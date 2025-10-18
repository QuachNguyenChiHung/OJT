package com.tanxuan.demoaws.config;

import com.tanxuan.demoaws.model.*;
import com.tanxuan.demoaws.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.Instant;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedData(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            ProductDetailsRepository productDetailsRepository,
            ColorRepository colorRepository,
            AppUserRepository appUserRepository,
            CustomerOrderRepository orderRepository,
            OrderDetailsRepository orderDetailsRepository,
            BannerRepository bannerRepository,
            BrandRepository brandRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (categoryRepository.count() == 0) {
                // Create Categories
                Category clothing = new Category();
                clothing.setCName("Clothing");
                categoryRepository.save(clothing);

                Category shoes = new Category();
                shoes.setCName("Shoes");
                categoryRepository.save(shoes);

                // Create Brands
                Brand nike = new Brand();
                nike.setBrandName("Nike");
                brandRepository.save(nike);

                Brand adidas = new Brand();
                adidas.setBrandName("Adidas");
                brandRepository.save(adidas);

                // Create Colors
                Color black = new Color("Black", "#000000");
                colorRepository.save(black);

                Color blue = new Color("Blue", "#0000FF");
                colorRepository.save(blue);

                Color white = new Color("White", "#FFFFFF");
                colorRepository.save(white);

                // Create Products
                Product product1 = new Product();
                product1.setPName("Sport Shoes");
                product1.setPDesc("High-quality sport shoes for running");
                product1.setPrice(new BigDecimal("199.99"));
                product1.setCategory(shoes);
                product1.setBrand(nike);
                productRepository.save(product1);

                Product product2 = new Product();
                product2.setPName("Running Shirt");
                product2.setPDesc("Comfortable running shirt");
                product2.setPrice(new BigDecimal("49.99"));
                product2.setCategory(clothing);
                product2.setBrand(adidas);
                productRepository.save(product2);

                // Create ProductDetails
                ProductDetails pd1 = new ProductDetails(
                    product1, 
                    black, 
                    "42", 
                    100, 
                    true
                );
                pd1.setImgList("shoe1.jpg,shoe2.jpg");
                productDetailsRepository.save(pd1);

                ProductDetails pd2 = new ProductDetails(
                    product2, 
                    blue, 
                    "L", 
                    200, 
                    true
                );
                pd2.setImgList("shirt1.jpg,shirt2.jpg");
                productDetailsRepository.save(pd2);

                // Create User
                AppUser user = new AppUser();
                user.setEmail("user@example.com");
                user.setPassword(passwordEncoder.encode("password"));
                user.setUName("John Doe");
                user.setPhoneNumber("0123456789");
                user.setAddress("123 Main St");
                user.setRole("USER");
                user.setIsActive(true);
                appUserRepository.save(user);

                // Create Admin
                AppUser admin = new AppUser();
                admin.setEmail("admin@example.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setUName("Admin User");
                admin.setPhoneNumber("0987654321");
                admin.setAddress("456 Admin St");
                admin.setRole("ADMIN");
                admin.setIsActive(true);
                appUserRepository.save(admin);

                // Create Order with OrderDetails
                CustomerOrder order1 = new CustomerOrder();
                order1.setUser(user);
                order1.setStatus("PENDING");
                order1.setDateCreated(Instant.now());
                orderRepository.save(order1);

                // Add order details
                OrderDetails detail1 = new OrderDetails();
                detail1.setOrder(order1);
                detail1.setProductDetails(pd1);
                detail1.setQuantity(1);
                detail1.setPrice(new BigDecimal("199.99"));
                order1.addOrderDetail(detail1);
                
                // Calculate and set total price
                order1.calculateTotalPrice();
                orderRepository.save(order1);

                // Create Banner
                Banner banner = new Banner();
                banner.setTitle("Summer Sale");
                banner.setImageUrl("banner-summer.jpg");
                banner.setIsActive(true);
                banner.setUser(admin);
                bannerRepository.save(banner);
            }
        };
    }
}
