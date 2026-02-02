package com.snowfort.turtorial.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.networknt.schema.JsonSchema;
import com.networknt.schema.JsonSchemaFactory;
import com.networknt.schema.SpecVersion;
import com.networknt.schema.ValidationMessage;
import com.snowfort.turtorial.model.Lesson;
import com.snowfort.turtorial.model.QuizQuestion;
import com.snowfort.turtorial.model.Step;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class LessonService {

    private final List<Lesson> lessons = new ArrayList<>();
    private final ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());
    private final String lessonsDirectory;
    private final boolean devMode;

    private static final Pattern FRONTMATTER_PATTERN = Pattern.compile(
            "^---\\s*\\R(.*?)\\R---\\s*(?:\\R(.*))?$",
            Pattern.DOTALL | Pattern.MULTILINE);
    private final boolean failOnError;
    private JsonSchema schema;

    public LessonService(
            @Value("${turtorial.lessons.directory}") String lessonsDirectory,
            @Value("${turtorial.dev-mode:false}") boolean devMode,
            @Value("${turtorial.lessons.frontmatter.validation.fail-on-error:true}") boolean failOnError) {
        this.lessonsDirectory = lessonsDirectory;
        this.devMode = devMode;
        this.failOnError = failOnError;
    }

    @PostConstruct
    public void init() {
        System.out.println("Turtorial Dev Mode: " + devMode);
        loadSchema();
        loadLessons();
    }

    private void loadSchema() {
        try (InputStream is = getClass().getResourceAsStream("/schemas/lesson-frontmatter.schema.json")) {
            if (is != null) {
                JsonSchemaFactory factory = JsonSchemaFactory.getInstance(SpecVersion.VersionFlag.V7);
                this.schema = factory.getSchema(is);
            } else {
                System.err.println("Could not find frontmatter schema at /schemas/lesson-frontmatter.schema.json");
            }
        } catch (Exception e) {
            System.err.println("Failed to load frontmatter schema: " + e.getMessage());
        }
    }

    public void loadLessons() {
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            String locationPattern;

            // Determine if we are loading from classpath or file system
            if (lessonsDirectory.startsWith("classpath:") || lessonsDirectory.startsWith("file:")) {
                locationPattern = lessonsDirectory + "/**/*.*";
            } else {
                locationPattern = "file:" + lessonsDirectory + "/**/*.*";
            }

            System.out.println("Loading lessons from: " + locationPattern);

            Resource[] resources;
            try {
                resources = resolver.getResources(locationPattern);
            } catch (java.io.FileNotFoundException e) {
                System.out.println("No lessons found at " + locationPattern);
                return;
            }

            if (resources == null || resources.length == 0) {
                System.out.println("No lesson resources found at " + locationPattern);
                return;
            }

            Map<String, Lesson> lessonMap = new TreeMap<>(); // Sorted by key (lesson directory name)

            for (Resource resource : resources) {
                try {
                    String path = resource.getURL().getPath();
                    boolean isStep = path.endsWith(".md") || path.endsWith(".mdx");
                    boolean isMetadata = path.endsWith("lesson.yml") || path.endsWith("lesson.yaml");

                    if (!isStep && !isMetadata) {
                        continue;
                    }

                    // Extract lesson ID and step ID from path relative to the configured directory
                    // We need a robust way to get the relative path.
                    // If it's a file resource, we can use the file path.
                    // If it's a classpath resource, it's a bit trickier, but usually ends with
                    // .../lessons/{lessonId}/{stepId}.{md|mdx}

                    String relativePath = getRelativePath(resource);

                    if (relativePath == null) {
                        System.err.println("Could not determine relative path for " + resource.getDescription());
                        continue;
                    }

                    // Remove leading slash if present
                    if (relativePath.startsWith("/")) {
                        relativePath = relativePath.substring(1);
                    }

                    String[] segments = relativePath.split("/");

                    if (segments.length < 2)
                        continue; // Need lessonDir/stepFile

                    String lessonDir = segments[segments.length - 2];
                    String filename = segments[segments.length - 1];

                    Lesson lesson = lessonMap.computeIfAbsent(lessonDir, k -> {
                        Lesson l = new Lesson();
                        l.setId(k);
                        l.setTitle(formatTitle(k));
                        l.setSteps(new ArrayList<>());
                        return l;
                    });

                    if (isMetadata) {
                        parseLessonMetadata(resource, lesson);
                    } else {
                        Step step = parseStep(resource, filename);
                        if (step != null) {
                            lesson.getSteps().add(step);
                        }
                    }
                } catch (Exception e) {
                    if (failOnError) {
                        throw new RuntimeException("Failed to process resource: " + resource.getDescription(), e);
                    }
                    System.err.println(
                            "Failed to process resource: " + resource.getDescription() + ". Error: " + e.getMessage());
                }
            }

            // Sort steps
            lessonMap.values()
                    .forEach(l -> l.getSteps().sort(Comparator.comparing(Step::getOrder).thenComparing(Step::getId)));

            this.lessons.clear();

            for (Lesson l : lessonMap.values()) {
                if (l.isDraft() && !devMode) {
                    System.out.println("Skipping draft lesson: " + l.getId());
                    continue;
                }
                this.lessons.add(l);
            }
            System.out.println("Loaded " + lessons.size() + " lessons.");

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private String getRelativePath(Resource resource) throws IOException {
        String fullPath = resource.getURL().getPath();

        // Normalize lessons directory path to matching what we might find in the URL
        // This is a heuristic.

        String cleanConfigDir = lessonsDirectory.replace("classpath:", "").replace("file:", "");

        // If the full path contains the config directory, we can slice it.
        int index = fullPath.indexOf(cleanConfigDir);
        if (index != -1) {
            return fullPath.substring(index + cleanConfigDir.length());
        }

        // Fallback for classpath if the exact string doesn't match (e.g. built inside a
        // jar)
        // If we assumed standard structure .../lessons/lessonId/stepId
        if (lessonsDirectory.contains("lessons")) {
            String[] parts = fullPath.split("/lessons/");
            if (parts.length >= 2) {
                return parts[1];
            }
        }

        // If we are just given a directory and we are scanning recursively,
        // maybe we can just take the last two segments?
        // But that assumes specific depth.
        // Let's rely on the file system relative path if possible.
        if (resource.isFile()) {
            java.io.File root = new java.io.File(lessonsDirectory.replace("file:", ""));
            java.io.File file = resource.getFile();
            return file.getAbsolutePath().replace(root.getAbsolutePath(), "");
        }

        return null;
    }

    private void parseLessonMetadata(Resource resource, Lesson lesson) {
        try {
            JsonNode node = yamlMapper.readTree(resource.getInputStream());
            if (node.has("title"))
                lesson.setTitle(node.get("title").asText());
            if (node.has("description"))
                lesson.setDescription(node.get("description").asText());
            if (node.has("draft"))
                lesson.setDraft(node.get("draft").asBoolean());
        } catch (IOException e) {
            System.err.println("Error parsing lesson metadata for " + lesson.getId() + ": " + e.getMessage());
        }
    }

    private Step parseStep(Resource resource, String filename) throws IOException {
        String fullContent;
        if (resource.isFile()) {
            fullContent = Files.readString(resource.getFile().toPath(), StandardCharsets.UTF_8);
        } else {
            try (InputStream is = resource.getInputStream()) {
                fullContent = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }
        }

        String frontMatter = "";
        String content = "";

        Matcher matcher = FRONTMATTER_PATTERN.matcher(fullContent);
        if (matcher.find()) {
            frontMatter = matcher.group(1);
            content = matcher.group(2);
            if (content == null) {
                content = "";
            }
        } else {
            content = fullContent;
        }

        Step step = new Step();
        String baseName = filename.replaceAll("\\.mdx?$", "");
        step.setId(baseName);

        // Default title from filename if not in frontmatter
        step.setTitle(formatTitle(baseName));

        if (!frontMatter.isBlank()) {
            try {
                JsonNode node = yamlMapper.readTree(frontMatter);

                if (node.has("draft") && node.get("draft").asBoolean() && !devMode) {
                    return null;
                }

                if (this.schema != null) {
                    Set<ValidationMessage> errors = this.schema.validate(node);
                    if (!errors.isEmpty()) {
                        String errorMessage = "Frontmatter validation errors for " + filename + ": " + errors;
                        if (failOnError) {
                            throw new RuntimeException(errorMessage);
                        } else {
                            System.err.println(errorMessage);
                        }
                    }
                }

                if (node.has("title"))
                    step.setTitle(node.get("title").asText());
                if (node.has("testCommand"))
                    step.setTestCommand(node.get("testCommand").asText());
                if (node.has("before"))
                    step.setBeforeCommand(node.get("before").asText());
                if (node.has("after"))
                    step.setAfterCommand(node.get("after").asText());
                if (node.has("order"))
                    step.setOrder(node.get("order").asInt());
                if (node.has("section"))
                    step.setSection(node.get("section").asText());
                if (node.has("quizzes")) {
                    try {
                        List<QuizQuestion> quizzes = yamlMapper.convertValue(node.get("quizzes"),
                                new TypeReference<List<QuizQuestion>>() {
                                });
                        step.setQuizzes(quizzes);
                    } catch (Exception e) {
                        System.err.println("Error parsing quizzes for " + filename + ": " + e.getMessage());
                    }
                }
            } catch (Exception e) {
                if (failOnError) {
                    throw new RuntimeException("Error parsing YAML for " + filename, e);
                }
                System.err.println("Error parsing YAML for " + filename + ": " + e.getMessage());
            }
        }

        // Send Raw Markdown to Frontend
        step.setContent(content);

        if (step.getOrder() == null) {
            step.setOrder(Integer.MAX_VALUE);
        }

        return step;
    }

    private String formatTitle(String slug) {
        // Simple humanization: "01-introduction" -> "Introduction"
        String title = slug.replaceAll("^\\d+-", "").replace("-", " ");
        if (title.isEmpty())
            return title;
        return title.substring(0, 1).toUpperCase() + title.substring(1);
    }

    public List<Lesson> findAll() {
        return lessons;
    }

    public Lesson findById(String id) {
        return lessons.stream().filter(l -> l.getId().equals(id)).findFirst().orElse(null);
    }

    public boolean verifyStep(String lessonId, String stepId) {
        Step step = findStep(lessonId, stepId);

        if (step == null || step.getTestCommand() == null || step.getTestCommand().isEmpty()) {
            return true;
        }

        return runCommand(step.getTestCommand());
    }

    public boolean runBeforeStep(String lessonId, String stepId) {
        Step step = findStep(lessonId, stepId);

        if (step == null || step.getBeforeCommand() == null || step.getBeforeCommand().isEmpty()) {
            return true;
        }

        return runCommand(step.getBeforeCommand());
    }

    public boolean runAfterStep(String lessonId, String stepId) {
        Step step = findStep(lessonId, stepId);

        if (step == null || step.getAfterCommand() == null || step.getAfterCommand().isEmpty()) {
            return true;
        }

        return runCommand(step.getAfterCommand());
    }

    private Step findStep(String lessonId, String stepId) {
        Lesson lesson = findById(lessonId);
        if (lesson == null)
            return null;

        return lesson.getSteps().stream()
                .filter(s -> s.getId().equals(stepId))
                .findFirst()
                .orElse(null);
    }

    private boolean runCommand(String command) {
        try {
            Process process = new ProcessBuilder("/bin/sh", "-c", command)
                    .redirectOutput(ProcessBuilder.Redirect.DISCARD)
                    .redirectError(ProcessBuilder.Redirect.DISCARD)
                    .start();
            int exitCode = process.waitFor();
            return exitCode == 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
