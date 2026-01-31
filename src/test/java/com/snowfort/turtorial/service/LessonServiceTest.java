package com.snowfort.turtorial.service;

import com.snowfort.turtorial.model.Lesson;
import com.snowfort.turtorial.model.Step;
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

public class LessonServiceTest {

    private Environment mockEnv;

    @BeforeEach
    public void setup() {
        mockEnv = mock(Environment.class);
        // Default behavior: not production
        when(mockEnv.acceptsProfiles(Profiles.of("prod"))).thenReturn(false);
    }

    @Test
    public void testLoadLessonsFromDirectory(@TempDir Path tempDir) throws IOException {
        // Create a mock lesson structure
        Path lessonDir = tempDir.resolve("lessons/lesson-1");
        Files.createDirectories(lessonDir);

        Path step1 = lessonDir.resolve("step1.md");
        Files.writeString(step1, "---\ntitle: Test Step\n---\n# Content");

        // Initialize service pointing to temp dir
        LessonService service = new LessonService(tempDir.resolve("lessons").toUri().toString(), false, mockEnv);
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
        LessonService service = new LessonService(tempDir.resolve("lessons").toUri().toString(), false, mockEnv);
        service.init();

        List<Lesson> lessons = service.findAll();
        Assertions.assertEquals(1, lessons.size());

        Lesson lesson = lessons.get(0);

        Assertions.assertEquals("Custom Title", lesson.getTitle());
        Assertions.assertEquals("Custom Description", lesson.getDescription());
        Assertions.assertEquals(1, lesson.getSteps().size());
    }

    @Test
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
        LessonService service = new LessonService(tempDir.resolve("lessons").toUri().toString(), false, mockEnv);
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
        LessonService service = new LessonService(tempDir.resolve("lessons").toUri().toString(), false, mockEnv);
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
        LessonService service = new LessonService(tempDir.resolve("lessons").toUri().toString(), false, mockEnv);
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

        LessonService service = new LessonService(tempDir.resolve("lessons").toUri().toString(), false, mockEnv);
        service.init();

        List<Lesson> lessons = service.findAll();
        Assertions.assertTrue(lessons.isEmpty());
    }

    @Test
    public void testDraftLessonInProduction(@TempDir Path tempDir) throws IOException {
        Path lessonDir = tempDir.resolve("lessons/draft-lesson");
        Files.createDirectories(lessonDir);

        Path meta = lessonDir.resolve("lesson.yml");
        Files.writeString(meta, "title: Draft Lesson\ndraft: true");

        Path step1 = lessonDir.resolve("step1.md");
        Files.writeString(step1, "# Content");

        // Mock production environment
        when(mockEnv.acceptsProfiles(Profiles.of("prod"))).thenReturn(true);

        LessonService service = new LessonService(tempDir.resolve("lessons").toUri().toString(), false, mockEnv);
        service.init();

        List<Lesson> lessons = service.findAll();
        Assertions.assertTrue(lessons.isEmpty(), "Draft lesson should not be loaded in production");
    }

    @Test
    public void testDraftLessonInDev(@TempDir Path tempDir) throws IOException {
        Path lessonDir = tempDir.resolve("lessons/draft-lesson");
        Files.createDirectories(lessonDir);

        Path meta = lessonDir.resolve("lesson.yml");
        Files.writeString(meta, "title: Draft Lesson\ndraft: true");

        Path step1 = lessonDir.resolve("step1.md");
        Files.writeString(step1, "# Content");

        // Mock dev environment (not production)
        when(mockEnv.acceptsProfiles(Profiles.of("prod"))).thenReturn(false);

        LessonService service = new LessonService(tempDir.resolve("lessons").toUri().toString(), false, mockEnv);
        service.init();

        List<Lesson> lessons = service.findAll();
        Assertions.assertEquals(1, lessons.size(), "Draft lesson SHOULD be loaded in non-production");
        Assertions.assertEquals("Draft Lesson", lessons.get(0).getTitle());
    }

    @Test
    public void testDraftStepHiddenByDefault(@TempDir Path tempDir) throws IOException {
        Path lessonDir = tempDir.resolve("lessons/draft-step-test");
        Files.createDirectories(lessonDir);

        Path step1 = lessonDir.resolve("01-visible.md");
        Files.writeString(step1, "# Visible Content");

        Path step2 = lessonDir.resolve("02-draft.md");
        Files.writeString(step2, "---\ntitle: Draft Step\ndraft: true\n---\n# Draft Content");

        // devMode = false
        LessonService service = new LessonService(tempDir.resolve("lessons").toUri().toString(), false, mockEnv);
        service.init();

        List<Lesson> lessons = service.findAll();
        Assertions.assertEquals(1, lessons.size());

        Lesson lesson = lessons.get(0);
        Assertions.assertEquals(1, lesson.getSteps().size());
        Assertions.assertEquals("01-visible", lesson.getSteps().get(0).getId());
    }

    @Test
    public void testDraftStepVisibleInDevMode(@TempDir Path tempDir) throws IOException {
        Path lessonDir = tempDir.resolve("lessons/draft-step-test");
        Files.createDirectories(lessonDir);

        Path step1 = lessonDir.resolve("01-visible.md");
        Files.writeString(step1, "# Visible Content");

        Path step2 = lessonDir.resolve("02-draft.md");
        Files.writeString(step2, "---\ntitle: Draft Step\ndraft: true\n---\n# Draft Content");

        // devMode = true
        LessonService service = new LessonService(tempDir.resolve("lessons").toUri().toString(), true, mockEnv);
        service.init();

        List<Lesson> lessons = service.findAll();
        Assertions.assertEquals(1, lessons.size());

        Lesson lesson = lessons.get(0);
        Assertions.assertEquals(2, lesson.getSteps().size());
    }

    @Test
    public void testFrontmatterOnly(@TempDir Path tempDir) throws IOException {
        Path lessonDir = tempDir.resolve("lessons/fm-only");
        Files.createDirectories(lessonDir);

        Path step1 = lessonDir.resolve("step1.md");
        // File ending with --- (no newline after)
        Files.writeString(step1, "---\ntitle: Only Metadata\n---");

        LessonService service = new LessonService(tempDir.resolve("lessons").toUri().toString(), false, mockEnv);
        service.init();

        List<Lesson> lessons = service.findAll();
        Assertions.assertEquals(1, lessons.size());

        Lesson lesson = lessons.get(0);
        Assertions.assertEquals(1, lesson.getSteps().size());

        Step step = lesson.getSteps().get(0);
        Assertions.assertEquals("Only Metadata", step.getTitle());
        Assertions.assertEquals("", step.getContent());
    }
}
