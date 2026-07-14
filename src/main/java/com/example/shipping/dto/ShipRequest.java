package com.example.shipping.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;

public class ShipRequest {

    @NotBlank(message = "productId is required")
    private String productId;

    @Min(value = 1, message = "quantity must be at least 1")
    private int quantity;

    private String userId;

    public ShipRequest() {}

    public ShipRequest(String productId, int quantity, String userId) {
        this.productId = productId;
        this.quantity = quantity;
        this.userId = userId;
    }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
