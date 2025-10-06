package com.tanxuan.demoaws.config;

import com.tanxuan.demoaws.model.*;
import com.tanxuan.demoaws.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            AppUserRepository appUserRepository,
            CustomerOrderRepository customerOrderRepository,
            BannerRepository bannerRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (categoryRepository.count() == 0) {
                Category electronics = new Category();
                electronics.setName("Electronics");
                electronics.setDescription("Gadgets and devices");
                categoryRepository.save(electronics);

                Product phone = new Product();
                phone.setName("Smartphone");
                phone.setDescription("Latest model");
                phone.setPrice(new BigDecimal("699.99"));
                phone.setStock(50);
                phone.setCategory(electronics);
                productRepository.save(phone);

                AppUser user = new AppUser();
                user.setEmail("user@example.com");
                user.setFullName("Demo User");
                user.setPassword(passwordEncoder.encode("password"));
                user.setRole(AppUser.Role.USER);
                user.setStatus(AppUser.UserStatus.ACTIVE);
                appUserRepository.save(user);

                CustomerOrder order = new CustomerOrder();
                order.setUser(user);
                order.setTotalAmount(new BigDecimal("699.99"));
                order.setShippingAddress("123 Demo Street, City");
                customerOrderRepository.save(order);

                Banner banner = new Banner();
                banner.setTitle("Big Sale");
                banner.setImageUrl("/images/sale.jpg");
                banner.setIsActive(true);
                banner.setLink("/products");
                bannerRepository.save(banner);
            }
        };
    }
}


