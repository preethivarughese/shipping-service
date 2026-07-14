package com.example.shipping.incident;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class IncidentState {

    private static final Logger log = LoggerFactory.getLogger(IncidentState.class);

    public volatile boolean cpuEnabled = false;
    public volatile boolean npeEnabled = false;
    public volatile boolean memoryLeakEnabled = false;
    public volatile boolean randomErrorEnabled = false;

    private final List<byte[]> memoryLeakStore = Collections.synchronizedList(new ArrayList<>());
    private volatile Thread cpuThread = null;
    private volatile Thread memoryThread = null;

    public synchronized void enableCpu() {
        if (cpuThread != null && cpuThread.isAlive()) {
            log.warn("CPU incident already active");
            return;
        }
        cpuEnabled = true;
        cpuThread = new Thread(() -> {
            log.warn("CPU load thread started");
            while (cpuEnabled) {
                double result = 0;
                for (int i = 0; i < 1_000_000; i++) {
                    result += Math.sqrt(i) * Math.tan(i);
                }
            }
            log.warn("CPU load thread stopped");
        }, "cpu-incident-thread");
        cpuThread.setDaemon(true);
        cpuThread.start();
        log.warn("Incident triggered: CPU_LOAD");
    }

    public synchronized void enableMemoryLeak() {
        if (memoryThread != null && memoryThread.isAlive()) {
            log.warn("Memory leak incident already active");
            return;
        }
        memoryLeakEnabled = true;
        memoryThread = new Thread(() -> {
            log.warn("Memory leak thread started");
            while (memoryLeakEnabled) {
                try {
                    memoryLeakStore.add(new byte[1024 * 1024]);
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
            log.warn("Memory leak thread stopped");
        }, "memory-leak-thread");
        memoryThread.setDaemon(true);
        memoryThread.start();
        log.warn("Incident triggered: MEMORY_LEAK");
    }

    public synchronized void reset() {
        cpuEnabled = false;
        npeEnabled = false;
        memoryLeakEnabled = false;
        randomErrorEnabled = false;
        memoryLeakStore.clear();
        log.info("Shipping service incident state reset - all incidents cleared");
    }
}
