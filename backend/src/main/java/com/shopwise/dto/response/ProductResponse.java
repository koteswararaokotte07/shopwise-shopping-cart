package com.shopwise.dto.response;

import com.shopwise.entity.Product;
import java.math.BigDecimal;

public record ProductResponse(Long id, String name, String description, BigDecimal price, String imageUrl) {
    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(), product.getName(), product.getDescription(), product.getPrice(), product.getImageUrl());
    }
}
