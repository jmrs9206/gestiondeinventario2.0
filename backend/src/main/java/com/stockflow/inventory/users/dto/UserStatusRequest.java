package com.stockflow.inventory.users.dto;

import jakarta.validation.constraints.NotNull;

public class UserStatusRequest {

    @NotNull(message = "Active status is mandatory")
    private Boolean active;

    // Getters and Setters
    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
