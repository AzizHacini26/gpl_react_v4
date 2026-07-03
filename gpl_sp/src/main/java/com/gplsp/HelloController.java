package com.gplsp;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/")
    public String home() {
        return "<html><body><h1>Spring 2 Boot Test Page</h1><p>The application is running successfully!</p></body></html>";
    }
}