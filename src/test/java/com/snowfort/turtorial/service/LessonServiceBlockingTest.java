package com.snowfort.turtorial.service;

import com.snowfort.turtorial.repository.ResourceLessonRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;

public class LessonServiceBlockingTest {

    @BeforeEach
    public void setup() {
        // No environment mocking needed anymore
    }

    @Test
    public void testVerifyStepBlocking(@TempDir Path tempDir) throws IOException {
        Path lessonDir = tempDir.resolve("lessons/blocking-lesson");
        Files.createDirectories(lessonDir);

        String blockingCommand = "yes \"012345678901234567890123456789\" | head -n 5000";

        Path step1 = lessonDir.resolve("step1.md");
        String content = "---\n" +
                "title: Blocking Step\n" +
                "testCommand: " + blockingCommand + "\n" +
                "---\n" +
                "# Content";
        Files.writeString(step1, content);

        ResourceLessonRepository repo = new ResourceLessonRepository(
                new LessonParser(true),
                tempDir.resolve("lessons").toUri().toString(),
                false,
                false);
        repo.init();

        LessonService service = new LessonService(repo, new ShellCommandExecutor());

        Assertions.assertFalse(service.findAll().isEmpty(), "Lesson should be loaded");
        String lessonId = service.findAll().get(0).getId();
        String stepId = service.findAll().get(0).getSteps().get(0).getId();

        Assertions.assertTimeoutPreemptively(Duration.ofSeconds(5), () -> {
            boolean result = service.verifyStep(lessonId, stepId);
        }, "verifyStep blocked due to unconsumed output");
    }
}
