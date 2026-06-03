package com.supplychain.notification.service;

import com.supplychain.inventory.entity.Product;
import com.supplychain.inventory.repository.ProductRepository;
import com.supplychain.notification.entity.Notification;
import com.supplychain.notification.repository.NotificationRepository;
import com.supplychain.auth.entity.User;
import com.supplychain.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationEngine {

    private final ProductRepository productRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * Periodic check for low stock levels.
     * Runs every hour.
     */
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void checkStockLevels() {
        log.info("Starting automated stock level check...");
        List<Product> lowStockProducts = productRepository.findAll().stream()
                .filter(Product::isLowStock)
                .toList();

        if (lowStockProducts.isEmpty()) return;

        // Notify all warehouse managers and admins
        List<User> recipients = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("ADMIN") || u.getRole().name().equals("WAREHOUSE_MANAGER"))
                .toList();

        for (Product product : lowStockProducts) {
            String title = "Low Stock Alert: " + product.getName();
            String message = String.format("Product %s (SKU: %s) is below reorder point. Current stock: %d, Reorder point: %d.",
                    product.getName(), product.getSku(), product.getQuantityInStock(), product.getReorderPoint());

            for (User user : recipients) {
                // Check if notification already exists to avoid duplicates
                boolean exists = notificationRepository.existsByUserIdAndTitleAndIsReadFalse(user.getId(), title);
                if (!exists) {
                    Notification notification = Notification.builder()
                            .user(user)
                            .title(title)
                            .message(message)
                            .type(Notification.NotificationType.ALERT)
                            .actionUrl("/inventory/products?sku=" + product.getSku())
                            .build();
                    notificationRepository.save(notification);
                }
            }
        }
    }

    /**
     * Simulated market condition check.
     * In a real app, this would call an external API or use AI to analyze trends.
     */
    @Scheduled(fixedRate = 86400000) // Daily
    @Transactional
    public void checkMarketConditions() {
        log.info("Starting AI-powered market condition analysis...");
        // Simulate finding a market opportunity or risk
        double random = Math.random();
        if (random > 0.7) {
            String title = "AI Market Insight: Demand Surge Predicted";
            String message = "Our AI models predict a 20% increase in demand for Electronics category next month. Consider increasing stock levels for high-turnover items.";
            broadcastToAdmins(title, message, Notification.NotificationType.AI, "/analytics");
        }
    }

    private void broadcastToAdmins(String title, String message, Notification.NotificationType type, String actionUrl) {
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("ADMIN") || u.getRole().name().equals("SUPER_ADMIN"))
                .toList();

        for (User admin : admins) {
            Notification notification = Notification.builder()
                    .user(admin)
                    .title(title)
                    .message(message)
                    .type(type)
                    .actionUrl(actionUrl)
                    .build();
            notificationRepository.save(notification);
        }
    }
}
