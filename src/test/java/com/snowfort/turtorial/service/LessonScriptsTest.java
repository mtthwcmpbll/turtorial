package com.snowfort.turtorial.service;

import com.snowfort.turtorial.model.Lesson;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import static org.mockito.Mockito.*;

public class LessonScriptsTest {

    private Environment mockEnv;

    @BeforeEach
    public void setup() {
        mockEnv = mock(Environment.class);
        when(mockEnv.acceptsProfiles(Profiles.of("prod"))).thenReturn(false);
    }

    @Test
    public void testScriptsDisabled(@TempDir Path tempDir) throws IOException {
        Path lessonDir = tempDir.resolve("lessons/script-lesson");
        Files.createDirectories(lessonDir);
        Path targetFile = tempDir.resolve("target-file");

        Path step1 = lessonDir.resolve("01.md");
        String content = "---\n" +
                "title: Script Test\n" +
                "before: touch " + targetFile.toAbsolutePath() + "\n" +
                "after: rm " + targetFile.toAbsolutePath() + "\n" +
                "---\n" +
                "# Content";
        Files.writeString(step1, content);

        // Disable scripts
        LessonService service = new LessonService(tempDir.resolve("lessons").toUri().toString(), false, false, mockEnv);
        service.init();

        List<Lesson> lessons = service.findAll();
        Lesson lesson = lessons.get(0);
        String lessonId = lesson.getId();
        String stepId = lesson.getSteps().get(0).getId();

        // Run prepare
        boolean result = service.prepareStep(lessonId, stepId);
        Assertions.assertTrue(result);
        Assertions.assertFalse(Files.exists(targetFile), "File should NOT be created when scripts are disabled");

        // Run cleanup
        // Create file manually to check if it gets deleted (it shouldn't)
        Files.createFile(targetFile);
        result = service.cleanupStep(lessonId, stepId);
        Assertions.assertTrue(result);
        Assertions.assertTrue(Files.exists(targetFile), "File should NOT be deleted when scripts are disabled");
    }

    @Test
    public void testScriptsEnabled(@TempDir Path tempDir) throws IOException {
        Path lessonDir = tempDir.resolve("lessons/script-lesson");
        Files.createDirectories(lessonDir);
        Path targetFile = tempDir.resolve("target-file");

        Path step1 = lessonDir.resolve("01.md");
        String content = "---\n" +
                "title: Script Test\n" +
                "before: touch " + targetFile.toAbsolutePath() + "\n" +
                "after: rm " + targetFile.toAbsolutePath() + "\n" +
                "---\n" +
                "# Content";
        Files.writeString(step1, content);

        // Enable scripts
        LessonService service = new LessonService(tempDir.resolve("lessons").toUri().toString(), false, true, mockEnv);
        service.init();

        List<Lesson> lessons = service.findAll();
        Lesson lesson = lessons.get(0);
        String lessonId = lesson.getId();
        String stepId = lesson.getSteps().get(0).getId();

        // Run prepare
        boolean result = service.prepareStep(lessonId, stepId);
        Assertions.assertTrue(result);
        Assertions.assertTrue(Files.exists(targetFile), "File SHOULD be created when scripts are enabled");

        // Run cleanup
        result = service.cleanupStep(lessonId, stepId);
        Assertions.assertTrue(result);
        Assertions.assertFalse(Files.exists(targetFile), "File SHOULD be deleted when scripts are enabled");
    }
}
