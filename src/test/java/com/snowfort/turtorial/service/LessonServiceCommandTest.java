package com.snowfort.turtorial.service;

import com.snowfort.turtorial.model.Lesson;
import com.snowfort.turtorial.repository.ResourceLessonRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class LessonServiceCommandTest {

    @Test
    public void testBeforeAndAfterCommands(@TempDir Path tempDir) throws IOException {
        Path lessonDir = tempDir.resolve("lessons/lesson-cmd");
        Files.createDirectories(lessonDir);

        Path prepareFile = tempDir.resolve("prepare.txt");
        Path cleanupFile = tempDir.resolve("cleanup.txt");

        String beforeCmd = "touch " + prepareFile.toAbsolutePath();
        String afterCmd = "touch " + cleanupFile.toAbsolutePath();

        Path step1 = lessonDir.resolve("step1.md");
        Files.writeString(step1,
                String.format("---\ntitle: Cmd Step\nbefore: %s\nafter: %s\n---\n# Content", beforeCmd, afterCmd));

        ResourceLessonRepository repo = new ResourceLessonRepository(
                new LessonParser(true),
                tempDir.resolve("lessons").toUri().toString(),
                true,
                true);
        repo.init();

        LessonService service = new LessonService(repo, new ShellCommandExecutor());

        List<Lesson> lessons = service.findAll();
        Assertions.assertEquals(1, lessons.size());
        Lesson lesson = lessons.get(0);
        String lessonId = lesson.getId();
        String stepId = lesson.getSteps().get(0).getId();

        Assertions.assertFalse(Files.exists(prepareFile), "Prepare file should not exist yet");
        boolean prepareResult = service.runBeforeStep(lessonId, stepId);
        Assertions.assertTrue(prepareResult, "Prepare step should succeed");
        Assertions.assertTrue(Files.exists(prepareFile), "Prepare file should exist after prepareStep");

        Assertions.assertFalse(Files.exists(cleanupFile), "Cleanup file should not exist yet");
        boolean cleanupResult = service.runAfterStep(lessonId, stepId);
        Assertions.assertTrue(cleanupResult, "Cleanup step should succeed");
        Assertions.assertTrue(Files.exists(cleanupFile), "Cleanup file should exist after cleanupStep");
    }
}
