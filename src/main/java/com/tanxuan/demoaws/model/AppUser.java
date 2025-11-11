package com.tanxuan.demoaws.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Users")
public class AppUser extends Auditable{
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "user_id", columnDefinition = "uniqueidentifier")
    private UUID userId;

    @Column(nullable = false, unique = true, length = 255, columnDefinition = "nvarchar(255)")
    private String email;

    @Column(nullable = false, length = 512, columnDefinition = "nvarchar(512)")
    private String password;

    @Column(name = "u_name", columnDefinition = "nvarchar(255)")
    private String uName;

    @Column(name = "phone_number", length = 13)
    private String phoneNumber;

    @Column(columnDefinition = "nvarchar(255)")
    private String address;

    @Column(name = "role", length = 20, columnDefinition = "nvarchar(20)")
    private String role;

    @Column(name = "isActive", columnDefinition = "bit")
    private Boolean isActive;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<CustomerOrder> orders = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Rating> ratings = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Banner> banners = new ArrayList<>();

    // Constructor
    public AppUser() {
        this.isActive = true;
        this.role = "USER";
    }

    // Getters and Setters
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getUName() { return uName; }
    public void setUName(String uName) { this.uName = uName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public List<CustomerOrder> getOrders() { return orders; }
    public void setOrders(List<CustomerOrder> orders) { this.orders = orders; }

    public List<Rating> getRatings() { return ratings; }
    public void setRatings(List<Rating> ratings) { this.ratings = ratings; }

    public List<Banner> getBanners() { return banners; }
    public void setBanners(List<Banner> banners) { this.banners = banners; }
}
