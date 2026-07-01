package com.stockflow.inventory.users.dto;

import com.stockflow.inventory.users.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserUpdateRequest {

    @NotBlank(message = "First name is mandatory")
    @Size(max = 120, message = "First name cannot exceed 120 characters")
    private String firstName;

    @NotBlank(message = "Last name is mandatory")
    @Size(max = 120, message = "Last name cannot exceed 120 characters")
    private String lastName;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Email should be valid")
    @Size(max = 180, message = "Email cannot exceed 180 characters")
    private String email;

    @NotNull(message = "Role is mandatory")
    private Role role;

    // Getters and Setters
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = com.stockflow.inventory.common.utils.TextNormalizer.normalize(firstName);
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = com.stockflow.inventory.common.utils.TextNormalizer.normalize(lastName);
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email != null ? com.stockflow.inventory.common.utils.TextNormalizer.normalize(email).toLowerCase() : null;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
