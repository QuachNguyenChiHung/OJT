package com.tanxuan.demoaws.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.tanxuan.demoaws.service.BedrockService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bedrock")
@CrossOrigin(origins = "*")
public class BedrockController {

    private final BedrockService bedrockService;

    public BedrockController(BedrockService bedrockService) {
        this.bedrockService = bedrockService;
    }

        @GetMapping("/ask")
        public String ask(@RequestParam String q) throws JsonProcessingException {
            return bedrockService.invokeModel(q);
        }
}
