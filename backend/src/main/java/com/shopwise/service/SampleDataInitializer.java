package com.shopwise.service;

import com.shopwise.entity.Product;
import com.shopwise.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SampleDataInitializer {
    @Bean
    CommandLineRunner seedProducts(ProductRepository productRepository) {
        return args -> {
            if (productRepository.count() == 0) {
                productRepository.saveAll(List.of(
                        new Product("Everyday Backpack", "A lightweight, durable bag for work and weekends.",
                                new BigDecimal("2499.00"), null),
                        new Product("Ceramic Coffee Set", "A handcrafted mug and matching saucer.",
                                new BigDecimal("899.00"), null),
                        new Product("Wireless Headphones", "Comfortable over-ear headphones with clear sound.",
                                new BigDecimal("3499.00"), null),
                        new Product("Desk Lamp", "A warm, adjustable lamp for your reading corner.",
                                new BigDecimal("1599.00"), null)
                ));
            }
        };
    }
}
