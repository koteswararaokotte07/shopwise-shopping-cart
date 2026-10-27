package com.shopwise.dto.response;

import com.shopwise.entity.CartItem;
import java.math.BigDecimal;

public record CartItemResponse(
        Long productId,
        String name,
        String description,
        String imageUrl,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal itemTotal
) {
    public static CartItemResponse from(CartItem item) {
        BigDecimal unitPrice = item.getProduct().getPrice();
        return new CartItemResponse(
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getDescription(),
                item.getProduct().getImageUrl(),
                unitPrice,
                item.getQuantity(),
                unitPrice.multiply(BigDecimal.valueOf(item.getQuantity())));
    }
}
