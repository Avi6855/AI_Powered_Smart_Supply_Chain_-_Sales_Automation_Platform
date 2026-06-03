package com.supplychain.order.repository;
import com.supplychain.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByCustomerId(Long customerId, Pageable pageable);
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);
    Page<Order> findByOrderNumberContainingIgnoreCase(String orderNumber, Pageable pageable);
}