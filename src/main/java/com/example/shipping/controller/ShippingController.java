package com.example.shipping.controller;

import com.example.shipping.dto.ShipRequest;
import com.example.shipping.dto.ShipResponse;
import com.example.shipping.service.ShippingService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/shipping")
public class ShippingController {

    private static final Logger log = LoggerFactory.getLogger(ShippingController.class);

    private final ShippingService shippingService;

    public ShippingController(ShippingService shippingService) {
        this.shippingService = shippingService;
    }

    @PostMapping
    public ResponseEntity<?> ship(@Valid @RequestBody ShipRequest request) {
        long start = System.currentTimeMillis();
        try {
            ShipResponse response = shippingService.ship(request);
            log.info("POST /shipping completed in {}ms status={}", System.currentTimeMillis() - start, response.getStatus());
            int httpStatus = "SHIPPED".equals(response.getStatus()) ? 201 : 200;
            return ResponseEntity.status(httpStatus).body(response);
        } catch (NullPointerException e) {
            log.error("NullPointerException in POST /shipping: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "error", "NullPointerException",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Exception in POST /shipping: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "error", e.getClass().getSimpleName(),
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/{shipmentId}")
    public ResponseEntity<?> getShipment(@PathVariable String shipmentId) {
        ShipResponse shipment = shippingService.getShipment(shipmentId);
        if (shipment == null) {
            return ResponseEntity.status(404).body(Map.of(
                    "error", "NotFound",
                    "message", "Shipment not found: " + shipmentId
            ));
        }
        return ResponseEntity.ok(shipment);
    }

    @GetMapping
    public ResponseEntity<Map<String, ShipResponse>> getAllShipments() {
        return ResponseEntity.ok(shippingService.getAllShipments());
    }
}
