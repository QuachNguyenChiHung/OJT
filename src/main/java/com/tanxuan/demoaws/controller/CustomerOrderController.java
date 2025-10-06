package com.tanxuan.demoaws.controller;

import com.tanxuan.demoaws.model.CustomerOrder;
import com.tanxuan.demoaws.service.CustomerOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class CustomerOrderController {
    private final CustomerOrderService customerOrderService;

    public CustomerOrderController(CustomerOrderService customerOrderService) {
        this.customerOrderService = customerOrderService;
    }

    @GetMapping
    public List<CustomerOrder> all() { return customerOrderService.findAll(); }

    @GetMapping("/{id}")
    public CustomerOrder one(@PathVariable Long id) { return customerOrderService.findById(id); }

    @PostMapping
    public ResponseEntity<CustomerOrder> create(@RequestParam Long userId, @RequestParam BigDecimal totalAmount) {
        CustomerOrder created = customerOrderService.create(userId, totalAmount);
        return ResponseEntity.created(URI.create("/api/orders/" + created.getId())).body(created);
    }

    @PostMapping("/{id}/advance")
    public CustomerOrder advance(@PathVariable Long id) {
        return customerOrderService.advanceStatus(id);
    }
}


