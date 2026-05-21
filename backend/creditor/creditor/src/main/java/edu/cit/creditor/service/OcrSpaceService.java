package edu.cit.creditor.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Iterator;

@Service
public class OcrSpaceService {

    private static final String OCR_URL = "https://api.ocr.space/parse/image";
    /** Free tier max file size is 1 MB. */
    private static final int MAX_BYTES = 900_000;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient = RestClient.create();

    @Value("${creditor.ocrspace.api-key:}")
    private String apiKey;

    @Value("${creditor.ocrspace.max-image-edge:1200}")
    private int maxImageEdge;

    @Value("${creditor.ocrspace.engine:2}")
    private int ocrEngine;

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String extractTextFromPhoto(MultipartFile photo) throws Exception {
        if (!isConfigured()) {
            throw new IllegalStateException(
                    "OCR.space API key is not configured. Set OCR_SPACE_API_KEY on the server.");
        }
        if (photo == null || photo.isEmpty()) {
            throw new IllegalArgumentException("Photo is required");
        }

        byte[] imageBytes = compressImageUnderLimit(photo.getBytes());
        MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
        form.add("apikey", apiKey.trim());
        form.add("language", "eng");
        form.add("detectOrientation", "true");
        form.add("scale", "true");
        form.add("OCREngine", String.valueOf(ocrEngine));
        form.add(
                "file",
                new ByteArrayResource(imageBytes) {
                    @Override
                    public String getFilename() {
                        return "tor.jpg";
                    }
                });

        String responseBody =
                restClient
                        .post()
                        .uri(OCR_URL)
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .body(form)
                        .retrieve()
                        .body(String.class);

        if (responseBody == null || responseBody.isBlank()) {
            throw new IllegalStateException("OCR.space returned an empty response");
        }

        return parseOcrResponse(responseBody);
    }

    private String parseOcrResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);

        if (root.path("IsErroredOnProcessing").asBoolean(false)) {
            String msg = root.path("ErrorMessage").asText("OCR processing failed");
            if (msg.contains("API key") || msg.contains("apikey")) {
                throw new IllegalStateException(
                        "Invalid OCR.space API key. Get one at https://ocr.space/ocrapi/freekey");
            }
            if (msg.toLowerCase().contains("limit") || msg.toLowerCase().contains("quota")) {
                throw new IllegalStateException(
                        "OCR.space free limit reached. Wait and try again, or upgrade your OCR.space plan.");
            }
            throw new IllegalStateException("OCR.space error: " + msg);
        }

        int exitCode = root.path("OCRExitCode").asInt(-1);
        if (exitCode == 3 || exitCode == 4) {
            throw new IllegalStateException(
                    "Could not read text from the photo. Retake in good light, focused on name, ID, and date issued.");
        }

        JsonNode parsedResults = root.path("ParsedResults");
        if (!parsedResults.isArray() || parsedResults.isEmpty()) {
            throw new IllegalStateException("No text detected in the photo");
        }

        StringBuilder text = new StringBuilder();
        for (JsonNode page : parsedResults) {
            String pageText = page.path("ParsedText").asText("").trim();
            if (!pageText.isEmpty()) {
                if (text.length() > 0) {
                    text.append('\n');
                }
                text.append(pageText);
            }
        }

        String result = text.toString().trim();
        if (result.isEmpty()) {
            throw new IllegalStateException(
                    "Could not read text from the photo. Retake in good light, focused on name, ID, and date issued.");
        }
        return result;
    }

    private byte[] compressImageUnderLimit(byte[] raw) throws Exception {
        byte[] compressed = encodeJpeg(scaleIfNeeded(readImage(raw)), 0.82f);
        float quality = 0.82f;
        int edge = maxImageEdge;

        while (compressed.length > MAX_BYTES && (quality > 0.45f || edge > 480)) {
            if (quality > 0.45f) {
                quality -= 0.1f;
            } else {
                edge = (int) (edge * 0.85);
            }
            compressed = encodeJpeg(scaleToMaxEdge(readImage(raw), edge), quality);
        }
        return compressed;
    }

    private BufferedImage readImage(byte[] raw) throws Exception {
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(raw));
        if (image == null) {
            throw new IllegalArgumentException("Unsupported image format");
        }
        return image;
    }

    private BufferedImage scaleIfNeeded(BufferedImage source) {
        return scaleToMaxEdge(source, Math.max(320, maxImageEdge));
    }

    private BufferedImage scaleToMaxEdge(BufferedImage source, int maxEdge) {
        int width = source.getWidth();
        int height = source.getHeight();
        int longest = Math.max(width, height);

        BufferedImage rgb = toRgb(source);
        if (longest <= maxEdge) {
            return rgb;
        }

        double scale = (double) maxEdge / longest;
        int newW = Math.max(1, (int) Math.round(width * scale));
        int newH = Math.max(1, (int) Math.round(height * scale));
        Image scaled = rgb.getScaledInstance(newW, newH, Image.SCALE_SMOOTH);
        BufferedImage out = new BufferedImage(newW, newH, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = out.createGraphics();
        g.drawImage(scaled, 0, 0, null);
        g.dispose();
        return out;
    }

    private BufferedImage toRgb(BufferedImage source) {
        if (source.getType() == BufferedImage.TYPE_INT_RGB) {
            return source;
        }
        BufferedImage rgb =
                new BufferedImage(source.getWidth(), source.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D g = rgb.createGraphics();
        g.drawImage(source, 0, 0, null);
        g.dispose();
        return rgb;
    }

    private byte[] encodeJpeg(BufferedImage image, float quality) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpeg");
        if (!writers.hasNext()) {
            ImageIO.write(image, "jpeg", out);
            return out.toByteArray();
        }
        ImageWriter writer = writers.next();
        ImageWriteParam params = writer.getDefaultWriteParam();
        if (params.canWriteCompressed()) {
            params.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            params.setCompressionQuality(quality);
        }
        try (ImageOutputStream ios = ImageIO.createImageOutputStream(out)) {
            writer.setOutput(ios);
            writer.write(null, new IIOImage(image, null, null), params);
        } finally {
            writer.dispose();
        }
        return out.toByteArray();
    }
}
