package com.tanxuan.demoaws.repository;

import com.tanxuan.demoaws.model.Cart;
import com.tanxuan.demoaws.model.AppUser;
import com.tanxuan.demoaws.model.ProductDetails;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {

    // Tìm tất cả các items trong giỏ hàng của user
    List<Cart> findByUser(AppUser user);

    // Tìm tất cả các items trong giỏ hàng của user theo userId
    @Query("SELECT c FROM Cart c WHERE c.user.userId = :userId")
    List<Cart> findByUserId(@Param("userId") UUID userId);

    // Tìm một item cụ thể trong giỏ hàng (user + productDetails)
    Optional<Cart> findByUserAndProductDetails(AppUser user, ProductDetails productDetails);

    // Tìm một item cụ thể trong giỏ hàng theo userId và productDetailsId
    @Query("SELECT c FROM Cart c WHERE c.user.userId = :userId AND c.productDetails.pdId = :pdId")
    Optional<Cart> findByUserIdAndProductDetailsId(@Param("userId") UUID userId, @Param("pdId") UUID pdId);

    // Xóa tất cả items trong giỏ hàng của user
    void deleteByUser(AppUser user);

    // Xóa tất cả items trong giỏ hàng của user theo userId
    @Modifying
    @Transactional
    @Query("DELETE FROM Cart c WHERE c.user.userId = :userId")
    void deleteByUserId(@Param("userId") UUID userId);

    // Đếm số lượng items trong giỏ hàng của user
    long countByUser(AppUser user);

    // Đếm số lượng items trong giỏ hàng của user theo userId
    @Query("SELECT COUNT(c) FROM Cart c WHERE c.user.userId = :userId")
    long countByUserId(@Param("userId") UUID userId);
}

