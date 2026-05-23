package com.vdenergy.inventory.materials.qr.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.vdenergy.inventory.audit.service.AuditService;
import com.vdenergy.inventory.common.exceptions.ResourceNotFoundException;
import com.vdenergy.inventory.inventory.entity.MaterialHistory;
import com.vdenergy.inventory.inventory.repository.MaterialHistoryRepository;
import com.vdenergy.inventory.materials.dto.MaterialResponse;
import com.vdenergy.inventory.materials.entity.Material;
import com.vdenergy.inventory.materials.repository.MaterialRepository;
import com.vdenergy.inventory.users.entity.User;
import com.vdenergy.inventory.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class QrService {

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final MaterialRepository materialRepository;
    private final MaterialHistoryRepository materialHistoryRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public QrService(
            MaterialRepository materialRepository,
            MaterialHistoryRepository materialHistoryRepository,
            UserRepository userRepository,
            AuditService auditService) {
        this.materialRepository = materialRepository;
        this.materialHistoryRepository = materialHistoryRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    private String generatePublicCode() {
        StringBuilder sb = new StringBuilder(24);
        sb.append("mat_");
        for (int i = 0; i < 20; i++) {
            sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }

    @Transactional(readOnly = true)
    public byte[] generateQrCodeImage(String publicCode, String format, int width, int height) {
        Material material = materialRepository.findByPublicCode(publicCode)
                .filter(Material::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active material not found with public code: " + publicCode));

        String qrPayload = "https://inventario.vdenergy.es/i/" + material.getPublicCode();

        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrPayload, BarcodeFormat.QR_CODE, width, height);

            if ("svg".equalsIgnoreCase(format)) {
                String svg = bitMatrixToSvg(bitMatrix);
                return svg.getBytes("UTF-8");
            } else {
                ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
                MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
                return pngOutputStream.toByteArray();
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    @Transactional
    public MaterialResponse regenerateQr(String publicCode, String performerPublicId, String ip, String userAgent) {
        Material material = materialRepository.findByPublicCode(publicCode)
                .filter(Material::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active material not found with public code: " + publicCode));

        User performer = userRepository.findByPublicId(performerPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + performerPublicId));

        String newPublicCode = generatePublicCode();
        while (materialRepository.findByPublicCode(newPublicCode).isPresent()) {
            newPublicCode = generatePublicCode();
        }

        String oldPublicCode = material.getPublicCode();
        material.setPublicCode(newPublicCode);
        material.setQrVersion(material.getQrVersion() + 1);
        material.setQrGeneratedAt(LocalDateTime.now());

        Material savedMaterial = materialRepository.save(material);

        // Record to History
        MaterialHistory history = new MaterialHistory(
                savedMaterial,
                "QR_REGENERATED",
                savedMaterial.getStatus(),
                savedMaterial.getStatus(),
                savedMaterial.getOffice(),
                savedMaterial.getOffice(),
                "QR code regenerated (Old code: " + oldPublicCode + ")",
                performer
        );
        materialHistoryRepository.save(history);

        // Audit Log
        auditService.logEvent("Material", savedMaterial.getPublicCode(), "QR_REGENERATED", "USER", performerPublicId, ip, userAgent);

        return new MaterialResponse(savedMaterial);
    }

    @Transactional(readOnly = true)
    public String getPrintLabelHtml(String publicCode) {
        Material material = materialRepository.findByPublicCode(publicCode)
                .filter(Material::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active material not found with public code: " + publicCode));

        String qrPayload = "https://inventario.vdenergy.es/i/" + material.getPublicCode();
        String qrSvg;
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrPayload, BarcodeFormat.QR_CODE, 200, 200);
            qrSvg = bitMatrixToSvg(bitMatrix);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR SVG for printing", e);
        }

        String brand = material.getBrand() != null ? material.getBrand() : "";
        String model = material.getModel() != null ? material.getModel() : "";
        String serialNumber = material.getSerialNumber() != null ? material.getSerialNumber() : "N/A";

        return String.format(
                "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <meta charset=\"utf-8\">\n" +
                "    <title>Material Label - %s</title>\n" +
                "    <style>\n" +
                "        @page {\n" +
                "            size: 2in 2in;\n" +
                "            margin: 0;\n" +
                "        }\n" +
                "        body {\n" +
                "            margin: 0;\n" +
                "            padding: 8px;\n" +
                "            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;\n" +
                "            font-size: 8px;\n" +
                "            color: #333;\n" +
                "            box-sizing: border-box;\n" +
                "            width: 2in;\n" +
                "            height: 2in;\n" +
                "            display: flex;\n" +
                "            flex-direction: column;\n" +
                "            align-items: center;\n" +
                "            justify-content: center;\n" +
                "            background-color: #fff;\n" +
                "        }\n" +
                "        .container {\n" +
                "            width: 100%%;\n" +
                "            height: 100%%;\n" +
                "            display: flex;\n" +
                "            flex-direction: column;\n" +
                "            align-items: center;\n" +
                "            justify-content: space-between;\n" +
                "            border: 1px solid #ddd;\n" +
                "            border-radius: 4px;\n" +
                "            padding: 6px;\n" +
                "            box-sizing: border-box;\n" +
                "        }\n" +
                "        .qr-wrapper {\n" +
                "            width: 70px;\n" +
                "            height: 70px;\n" +
                "        }\n" +
                "        .details {\n" +
                "            text-align: center;\n" +
                "            width: 100%%;\n" +
                "        }\n" +
                "        .title {\n" +
                "            font-weight: bold;\n" +
                "            font-size: 9px;\n" +
                "            margin-bottom: 2px;\n" +
                "            white-space: nowrap;\n" +
                "            overflow: hidden;\n" +
                "            text-overflow: ellipsis;\n" +
                "        }\n" +
                "        .subtitle {\n" +
                "            font-size: 7px;\n" +
                "            color: #666;\n" +
                "            margin-bottom: 2px;\n" +
                "            white-space: nowrap;\n" +
                "            overflow: hidden;\n" +
                "            text-overflow: ellipsis;\n" +
                "        }\n" +
                "        .code {\n" +
                "            font-family: monospace;\n" +
                "            font-weight: bold;\n" +
                "            font-size: 7px;\n" +
                "            background-color: #eee;\n" +
                "            padding: 1px 3px;\n" +
                "            border-radius: 2px;\n" +
                "        }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body onload=\"window.print()\">\n" +
                "    <div class=\"container\">\n" +
                "        <div class=\"qr-wrapper\">\n" +
                "            %s\n" +
                "        </div>\n" +
                "        <div class=\"details\">\n" +
                "            <div class=\"title\">%s %s</div>\n" +
                "            <div class=\"subtitle\">S/N: %s</div>\n" +
                "            <div class=\"code\">%s</div>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>",
                material.getPublicCode(),
                qrSvg,
                brand,
                model,
                serialNumber,
                material.getPublicCode()
        );
    }

    private String bitMatrixToSvg(BitMatrix matrix) {
        int width = matrix.getWidth();
        int height = matrix.getHeight();
        StringBuilder sb = new StringBuilder();
        sb.append("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 ")
                .append(width).append(" ").append(height).append("\" width=\"100%\" height=\"100%\">");
        sb.append("<rect width=\"").append(width).append("\" height=\"").append(height).append("\" fill=\"#FFFFFF\"/>");
        sb.append("<path d=\"");
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                if (matrix.get(x, y)) {
                    sb.append("M").append(x).append(" ").append(y).append("h1v1h-1z ");
                }
            }
        }
        sb.append("\" fill=\"#000000\" shape-rendering=\"crispEdges\"/>");
        sb.append("</svg>");
        return sb.toString();
    }
}
