package com.vdenergy.inventory.offices.entity;

import com.vdenergy.inventory.common.entity.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "offices")
public class Office extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, length = 64)
    private String publicId;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    // Constructors
    public Office() {
    }

    public Office(String publicId, String name) {
        this.publicId = publicId;
        this.name = name;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPublicId() {
        return publicId;
    }

    public void setPublicId(String publicId) {
        this.publicId = publicId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
