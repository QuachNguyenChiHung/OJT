package com.tanxuan.demoaws.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TempController {
    @GetMapping("/api/debug")
    public String debug(){
        return "ba mẹ ơi api lên rồi nè";
    }
}
