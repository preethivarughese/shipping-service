package com.example.shipping.client;

import com.example.shipping.dto.OrderResponse;
import com.example.shipping.dto.ShipRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "order-service", url = "${order-service.url}")
public interface OrderClient {

    @PostMapping("/orders")
    ResponseEntity<OrderResponse> createOrder(@RequestBody ShipRequest request);

    @GetMapping("/orders/{orderId}")
    ResponseEntity<OrderResponse> getOrder(@PathVariable String orderId);
}
