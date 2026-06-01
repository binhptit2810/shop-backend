package com.shop.service.impl;

import com.shop.dto.CartItemRequest;
import com.shop.dto.CartResponse;
import com.shop.entity.Cart;
import com.shop.entity.CartItem;
import com.shop.entity.Product;
import com.shop.entity.User;
import com.shop.exception.BadRequestException;
import com.shop.exception.ResourceNotFoundException;
import com.shop.mapper.CartMapper;
import com.shop.repository.CartItemRepository;
import com.shop.repository.CartRepository;
import com.shop.repository.ProductRepository;
import com.shop.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public CartResponse getCart(User user) {
        Cart cart = getOrCreateCartEntity(user);
        return CartMapper.toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItem(User user, CartItemRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + request.getProductId()));

        Cart cart = getOrCreateCartEntity(user);

        // Tìm xem sản phẩm đã có trong giỏ hàng chưa
        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        int newQuantity = request.getQuantity();
        CartItem cartItem;

        if (existingItemOpt.isPresent()) {
            cartItem = existingItemOpt.get();
            newQuantity += cartItem.getQuantity();
        } else {
            cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .build();
        }

        // Kiểm tra tồn kho của sản phẩm
        if (newQuantity > product.getQuantity()) {
            throw new BadRequestException("Số lượng sản phẩm vượt quá tồn kho hiện tại (" + product.getQuantity() + " sản phẩm)");
        }

        cartItem.setQuantity(newQuantity);
        cartItemRepository.save(cartItem);

        // Nạp lại giỏ hàng mới nhất từ database
        Cart updatedCart = cartRepository.findById(cart.getId()).orElse(cart);
        return CartMapper.toResponse(updatedCart);
    }

    @Override
    @Transactional
    public CartResponse updateQuantity(User user, Long cartItemId, int quantity) {
        if (quantity <= 0) {
            return removeItem(user, cartItemId);
        }

        Cart cart = getOrCreateCartEntity(user);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mục sản phẩm này trong giỏ hàng (ID: " + cartItemId + ")"));

        // Bảo mật: Đảm bảo mặt hàng này thuộc về giỏ hàng của chính người dùng đăng nhập
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Yêu cầu không hợp lệ. Mục giỏ hàng không thuộc sở hữu của bạn.");
        }

        Product product = cartItem.getProduct();
        // Kiểm tra tồn kho
        if (quantity > product.getQuantity()) {
            throw new BadRequestException("Số lượng sản phẩm vượt quá tồn kho hiện tại (" + product.getQuantity() + " sản phẩm)");
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        Cart updatedCart = cartRepository.findById(cart.getId()).orElse(cart);
        return CartMapper.toResponse(updatedCart);
    }

    @Override
    @Transactional
    public CartResponse removeItem(User user, Long cartItemId) {
        Cart cart = getOrCreateCartEntity(user);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mục sản phẩm này trong giỏ hàng (ID: " + cartItemId + ")"));

        // Bảo mật: Đảm bảo mặt hàng thuộc về giỏ hàng của chính người dùng đăng nhập
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Yêu cầu không hợp lệ. Mục giỏ hàng không thuộc sở hữu của bạn.");
        }

        cartItemRepository.delete(cartItem);

        Cart updatedCart = cartRepository.findById(cart.getId()).orElse(cart);
        return CartMapper.toResponse(updatedCart);
    }

    @Override
    @Transactional
    public void clearCart(User user) {
        Cart cart = getOrCreateCartEntity(user);
        cart.getCartItems().clear(); // orphanRemoval = true sẽ tự xóa dữ liệu con tương ứng ở DB
        cartRepository.save(cart);
    }

    /**
     * Tìm hoặc tự tạo giỏ hàng mới cho người dùng
     */
    private Cart getOrCreateCartEntity(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(user)
                            .build();
                    return cartRepository.save(newCart);
                });
    }
}
