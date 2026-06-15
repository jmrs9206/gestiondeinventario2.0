package com.stockflow.inventory.common.exceptions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import jakarta.validation.ConstraintViolationException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private String getTimestamp() {
        return LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
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
        log.warn("Conflict error: {}", ex.getMessage());
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

        log.warn("Validation failed: {}", details);

        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("code", "VALIDATION_FAILED");
        errorDetails.put("message", details);

        Map<String, Object> response = new HashMap<>();
        response.put("error", errorDetails);
        response.put("timestamp", getTimestamp());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolationException(ConstraintViolationException ex) {
        String details = ex.getConstraintViolations().stream()
                .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                .collect(Collectors.joining(", "));

        log.warn("Constraint violation failed: {}", details);

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
        log.warn("No resource found for request: {}", ex.getMessage());
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("code", "RESOURCE_NOT_FOUND");
        errorDetails.put("message", ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("error", errorDetails);
        response.put("timestamp", getTimestamp());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        log.warn("HTTP Method not supported: {}", ex.getMessage());
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("code", "METHOD_NOT_ALLOWED");
        errorDetails.put("message", ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("error", errorDetails);
        response.put("timestamp", getTimestamp());

        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(response);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String details = String.format("Parameter '%s' should be of type '%s'", ex.getName(), 
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");
        log.warn("Method argument type mismatch: {}", details);

        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("code", "TYPE_MISMATCH");
        errorDetails.put("message", details);

        Map<String, Object> response = new HashMap<>();
        response.put("error", errorDetails);
        response.put("timestamp", getTimestamp());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> handleMissingParameter(MissingServletRequestParameterException ex) {
        log.warn("Missing servlet request parameter: {}", ex.getMessage());
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("code", "MISSING_PARAMETER");
        errorDetails.put("message", ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("error", errorDetails);
        response.put("timestamp", getTimestamp());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleMalformedJson(HttpMessageNotReadableException ex) {
        log.warn("Malformed HTTP JSON body: {}", ex.getMessage());
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("code", "MALFORMED_JSON");
        errorDetails.put("message", "Required request body is missing or malformed");

        Map<String, Object> response = new HashMap<>();
        response.put("error", errorDetails);
        response.put("timestamp", getTimestamp());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<Map<String, Object>> handleMissingHeader(MissingRequestHeaderException ex) {
        log.warn("Missing request header: {}", ex.getMessage());
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("code", "MISSING_HEADER");
        errorDetails.put("message", ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("error", errorDetails);
        response.put("timestamp", getTimestamp());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public void handleAccessDenied(org.springframework.security.access.AccessDeniedException ex) {
        // Rethrow to let AccessDeniedHandler handle it and audit appropriately
        throw ex;
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Unhandled exception occurred: {}", ex.getMessage(), ex);
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("code", "INTERNAL_SERVER_ERROR");
        errorDetails.put("message", "An unexpected error occurred");

        Map<String, Object> response = new HashMap<>();
        response.put("error", errorDetails);
        response.put("timestamp", getTimestamp());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
