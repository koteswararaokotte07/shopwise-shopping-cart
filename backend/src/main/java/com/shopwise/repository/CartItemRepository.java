package com.shopwise.repository;

import com.shopwise.entity.CartItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findAllByOrderByIdAsc();

    Optional<CartItem> findByProductId(Long productId);

    void deleteByProductId(Long productId);
}
