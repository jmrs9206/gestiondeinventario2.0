package com.vdenergy.inventory.inventory.entity;

import com.vdenergy.inventory.common.entity.MaterialStatus;
import com.vdenergy.inventory.materials.entity.Material;
import com.vdenergy.inventory.offices.entity.Office;
import com.vdenergy.inventory.users.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "material_history")
public class MaterialHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Column(name = "action", nullable = false, length = 80)
    private String action;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 40)
    private MaterialStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", length = 40)
    private MaterialStatus newStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "previous_office_id")
    private Office previousOffice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_office_id")
    private Office newOffice;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by_user_id")
    private User performedByUser;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public MaterialHistory() {
    }

    public MaterialHistory(Material material, String action, MaterialStatus previousStatus, MaterialStatus newStatus, Office previousOffice, Office newOffice, String comment, User performedByUser) {
        this.material = material;
        this.action = action;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.previousOffice = previousOffice;
        this.newOffice = newOffice;
        this.comment = comment;
        this.performedByUser = performedByUser;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Material getMaterial() {
        return material;
    }

    public void setMaterial(Material material) {
        this.material = material;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public MaterialStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(MaterialStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public MaterialStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(MaterialStatus newStatus) {
        this.newStatus = newStatus;
    }

    public Office getPreviousOffice() {
        return previousOffice;
    }

    public void setPreviousOffice(Office previousOffice) {
        this.previousOffice = previousOffice;
    }

    public Office getNewOffice() {
        return newOffice;
    }

    public void setNewOffice(Office newOffice) {
        this.newOffice = newOffice;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public User getPerformedByUser() {
        return performedByUser;
    }

    public void setPerformedByUser(User performedByUser) {
        this.performedByUser = performedByUser;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
