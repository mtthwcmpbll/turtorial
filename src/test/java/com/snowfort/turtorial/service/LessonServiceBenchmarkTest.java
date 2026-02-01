package com.snowfort.turtorial.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class LessonServiceBenchmarkTest {

    private static final int ITERATIONS = 10000;

    // Regex for new implementation
    private static final Pattern FRONTMATTER_PATTERN = Pattern.compile(
            "^---\\s*\\R(.*?)\\R---\\s*(?:\\R(.*))?$",
            Pattern.DOTALL | Pattern.MULTILINE
    );

    @Test
    public void benchmarkParsing(@TempDir Path tempDir) throws IOException {
        Path testFile = tempDir.resolve("benchmark.md");
        String content = "---\n" +
                "title: Benchmark Lesson\n" +
                "description: A lesson to test performance\n" +
                "order: 1\n" +
                "section: Performance\n" +
                "---\n" +
                "# Lesson Content\n\n" +
                "This is a paragraph of text to simulate content.\n".repeat(50);

        Files.writeString(testFile, content);

        System.out.println("Starting Benchmark with " + ITERATIONS + " iterations...");

        // Warmup
        for (int i = 0; i < 100; i++) {
            oldImplementation(testFile);
            newImplementation(testFile);
        }

        // Measure Old
        long startOld = System.nanoTime();
        for (int i = 0; i < ITERATIONS; i++) {
            oldImplementation(testFile);
        }
        long durationOld = System.nanoTime() - startOld;
        double avgOld = durationOld / (double) ITERATIONS / 1_000_000.0;
        System.out.println(String.format("Old Implementation: %.4f ms/op (Total: %d ms)", avgOld, durationOld / 1_000_000));

        // Measure New
        long startNew = System.nanoTime();
        for (int i = 0; i < ITERATIONS; i++) {
            newImplementation(testFile);
        }
        long durationNew = System.nanoTime() - startNew;
        double avgNew = durationNew / (double) ITERATIONS / 1_000_000.0;
        System.out.println(String.format("New Implementation: %.4f ms/op (Total: %d ms)", avgNew, durationNew / 1_000_000));

        System.out.println(String.format("Improvement: %.2fx faster", (double) durationOld / durationNew));
    }

    private void oldImplementation(Path file) throws IOException {
        StringBuilder content = new StringBuilder();
        StringBuilder frontMatter = new StringBuilder();
        boolean inFrontMatter = false;
        boolean hasFrontMatter = false;

        // Simulating Resource.getInputStream() with FileInputStream
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new FileInputStream(file.toFile()), StandardCharsets.UTF_8))) {
            String line;
            int lineCount = 0;
            while ((line = reader.readLine()) != null) {
                lineCount++;
                if (line.trim().equals("---")) {
                    if (lineCount == 1) {
                        inFrontMatter = true;
                        hasFrontMatter = true;
                        continue;
                    }
                    if (inFrontMatter) {
                        inFrontMatter = false;
                        continue;
                    }
                }

                if (inFrontMatter) {
                    frontMatter.append(line).append("\n");
                } else {
                    content.append(line).append("\n");
                }
            }
        }
        // Parsing logic would follow, but we are benchmarking reading/splitting primarily
        String fm = frontMatter.toString();
        String c = content.toString();
    }

    private void newImplementation(Path file) throws IOException {
        String fullContent;
        // Simulating resource.isFile() check
        if (file.toFile().isFile()) {
            fullContent = Files.readString(file, StandardCharsets.UTF_8);
        } else {
            // Fallback
             try (java.io.InputStream is = new FileInputStream(file.toFile())) {
                 fullContent = new String(is.readAllBytes(), StandardCharsets.UTF_8);
             }
        }

        String frontMatter = "";
        String content = "";

        Matcher matcher = FRONTMATTER_PATTERN.matcher(fullContent);
        if (matcher.find()) {
            frontMatter = matcher.group(1);
            content = matcher.group(2);
        } else {
            content = fullContent;
        }

        // Simulating what happens next
        String fm = frontMatter;
        String c = content;
    }
}
