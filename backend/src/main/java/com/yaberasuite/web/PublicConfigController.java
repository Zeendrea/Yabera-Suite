package com.yaberasuite.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicConfigController {

    @GetMapping("/config")
    public Map<String, String> config() {
        return Map.of(
                "propertyName", "Yabera Suite"
        );
    }
}
