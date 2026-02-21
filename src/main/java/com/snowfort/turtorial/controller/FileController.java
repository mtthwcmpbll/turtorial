package com.snowfort.turtorial.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final Path workingDir = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();

    @GetMapping("/content")
    public ResponseEntity<String> getFileContent(@RequestParam String path) {
        try {
            // Prevent path traversal
            if (path.contains("..")) {
                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Path traversal detected");
            }

            Path filePath = workingDir.resolve(path).normalize();
            if (!filePath.startsWith(workingDir)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
            if (!Files.exists(filePath)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("File not found");
            }
            String content = Files.readString(filePath, StandardCharsets.UTF_8);
            return ResponseEntity.ok(content);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error reading file: " + e.getMessage());
        }
    }

    @PostMapping("/content")
    public ResponseEntity<String> saveFileContent(@RequestParam String path, @RequestBody String content) {
        try {
             // Prevent path traversal
            if (path.contains("..")) {
                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied: Path traversal detected");
            }

            Path filePath = workingDir.resolve(path).normalize();
            if (!filePath.startsWith(workingDir)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }

            if (filePath.getParent() != null) {
                Files.createDirectories(filePath.getParent());
            }
            Files.writeString(filePath, content, StandardCharsets.UTF_8);
            return ResponseEntity.ok("File saved");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error writing file: " + e.getMessage());
        }
    }
}
