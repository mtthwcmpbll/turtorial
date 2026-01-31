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
    public void testLoadLessonsWithMetadata(@TempDir Path tempDir) throws IOException {
        // Create a mock lesson structure
        Path lessonDir = tempDir.resolve("lessons/lesson-meta");
        Files.createDirectories(lessonDir);

        Path step1 = lessonDir.resolve("step1.md");
        Files.writeString(step1, "# Content");

        Path meta = lessonDir.resolve("lesson.yml");
        Files.writeString(meta, "title: Custom Title\ndescription: Custom Description");

        // Initialize service pointing to temp dir
        LessonService service = new LessonService(tempDir.resolve("lessons").toUri().toString());
        service.init();

        List<Lesson> lessons = service.findAll();
        Assertions.assertEquals(1, lessons.size());

        Lesson lesson = lessons.get(0);
        Assertions.assertEquals("Custom Title", lesson.getTitle());
        Assertions.assertEquals("Custom Description", lesson.getDescription());
        Assertions.assertEquals(1, lesson.getSteps().size());
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
