package com.vdenergy.inventory.common.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private String getTimestamp() {
        return LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("code", "RESOURCE_NOT_FOUND");
        errorDetails.put("message", ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("error", errorDetails);
        response.put("timestamp", getTimestamp());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(ConflictException ex) {
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("code", "RESOURCE_CONFLICT");
        errorDetails.put("message", ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("error", errorDetails);
        response.put("timestamp", getTimestamp());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String details = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("code", "VALIDATION_FAILED");
        errorDetails.put("message", details);

        Map<String, Object> response = new HashMap<>();
        response.put("error", errorDetails);
        response.put("timestamp", getTimestamp());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResourceFound(NoResourceFoundException ex) {
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("code", "RESOURCE_NOT_FOUND");
        errorDetails.put("message", ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("error", errorDetails);
        response.put("timestamp", getTimestamp());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public void handleAccessDenied(org.springframework.security.access.AccessDeniedException ex) {
        throw ex;
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("code", "INTERNAL_SERVER_ERROR");
        errorDetails.put("message", "An unexpected error occurred");

        Map<String, Object> response = new HashMap<>();
        response.put("error", errorDetails);
        response.put("timestamp", getTimestamp());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
