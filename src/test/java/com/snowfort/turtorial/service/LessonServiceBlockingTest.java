package com.snowfort.turtorial.service;

import com.snowfort.turtorial.model.Lesson;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;

import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import static org.mockito.Mockito.*;

public class LessonServiceBlockingTest {

    private Environment mockEnv;

    @BeforeEach
    public void setup() {
        mockEnv = mock(Environment.class);
        when(mockEnv.acceptsProfiles(Profiles.of("prod"))).thenReturn(false);
    }

    @Test
    public void testVerifyStepBlocking(@TempDir Path tempDir) throws IOException {
        Path lessonDir = tempDir.resolve("lessons/blocking-lesson");
        Files.createDirectories(lessonDir);

        // A command that produces enough output to fill the buffer (typically 64KB on Linux)
        // yes prints the string repeatedly. head limits the output.
        // 30 chars + newline = 31 bytes per line.
        // 5000 lines * 31 bytes = 155,000 bytes > 64KB.
        String blockingCommand = "yes \"012345678901234567890123456789\" | head -n 5000";

        Path step1 = lessonDir.resolve("step1.md");
        String content = "---\n" +
                "title: Blocking Step\n" +
                "testCommand: " + blockingCommand + "\n" +
                "---\n" +
                "# Content";
        Files.writeString(step1, content);

        LessonService service = new LessonService(
                tempDir.resolve("lessons").toUri().toString(),
                false,
                false,
                mockEnv);
        service.init();

        // Ensure the lesson is loaded
        Assertions.assertFalse(service.findAll().isEmpty(), "Lesson should be loaded");
        String lessonId = service.findAll().get(0).getId();
        String stepId = service.findAll().get(0).getSteps().get(0).getId();

        // This should timeout if blocking occurs
        Assertions.assertTimeoutPreemptively(Duration.ofSeconds(5), () -> {
            boolean result = service.verifyStep(lessonId, stepId);
            // We expect the command to exit successfully if it doesn't block
        }, "verifyStep blocked due to unconsumed output");
    }
}
