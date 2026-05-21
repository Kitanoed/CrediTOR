package edu.cit.creditor.util;

public final class IdentityMatchUtil {

    private IdentityMatchUtil() {}

    public static boolean matchesStudentId(String registered, String provided) {
        return normalizeStudentId(registered).equals(normalizeStudentId(provided));
    }

    public static boolean matchesFullName(String registered, String provided) {
        return normalizeFullName(registered).equals(normalizeFullName(provided));
    }

    public static String normalizeStudentId(String value) {
        if (value == null) {
            return "";
        }
        return value.trim().toUpperCase().replaceAll("\\s+", "");
    }

    public static String normalizeFullName(String value) {
        if (value == null) {
            return "";
        }
        return value.trim().replaceAll("\\s+", " ").toUpperCase();
    }
}
