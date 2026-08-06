package com.snowfort.turtorial.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping("/lesson/{id}")
    public String forwardLesson() {
        return "forward:/index.html";
    }
}
