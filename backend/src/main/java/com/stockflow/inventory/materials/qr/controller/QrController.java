package com.stockflow.inventory.materials.qr.controller;

import com.stockflow.inventory.common.responses.ApiResponse;
import com.stockflow.inventory.materials.dto.MaterialResponse;
import com.stockflow.inventory.materials.qr.service.QrService;
import com.stockflow.inventory.users.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/materials/{publicCode}/qr")
public class QrController {

    private final QrService qrService;

    public QrController(QrService qrService) {
        this.qrService = qrService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECNICO')")
    public ResponseEntity<byte[]> getQrCode(
            @PathVariable String publicCode,
            @RequestParam(defaultValue = "png") String format,
            @RequestParam(defaultValue = "250") int width,
            @RequestParam(defaultValue = "250") int height
    ) {
        byte[] image = qrService.generateQrCodeImage(publicCode, format, width, height);

        HttpHeaders headers = new HttpHeaders();
        if ("svg".equalsIgnoreCase(format)) {
            headers.setContentType(MediaType.valueOf("image/svg+xml"));
        } else {
            headers.setContentType(MediaType.IMAGE_PNG);
        }

        return new ResponseEntity<>(image, headers, HttpStatus.OK);
    }

    @PostMapping("/regenerate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MaterialResponse>> regenerateQr(
            @PathVariable String publicCode,
            @AuthenticationPrincipal User performer,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        MaterialResponse response = qrService.regenerateQr(publicCode, performer.getPublicId(), ip, userAgent);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @GetMapping("/print")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECNICO')")
    public ResponseEntity<String> getPrintLabel(@PathVariable String publicCode) {
        String html = qrService.getPrintLabelHtml(publicCode);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_HTML);
        return new ResponseEntity<>(html, headers, HttpStatus.OK);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
