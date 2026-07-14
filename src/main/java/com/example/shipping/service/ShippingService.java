package com.example.shipping.service;

import com.example.shipping.client.OrderClient;
import com.example.shipping.dto.OrderResponse;
import com.example.shipping.dto.ShipRequest;
import com.example.shipping.dto.ShipResponse;
import com.example.shipping.incident.IncidentState;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ShippingService {

    private static final Logger log = LoggerFactory.getLogger(ShippingService.class);

    private final OrderClient orderClient;
    private final IncidentState incidentState;

    private final Map<String, ShipResponse> shipments = new ConcurrentHashMap<>();
    private final AtomicLong shipCounter = new AtomicLong(5000);
    private final Random random = new Random();

    public ShippingService(OrderClient orderClient, IncidentState incidentState) {
        this.orderClient = orderClient;
        this.incidentState = incidentState;
    }

    public ShipResponse ship(ShipRequest request) {
        String shipmentId = "SHIP-" + shipCounter.getAndIncrement();

        // --- NPE incident (local to shipping service) ---
        if (incidentState.npeEnabled) {
            log.error("NPE incident active - throwing NullPointerException");
            throw new NullPointerException("Shipping processing failed: shipment context is null");
        }

        // --- Random error incident (local to shipping service) ---
        if (incidentState.randomErrorEnabled && random.nextInt(100) < 30) {
            log.error("Random error incident: 30% failure rate triggered for shipmentId={}", shipmentId);
            throw new RuntimeException("Random failure (30% error rate incident active)");
        }

        // --- Call Order Service (cross-repo dependency) ---
        OrderResponse order;
        try {
            log.info("Calling Order Service: POST /orders for productId={}", request.getProductId());
            ResponseEntity<OrderResponse> response = orderClient.createOrder(request);
            order = response.getBody();
        } catch (FeignException e) {
            log.error("Order Service call failed [{}]: {}", e.status(), e.getMessage());
            ShipResponse failed = buildShipResponse(shipmentId, null, "FAILED",
                    "Order Service unreachable: HTTP " + e.status(), request);
            shipments.put(shipmentId, failed);
            return failed;
        } catch (Exception e) {
            log.error("Order Service call failed: {}", e.getMessage());
            ShipResponse failed = buildShipResponse(shipmentId, null, "FAILED",
                    "Order Service unreachable: " + e.getMessage(), request);
            shipments.put(shipmentId, failed);
            return failed;
        }

        if (order == null) {
            ShipResponse failed = buildShipResponse(shipmentId, null, "FAILED",
                    "Order Service returned empty response", request);
            shipments.put(shipmentId, failed);
            return failed;
        }

        log.info("Order Service responded: orderId={} status={}", order.getOrderId(), order.getStatus());

        // --- Shipping logic based on order status ---
        if ("CREATED".equals(order.getStatus())) {
            ShipResponse shipped = buildShipResponse(shipmentId, order.getOrderId(), "SHIPPED",
                    "Shipment created for order " + order.getOrderId(), request);
            shipments.put(shipmentId, shipped);
            log.info("Shipment created: shipmentId={} orderId={}", shipmentId, order.getOrderId());
            return shipped;
        } else {
            ShipResponse rejected = buildShipResponse(shipmentId, order.getOrderId(), "REJECTED",
                    "Order not ready for shipping. Order status: " + order.getStatus()
                            + (order.getMessage() != null ? " - " + order.getMessage() : ""), request);
            shipments.put(shipmentId, rejected);
            log.warn("Shipment rejected: orderId={} orderStatus={}", order.getOrderId(), order.getStatus());
            return rejected;
        }
    }

    public ShipResponse getShipment(String shipmentId) {
        return shipments.get(shipmentId);
    }

    public Map<String, ShipResponse> getAllShipments() {
        return shipments;
    }

    private ShipResponse buildShipResponse(String shipmentId, String orderId, String status,
                                            String message, ShipRequest req) {
        return new ShipResponse(
                shipmentId,
                orderId,
                status,
                message,
                req.getProductId(),
                req.getQuantity(),
                req.getUserId(),
                LocalDateTime.now()
        );
    }
}
