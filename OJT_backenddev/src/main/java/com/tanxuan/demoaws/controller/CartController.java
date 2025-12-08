package com.tanxuan.demoaws.controller;

import com.tanxuan.demoaws.dto.CartDTO;
import com.tanxuan.demoaws.model.AppUser;
import com.tanxuan.demoaws.repository.AppUserRepository;
import com.tanxuan.demoaws.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;
    private final AppUserRepository appUserRepository;

    public CartController(CartService cartService, AppUserRepository appUserRepository) {
        this.cartService = cartService;
        this.appUserRepository = appUserRepository;
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     * POST /api/cart
     */
    @PostMapping
    public ResponseEntity<?> addToCart(
            @Valid @RequestBody CartDTO.AddToCartRequest request,
            Authentication authentication) {
        try {
            // Lấy userId từ authentication (email)
            String email = authentication.getName();
            UUID userId = getUserIdFromEmail(email);

            CartDTO.CartItemResponse response = cartService.addToCart(userId, request);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Đã thêm sản phẩm vào giỏ hàng");
            result.put("data", response);

            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Xem giỏ hàng của user hiện tại (lấy tất cả items)
     * GET /api/cart/me
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyCart(Authentication authentication) {
        try {
            String email = authentication.getName();
            UUID userId = getUserIdFromEmail(email);

            CartDTO.CartSummaryResponse response = cartService.getCartByUserId(userId);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", response);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Cập nhật số lượng sản phẩm trong giỏ hàng
     * PUT /api/cart/{cartId}
     */
    @PutMapping("/{cartId}")
    public ResponseEntity<?> updateCartItem(
            @PathVariable UUID cartId,
            @Valid @RequestBody CartDTO.UpdateCartRequest request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            UUID userId = getUserIdFromEmail(email);

            CartDTO.CartItemResponse response = cartService.updateCartItem(userId, cartId, request);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Đã cập nhật số lượng sản phẩm");
            result.put("data", response);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Xóa một sản phẩm khỏi giỏ hàng
     * DELETE /api/cart/{cartId}
     */
    @DeleteMapping("/{cartId}")
    public ResponseEntity<?> removeCartItem(
            @PathVariable UUID cartId,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            UUID userId = getUserIdFromEmail(email);

            cartService.removeCartItem(userId, cartId);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Đã xóa sản phẩm khỏi giỏ hàng");

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Xóa tất cả sản phẩm trong giỏ hàng
     * DELETE /api/cart
     */
    @DeleteMapping
    public ResponseEntity<?> clearCart(Authentication authentication) {
        try {
            String email = authentication.getName();
            UUID userId = getUserIdFromEmail(email);

            cartService.clearCart(userId);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Đã xóa tất cả sản phẩm trong giỏ hàng");

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Đếm số lượng items trong giỏ hàng
     * GET /api/cart/count
     */
    @GetMapping("/count")
    public ResponseEntity<?> countCartItems(Authentication authentication) {
        try {
            String email = authentication.getName();
            UUID userId = getUserIdFromEmail(email);

            long count = cartService.countCartItems(userId);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("count", count);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Helper method: Lấy userId từ email
     */
    private UUID getUserIdFromEmail(String email) {
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        return user.getUserId();
    }
}

