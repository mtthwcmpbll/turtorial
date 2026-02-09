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

public class LessonScriptsTest {

    private LessonService createService(Path tempDir, boolean environmentScriptsEnabled) {
        LessonParser parser = new LessonParser(true);
        parser.init();
        ResourceLessonRepository repo = new ResourceLessonRepository(
                parser,
                tempDir.resolve("lessons").toUri().toString(),
                true, // devMode
                true // failOnError
        );
        repo.init();
        return new LessonService(repo, new ShellCommandExecutor(), environmentScriptsEnabled);
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
        LessonService service = createService(tempDir, false);

        List<Lesson> lessons = service.findAll();
        Lesson lesson = lessons.get(0);
        String lessonId = lesson.getId();
        String stepId = lesson.getSteps().get(0).getId();

        // Run prepare (runBeforeStep)
        boolean result = service.runBeforeStep(lessonId, stepId);
        Assertions.assertTrue(result);
        Assertions.assertFalse(Files.exists(targetFile), "File should NOT be created when scripts are disabled");

        // Run cleanup (runAfterStep)
        // Create file manually to check if it gets deleted (it shouldn't)
        Files.createFile(targetFile);
        result = service.runAfterStep(lessonId, stepId);
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
        LessonService service = createService(tempDir, true);

        List<Lesson> lessons = service.findAll();
        Lesson lesson = lessons.get(0);
        String lessonId = lesson.getId();
        String stepId = lesson.getSteps().get(0).getId();

        // Run prepare (runBeforeStep)
        boolean result = service.runBeforeStep(lessonId, stepId);
        Assertions.assertTrue(result);
        Assertions.assertTrue(Files.exists(targetFile), "File SHOULD be created when scripts are enabled");

        // Run cleanup (runAfterStep)
        result = service.runAfterStep(lessonId, stepId);
        Assertions.assertTrue(result);
        Assertions.assertFalse(Files.exists(targetFile), "File SHOULD be deleted when scripts are enabled");
    }
}
