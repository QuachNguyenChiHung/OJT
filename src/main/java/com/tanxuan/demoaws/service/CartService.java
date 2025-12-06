package com.tanxuan.demoaws.service;

import com.tanxuan.demoaws.dto.CartDTO;
import com.tanxuan.demoaws.model.AppUser;
import com.tanxuan.demoaws.model.Cart;
import com.tanxuan.demoaws.model.ProductDetails;
import com.tanxuan.demoaws.repository.AppUserRepository;
import com.tanxuan.demoaws.repository.CartRepository;
import com.tanxuan.demoaws.repository.ProductDetailsRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final AppUserRepository appUserRepository;
    private final ProductDetailsRepository productDetailsRepository;

    public CartService(CartRepository cartRepository,
                       AppUserRepository appUserRepository,
                       ProductDetailsRepository productDetailsRepository) {
        this.cartRepository = cartRepository;
        this.appUserRepository = appUserRepository;
        this.productDetailsRepository = productDetailsRepository;
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     */
    @Transactional
    public CartDTO.CartItemResponse addToCart(UUID userId, CartDTO.AddToCartRequest request) {
        // Kiểm tra user có tồn tại không
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // Kiểm tra product details có tồn tại không
        ProductDetails productDetails = productDetailsRepository.findById(request.getProductDetailsId())
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        // Kiểm tra size và màu đã được chọn
        if (productDetails.getSize() == null || productDetails.getSize().isEmpty()) {
            throw new RuntimeException("Vui lòng chọn size sản phẩm");
        }

        // Kiểm tra tồn kho
        if (productDetails.getAmount() == null || productDetails.getAmount() < request.getQuantity()) {
            throw new RuntimeException("Không đủ số lượng trong kho");
        }

        // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
        Cart existingCart = cartRepository.findByUserAndProductDetails(user, productDetails)
                .orElse(null);

        if (existingCart != null) {
            // Nếu đã có, cập nhật số lượng
            int newQuantity = existingCart.getQuantity() + request.getQuantity();

            // Kiểm tra tồn kho với số lượng mới
            if (productDetails.getAmount() < newQuantity) {
                throw new RuntimeException("Không đủ số lượng trong kho");
            }

            existingCart.setQuantity(newQuantity);
            existingCart.setUpdatedAt(Instant.now());
            cartRepository.save(existingCart);

            return mapToCartItemResponse(existingCart);
        } else {
            // Nếu chưa có, tạo mới
            Cart newCart = new Cart(user, productDetails, request.getQuantity());
            cartRepository.save(newCart);

            return mapToCartItemResponse(newCart);
        }
    }

    /**
     * Lấy tất cả items trong giỏ hàng của user
     */
    public CartDTO.CartSummaryResponse getCartByUserId(UUID userId) {
        List<Cart> cartItems = cartRepository.findByUserId(userId);

        List<CartDTO.CartItemResponse> items = cartItems.stream()
                .map(this::mapToCartItemResponse)
                .collect(Collectors.toList());

        // Tính tổng tiền
        BigDecimal totalPrice = items.stream()
                .map(CartDTO.CartItemResponse::getItemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tính số lượng items
        int totalItems = items.size();

        // Shipping cost (có thể tính theo logic riêng)
        BigDecimal estimatedShipping = BigDecimal.ZERO;
        if (totalPrice.compareTo(BigDecimal.ZERO) > 0) {
            estimatedShipping = new BigDecimal("30000"); // 30,000 VND
        }

        BigDecimal grandTotal = totalPrice.add(estimatedShipping);

        CartDTO.CartSummaryResponse response = new CartDTO.CartSummaryResponse();
        response.setItems(items);
        response.setTotalItems(totalItems);
        response.setTotalPrice(totalPrice);
        response.setEstimatedShipping(estimatedShipping);
        response.setGrandTotal(grandTotal);

        return response;
    }

    /**
     * Cập nhật số lượng sản phẩm trong giỏ hàng
     */
    @Transactional
    public CartDTO.CartItemResponse updateCartItem(UUID userId, UUID cartId, CartDTO.UpdateCartRequest request) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Item không tồn tại trong giỏ hàng"));

        // Kiểm tra cart có thuộc về user này không
        if (!cart.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền cập nhật item này");
        }

        // Kiểm tra tồn kho
        if (cart.getProductDetails().getAmount() < request.getQuantity()) {
            throw new RuntimeException("Không đủ số lượng trong kho");
        }

        cart.setQuantity(request.getQuantity());
        cart.setUpdatedAt(Instant.now());
        cartRepository.save(cart);

        return mapToCartItemResponse(cart);
    }

    /**
     * Xóa một item khỏi giỏ hàng
     */
    @Transactional
    public void removeCartItem(UUID userId, UUID cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Item không tồn tại trong giỏ hàng"));

        // Kiểm tra cart có thuộc về user này không
        if (!cart.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa item này");
        }

        cartRepository.delete(cart);
    }

    /**
     * Xóa tất cả items trong giỏ hàng
     */
    @Transactional
    public void clearCart(UUID userId) {
        cartRepository.deleteByUserId(userId);
    }

    /**
     * Đếm số lượng items trong giỏ hàng
     */
    public long countCartItems(UUID userId) {
        return cartRepository.countByUserId(userId);
    }

    /**
     * Map Cart entity to CartItemResponse DTO
     */
    private CartDTO.CartItemResponse mapToCartItemResponse(Cart cart) {
        ProductDetails pd = cart.getProductDetails();

        // Lấy hình ảnh đầu tiên từ imgList
        String firstImage = null;
        if (pd.getImgList() != null && !pd.getImgList().isEmpty()) {
            String imgList = pd.getImgList().trim();
            // Remove brackets if present
            if (imgList.startsWith("[") && imgList.endsWith("]")) {
                imgList = imgList.substring(1, imgList.length() - 1);
            }
            // Remove quotes and get first image
            String[] images = imgList.split(",");
            if (images.length > 0) {
                firstImage = images[0].trim().replaceAll("^\"|\"$", "");
            }
        }

        BigDecimal price = pd.getProduct().getPrice();
        BigDecimal itemTotal = price.multiply(new BigDecimal(cart.getQuantity()));

        CartDTO.CartItemResponse response = new CartDTO.CartItemResponse();
        response.setCartId(cart.getCartId());
        response.setProductId(pd.getProduct().getPId());
        response.setProductDetailsId(pd.getPdId());
        response.setProductName(pd.getProduct().getPName());
        response.setPrice(price);
        response.setSize(pd.getSize());
        response.setColorName(pd.getColorName());
        response.setColorCode(pd.getColorCode());
        response.setQuantity(cart.getQuantity());
        response.setImage(firstImage);
        response.setItemTotal(itemTotal);

        return response;
    }
}

