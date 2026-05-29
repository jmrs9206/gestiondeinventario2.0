package com.vdenergy.inventory.dashboard.dto;

public class OfficeCountDto {
    private String publicId;
    private String name;
    private long count;

    public OfficeCountDto() {
    }

    public OfficeCountDto(String publicId, String name, long count) {
        this.publicId = publicId;
        this.name = name;
        this.count = count;
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

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
