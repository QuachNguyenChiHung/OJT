package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.OrderDetails;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrderDetailsRepository extends JpaRepository<OrderDetails, UUID> {
    List<OrderDetails> findByOrder_oId(UUID orderId);
    List<OrderDetails> findByProductDetailsPdId(UUID productDetailsId);
}
