package com.shopwise.service;

import com.shopwise.dto.request.AddCartItemRequest;
import com.shopwise.dto.response.CartItemResponse;
import com.shopwise.dto.response.CartResponse;
import com.shopwise.entity.CartItem;
import com.shopwise.entity.Product;
import com.shopwise.exception.ResourceNotFoundException;
import com.shopwise.repository.CartItemRepository;
import com.shopwise.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(CartItemRepository cartItemRepository, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public CartResponse getCart() {
        return toResponse(cartItemRepository.findAllByOrderByIdAsc());
    }

    @Transactional
    public CartResponse addItem(AddCartItemRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product " + request.productId() + " was not found."));
        CartItem item = cartItemRepository.findByProductId(product.getId())
                .orElseGet(() -> new CartItem(product, 0));
        item.setQuantity(Math.addExact(item.getQuantity(), request.quantity()));
        cartItemRepository.save(item);
        return getCart();
    }

    @Transactional
    public CartResponse updateQuantity(Long productId, int quantity) {
        CartItem item = findCartItem(productId);
        item.setQuantity(quantity);
        return getCart();
    }

    @Transactional
    public CartResponse removeItem(Long productId) {
        CartItem item = findCartItem(productId);
        cartItemRepository.delete(item);
        return getCart();
    }

    @Transactional
    public CartResponse clearCart() {
        cartItemRepository.deleteAllInBatch();
        return getCart();
    }

    private CartItem findCartItem(Long productId) {
        return cartItemRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product " + productId + " is not in the cart."));
    }

    private CartResponse toResponse(List<CartItem> items) {
        List<CartItemResponse> responses = items.stream().map(CartItemResponse::from).toList();
        BigDecimal total = responses.stream()
                .map(CartItemResponse::itemTotal)
                .reduce(BigDecimal.ZERO.setScale(2), BigDecimal::add);
        return new CartResponse(responses, total);
    }
}
