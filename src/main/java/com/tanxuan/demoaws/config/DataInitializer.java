package com.tanxuan.demoaws.config;

import com.tanxuan.demoaws.model.*;
import com.tanxuan.demoaws.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedData(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
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
                clothing.setName("Clothing");
                categoryRepository.save(clothing);

                Category shoes = new Category();
                shoes.setName("Shoes");
                categoryRepository.save(shoes);

                // Create Brands
                Brand nike = new Brand();
                nike.setBrandName("Nike");
                brandRepository.save(nike);

                Brand adidas = new Brand();
                adidas.setBrandName("Adidas");
                brandRepository.save(adidas);

                // Create Products
                Product product1 = new Product();
                product1.setName("Sport Shoes");
                product1.setPrice(199.99f);
                product1.setAmount(100);
                product1.setImgList("shoe1.jpg,shoe2.jpg");
                product1.setSize("42");
                product1.setColor("Black");
                product1.setStatus("AVAILABLE");
                product1.setCategory(shoes);
                product1.setBrand(nike);
                productRepository.save(product1);

                Product product2 = new Product();
                product2.setName("Running Shirt");
                product2.setPrice(49.99f);
                product2.setAmount(200);
                product2.setImgList("shirt1.jpg,shirt2.jpg");
                product2.setSize("L");
                product2.setColor("Blue");
                product2.setStatus("AVAILABLE");
                product2.setCategory(clothing);
                product2.setBrand(adidas);
                productRepository.save(product2);

                // Create User
                AppUser user = new AppUser();
                user.setEmail("user@example.com");
                user.setPassword(passwordEncoder.encode("password"));
                user.setFullName("John Doe");
                user.setPhoneNumber("0123456789");
                user.setAddress("123 Main St");
                user.setRole("USER");
                user.setActive(true);
                appUserRepository.save(user);

                // Create Admin
                AppUser admin = new AppUser();
                admin.setEmail("admin@example.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setFullName("Admin User");
                admin.setPhoneNumber("0987654321");
                admin.setAddress("456 Admin St");
                admin.setRole("ADMIN");
                admin.setActive(true);
                appUserRepository.save(admin);

                // Create Order with OrderDetails
                CustomerOrder order1 = new CustomerOrder();
                order1.setUser(user);
                order1.setStatus("PENDING");
                order1.setDateCreated(new java.util.Date());
                orderRepository.save(order1);

                // Add order details
                OrderDetails detail1 = new OrderDetails();
                detail1.setOrder(order1);
                detail1.setProduct(product1);
                detail1.setQuantity(1);
                detail1.setPrice(199.99f);
                order1.addOrderDetail(detail1);
                orderRepository.save(order1);

                // Create Banner
                Banner banner = new Banner();
                banner.setTitle("Summer Sale");
                banner.setImageUrl("banner-summer.jpg");
                banner.setActive(true);
                bannerRepository.save(banner);
            }
        };
    }
}
