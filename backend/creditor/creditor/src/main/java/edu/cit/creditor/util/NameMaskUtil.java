package edu.cit.creditor.util;

public final class NameMaskUtil {

    private NameMaskUtil() {}

    public static String maskName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return fullName;
        }
        String[] parts = fullName.trim().split("\\s+");
        StringBuilder masked = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            String part = parts[i];
            if (part.isEmpty()) continue;
            if (i > 0) masked.append(", ");
            masked.append(part.charAt(0));
            masked.append("*".repeat(Math.max(0, part.length() - 1)));
        }
        return masked.toString();
    }
}
