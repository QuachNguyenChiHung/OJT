package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findByUser_Id(Long userId);
    List<CustomerOrder> findByStatus(String status);
    List<CustomerOrder> findByDateCreatedBetween(Date startDate, Date endDate);
    List<CustomerOrder> findByStatusAndDateCreatedBetween(String status, Date startDate, Date endDate);
    List<CustomerOrder> findByUser_IdAndStatus(Long userId, String status);
    @Query("SELECT o FROM CustomerOrder o JOIN o.orderDetails d WHERE d.product.id = :productId")
    List<CustomerOrder> findByProductId(@Param("productId") Long productId);
}
