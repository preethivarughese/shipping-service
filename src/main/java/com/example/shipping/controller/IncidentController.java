package com.example.shipping.controller;

import com.example.shipping.incident.IncidentState;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/incident")
public class IncidentController {

    private static final Logger log = LoggerFactory.getLogger(IncidentController.class);

    private final IncidentState incidentState;

    public IncidentController(IncidentState incidentState) {
        this.incidentState = incidentState;
    }

    @PostMapping("/cpu")
    public ResponseEntity<Map<String, String>> triggerCpu() {
        incidentState.enableCpu();
        return ResponseEntity.ok(Map.of(
                "incident", "CPU_LOAD",
                "status", "ACTIVE",
                "effect", "Background CPU thread running in shipping-service - watch CPU metrics spike"
        ));
    }

    @PostMapping("/npe")
    public ResponseEntity<Map<String, String>> triggerNpe() {
        incidentState.npeEnabled = true;
        log.warn("Incident triggered: NULL_POINTER_EXCEPTION");
        return ResponseEntity.ok(Map.of(
                "incident", "NULL_POINTER_EXCEPTION",
                "status", "ACTIVE",
                "effect", "POST /shipping now throws NullPointerException - HTTP 500"
        ));
    }

    @PostMapping("/memory")
    public ResponseEntity<Map<String, String>> triggerMemoryLeak() {
        incidentState.enableMemoryLeak();
        return ResponseEntity.ok(Map.of(
                "incident", "MEMORY_LEAK",
                "status", "ACTIVE",
                "effect", "Allocating 1MB every 500ms in shipping-service - watch JVM heap grow"
        ));
    }

    @PostMapping("/random")
    public ResponseEntity<Map<String, String>> triggerRandomErrors() {
        incidentState.randomErrorEnabled = true;
        log.warn("Incident triggered: RANDOM_ERRORS (30% failure rate)");
        return ResponseEntity.ok(Map.of(
                "incident", "RANDOM_ERRORS",
                "status", "ACTIVE",
                "effect", "30% of POST /shipping requests will return HTTP 500"
        ));
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, String>> reset() {
        incidentState.reset();
        return ResponseEntity.ok(Map.of(
                "status", "ALL_INCIDENTS_CLEARED",
                "service", "shipping-service"
        ));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of(
                "service", "shipping-service",
                "cpuEnabled", incidentState.cpuEnabled,
                "npeEnabled", incidentState.npeEnabled,
                "memoryLeakEnabled", incidentState.memoryLeakEnabled,
                "randomErrorEnabled", incidentState.randomErrorEnabled
        ));
    }
}
