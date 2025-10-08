package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.OrderDetails;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderDetailsRepository extends JpaRepository<OrderDetails, Long> {
    List<OrderDetails> findByOrder_Id(Long orderId);
    List<OrderDetails> findByProduct_Id(Long productId);
}
