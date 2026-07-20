package com.stockflow.inventory.materials.service;

import com.stockflow.inventory.audit.service.AuditService;
import com.stockflow.inventory.common.entity.MaterialStatus;
import com.stockflow.inventory.common.exceptions.ConflictException;
import com.stockflow.inventory.common.exceptions.ResourceNotFoundException;
import com.stockflow.inventory.inventory.entity.MaterialHistory;
import com.stockflow.inventory.inventory.repository.MaterialHistoryRepository;
import com.stockflow.inventory.materials.dto.MaterialRequest;
import com.stockflow.inventory.materials.dto.MaterialResponse;
import com.stockflow.inventory.materials.entity.Material;
import com.stockflow.inventory.materials.repository.MaterialRepository;
import com.stockflow.inventory.offices.entity.Office;
import com.stockflow.inventory.offices.repository.OfficeRepository;
import com.stockflow.inventory.users.entity.User;
import com.stockflow.inventory.users.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MaterialService {

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final MaterialRepository materialRepository;
    private final MaterialHistoryRepository materialHistoryRepository;
    private final OfficeRepository officeRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    public MaterialService(
            MaterialRepository materialRepository,
            MaterialHistoryRepository materialHistoryRepository,
            OfficeRepository officeRepository,
            UserRepository userRepository,
            AuditService auditService,
            ObjectMapper objectMapper) {
        this.materialRepository = materialRepository;
        this.materialHistoryRepository = materialHistoryRepository;
        this.officeRepository = officeRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.objectMapper = objectMapper;
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }

    private String normalizeText(String input) {
        return com.stockflow.inventory.common.utils.TextNormalizer.normalize(input);
    }

    private String generatePublicCode() {
        StringBuilder sb = new StringBuilder(24);
        for (int i = 0; i < 24; i++) {
            sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }

    @Transactional
    public MaterialResponse createMaterial(MaterialRequest request, String performerPublicId, String ip, String userAgent) {
        Office office = officeRepository.findByPublicId(request.getOfficePublicId())
                .filter(Office::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active office not found with public ID: " + request.getOfficePublicId()));

        User performer = userRepository.findByPublicId(performerPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + performerPublicId));

        String publicCode = generatePublicCode();
        // Ensure uniqueness just in case
        while (materialRepository.findByPublicCode(publicCode).isPresent()) {
            publicCode = generatePublicCode();
        }

        Material material = new Material(
                publicCode,
                normalizeText(request.getMaterialType()),
                normalizeText(request.getBrand()),
                normalizeText(request.getModel()),
                normalizeText(request.getSerialNumber()),
                office,
                request.getStatus()
        );
        material.setPurchasePrice(request.getPurchasePrice());
        material.setPurchaseDate(request.getPurchaseDate());
        material.setActive(true);

        Material savedMaterial = materialRepository.save(material);

        // Write operational history
        MaterialHistory history = new MaterialHistory(
                savedMaterial,
                "MATERIAL_CREATED",
                null,
                savedMaterial.getStatus(),
                null,
                savedMaterial.getOffice(),
                normalizeText(request.getComment()),
                performer
        );
        materialHistoryRepository.save(history);

        // Log audit
        String newValueJson = toJson(new MaterialResponse(savedMaterial));
        auditService.logEvent("Material", savedMaterial.getPublicCode(), "MATERIAL_CREATED", "USER", performerPublicId, ip, userAgent, null, newValueJson);

        return new MaterialResponse(savedMaterial);
    }

    @Transactional
    public MaterialResponse updateMaterial(String publicCode, MaterialRequest request, String performerPublicId, String ip, String userAgent) {
        Material material = materialRepository.findByPublicCode(publicCode)
                .filter(Material::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active material not found with public code: " + publicCode));

        String oldValueJson = toJson(new MaterialResponse(material));

        Office newOffice = officeRepository.findByPublicId(request.getOfficePublicId())
                .filter(Office::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active office not found with public ID: " + request.getOfficePublicId()));

        User performer = userRepository.findByPublicId(performerPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + performerPublicId));

        boolean statusChanged = !material.getStatus().equals(request.getStatus());
        boolean officeChanged = !material.getOffice().getPublicId().equals(request.getOfficePublicId());

        MaterialStatus prevStatus = material.getStatus();
        Office prevOffice = material.getOffice();

        // Update fields
        material.setMaterialType(normalizeText(request.getMaterialType()));
        material.setBrand(normalizeText(request.getBrand()));
        material.setModel(normalizeText(request.getModel()));
        material.setSerialNumber(normalizeText(request.getSerialNumber()));
        material.setOffice(newOffice);
        material.setStatus(request.getStatus());
        material.setPurchasePrice(request.getPurchasePrice());
        material.setPurchaseDate(request.getPurchaseDate());

        Material updatedMaterial = materialRepository.save(material);

        // Create MaterialHistory record
        String historyAction = "MATERIAL_UPDATED";
        if (statusChanged && officeChanged) {
            historyAction = "STATUS_AND_OFFICE_CHANGED";
        } else if (statusChanged) {
            historyAction = "STATUS_CHANGED";
        } else if (officeChanged) {
            historyAction = "OFFICE_CHANGED";
        }

        MaterialHistory history = new MaterialHistory(
                updatedMaterial,
                historyAction,
                prevStatus,
                updatedMaterial.getStatus(),
                prevOffice,
                updatedMaterial.getOffice(),
                normalizeText(request.getComment()),
                performer
        );
        materialHistoryRepository.save(history);

        // Log audits
        String newValueJson = toJson(new MaterialResponse(updatedMaterial));
        if (statusChanged) {
            auditService.logEvent("Material", updatedMaterial.getPublicCode(), "STATUS_CHANGED", "USER", performerPublicId, ip, userAgent, oldValueJson, newValueJson);
        }
        if (officeChanged) {
            auditService.logEvent("Material", updatedMaterial.getPublicCode(), "OFFICE_CHANGED", "USER", performerPublicId, ip, userAgent, oldValueJson, newValueJson);
        }
        auditService.logEvent("Material", updatedMaterial.getPublicCode(), "MATERIAL_UPDATED", "USER", performerPublicId, ip, userAgent, oldValueJson, newValueJson);

        return new MaterialResponse(updatedMaterial);
    }

    @Transactional
    public MaterialResponse decommissionMaterial(String publicCode, String comment, String performerPublicId, String ip, String userAgent) {
        Material material = materialRepository.findByPublicCode(publicCode)
                .filter(Material::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active material not found with public code: " + publicCode));

        String oldValueJson = toJson(new MaterialResponse(material));

        User performer = userRepository.findByPublicId(performerPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + performerPublicId));

        if (comment == null || comment.trim().isEmpty()) {
            throw new IllegalArgumentException("Decommission comment is mandatory");
        }

        MaterialStatus prevStatus = material.getStatus();
        Office office = material.getOffice();

        // Soft delete / decommission
        material.setActive(false);
        material.setStatus(MaterialStatus.BAJA);

        Material savedMaterial = materialRepository.save(material);

        // Create MaterialHistory record
        MaterialHistory history = new MaterialHistory(
                savedMaterial,
                "MATERIAL_DECOMMISSIONED",
                prevStatus,
                MaterialStatus.BAJA,
                office,
                office,
                normalizeText(comment),
                performer
        );
        materialHistoryRepository.save(history);

        // Log audit
        String newValueJson = toJson(new MaterialResponse(savedMaterial));
        auditService.logEvent("Material", savedMaterial.getPublicCode(), "MATERIAL_DECOMMISSIONED", "USER", performerPublicId, ip, userAgent, oldValueJson, newValueJson);

        return new MaterialResponse(savedMaterial);
    }

    @Transactional(readOnly = true)
    public MaterialResponse getMaterialByPublicCode(String publicCode) {
        Material material = materialRepository.findByPublicCode(publicCode)
                .filter(Material::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Active material not found with public code: " + publicCode));
        return new MaterialResponse(material);
    }

    @Transactional(readOnly = true)
    public Page<MaterialResponse> listMaterials(MaterialStatus status, String materialType, String officePublicId, String serialNumber, Pageable pageable) {
        return listMaterials(status, materialType, officePublicId, serialNumber, false, pageable);
    }

    @Transactional(readOnly = true)
    public Page<MaterialResponse> listMaterials(MaterialStatus status, String materialType, String officePublicId, String serialNumber, boolean includeInactive, Pageable pageable) {
        Specification<Material> spec = (root, query, cb) -> {
            if (status == MaterialStatus.BAJA) {
                return cb.equal(root.get("active"), false);
            } else if (includeInactive) {
                return cb.conjunction();
            } else {
                return cb.equal(root.get("active"), true);
            }
        };

        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (materialType != null && !materialType.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("materialType")), "%" + materialType.trim().toLowerCase() + "%"));
        }
        if (officePublicId != null && !officePublicId.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("office").get("publicId"), officePublicId.trim()));
        }
        if (serialNumber != null && !serialNumber.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("serialNumber")), "%" + serialNumber.trim().toLowerCase() + "%"));
        }

        Page<Material> materials = materialRepository.findAll(spec, pageable);
        return materials.map(MaterialResponse::new);
    }

    @Transactional
    public MaterialResponse reactivateMaterial(String publicCode, String comment, String performerPublicId, String ip, String userAgent) {
        Material material = materialRepository.findByPublicCode(publicCode)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with public code: " + publicCode));

        if (material.isActive()) {
            throw new ConflictException("Material is already active");
        }

        if (!material.getOffice().isActive()) {
            throw new ConflictException("Cannot reactivate material because its office '" + material.getOffice().getName() + "' is deactivated. Please reactivate the office first.");
        }

        String oldValueJson = toJson(new MaterialResponse(material));

        User performer = userRepository.findByPublicId(performerPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + performerPublicId));

        MaterialStatus prevStatus = material.getStatus();
        Office office = material.getOffice();

        material.setActive(true);
        material.setStatus(MaterialStatus.OPERATIVO);

        Material savedMaterial = materialRepository.save(material);

        MaterialHistory history = new MaterialHistory(
                savedMaterial,
                "MATERIAL_REACTIVATED",
                prevStatus,
                MaterialStatus.OPERATIVO,
                office,
                office,
                normalizeText(comment),
                performer
        );
        materialHistoryRepository.save(history);

        String newValueJson = toJson(new MaterialResponse(savedMaterial));
        auditService.logEvent("Material", savedMaterial.getPublicCode(), "MATERIAL_REACTIVATED", "USER", performerPublicId, ip, userAgent, oldValueJson, newValueJson);

        return new MaterialResponse(savedMaterial);
    }

    @Transactional
    public void importMaterialsFromCsv(org.springframework.web.multipart.MultipartFile file, String performerPublicId, String ip, String userAgent) {
        User performer = userRepository.findByPublicId(performerPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + performerPublicId));

        try (java.io.BufferedReader br = new java.io.BufferedReader(new java.io.InputStreamReader(file.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
            String line;
            boolean isHeader = true;
            while ((line = br.readLine()) != null) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                }
                if (line.trim().isEmpty()) {
                    continue;
                }
                
                String[] fields = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                if (fields.length < 5) {
                    continue;
                }

                String materialType = normalizeText(cleanCsvField(fields[0]));
                String brand = normalizeText(cleanCsvField(fields[1]));
                String model = normalizeText(cleanCsvField(fields[2]));
                String serialNumber = normalizeText(cleanCsvField(fields[3]));
                String officeName = normalizeText(cleanCsvField(fields[4]));
                String statusStr = fields.length > 5 ? cleanCsvField(fields[5]) : "OPERATIVO";

                BigDecimal purchasePrice = null;
                if (fields.length > 6) {
                    String priceStr = cleanCsvField(fields[6]);
                    if (!priceStr.isEmpty()) {
                        try {
                            purchasePrice = new BigDecimal(priceStr);
                        } catch (Exception e) {
                            // ignore
                        }
                    }
                }

                LocalDate purchaseDate = null;
                if (fields.length > 7) {
                    String dateStr = cleanCsvField(fields[7]);
                    if (!dateStr.isEmpty()) {
                        try {
                            purchaseDate = LocalDate.parse(dateStr);
                        } catch (Exception e) {
                            // ignore
                        }
                    }
                }

                if (materialType.isEmpty() || officeName.isEmpty()) {
                    continue;
                }

                Office office = officeRepository.findByNameIgnoreCase(officeName)
                        .orElseGet(() -> {
                            Office newOffice = new Office(UUID.randomUUID().toString(), officeName);
                            newOffice.setActive(true);
                            return officeRepository.save(newOffice);
                        });

                if (!office.isActive()) {
                    office.setActive(true);
                    office = officeRepository.save(office);
                }

                MaterialStatus status;
                try {
                    status = MaterialStatus.valueOf(statusStr.toUpperCase());
                } catch (Exception e) {
                    status = MaterialStatus.OPERATIVO;
                }

                String publicCode = generatePublicCode();
                while (materialRepository.findByPublicCode(publicCode).isPresent()) {
                    publicCode = generatePublicCode();
                }

                Material material = new Material(
                        publicCode,
                        materialType,
                        brand,
                        model,
                        serialNumber,
                        office,
                        status
                );
                material.setPurchasePrice(purchasePrice);
                material.setPurchaseDate(purchaseDate);
                material.setActive(true);
                Material savedMaterial = materialRepository.save(material);

                MaterialHistory history = new MaterialHistory(
                        savedMaterial,
                        "MATERIAL_IMPORTED",
                        null,
                        savedMaterial.getStatus(),
                        null,
                        savedMaterial.getOffice(),
                        "Importado vía masiva CSV",
                        performer
                );
                materialHistoryRepository.save(history);

                String newValueJson = toJson(new MaterialResponse(savedMaterial));
                auditService.logEvent("Material", savedMaterial.getPublicCode(), "MATERIAL_IMPORTED", "USER", performerPublicId, ip, userAgent, null, newValueJson);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error reading CSV file: " + e.getMessage(), e);
        }
    }

    private String cleanCsvField(String field) {
        if (field == null) {
            return "";
        }
        String trimmed = field.trim();
        if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
            trimmed = trimmed.substring(1, trimmed.length() - 1);
        }
        return trimmed.replace("\"\"", "\"").trim();
    }

    @Transactional(readOnly = true)
    public String exportMaterialsToCsv() {
        java.util.List<Material> materials = materialRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("publicCode,materialType,brand,model,serialNumber,officeName,status,active\n");
        for (Material material : materials) {
            sb.append(escapeCsv(material.getPublicCode())).append(",")
              .append(escapeCsv(material.getMaterialType())).append(",")
              .append(escapeCsv(material.getBrand())).append(",")
              .append(escapeCsv(material.getModel())).append(",")
              .append(escapeCsv(material.getSerialNumber())).append(",")
              .append(escapeCsv(material.getOffice().getName())).append(",")
              .append(material.getStatus().name()).append(",")
              .append(material.isActive() && material.getStatus() != MaterialStatus.BAJA)
              .append("\n");
        }
        return sb.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    @Transactional
    public void importMaterialsFromExcel(org.springframework.web.multipart.MultipartFile file, String performerPublicId, String ip, String userAgent) {
        User performer = userRepository.findByPublicId(performerPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + performerPublicId));

        try (org.apache.poi.ss.usermodel.Workbook workbook = org.apache.poi.ss.usermodel.WorkbookFactory.create(file.getInputStream())) {
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);
            boolean isHeader = true;
            for (org.apache.poi.ss.usermodel.Row row : sheet) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                String materialType = normalizeText(getCellValueAsString(row.getCell(0)));
                String brand = normalizeText(getCellValueAsString(row.getCell(1)));
                String model = normalizeText(getCellValueAsString(row.getCell(2)));
                String serialNumber = normalizeText(getCellValueAsString(row.getCell(3)));
                String officeName = normalizeText(getCellValueAsString(row.getCell(4)));
                String statusStr = getCellValueAsString(row.getCell(5));
                String priceStr = getCellValueAsString(row.getCell(6));
                String dateStr = getCellValueAsString(row.getCell(7));

                if (materialType.isEmpty() || officeName.isEmpty()) {
                    continue;
                }

                Office office = officeRepository.findByNameIgnoreCase(officeName)
                        .orElseGet(() -> {
                            Office newOffice = new Office(UUID.randomUUID().toString(), officeName);
                            newOffice.setActive(true);
                            return officeRepository.save(newOffice);
                        });

                if (!office.isActive()) {
                    office.setActive(true);
                    office = officeRepository.save(office);
                }

                MaterialStatus status;
                try {
                    status = MaterialStatus.valueOf(statusStr.toUpperCase());
                } catch (Exception e) {
                    status = MaterialStatus.OPERATIVO;
                }

                BigDecimal purchasePrice = null;
                if (!priceStr.isEmpty()) {
                    try {
                        purchasePrice = new BigDecimal(priceStr);
                    } catch (Exception e) {
                        // ignore
                    }
                }

                LocalDate purchaseDate = null;
                if (!dateStr.isEmpty()) {
                    try {
                        purchaseDate = LocalDate.parse(dateStr);
                    } catch (Exception e) {
                        try {
                            org.apache.poi.ss.usermodel.Cell dateCell = row.getCell(7);
                            if (dateCell != null && org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(dateCell)) {
                                purchaseDate = dateCell.getLocalDateTimeCellValue().toLocalDate();
                            }
                        } catch (Exception ex) {
                            // ignore
                        }
                    }
                }

                String publicCode = generatePublicCode();
                while (materialRepository.findByPublicCode(publicCode).isPresent()) {
                    publicCode = generatePublicCode();
                }

                Material material = new Material(
                        publicCode,
                        materialType,
                        brand,
                        model,
                        serialNumber,
                        office,
                        status
                );
                material.setPurchasePrice(purchasePrice);
                material.setPurchaseDate(purchaseDate);
                material.setActive(true);
                Material savedMaterial = materialRepository.save(material);

                MaterialHistory history = new MaterialHistory(
                        savedMaterial,
                        "MATERIAL_IMPORTED",
                        null,
                        savedMaterial.getStatus(),
                        null,
                        savedMaterial.getOffice(),
                        "Importado vía masiva Excel",
                        performer
                );
                materialHistoryRepository.save(history);

                String newValueJson = toJson(new MaterialResponse(savedMaterial));
                auditService.logEvent("Material", savedMaterial.getPublicCode(), "MATERIAL_IMPORTED", "USER", performerPublicId, ip, userAgent, null, newValueJson);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error reading Excel file: " + e.getMessage(), e);
        }
    }

    private String getCellValueAsString(org.apache.poi.ss.usermodel.Cell cell) {
        if (cell == null) {
            return "";
        }
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate().toString();
                }
                double val = cell.getNumericCellValue();
                if (val == (long) val) {
                    return String.valueOf((long) val);
                }
                return String.valueOf(val);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            default:
                return "";
        }
    }

    @Transactional(readOnly = true)
    public byte[] exportMaterialsToExcel() {
        List<Material> materials = materialRepository.findAll();
        try (org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook();
             java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
             
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("Inventario");
            
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            String[] columns = {"Código Público", "Tipo Material", "Marca", "Modelo", "Nº Serie", "Oficina", "Estado", "Precio Adquisición", "Fecha Adquisición", "Activo"};
            for (int i = 0; i < columns.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                
                org.apache.poi.ss.usermodel.CellStyle style = workbook.createCellStyle();
                org.apache.poi.ss.usermodel.Font font = workbook.createFont();
                font.setBold(true);
                style.setFont(font);
                cell.setCellStyle(style);
            }
            
            int rowIdx = 1;
            for (Material material : materials) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(material.getPublicCode());
                row.createCell(1).setCellValue(material.getMaterialType());
                row.createCell(2).setCellValue(material.getBrand() != null ? material.getBrand() : "");
                row.createCell(3).setCellValue(material.getModel() != null ? material.getModel() : "");
                row.createCell(4).setCellValue(material.getSerialNumber() != null ? material.getSerialNumber() : "");
                row.createCell(5).setCellValue(material.getOffice() != null ? material.getOffice().getName() : "");
                row.createCell(6).setCellValue(material.getStatus().name());
                
                if (material.getPurchasePrice() != null) {
                    row.createCell(7).setCellValue(material.getPurchasePrice().doubleValue());
                } else {
                    row.createCell(7).setCellValue("");
                }
                
                if (material.getPurchaseDate() != null) {
                    row.createCell(8).setCellValue(material.getPurchaseDate().toString());
                } else {
                    row.createCell(8).setCellValue("");
                }
                
                row.createCell(9).setCellValue(material.isActive() ? "SÍ" : "NO");
            }
            
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel file: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public byte[] exportMaterialsToPdf() {
        List<Material> materials = materialRepository.findAll();
        try (java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
            com.lowagie.text.Document document = new com.lowagie.text.Document(com.lowagie.text.PageSize.A4.rotate());
            com.lowagie.text.pdf.PdfWriter.getInstance(document, out);
            document.open();
            
            com.lowagie.text.Font titleFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 18);
            com.lowagie.text.Font headerFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 9);
            com.lowagie.text.Font dataFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA, 8);
            
            com.lowagie.text.Paragraph title = new com.lowagie.text.Paragraph("GESTION DE INVENTARIO - Reporte de Inventario de Materiales", titleFont);
            title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);
            
            com.lowagie.text.pdf.PdfPTable table = new com.lowagie.text.pdf.PdfPTable(10);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2.5f, 1.5f, 1.2f, 1.2f, 1.5f, 1.5f, 1.2f, 1.0f, 1.2f, 0.7f});
            
            String[] headers = {"Código Público", "Tipo", "Marca", "Modelo", "Nº Serie", "Oficina", "Estado", "Precio", "Fecha Compra", "Activo"};
            for (String columnHeader : headers) {
                com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase(columnHeader, headerFont));
                cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                cell.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_CENTER);
                table.addCell(cell);
            }
            
            for (Material material : materials) {
                table.addCell(new com.lowagie.text.Phrase(material.getPublicCode(), dataFont));
                table.addCell(new com.lowagie.text.Phrase(material.getMaterialType(), dataFont));
                table.addCell(new com.lowagie.text.Phrase(material.getBrand() != null ? material.getBrand() : "", dataFont));
                table.addCell(new com.lowagie.text.Phrase(material.getModel() != null ? material.getModel() : "", dataFont));
                table.addCell(new com.lowagie.text.Phrase(material.getSerialNumber() != null ? material.getSerialNumber() : "", dataFont));
                table.addCell(new com.lowagie.text.Phrase(material.getOffice() != null ? material.getOffice().getName() : "", dataFont));
                table.addCell(new com.lowagie.text.Phrase(material.getStatus().name(), dataFont));
                
                String priceStr = material.getPurchasePrice() != null ? String.format("%.2f €", material.getPurchasePrice().doubleValue()) : "-";
                table.addCell(new com.lowagie.text.Phrase(priceStr, dataFont));
                
                String dateStr = material.getPurchaseDate() != null ? material.getPurchaseDate().toString() : "-";
                table.addCell(new com.lowagie.text.Phrase(dateStr, dataFont));
                
                table.addCell(new com.lowagie.text.Phrase(material.isActive() ? "SÍ" : "NO", dataFont));
            }
            
            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF file: " + e.getMessage(), e);
        }
    }
}
