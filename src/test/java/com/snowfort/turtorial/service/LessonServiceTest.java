package com.snowfort.turtorial.service;

import com.snowfort.turtorial.model.Lesson;
import com.snowfort.turtorial.model.QuizQuestion;
import com.snowfort.turtorial.model.QuizType;
import com.snowfort.turtorial.model.Step;
import com.snowfort.turtorial.repository.ResourceLessonRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class LessonServiceTest {

    private LessonParser lessonParser;

    @BeforeEach
    public void setup() {
        lessonParser = new LessonParser(true);
        lessonParser.init();
    }

    private LessonService createService(Path tempDir, boolean devMode, boolean failOnError) {
        LessonParser parser = new LessonParser(failOnError);
        parser.init();
        ResourceLessonRepository repo = new ResourceLessonRepository(
                parser, // Create fresh parser with config
                tempDir.resolve("lessons").toUri().toString(),
                devMode,
                failOnError
        );
        repo.init();
        return new LessonService(repo, new ShellCommandExecutor());
    }

    @Test
    public void testLoadLessonsFromDirectory(@TempDir Path tempDir) throws IOException {
        Path lessonDir = tempDir.resolve("lessons/lesson-1");
        Files.createDirectories(lessonDir);

        Path step1 = lessonDir.resolve("step1.md");
        Files.writeString(step1, "---\ntitle: Test Step\n---\n# Content");

        LessonService service = createService(tempDir, false, true);

        List<Lesson> lessons = service.findAll();
        Assertions.assertEquals(1, lessons.size());

        Lesson lesson = lessons.get(0);
        Assertions.assertEquals("Lesson 1", lesson.getTitle());
        Assertions.assertEquals(1, lesson.getSteps().size());
        Assertions.assertEquals("Test Step", lesson.getSteps().get(0).getTitle());
    }

    @Test
    public void testLoadLessonsWithMetadata(@TempDir Path tempDir) throws IOException {
        Path lessonDir = tempDir.resolve("lessons/lesson-meta");
        Files.createDirectories(lessonDir);

        Path step1 = lessonDir.resolve("step1.md");
        Files.writeString(step1, "# Content");

        Path meta = lessonDir.resolve("lesson.yml");
        Files.writeString(meta, "title: Custom Title\ndescription: Custom Description");

        LessonService service = createService(tempDir, false, true);

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

        Path step1 = lessonDir.resolve("01.md");
        Files.writeString(step1, "---\ntitle: Step 1\norder: 2\n---\n# Content 1");

        Path step2 = lessonDir.resolve("02.md");
        Files.writeString(step2, "---\ntitle: Step 2\norder: 1\n---\n# Content 2");

        LessonService service = createService(tempDir, true, true);

        List<Lesson> lessons = service.findAll();
        Assertions.assertEquals(1, lessons.size());

        Lesson lesson = lessons.get(0);

        Assertions.assertEquals(2, lesson.getSteps().size());

        Assertions.assertEquals("02", lesson.getSteps().get(0).getId());
        Assertions.assertEquals("Step 2", lesson.getSteps().get(0).getTitle());

        Assertions.assertEquals("01", lesson.getSteps().get(1).getId());
        Assertions.assertEquals("Step 1", lesson.getSteps().get(1).getTitle());
    }

    @Test
    public void testStepOrderingMixed(@TempDir Path tempDir) throws IOException {
        Path lessonDir = tempDir.resolve("lessons/lesson-mixed");
        Files.createDirectories(lessonDir);

        Path stepA = lessonDir.resolve("a.md");
        Files.writeString(stepA, "---\ntitle: Step A\n---\n# Content A");

        Path stepB = lessonDir.resolve("b.md");
        Files.writeString(stepB, "---\ntitle: Step B\norder: 1\n---\n# Content B");

        Path stepC = lessonDir.resolve("c.md");
        Files.writeString(stepC, "---\ntitle: Step C\n---\n# Content C");

        LessonService service = createService(tempDir, false, true);

        List<Lesson> lessons = service.findAll();
        Assertions.assertEquals(1, lessons.size());

        Lesson lesson = lessons.get(0);
        Assertions.assertEquals(3, lesson.getSteps().size());

        Assertions.assertEquals("b", lesson.getSteps().get(0).getId());
        Assertions.assertEquals("a", lesson.getSteps().get(1).getId());
        Assertions.assertEquals("c", lesson.getSteps().get(2).getId());
    }

    @Test
    public void testLoadLessonsWithSections(@TempDir Path tempDir) throws IOException {
        Path lessonDir = tempDir.resolve("lessons/lesson-1");
        Files.createDirectories(lessonDir);

        Path step1 = lessonDir.resolve("step1.md");
        Files.writeString(step1, "---\ntitle: Step 1\nsection: Basics\n---\n# Content");

        Path step2 = lessonDir.resolve("step2.md");
        Files.writeString(step2, "---\ntitle: Step 2\nsection: Advanced\n---\n# Content");

        LessonService service = createService(tempDir, true, true);

        List<Lesson> lessons = service.findAll();
        Assertions.assertEquals(1, lessons.size());

        Lesson lesson = lessons.get(0);
        Assertions.assertEquals(2, lesson.getSteps().size());

        Assertions.assertEquals("Step 1", lesson.getSteps().get(0).getTitle());
        Assertions.assertEquals("Basics", lesson.getSteps().get(0).getSection());

        Assertions.assertEquals("Step 2", lesson.getSteps().get(1).getTitle());
        Assertions.assertEquals("Advanced", lesson.getSteps().get(1).getSection());
    }

    @Test
    public void testLoadLessonsEmptyDirectory(@TempDir Path tempDir) throws IOException {
        Path lessonsDir = tempDir.resolve("lessons");
        Files.createDirectories(lessonsDir);

        LessonService service = createService(tempDir, false, true);

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

        LessonService service = createService(tempDir, false, false);

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

        LessonService service = createService(tempDir, true, true);

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

        LessonService service = createService(tempDir, false, true);

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

        LessonService service = createService(tempDir, true, true);

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
        Files.writeString(step1, "---\ntitle: Only Metadata\n---");

        LessonService service = createService(tempDir, false, true);

        List<Lesson> lessons = service.findAll();
        Assertions.assertEquals(1, lessons.size());

        Lesson lesson = lessons.get(0);
        Assertions.assertEquals(1, lesson.getSteps().size());

        Step step = lesson.getSteps().get(0);
        Assertions.assertEquals("Only Metadata", step.getTitle());
        Assertions.assertEquals("", step.getContent());
    }

    @Test
    public void testLoadLessonsWithInvalidFrontmatter(@TempDir Path tempDir) throws IOException {
        Path lessonDir = tempDir.resolve("lessons/lesson-invalid");
        Files.createDirectories(lessonDir);

        Path step1 = lessonDir.resolve("step1.md");
        Files.writeString(step1, "---\ntitle: Invalid Step\norder: \"not-a-number\"\n---\n# Content");

        // We expect ResourceLessonRepository init to throw RuntimeException
        Assertions.assertThrows(RuntimeException.class, () -> createService(tempDir, true, true));
    }

    @Test
    public void testLoadLessonsWithInvalidFrontmatterWarnOnly(@TempDir Path tempDir) throws IOException {
        Path lessonDir = tempDir.resolve("lessons/lesson-invalid-warn");
        Files.createDirectories(lessonDir);

        Path step1 = lessonDir.resolve("step1.md");
        Files.writeString(step1, "---\ntitle: Invalid Step\norder: \"not-a-number\"\n---\n# Content");

        LessonService service = createService(tempDir, false, false);

        List<Lesson> lessons = service.findAll();
        Assertions.assertEquals(1, lessons.size());
    }

    @Test
    public void testLoadLessonsWithQuizzes(@TempDir Path tempDir) throws IOException {
        Path lessonDir = tempDir.resolve("lessons/lesson-quiz");
        Files.createDirectories(lessonDir);

        Path step1 = lessonDir.resolve("step1.md");
        String content = "---\n" +
                "title: Step Quiz\n" +
                "quizzes:\n" +
                "  - question: 'What is 2+2?'\n" +
                "    type: CHOICE\n" +
                "    options:\n" +
                "      - '3'\n" +
                "      - '4'\n" +
                "      - '5'\n" +
                "    correctAnswer: '4'\n" +
                "  - question: 'Type hello'\n" +
                "    type: TEXT\n" +
                "    validationRegex: '^hello$'\n" +
                "---\n" +
                "# Content";

        Files.writeString(step1, content);

        LessonService service = createService(tempDir, true, true);

        List<Lesson> lessons = service.findAll();
        Assertions.assertEquals(1, lessons.size());

        Lesson lesson = lessons.get(0);
        Step step = lesson.getSteps().get(0);

        List<QuizQuestion> quizzes = step.getQuizzes();
        Assertions.assertNotNull(quizzes);
        Assertions.assertEquals(2, quizzes.size());
    }
}
