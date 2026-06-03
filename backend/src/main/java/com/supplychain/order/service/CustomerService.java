package com.supplychain.order.service;
import com.supplychain.order.dto.CustomerDTO;
import com.supplychain.order.entity.Customer;
import com.supplychain.order.repository.CustomerRepository;
import com.supplychain.common.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;
    public PagedResponse<CustomerDTO> getCustomers(Pageable pageable) {
        Page<Customer> page = customerRepository.findAll(pageable);
        return PagedResponse.from(page, page.getContent().stream().map(this::toDTO).toList());
    }
    private CustomerDTO toDTO(Customer c) {
        return CustomerDTO.builder()
            .id(c.getId()).name(c.getName()).email(c.getEmail())
            .phone(c.getPhone()).city(c.getCity()).country(c.getCountry())
            .customerType(c.getCustomerType().name()).totalSpent(c.getTotalSpent())
            .totalOrders(c.getTotalOrders()).status(c.getStatus().name()).build();
    }
}