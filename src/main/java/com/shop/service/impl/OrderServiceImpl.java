package com.shop.service.impl;

import com.shop.dto.CheckoutRequest;
import com.shop.dto.OrderResponse;
import com.shop.entity.*;
import com.shop.exception.BadRequestException;
import com.shop.exception.ResourceNotFoundException;
import com.shop.mapper.OrderMapper;
import com.shop.repository.CartRepository;
import com.shop.repository.OrderRepository;
import com.shop.repository.ProductRepository;
import com.shop.service.CartService;
import com.shop.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;

    @Override
    @Transactional
    public OrderResponse checkout(User user, CheckoutRequest request) {
        // 1. Lấy giỏ hàng của người dùng hiện tại
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm vào giỏ trước khi thanh toán."));

        if (cart.getCartItems().isEmpty()) {
            throw new BadRequestException("Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm vào giỏ trước khi thanh toán.");
        }

        // 2. Khởi tạo đơn hàng mới
        Order order = Order.builder()
                .user(user)
                .shippingAddress(request.getShippingAddress())
                .phoneNumber(request.getPhoneNumber())
                .status(OrderStatus.PENDING)
                .build();

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;

        // 3. Duyệt qua từng sản phẩm trong giỏ hàng, xác minh tồn kho, trừ tồn kho và tính tổng tiền
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();

            // Kiểm tra số lượng tồn kho thực tế
            if (product.getQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Sản phẩm '" + product.getName() + "' không đủ hàng trong kho (Tồn kho hiện tại: " + product.getQuantity() + ")");
            }

            // Trừ số lượng tồn kho của sản phẩm trực tiếp ở DB
            product.setQuantity(product.getQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            // Tạo chi tiết đơn hàng (lưu lại giá bán ở thời điểm giao dịch)
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(product.getPrice())
                    .build();

            orderItems.add(orderItem);

            // Cộng dồn tổng giá trị hóa đơn
            BigDecimal itemTotalPrice = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalPrice = totalPrice.add(itemTotalPrice);
        }

        order.setOrderItems(orderItems);
        order.setTotalPrice(totalPrice);

        // 4. Lưu đơn hàng vào cơ sở dữ liệu
        Order savedOrder = orderRepository.save(order);

        // 5. Dọn sạch giỏ hàng hiện tại sau khi đặt hàng thành công
        cartService.clearCart(user);

        return OrderMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        // Bảo mật: Khách hàng thông thường (USER) chỉ xem được hóa đơn của chính họ. ADMIN được xem tất cả.
        if (user.getRole() == Role.USER && !order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Yêu cầu không hợp lệ. Bạn không có quyền truy cập đơn hàng này.");
        }

        return OrderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(User user) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(OrderMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(OrderMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        OrderStatus currentStatus = order.getStatus();
        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Trạng thái đơn hàng '" + status + "' không hợp lệ!");
        }

        if (!isValidTransition(currentStatus, newStatus)) {
            throw new BadRequestException("Không thể chuyển đổi trạng thái đơn hàng từ " + currentStatus + " sang " + newStatus + ".");
        }

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        return OrderMapper.toResponse(updatedOrder);
    }

    private boolean isValidTransition(OrderStatus current, OrderStatus next) {
        if (current == next) {
            return true;
        }
        if (current == OrderStatus.COMPLETED || current == OrderStatus.CANCELLED) {
            return false;
        }
        switch (current) {
            case PENDING:
                return next == OrderStatus.CONFIRMED || next == OrderStatus.CANCELLED;
            case CONFIRMED:
                return next == OrderStatus.SHIPPING;
            case SHIPPING:
                return next == OrderStatus.DELIVERED;
            case DELIVERED:
                return next == OrderStatus.COMPLETED;
            default:
                return false;
        }
    }
}
