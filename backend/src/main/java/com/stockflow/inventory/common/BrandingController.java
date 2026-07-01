package com.stockflow.inventory.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.AbstractMap;
import java.util.Map;

@RestController
public class BrandingController {

    @Value("${app.branding.app-name:GESTION DE INVENTARIO}")
    private String appName;

    @Value("${app.branding.company-name:Tu Empresa}")
    private String companyName;

    @Value("${app.branding.logo-url:}")
    private String logoUrl;

    @Value("${app.branding.logo-png-url:}")
    private String logoPngUrl;

    @Value("${app.branding.favicon-url:}")
    private String faviconUrl;

    @Value("${app.branding.primary-color:blue}")
    private String primaryColor;

    @Value("${app.branding.icon-preset:shield}")
    private String iconPreset;

    @Value("${app.branding.theme.mode:dark}")
    private String themeMode;

    @Value("${app.branding.theme.background:#1f232a}")
    private String backgroundColor;

    @Value("${app.branding.theme.surface:#282d35}")
    private String surfaceColor;

    @Value("${app.branding.theme.surface-alt:#303640}")
    private String surfaceAltColor;

    @Value("${app.branding.theme.border:#3b4555}")
    private String borderColor;

    @Value("${app.branding.theme.text:#f8fafc}")
    private String textColor;

    @Value("${app.branding.theme.text-muted:#9fb0c7}")
    private String textMutedColor;

    @Value("${app.branding.theme.accent:#3b82f6}")
    private String accentColor;

    @Value("${app.branding.theme.success:#10b981}")
    private String successColor;

    @Value("${app.branding.theme.warning:#f59e0b}")
    private String warningColor;

    @Value("${app.branding.theme.danger:#ef4444}")
    private String dangerColor;

    @Value("${app.branding.theme.info:#06b6d4}")
    private String infoColor;

    @GetMapping("/api/v1/branding")
    public Map<String, Object> getBranding() {
        return Map.of(
            "appName", appName,
            "companyName", companyName,
            "logoUrl", logoUrl,
            "logoPngUrl", logoPngUrl,
            "faviconUrl", faviconUrl,
            "primaryColor", primaryColor,
            "themeSettings", Map.of(
                "icon", iconPreset,
                "color", primaryColor,
                "mode", themeMode,
                "palette", Map.ofEntries(
                    new AbstractMap.SimpleEntry<>("background", backgroundColor),
                    new AbstractMap.SimpleEntry<>("surface", surfaceColor),
                    new AbstractMap.SimpleEntry<>("surfaceAlt", surfaceAltColor),
                    new AbstractMap.SimpleEntry<>("border", borderColor),
                    new AbstractMap.SimpleEntry<>("text", textColor),
                    new AbstractMap.SimpleEntry<>("textMuted", textMutedColor),
                    new AbstractMap.SimpleEntry<>("accent", accentColor),
                    new AbstractMap.SimpleEntry<>("success", successColor),
                    new AbstractMap.SimpleEntry<>("warning", warningColor),
                    new AbstractMap.SimpleEntry<>("danger", dangerColor),
                    new AbstractMap.SimpleEntry<>("info", infoColor)
                )
            )
        );
    }
}
