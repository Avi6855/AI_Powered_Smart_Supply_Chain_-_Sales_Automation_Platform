package com.supplychain.order.service;
import com.supplychain.order.dto.OrderDTO;
import com.supplychain.order.dto.OrderUpsertRequest;
import com.supplychain.order.entity.Customer;
import com.supplychain.order.entity.Order;
import com.supplychain.order.repository.CustomerRepository;
import com.supplychain.order.repository.OrderRepository;
import com.supplychain.common.exception.ResourceNotFoundException;
import com.supplychain.common.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service @RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public PagedResponse<OrderDTO> getOrders(String search, String status, Pageable pageable) {
        Page<Order> page;
        if (search != null && !search.isEmpty()) {
            page = orderRepository.findByOrderNumberContainingIgnoreCase(search, pageable);
        } else if (status != null && !status.isEmpty()) {
            try {
                page = orderRepository.findByStatus(Order.OrderStatus.valueOf(status.toUpperCase()), pageable);
            } catch (IllegalArgumentException e) {
                page = orderRepository.findAll(pageable);
            }
        } else {
            page = orderRepository.findAll(pageable);
        }
        return PagedResponse.from(page, page.getContent().stream().map(this::toDTO).toList());
    }
    
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public OrderDTO getOrderById(Long id) {
        return orderRepository.findById(id).map(this::toDTO)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new ResourceNotFoundException("Order", "id", id);
        }
        orderRepository.deleteById(id);
    }

    @org.springframework.transaction.annotation.Transactional
    public OrderDTO createOrder(OrderUpsertRequest req) {
        Order order = new Order();
        apply(order, req);
        return toDTO(orderRepository.save(order));
    }

    @org.springframework.transaction.annotation.Transactional
    public OrderDTO updateOrder(Long id, OrderUpsertRequest req) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        apply(order, req);
        return toDTO(orderRepository.save(order));
    }

    @org.springframework.transaction.annotation.Transactional
    public OrderDTO updateStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        if (status != null && !status.isBlank()) {
            try {
                order.setStatus(Order.OrderStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }
        return toDTO(orderRepository.save(order));
    }

    private void apply(Order order, OrderUpsertRequest req) {
        if (req.getOrderNumber() != null && !req.getOrderNumber().isBlank()) order.setOrderNumber(req.getOrderNumber().trim());
        if (req.getTotalAmount() != null) order.setTotalAmount(req.getTotalAmount());
        else if (order.getTotalAmount() == null) order.setTotalAmount(BigDecimal.ZERO);

        if (req.getPaymentStatus() != null) order.setPaymentStatus(req.getPaymentStatus());
        if (req.getPaymentMethod() != null) order.setPaymentMethod(req.getPaymentMethod());
        if (req.getNotes() != null) order.setNotes(req.getNotes());
        if (req.getShippingAddress() != null) order.setShippingAddress(req.getShippingAddress());

        if (req.getStatus() != null && !req.getStatus().isBlank()) {
            try {
                order.setStatus(Order.OrderStatus.valueOf(req.getStatus().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }

        if (req.getCustomerName() != null && !req.getCustomerName().isBlank()) {
            String name = req.getCustomerName().trim();
            Customer customer = customerRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> customerRepository.save(Customer.builder().name(name).build()));
            order.setCustomer(customer);
        }
    }
    
    private OrderDTO toDTO(Order o) {
        return OrderDTO.builder()
            .id(o.getId())
            .orderNumber(o.getOrderNumber())
            .customerName(o.getCustomer() != null ? o.getCustomer().getName() : "Unknown")
            .status(o.getStatus().name())
            .totalAmount(o.getTotalAmount())
            .paymentStatus(o.getPaymentStatus() != null ? o.getPaymentStatus() : "UNPAID")
            .paymentMethod(o.getPaymentMethod())
            .notes(o.getNotes())
            .shippingAddress(o.getShippingAddress())
            .createdAt(o.getCreatedAt())
            .updatedAt(o.getUpdatedAt())
            .build();
    }
}
