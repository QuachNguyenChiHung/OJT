package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, UUID> {
    List<CustomerOrder> findByUserUserId(UUID userId);
//    List<CustomerOrder> findByStatus(String status);
//    List<CustomerOrder> findByDateCreatedBetween(Instant startDate, Instant endDate);
    List<CustomerOrder> findByStatusAndDateCreatedBetween(String status, Instant startDate, Instant endDate);
    List<CustomerOrder> findByUserUserIdAndStatus(UUID userId, String status);

    @Query("SELECT o FROM CustomerOrder o JOIN o.orderDetails d WHERE d.productDetails.product.PId = :productId")
    List<CustomerOrder> findByProductId(@Param("productId") UUID productId);
}

