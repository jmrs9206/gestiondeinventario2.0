package com.vdenergy.inventory.offices.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class OfficeRequest {

    @NotBlank(message = "Office name is mandatory")
    @Size(max = 160, message = "Office name cannot exceed 160 characters")
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
