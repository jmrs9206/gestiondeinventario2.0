package com.stockflow.inventory.materials.controller;

import com.stockflow.inventory.common.entity.MaterialStatus;
import com.stockflow.inventory.common.responses.ApiPageResponse;
import com.stockflow.inventory.common.responses.ApiResponse;
import com.stockflow.inventory.materials.dto.MaterialRequest;
import com.stockflow.inventory.materials.dto.MaterialResponse;
import com.stockflow.inventory.materials.service.MaterialService;
import com.stockflow.inventory.users.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ContentDisposition;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/materials")
@PreAuthorize("isAuthenticated()")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_MATERIAL')")
    public ResponseEntity<ApiResponse<MaterialResponse>> createMaterial(
            @Valid @RequestBody MaterialRequest request,
            @AuthenticationPrincipal User performer,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        MaterialResponse response = materialService.createMaterial(request, performer.getPublicId(), ip, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ApiPageResponse<MaterialResponse>>> listMaterials(
            @RequestParam(required = false) MaterialStatus status,
            @RequestParam(required = false) String materialType,
            @RequestParam(required = false) String officePublicId,
            @RequestParam(required = false) String serialNumber,
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive,
            Pageable pageable
    ) {
        Page<MaterialResponse> page = materialService.listMaterials(status, materialType, officePublicId, serialNumber, includeInactive, pageable);
        return ResponseEntity.ok(new ApiResponse<>(new ApiPageResponse<>(page)));
    }

    @PostMapping("/{publicCode}/reactivate")
    @PreAuthorize("hasAuthority('UPDATE_MATERIAL_STATUS')")
    public ResponseEntity<ApiResponse<MaterialResponse>> reactivateMaterial(
            @PathVariable String publicCode,
            @RequestParam(required = false) String comment,
            @AuthenticationPrincipal User performer,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        MaterialResponse response = materialService.reactivateMaterial(publicCode, comment, performer.getPublicId(), ip, userAgent);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @GetMapping("/{publicCode}")
    public ResponseEntity<ApiResponse<MaterialResponse>> getMaterial(@PathVariable String publicCode) {
        MaterialResponse response = materialService.getMaterialByPublicCode(publicCode);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @PutMapping("/{publicCode}")
    @PreAuthorize("hasAuthority('UPDATE_MATERIAL')")
    public ResponseEntity<ApiResponse<MaterialResponse>> updateMaterial(
            @PathVariable String publicCode,
            @Valid @RequestBody MaterialRequest request,
            @AuthenticationPrincipal User performer,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        MaterialResponse response = materialService.updateMaterial(publicCode, request, performer.getPublicId(), ip, userAgent);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @DeleteMapping("/{publicCode}")
    @PreAuthorize("hasAuthority('UPDATE_MATERIAL_STATUS')")
    public ResponseEntity<ApiResponse<MaterialResponse>> deleteMaterial(
            @PathVariable String publicCode,
            @RequestParam(required = true) String comment,
            @AuthenticationPrincipal User performer,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        MaterialResponse response = materialService.decommissionMaterial(publicCode, comment, performer.getPublicId(), ip, userAgent);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @PostMapping("/import")
    @PreAuthorize("hasAuthority('CREATE_MATERIAL')")
    public ResponseEntity<ApiResponse<String>> importMaterials(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @AuthenticationPrincipal User performer,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        String filename = file.getOriginalFilename();
        if (filename != null && (filename.endsWith(".xlsx") || filename.endsWith(".xls"))) {
            materialService.importMaterialsFromExcel(file, performer.getPublicId(), ip, userAgent);
        } else {
            materialService.importMaterialsFromCsv(file, performer.getPublicId(), ip, userAgent);
        }
        return ResponseEntity.ok(new ApiResponse<>("Importación masiva completada con éxito"));
    }

    @GetMapping("/export")
    @PreAuthorize("hasAuthority('READ_MATERIAL_HISTORY')")
    public ResponseEntity<byte[]> exportMaterials() {
        String csvData = materialService.exportMaterialsToCsv();
        byte[] csvBytes = csvData.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename("inventario_materiales.csv")
                .build());
        
        return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/export/excel")
    @PreAuthorize("hasAuthority('READ_MATERIAL_HISTORY')")
    public ResponseEntity<byte[]> exportMaterialsToExcel() {
        byte[] excelBytes = materialService.exportMaterialsToExcel();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename("inventario_materiales.xlsx")
                .build());
        
        return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/export/pdf")
    @PreAuthorize("hasAuthority('READ_MATERIAL_HISTORY')")
    public ResponseEntity<byte[]> exportMaterialsToPdf() {
        byte[] pdfBytes = materialService.exportMaterialsToPdf();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename("inventario_materiales.pdf")
                .build());
        
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
