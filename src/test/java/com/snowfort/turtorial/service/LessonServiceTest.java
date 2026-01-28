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

    public void testStepOrdering(@TempDir Path tempDir) throws IOException {
        Path lessonDir = tempDir.resolve("lessons/lesson-ordering");
        Files.createDirectories(lessonDir);

        // Create 01.md with order 2
        Path step1 = lessonDir.resolve("01.md");
        Files.writeString(step1, "---\ntitle: Step 1\norder: 2\n---\n# Content 1");

        // Create 02.md with order 1
        Path step2 = lessonDir.resolve("02.md");
        Files.writeString(step2, "---\ntitle: Step 2\norder: 1\n---\n# Content 2");

        // Initialize service
        LessonService service = new LessonService(tempDir.resolve("lessons").toUri().toString());
        service.init();

        List<Lesson> lessons = service.findAll();
        Assertions.assertEquals(1, lessons.size());

        Lesson lesson = lessons.get(0);

        Assertions.assertEquals(2, lesson.getSteps().size());

        // Verify Step 2 (order 1) comes first
        Assertions.assertEquals("02", lesson.getSteps().get(0).getId());
        Assertions.assertEquals("Step 2", lesson.getSteps().get(0).getTitle());

        // Verify Step 1 (order 2) comes second
        Assertions.assertEquals("01", lesson.getSteps().get(1).getId());
        Assertions.assertEquals("Step 1", lesson.getSteps().get(1).getTitle());
    }

    @Test
    public void testStepOrderingMixed(@TempDir Path tempDir) throws IOException {
        Path lessonDir = tempDir.resolve("lessons/lesson-mixed");
        Files.createDirectories(lessonDir);

        // Implicit order (should be MAX_VALUE, so sorted by ID at the end)
        Path stepA = lessonDir.resolve("a.md");
        Files.writeString(stepA, "---\ntitle: Step A\n---\n# Content A");

        // Explicit order 1
        Path stepB = lessonDir.resolve("b.md");
        Files.writeString(stepB, "---\ntitle: Step B\norder: 1\n---\n# Content B");

        // Implicit order (should be MAX_VALUE, so sorted by ID at the end)
        Path stepC = lessonDir.resolve("c.md");
        Files.writeString(stepC, "---\ntitle: Step C\n---\n# Content C");

        // Initialize service
        LessonService service = new LessonService(tempDir.resolve("lessons").toUri().toString());
        service.init();

        List<Lesson> lessons = service.findAll();
        Assertions.assertEquals(1, lessons.size());

        Lesson lesson = lessons.get(0);
        Assertions.assertEquals(3, lesson.getSteps().size());

        // B comes first (order 1)
        Assertions.assertEquals("b", lesson.getSteps().get(0).getId());

        // A and C come after, sorted by ID (a then c)
        Assertions.assertEquals("a", lesson.getSteps().get(1).getId());
        Assertions.assertEquals("c", lesson.getSteps().get(2).getId());
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
