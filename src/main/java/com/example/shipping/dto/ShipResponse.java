package com.example.shipping.dto;

import java.time.LocalDateTime;

public class ShipResponse {

    private String shipmentId;
    private String orderId;
    private String status;
    private String message;
    private String productId;
    private int quantity;
    private String userId;
    private LocalDateTime shippedAt;

    public ShipResponse() {}

    public ShipResponse(String shipmentId, String orderId, String status, String message,
                        String productId, int quantity, String userId, LocalDateTime shippedAt) {
        this.shipmentId = shipmentId;
        this.orderId = orderId;
        this.status = status;
        this.message = message;
        this.productId = productId;
        this.quantity = quantity;
        this.userId = userId;
        this.shippedAt = shippedAt;
    }

    public String getShipmentId() { return shipmentId; }
    public void setShipmentId(String shipmentId) { this.shipmentId = shipmentId; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public LocalDateTime getShippedAt() { return shippedAt; }
    public void setShippedAt(LocalDateTime shippedAt) { this.shippedAt = shippedAt; }
}
