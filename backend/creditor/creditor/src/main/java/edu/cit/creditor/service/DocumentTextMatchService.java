package edu.cit.creditor.service;

import edu.cit.creditor.model.TorRecord;
import edu.cit.creditor.util.IdentityMatchUtil;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class DocumentTextMatchService {

    private static final Pattern DATE_NUMERIC = Pattern.compile(
            "\\b(\\d{1,2})[/.\\-](\\d{1,2})[/.\\-](\\d{2,4})\\b");

    public boolean matchesRecord(String scannedText, TorRecord record) {
        return studentIdFound(scannedText, record.getStudentId())
                && nameFound(scannedText, record.getFullName())
                && dateFound(scannedText, record.getDateIssued());
    }

    public String summarizeFindings(String scannedText, TorRecord record) {
        if (scannedText == null || scannedText.isBlank()) {
            return "No readable text detected in the photo.";
        }
        boolean id = studentIdFound(scannedText, record.getStudentId());
        boolean name = nameFound(scannedText, record.getFullName());
        boolean date = dateFound(scannedText, record.getDateIssued());

        StringBuilder summary = new StringBuilder();
        summary.append("OCR scan — Student ID ")
                .append(id ? "found" : "not found")
                .append(", name ")
                .append(name ? "found" : "not found")
                .append(", date issued ")
                .append(date ? "found" : "not found");

        if (!date && record.getDateIssued() != null) {
            summary.append(" (registrar expects: ")
                    .append(formatDateForDisplay(record.getDateIssued()))
                    .append(" — not admission date)");
        }
        return summary.toString();
    }

    public boolean studentIdFound(String scannedText, String studentId) {
        if (studentId == null || studentId.isBlank()) {
            return false;
        }
        String upper = normalizeForMatch(scannedText);
        String normalized = IdentityMatchUtil.normalizeStudentId(studentId);
        if (upper.contains(normalized)) {
            return true;
        }
        String compactId = normalized.replaceAll("[^A-Z0-9]", "");
        String compactText = upper.replaceAll("[^A-Z0-9]", "");
        return !compactId.isEmpty() && compactText.contains(compactId);
    }

    public boolean nameFound(String scannedText, String fullName) {
        return nameFoundInText(normalizeForMatch(scannedText), fullName);
    }

    public boolean dateFound(String scannedText, LocalDate date) {
        return dateFoundInText(normalizeForMatch(scannedText), date);
    }

    private String formatDateForDisplay(LocalDate date) {
        return date.format(DateTimeFormatter.ofPattern("M/d/yyyy", Locale.ENGLISH));
    }

    private String normalizeForMatch(String text) {
        return text.toUpperCase(Locale.ROOT)
                .replace(',', ' ')
                .replace('.', ' ')
                .replaceAll("\\s+", " ")
                .trim();
    }

    private boolean nameFoundInText(String upperText, String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return false;
        }

        String normalized = IdentityMatchUtil.normalizeFullName(fullName);
        if (upperText.contains(normalized)) {
            return true;
        }

        List<String> tokens = nameTokens(fullName);
        if (tokens.isEmpty()) {
            return false;
        }

        for (String variant : nameVariants(tokens)) {
            if (upperText.contains(variant)) {
                return true;
            }
        }

        return nameTokensFoundInText(upperText, tokens);
    }

    private List<String> nameTokens(String fullName) {
        return Arrays.stream(fullName.trim().split("\\s+"))
                .map(t -> t.replace(".", "").toUpperCase(Locale.ROOT))
                .filter(t -> !t.isEmpty())
                .collect(Collectors.toList());
    }

    /** e.g. Xavier John A Sabornido → "XAVIER JOHN A SABORNIDO" and "SABORNIDO XAVIER JOHN A". */
    private List<String> nameVariants(List<String> tokens) {
        Set<String> variants = new LinkedHashSet<>();
        if (tokens.isEmpty()) {
            return List.of();
        }

        String natural = String.join(" ", tokens);
        variants.add(natural);

        if (tokens.size() >= 2) {
            String last = tokens.get(tokens.size() - 1);
            String first = tokens.get(0);
            List<String> middle = tokens.subList(1, tokens.size() - 1);
            String middleJoined = String.join(" ", middle);

            variants.add(last + " " + first + (middleJoined.isEmpty() ? "" : " " + middleJoined));
            variants.add(last + " " + first);
            variants.add(first + " " + last);
            if (!middleJoined.isEmpty()) {
                variants.add(last + " " + middleJoined + " " + first);
            }
        }
        return new ArrayList<>(variants);
    }

    /**
     * Requires first and last name tokens; middle names/initials are optional.
     * Handles OCR that reads "Sabornido, Xavier John A" vs stored "Xavier John A. Sabornido".
     */
    private boolean nameTokensFoundInText(String upperText, List<String> tokens) {
        if (tokens.size() == 1) {
            return upperText.contains(tokens.get(0));
        }

        String first = tokens.get(0);
        String last = tokens.get(tokens.size() - 1);
        if (!upperText.contains(first) || !upperText.contains(last)) {
            return false;
        }

        List<String> middle = tokens.subList(1, tokens.size() - 1);
        if (middle.isEmpty()) {
            return true;
        }

        long substantiveMiddle = middle.stream().filter(t -> t.length() >= 2).count();
        if (substantiveMiddle == 0) {
            return true;
        }

        long foundMiddle = middle.stream()
                .filter(t -> t.length() >= 2)
                .filter(upperText::contains)
                .count();

        return foundMiddle >= 1;
    }

    private boolean dateFoundInText(String upperText, LocalDate date) {
        if (date == null) {
            return true;
        }

        String ocrNormalized = upperText.replace(',', ' ').replaceAll("\\s+", " ").trim();

        for (String pattern : datePatterns(date)) {
            if (ocrNormalized.contains(pattern.toUpperCase(Locale.ROOT))) {
                return true;
            }
        }

        if (dateComponentsFound(ocrNormalized, date)) {
            return true;
        }

        return numericDatesMatch(ocrNormalized, date);
    }

    private boolean dateComponentsFound(String text, LocalDate date) {
        String year = String.valueOf(date.getYear());
        if (!text.contains(year)) {
            return false;
        }

        String monthFull =
                date.format(DateTimeFormatter.ofPattern("MMMM", Locale.ENGLISH)).toUpperCase(Locale.ROOT);
        String monthAbbr =
                date.format(DateTimeFormatter.ofPattern("MMM", Locale.ENGLISH)).toUpperCase(Locale.ROOT);
        String monthNum2 = String.format(Locale.ROOT, "%02d", date.getMonthValue());
        String monthNum1 = String.valueOf(date.getMonthValue());
        String day2 = String.format(Locale.ROOT, "%02d", date.getDayOfMonth());
        String day1 = String.valueOf(date.getDayOfMonth());

        boolean hasMonth = text.contains(monthFull)
                || text.contains(monthAbbr)
                || containsToken(text, monthNum2)
                || containsToken(text, monthNum1);

        boolean hasDay = containsToken(text, day2) || containsToken(text, day1);

        return hasMonth && hasDay;
    }

    private boolean containsToken(String text, String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        Pattern p = Pattern.compile("\\b" + Pattern.quote(token) + "\\b");
        return p.matcher(text).find();
    }

    /** Tries MM/DD/YYYY and DD/MM/YYYY (and - . separators) against the registrar date. */
    private boolean numericDatesMatch(String text, LocalDate expected) {
        Matcher matcher = DATE_NUMERIC.matcher(text);
        while (matcher.find()) {
            int a = Integer.parseInt(matcher.group(1));
            int b = Integer.parseInt(matcher.group(2));
            int y = parseYear(matcher.group(3));

            if (matchesAsDate(a, b, y, expected) || matchesAsDate(b, a, y, expected)) {
                return true;
            }
        }
        return false;
    }

    private boolean matchesAsDate(int part1, int part2, int year, LocalDate expected) {
        if (year != expected.getYear()) {
            return false;
        }
        try {
            LocalDate parsed = LocalDate.of(year, part1, part2);
            return parsed.equals(expected);
        } catch (Exception ignored) {
            // try swapped interpretation below
        }
        try {
            LocalDate parsed = LocalDate.of(year, part2, part1);
            return parsed.equals(expected);
        } catch (Exception ignored) {
            return false;
        }
    }

    private int parseYear(String raw) {
        int y = Integer.parseInt(raw);
        if (y < 100) {
            y += y >= 50 ? 1900 : 2000;
        }
        return y;
    }

    private List<String> datePatterns(LocalDate date) {
        List<String> patterns = new ArrayList<>();
        patterns.add(date.toString());

        int m = date.getMonthValue();
        int d = date.getDayOfMonth();
        int y = date.getYear();

        patterns.add(String.format(Locale.ROOT, "%02d/%02d/%d", m, d, y));
        patterns.add(String.format(Locale.ROOT, "%d/%d/%d", m, d, y));
        patterns.add(String.format(Locale.ROOT, "%02d-%02d-%d", m, d, y));
        patterns.add(String.format(Locale.ROOT, "%d-%d-%d", m, d, y));
        patterns.add(String.format(Locale.ROOT, "%02d.%02d.%d", m, d, y));
        patterns.add(String.format(Locale.ROOT, "%d.%d.%d", m, d, y));

        patterns.add(String.format(Locale.ROOT, "%02d/%02d/%d", d, m, y));
        patterns.add(String.format(Locale.ROOT, "%d/%d/%d", d, m, y));
        patterns.add(String.format(Locale.ROOT, "%02d-%02d-%d", d, m, y));
        patterns.add(String.format(Locale.ROOT, "%02d-%02d-%d", d, m, y));

        addFormatted(patterns, date, "MMMM d, yyyy");
        addFormatted(patterns, date, "MMMM d yyyy");
        addFormatted(patterns, date, "MMM d, yyyy");
        addFormatted(patterns, date, "MMM d yyyy");
        addFormatted(patterns, date, "d MMMM yyyy");
        addFormatted(patterns, date, "d MMM yyyy");
        addFormatted(patterns, date, "MMMM d, yyyy");
        addFormatted(patterns, date, "d'th' MMMM yyyy");
        addFormatted(patterns, date, "MMMM dd, yyyy");
        addFormatted(patterns, date, "dd MMMM yyyy");

        patterns.add(String.format(Locale.ROOT, "%d %d %d", m, d, y));
        patterns.add(String.format(Locale.ROOT, "%d %d %d", d, m, y));

        return patterns;
    }

    private void addFormatted(List<String> patterns, LocalDate date, String pattern) {
        try {
            DateTimeFormatter formatter = new DateTimeFormatterBuilder()
                    .parseCaseInsensitive()
                    .appendPattern(pattern)
                    .toFormatter(Locale.ENGLISH);
            patterns.add(date.format(formatter));
        } catch (Exception ignored) {
            // skip unsupported pattern
        }
    }
}
