package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
}


