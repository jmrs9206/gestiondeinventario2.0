package com.stockflow.inventory.common.utils;

import java.text.Normalizer;

public class TextNormalizer {

    public static String normalize(String input) {
        if (input == null) {
            return null;
        }
        
        // Normalize string to strip accents (decomposed Form NFD separates letters from diacritics)
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        // Replace diacritical marks with empty string
        normalized = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        
        // Convert to uppercase and trim
        return normalized.toUpperCase().trim();
    }
}
