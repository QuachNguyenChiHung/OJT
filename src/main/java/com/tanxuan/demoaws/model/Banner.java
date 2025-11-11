package com.tanxuan.demoaws.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "Banner")
public class Banner extends Auditable {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "banner_id", columnDefinition = "uniqueidentifier")
    private UUID bannerId;

    @Column(name = "image_url", length = 255, columnDefinition = "nvarchar(255)")
    private String imageUrl;

    @Column(name = "is_active", columnDefinition = "bit")
    private Boolean isActive = true;

    @Column(name = "title", length = 128, columnDefinition = "nvarchar(128)")
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "u_id")
    private AppUser user;

    // Constructor
    public Banner() {
    }

    // Getters and Setters
    public UUID getBannerId() {
        return bannerId;
    }

    public void setBannerId(UUID bannerId) {
        this.bannerId = bannerId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public AppUser getUser() {
        return user;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }
}

