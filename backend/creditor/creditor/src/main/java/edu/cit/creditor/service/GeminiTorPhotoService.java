package edu.cit.creditor.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.cit.creditor.dto.GeminiPhotoMatchResult;
import edu.cit.creditor.model.TorRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
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
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class GeminiTorPhotoService {

    private static final String API_BASE =
            "https://generativelanguage.googleapis.com/v1beta/models/";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient =
            HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(30)).build();

    @Value("${creditor.gemini.api-key:}")
    private String apiKey;

    @Value("${creditor.gemini.model:gemini-2.0-flash-lite}")
    private String model;

    @Value("${creditor.gemini.max-image-edge:1280}")
    private int maxImageEdge;

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public GeminiPhotoMatchResult analyzePhotoAgainstRecord(MultipartFile photo, TorRecord record)
            throws Exception {
        if (!isConfigured()) {
            throw new IllegalStateException(
                    "Gemini API key is not configured. Set GEMINI_API_KEY on the server.");
        }
        if (photo == null || photo.isEmpty()) {
            throw new IllegalArgumentException("Photo is required");
        }

        byte[] imageBytes = compressImageForApi(photo.getBytes());
        String mimeType = "image/jpeg";

        String base64 = Base64.getEncoder().encodeToString(imageBytes);
        String prompt = buildPrompt(record);

        Map<String, Object> inlineData = Map.of("mime_type", mimeType, "data", base64);
        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put(
                "contents",
                List.of(Map.of(
                        "parts",
                        List.of(Map.of("text", prompt), Map.of("inline_data", inlineData)))));
        requestBody.put(
                "generationConfig",
                Map.of("temperature", 0.1, "responseMimeType", "application/json"));

        String url = API_BASE + model + ":generateContent?key=" + apiKey.trim();
        String jsonBody = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(90))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response =
                httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            String responseBody = response.body() != null ? response.body() : "";
            if (response.statusCode() == 400
                    && (responseBody.contains("API_KEY_INVALID")
                            || responseBody.contains("API key not valid"))) {
                throw new IllegalStateException(
                        "Invalid Gemini API key. Create one at https://aistudio.google.com/apikey "
                                + "and set GEMINI_API_KEY (no $ prefix) before starting the server.");
            }
            if (response.statusCode() == 429 || responseBody.contains("RESOURCE_EXHAUSTED")) {
                throw new IllegalStateException(
                        "Gemini free-tier quota exceeded. Wait a few minutes and try again, "
                                + "avoid rapid test scans, or check usage at https://ai.dev/rate-limit. "
                                + "You can also link billing in Google AI Studio (still free within limits) or set "
                                + "GEMINI_MODEL=gemini-2.0-flash-lite.");
            }
            throw new IllegalStateException(
                    "Gemini API error (" + response.statusCode() + "): " + truncate(responseBody, 400));
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode candidates = root.path("candidates");
        if (!candidates.isArray() || candidates.isEmpty()) {
            throw new IllegalStateException("Gemini returned no analysis result");
        }

        String text = candidates
                .get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text")
                .asText("");

        if (text.isBlank()) {
            throw new IllegalStateException("Gemini returned empty text");
        }

        return objectMapper.readValue(stripJsonFences(text), GeminiPhotoMatchResult.class);
    }

    private String buildPrompt(TorRecord record) {
        String dateIssued = record.getDateIssued() != null
                ? record.getDateIssued()
                        .format(DateTimeFormatter.ofPattern("MMMM d, yyyy", Locale.ENGLISH))
                : "unknown";
        String isoDate = record.getDateIssued() != null ? record.getDateIssued().toString() : "";

        return """
                You verify a Transcript of Records (TOR) photo against registrar data.

                Expected on this physical document:
                - Student ID: %s
                - Full Name: %s
                - Date Issued: %s (also acceptable as %s or common regional formats)

                Examine the image carefully. Mark a field as found if it is clearly visible, even with:
                - different spacing or line breaks
                - ALL CAPS vs mixed case
                - date written as MM/DD/YYYY, DD/MM/YYYY, or spelled month
                - minor glare, slight blur, or partial crop as long as the value is still readable

                Set "matches" to true ONLY when studentIdFound, fullNameFound, and dateIssuedFound are all true.

                Respond with ONLY valid JSON (no markdown):
                {
                  "studentIdFound": boolean,
                  "fullNameFound": boolean,
                  "dateIssuedFound": boolean,
                  "matches": boolean,
                  "confidence": "high" | "medium" | "low",
                  "notes": "one short sentence"
                }
                """
                .formatted(record.getStudentId(), record.getFullName(), dateIssued, isoDate);
    }

    private static String stripJsonFences(String text) {
        String trimmed = text.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```(?:json)?\\s*", "");
            int end = trimmed.lastIndexOf("```");
            if (end >= 0) {
                trimmed = trimmed.substring(0, end);
            }
        }
        return trimmed.trim();
    }

    /** Shrinks photos before upload to reduce free-tier token usage. */
    private byte[] compressImageForApi(byte[] raw) throws Exception {
        BufferedImage source = ImageIO.read(new ByteArrayInputStream(raw));
        if (source == null) {
            return raw;
        }

        int width = source.getWidth();
        int height = source.getHeight();
        int maxEdge = Math.max(320, maxImageEdge);
        int longest = Math.max(width, height);

        BufferedImage toEncode = source;
        if (longest > maxEdge) {
            double scale = (double) maxEdge / longest;
            int newW = Math.max(1, (int) Math.round(width * scale));
            int newH = Math.max(1, (int) Math.round(height * scale));
            Image scaled = source.getScaledInstance(newW, newH, Image.SCALE_SMOOTH);
            toEncode = new BufferedImage(newW, newH, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = toEncode.createGraphics();
            g.drawImage(scaled, 0, 0, null);
            g.dispose();
        } else if (toEncode.getType() != BufferedImage.TYPE_INT_RGB) {
            BufferedImage rgb = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = rgb.createGraphics();
            g.drawImage(source, 0, 0, null);
            g.dispose();
            toEncode = rgb;
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpeg");
        if (!writers.hasNext()) {
            ImageIO.write(toEncode, "jpeg", out);
            return out.toByteArray();
        }
        ImageWriter writer = writers.next();
        ImageWriteParam params = writer.getDefaultWriteParam();
        if (params.canWriteCompressed()) {
            params.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            params.setCompressionQuality(0.82f);
        }
        try (ImageOutputStream ios = ImageIO.createImageOutputStream(out)) {
            writer.setOutput(ios);
            writer.write(null, new IIOImage(toEncode, null, null), params);
        } finally {
            writer.dispose();
        }
        return out.toByteArray();
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return "";
        }
        return value.length() <= max ? value : value.substring(0, max) + "…";
    }
}
