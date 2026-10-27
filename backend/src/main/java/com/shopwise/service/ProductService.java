package com.shopwise.service;

import com.shopwise.dto.request.ProductRequest;
import com.shopwise.dto.response.ProductResponse;
import com.shopwise.entity.Product;
import com.shopwise.exception.ResourceNotFoundException;
import com.shopwise.repository.CartItemRepository;
import com.shopwise.repository.ProductRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;

    public ProductService(ProductRepository productRepository, CartItemRepository cartItemRepository) {
        this.productRepository = productRepository;
        this.cartItemRepository = cartItemRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAll() {
        return productRepository.findAll().stream().map(ProductResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return ProductResponse.from(findProduct(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = new Product(request.name().trim(), request.description().trim(),
                request.price(), normalizeImageUrl(request.imageUrl()));
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findProduct(id);
        product.update(request.name().trim(), request.description().trim(),
                request.price(), normalizeImageUrl(request.imageUrl()));
        return ProductResponse.from(product);
    }

    @Transactional
    public void delete(Long id) {
        Product product = findProduct(id);
        cartItemRepository.deleteByProductId(id);
        productRepository.delete(product);
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product " + id + " was not found."));
    }

    private String normalizeImageUrl(String imageUrl) {
        return imageUrl == null || imageUrl.isBlank() ? null : imageUrl.trim();
    }
}
