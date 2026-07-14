package com.example.shipping;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "order-service.url=http://localhost:9999"
})
class ShippingServiceApplicationTests {

    @Test
    void contextLoads() {
    }
}
