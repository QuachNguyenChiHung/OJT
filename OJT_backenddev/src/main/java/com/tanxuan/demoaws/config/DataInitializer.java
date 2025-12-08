package com.tanxuan.demoaws.config;

import com.tanxuan.demoaws.model.*;
import com.tanxuan.demoaws.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Collections;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedData(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            ProductDetailsRepository productDetailsRepository,
            AppUserRepository appUserRepository,
            CustomerOrderRepository orderRepository,
            OrderDetailsRepository orderDetailsRepository,
            BannerRepository bannerRepository,
            BrandRepository brandRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
            CartRepository cartRepository // added cart repository
    ) {
        return args -> {
            if (categoryRepository.count() == 0) {
                seedTransactional(
                        categoryRepository,
                        productRepository,
                        productDetailsRepository,
                        appUserRepository,
                        orderRepository,
                        orderDetailsRepository,
                        bannerRepository,
                        brandRepository,
                        passwordEncoder,
                        cartRepository // pass through
                );
            }
        };
    }

    @Transactional
    void seedTransactional(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            ProductDetailsRepository productDetailsRepository,
            AppUserRepository appUserRepository,
            CustomerOrderRepository orderRepository,
            OrderDetailsRepository orderDetailsRepository,
            BannerRepository bannerRepository,
            BrandRepository brandRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
            CartRepository cartRepository // added
    ) {
        // We'll create 10 of each entity and wire relations similar to sample.sql

        // --- Prepare UUIDs (matching sample.sql) ---
        String[] userIds = {
                "11111111-1111-1111-1111-111111111111",
                "11111111-1111-1111-1111-111111111112",
                "11111111-1111-1111-1111-111111111113",
                "11111111-1111-1111-1111-111111111114",
                "11111111-1111-1111-1111-111111111115",
                "11111111-1111-1111-1111-111111111116",
                "11111111-1111-1111-1111-111111111117",
                "11111111-1111-1111-1111-111111111118",
                "11111111-1111-1111-1111-111111111119",
                "11111111-1111-1111-1111-111111111120"
        };

        // (other id arrays kept for reference but not used to set IDs)
        String[] categoryIds = {
                "22222222-2222-2222-2222-222222222221",
                "22222222-2222-2222-2222-222222222222",
                "22222222-2222-2222-2222-222222222223",
                "22222222-2222-2222-2222-222222222224",
                "22222222-2222-2222-2222-222222222225",
                "22222222-2222-2222-2222-222222222226",
                "22222222-2222-2222-2222-222222222227",
                "22222222-2222-2222-2222-222222222228",
                "22222222-2222-2222-2222-222222222229",
                "22222222-2222-2222-2222-222222222230"
        };

        String[] brandIds = {
                "33333333-3333-3333-3333-333333333331",
                "33333333-3333-3333-3333-333333333332",
                "33333333-3333-3333-3333-333333333333",
                "33333333-3333-3333-3333-333333333334",
                "33333333-3333-3333-3333-333333333335",
                "33333333-3333-3333-3333-333333333336",
                "33333333-3333-3333-3333-333333333337",
                "33333333-3333-3333-3333-333333333338",
                "33333333-3333-3333-3333-333333333339",
                "33333333-3333-3333-3333-333333333340"
        };

        String[] colorIds = {
                "44444444-4444-4444-4444-444444444441",
                "44444444-4444-4444-4444-444444444442",
                "44444444-4444-4444-4444-444444444443",
                "44444444-4444-4444-4444-444444444444",
                "44444444-4444-4444-4444-444444444445",
                "44444444-4444-4444-4444-444444444446",
                "44444444-4444-4444-4444-444444444447",
                "44444444-4444-4444-4444-444444444448",
                "44444444-4444-4444-4444-444444444449",
                "44444444-4444-4444-4444-444444444450"
        };

        String[] productIds = {
                "55555555-5555-5555-5555-555555555551",
                "55555555-5555-5555-5555-555555555552",
                "55555555-5555-5555-5555-555555555553",
                "55555555-5555-5555-5555-555555555554",
                "55555555-5555-5555-5555-555555555555",
                "55555555-5555-5555-5555-555555555556",
                "55555555-5555-5555-5555-555555555557",
                "55555555-5555-5555-5555-555555555558",
                "55555555-5555-5555-5555-555555555559",
                "55555555-5555-5555-5555-555555555560"
        };

        String[] pdIds = {
                "66666666-6666-6666-6666-666666666661",
                "66666666-6666-6666-6666-666666666662",
                "66666666-6666-6666-6666-666666666663",
                "66666666-6666-6666-6666-666666666664",
                "66666666-6666-6666-6666-666666666665",
                "66666666-6666-6666-6666-666666666666",
                "66666666-6666-6666-6666-666666666667",
                "66666666-6666-6666-6666-666666666668",
                "66666666-6666-6666-6666-666666666669",
                "66666666-6666-6666-6666-666666666670"
        };

        String[] bannerIds = {
                "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01",
                "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02",
                "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03",
                "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04",
                "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05",
                "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06",
                "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa07",
                "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa08",
                "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa09",
                "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa10"
        };

        String[] orderIds = {
                "77777777-7777-7777-7777-777777777771",
                "77777777-7777-7777-7777-777777777772",
                "77777777-7777-7777-7777-777777777773",
                "77777777-7777-7777-7777-777777777774",
                "77777777-7777-7777-7777-777777777775",
                "77777777-7777-7777-7777-777777777776",
                "77777777-7777-7777-7777-777777777777",
                "77777777-7777-7777-7777-777777777778",
                "77777777-7777-7777-7777-777777777779",
                "77777777-7777-7777-7777-777777777780"
        };

        String[] odIds = {
                "88888888-8888-8888-8888-888888888881",
                "88888888-8888-8888-8888-888888888882",
                "88888888-8888-8888-8888-888888888883",
                "88888888-8888-8888-8888-888888888884",
                "88888888-8888-8888-8888-888888888885",
                "88888888-8888-8888-8888-888888888886",
                "88888888-8888-8888-8888-888888888887",
                "88888888-8888-8888-8888-888888888888",
                "88888888-8888-8888-8888-888888888889",
                "88888888-8888-8888-8888-888888888890"
        };

        String[] ratingIds = {
                "99999999-9999-9999-9999-999999999991",
                "99999999-9999-9999-9999-999999999992",
                "99999999-9999-9999-9999-999999999993",
                "99999999-9999-9999-9999-999999999994",
                "99999999-9999-9999-9999-999999999995",
                "99999999-9999-9999-9999-999999999996",
                "99999999-9999-9999-9999-999999999997",
                "99999999-9999-9999-9999-999999999998",
                "99999999-9999-9999-9999-999999999999",
                "99999999-9999-9999-9999-999999999990"
        };

        // --- Create Categories ---
        List<Category> categories = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Category c = new Category();
            // DO NOT set ID manually - let Hibernate generate it to ensure inserts
            c.setCName("Category " + (i + 1));
            categories.add(c);
        }
        categoryRepository.saveAll(categories);

        // --- Create Brands ---
        List<Brand> brands = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Brand b = new Brand();
            // DO NOT set ID manually
            b.setBrandName("Brand " + (i + 1));
            brands.add(b);
        }
        brandRepository.saveAll(brands);

        // --- Create Products ---
        List<Product> products = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Product p = new Product();
            // DO NOT set ID manually
            p.setPName("Product " + (i + 1));
            p.setPDesc("Sample product " + (i + 1));
            // Prices are in VND and must be greater than 100,000
            // Use (i+1)*100000 + 1 to ensure strictly greater than 100,000
            // generate price and adjust rightmost digit: if it ends with '1', change to '0'
            BigDecimal generatedPrice = BigDecimal.valueOf((i + 1) * 100000L + 1L);
            if (generatedPrice.remainder(BigDecimal.TEN).intValue() == 1) {
                generatedPrice = generatedPrice.subtract(BigDecimal.ONE);
            }
            p.setPrice(generatedPrice);
            // link category and brand (use persisted lists)
            p.setCategory(categories.get(i));
            p.setBrand(brands.get(i));
            products.add(p);
        }
        productRepository.saveAll(products);

        // --- Create ProductDetails ---
        String[] colorNames = {"Red","Green","Blue","Black","White"};
        String[] colorCodes = {"#FF0000","#00FF00","#0000FF","#000000","#FFFFFF"};
        List<ProductDetails> pds = new ArrayList<>();
        String[] sizes = {"S","M","L","XL","XXL"}; // 5 sizes for product details
        // We'll create 25 product details per product (5 sizes x 5 colors)
        for (int i = 0; i < 10; i++) {
            for (int s = 0; s < sizes.length; s++) {
                for (int c = 0; c < colorNames.length; c++) {
                    ProductDetails pd = new ProductDetails();
                    // DO NOT set ID manually
                    pd.setProduct(products.get(i));
                    pd.setSize(sizes[s]);
                    // each size has 5 different color names and codes
                    pd.setColorName(colorNames[c]);
                    pd.setColorCode(colorCodes[c]);
                    // Ensure at least 5 images and they must be "/img/clothes.png"
                    pd.setImgList("[\"/img/clothes.png\",\"/img/clothes.png\",\"/img/clothes.png\",\"/img/clothes.png\",\"/img/clothes.png\"]");
                    // amount varies randomly between 0 and 20
                    pd.setAmount(java.util.concurrent.ThreadLocalRandom.current().nextInt(0, 21));
                    // Make Product 9 (index 8) entirely unavailable
                    if (i == 8) {
                        pd.setInStock(false);
                    } else {
                        pd.setInStock(c != 2); // Blue color out of stock for variety
                    }
                    pds.add(pd);
                }
            }
        }
        // Validate that we created 25 ProductDetails per product (5 sizes × 5 colors)
        int expectedTotal = products.size() * sizes.length * colorNames.length; // 10 × 5 × 5 = 250
        if (pds.size() != expectedTotal) {
            throw new IllegalStateException("Expected " + expectedTotal + " ProductDetails but created " + pds.size());
        }
        productDetailsRepository.saveAll(pds);

        // --- Create Users ---
        List<AppUser> users = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            AppUser u = new AppUser();
            // DO NOT set ID manually
            u.setEmail("user" + (i+1) + "@example.com");
            u.setPhoneNumber(String.format("09000000%02d", i+1));
            u.setUName("User " + (i+1));
            u.setAddress((123 + i) + " Main St");
            u.setRole(i == 2 || i == 7 ? "ADMIN" : (i == 1 || i == 5 ? "EMPLOYEE" : "USER"));
            u.setIsActive(i != 4);
            u.setPassword(passwordEncoder.encode("password" + (i+1)));
            users.add(u);
        }
        appUserRepository.saveAll(users);

        // --- Create Banners ---
        List<Banner> banners = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Banner bn = new Banner();
            // DO NOT set ID manually
            bn.setImageUrl("https://example.com/banner" + (i+1) + ".jpg");
            bn.setIsActive(true);
            bn.setTitle("Banner " + (i+1));
            // link to user i
            bn.setUser(users.get(i));
            banners.add(bn);
        }
        bannerRepository.saveAll(banners);

        // --- Create Orders ---
        String[] statuses = {"PENDING","PROCESSING","SHIPPING","DELIVERED","CANCELLED","PENDING","PROCESSING","SHIPPING","DELIVERED","PENDING"};
        List<CustomerOrder> orders = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            CustomerOrder o = new CustomerOrder();
            // DO NOT set ID manually
            o.setUser(users.get(i));
            o.setStatus(statuses[i]);
            o.setDateCreated(Instant.parse("2023-01-0" + ((i%9)+1) + "T00:00:00Z"));
            o.setTotalPrice(BigDecimal.ZERO);
            orders.add(o);
        }
        orderRepository.saveAll(orders);

        // --- Create OrderDetails ---
        List<OrderDetails> odList = new ArrayList<>();
        int[] quantities = {2,1,2,1,1,2,1,3,1,1};
        BigDecimal[] odPrices = {
                new BigDecimal("10.00"),new BigDecimal("20.00"),new BigDecimal("30.00"),new BigDecimal("40.00"),new BigDecimal("50.00"),
                new BigDecimal("60.00"),new BigDecimal("70.00"),new BigDecimal("80.00"),new BigDecimal("90.00"),new BigDecimal("100.00")
        };
        for (int i = 0; i < 10; i++) {
            OrderDetails od = new OrderDetails();
            // DO NOT set ID manually
            od.setOrder(orders.get(i));
            // use the first product detail for each product (index i*25)
            od.setProductDetails(pds.get(i * 25));
            od.setQuantity(quantities[i]);
            od.setPrice(odPrices[i]);
            // add to order
            orders.get(i).addOrderDetail(od);
            odList.add(od);
        }
        orderDetailsRepository.saveAll(odList);

        // Update order totalPrices after adding details
        for (CustomerOrder o : orders) {
            o.calculateTotalPrice();
        }
        orderRepository.saveAll(orders);

        // --- Create Ratings ---
        // For each product, assign up to 10 unique random ratings from existing users (no duplicate user per product)
        if (users != null && !users.isEmpty()) {
            int ratingsPerProduct = Math.min(10, users.size());
            for (Product p : products) {
                // Shuffle a copy of the users list and pick the first N users
                List<AppUser> shuffledUsers = new ArrayList<>(users);
                Collections.shuffle(shuffledUsers);
                for (int j = 0; j < ratingsPerProduct; j++) {
                    AppUser u = shuffledUsers.get(j);
                    Rating r = new Rating();
                    r.setUser(u);
                    r.setProduct(p);
                    // random rating value between 1 and 5
                    int ratingValue = java.util.concurrent.ThreadLocalRandom.current().nextInt(1, 6);
                    r.setRatingValue(ratingValue);
                    p.getRatings().add(r);
                }
                // save product once after adding its ratings (Product has cascade on ratings)
                productRepository.save(p);
            }
        }

        // --- Create Carts: add 5 carts per user ---
        List<Cart> carts = new ArrayList<>();
        // We'll pick random productDetails for each cart entry
        for (AppUser u : users) {
            for (int i = 0; i < 5; i++) {
                Cart cart = new Cart();
                cart.setUser(u);
                // choose a random product detail across all pds
                ProductDetails randomPd = pds.get(java.util.concurrent.ThreadLocalRandom.current().nextInt(0, pds.size()));
                cart.setProductDetails(randomPd);
                // random quantity between 1 and 5
                cart.setQuantity(java.util.concurrent.ThreadLocalRandom.current().nextInt(1, 6));
                carts.add(cart);
            }
        }
        cartRepository.saveAll(carts);

        // --- Add additional fee to orders based on user's carts ---
        // Calculate subtotal per user from carts we just created
        java.util.Map<java.util.UUID, BigDecimal> userCartSubtotals = new java.util.HashMap<>();
        for (Cart c : carts) {
            java.util.UUID uid = c.getUser().getUserId();
            BigDecimal itemTotal = c.getItemTotal();
            userCartSubtotals.merge(uid, itemTotal, BigDecimal::add);
        }

        // Define additional fee as 5% of cart subtotal (rounded to 2 decimals)
        for (CustomerOrder o : orders) {
            BigDecimal subtotal = userCartSubtotals.getOrDefault(o.getUser().getUserId(), BigDecimal.ZERO);
            BigDecimal fee = subtotal.multiply(new BigDecimal("0.05"));
            fee = fee.setScale(2, java.math.RoundingMode.HALF_UP);
            // ensure order's totalPrice already calculated (order.calculateTotalPrice called earlier)
            if (o.getTotalPrice() == null) {
                o.calculateTotalPrice();
            }
            o.setTotalPrice(o.getTotalPrice().add(fee));
        }
        // Persist updated orders with additional fees
        orderRepository.saveAll(orders);

    }
}
