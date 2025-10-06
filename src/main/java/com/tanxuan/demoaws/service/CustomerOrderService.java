package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.model.AppUser;
import com.tanxuan.demoaws.model.CustomerOrder;
import com.tanxuan.demoaws.repository.AppUserRepository;
import com.tanxuan.demoaws.repository.CustomerOrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CustomerOrderService {
    private final CustomerOrderRepository customerOrderRepository;
    private final AppUserRepository appUserRepository;

    public CustomerOrderService(CustomerOrderRepository customerOrderRepository, AppUserRepository appUserRepository) {
        this.customerOrderRepository = customerOrderRepository;
        this.appUserRepository = appUserRepository;
    }

    public List<CustomerOrder> findAll() { return customerOrderRepository.findAll(); }

    public CustomerOrder findById(Long id) { return customerOrderRepository.findById(id).orElseThrow(); }

    public CustomerOrder create(Long userId, BigDecimal totalAmount) {
        AppUser user = appUserRepository.findById(userId).orElseThrow();
        CustomerOrder order = new CustomerOrder();
        order.setUser(user);
        order.setTotalAmount(totalAmount);
        return customerOrderRepository.save(order);
    }

    public CustomerOrder advanceStatus(Long id) {
        CustomerOrder order = findById(id);
        switch (order.getStatus()) {
            case PENDING -> order.setStatus(CustomerOrder.OrderStatus.SHIPPED);
            case SHIPPED -> order.setStatus(CustomerOrder.OrderStatus.COMPLETED);
            case COMPLETED -> { /* do nothing */ }
        }
        return customerOrderRepository.save(order);
    }
}


