package com.snowfort.turtorial.service;

import com.snowfort.turtorial.model.Lesson;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class LessonServiceTest {

    @Test
    public void testLoadLessonsFromDirectory(@TempDir Path tempDir) throws IOException {
        // Create a mock lesson structure
        Path lessonDir = tempDir.resolve("lessons/lesson-1");
        Files.createDirectories(lessonDir);

        Path step1 = lessonDir.resolve("step1.md");
        Files.writeString(step1, "---\ntitle: Test Step\n---\n# Content");

        // Initialize service pointing to temp dir
        LessonService service = new LessonService(tempDir.resolve("lessons").toUri().toString());
        service.init();

        List<Lesson> lessons = service.findAll();
        Assertions.assertEquals(1, lessons.size());

        Lesson lesson = lessons.get(0);
        Assertions.assertEquals("Lesson 1", lesson.getTitle());
        Assertions.assertEquals(1, lesson.getSteps().size());
        Assertions.assertEquals("Test Step", lesson.getSteps().get(0).getTitle());
    }

    @Test
    public void testLoadLessonsWithSections(@TempDir Path tempDir) throws IOException {
        // Create a mock lesson structure
        Path lessonDir = tempDir.resolve("lessons/lesson-1");
        Files.createDirectories(lessonDir);

        Path step1 = lessonDir.resolve("step1.md");
        Files.writeString(step1, "---\ntitle: Step 1\nsection: Basics\n---\n# Content");

        Path step2 = lessonDir.resolve("step2.md");
        Files.writeString(step2, "---\ntitle: Step 2\nsection: Advanced\n---\n# Content");

        // Initialize service pointing to temp dir
        LessonService service = new LessonService(tempDir.resolve("lessons").toUri().toString());
        service.init();

        List<Lesson> lessons = service.findAll();
        Assertions.assertEquals(1, lessons.size());

        Lesson lesson = lessons.get(0);
        Assertions.assertEquals(2, lesson.getSteps().size());

        // Steps are sorted by ID (filename)
        Assertions.assertEquals("Step 1", lesson.getSteps().get(0).getTitle());
        Assertions.assertEquals("Basics", lesson.getSteps().get(0).getSection());

        Assertions.assertEquals("Step 2", lesson.getSteps().get(1).getTitle());
        Assertions.assertEquals("Advanced", lesson.getSteps().get(1).getSection());
    }

    @Test
    public void testLoadLessonsEmptyDirectory(@TempDir Path tempDir) throws IOException {
        Path lessonsDir = tempDir.resolve("lessons");
        Files.createDirectories(lessonsDir);

        LessonService service = new LessonService(tempDir.resolve("lessons").toUri().toString());
        service.init();

        List<Lesson> lessons = service.findAll();
        Assertions.assertTrue(lessons.isEmpty());
    }
}
