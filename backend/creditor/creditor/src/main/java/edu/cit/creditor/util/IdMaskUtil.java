package edu.cit.creditor.util;

public final class IdMaskUtil {

    private IdMaskUtil() {}

    public static String maskStudentId(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            return studentId;
        }
        String[] parts = studentId.trim().split("-");
        if (parts.length == 1) {
            return maskSegment(parts[0], true);
        }
        StringBuilder masked = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (i > 0) {
                masked.append("-");
            }
            boolean last = i == parts.length - 1;
            masked.append(maskSegment(parts[i], last));
        }
        return masked.toString();
    }

    private static String maskSegment(String part, boolean lastSegment) {
        if (part == null || part.isEmpty()) {
            return "";
        }
        if (lastSegment && part.length() > 2) {
            int stars = Math.max(3, part.length() - 2);
            return "*".repeat(stars) + part.substring(part.length() - 2);
        }
        int keep = Math.min(2, part.length());
        int stars = Math.max(2, part.length() - keep);
        return part.substring(0, keep) + "*".repeat(stars);
    }
}
