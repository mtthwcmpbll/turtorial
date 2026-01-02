package com.snowfort.turtorial.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.snowfort.turtorial.model.Lesson;
import com.snowfort.turtorial.model.Step;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class LessonService {

    private final List<Lesson> lessons = new ArrayList<>();
    private final ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());

    public LessonService() {
    }

    @PostConstruct
    public void init() {
        loadLessons();
    }

    public void loadLessons() {
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            // Find all markdown/mdx files in lessons directory
            Resource[] resources = resolver.getResources("classpath*:lessons/**/*.*");

            Map<String, Lesson> lessonMap = new TreeMap<>(); // Sorted by key (lesson directory name)

            for (Resource resource : resources) {
                String path = resource.getURL().getPath();
                if (!path.endsWith(".md") && !path.endsWith(".mdx")) {
                    continue;
                }

                // extraction logic depending on path structure
                // Expected: .../lessons/{lessonId}/{stepId}.{md|mdx}

                String[] parts = path.split("/lessons/");
                if (parts.length < 2)
                    continue;

                String relativePath = parts[1];
                String[] segments = relativePath.split("/");

                if (segments.length < 2)
                    continue; // Need lessonDir/stepFile

                String lessonDir = segments[segments.length - 2];
                String stepFile = segments[segments.length - 1];

                Lesson lesson = lessonMap.computeIfAbsent(lessonDir, k -> {
                    Lesson l = new Lesson();
                    l.setId(k);
                    l.setTitle(formatTitle(k));
                    l.setSteps(new ArrayList<>());
                    return l;
                });

                Step step = parseStep(resource, stepFile);
                lesson.getSteps().add(step);
            }

            // Sort steps
            lessonMap.values().forEach(l -> l.getSteps().sort(Comparator.comparing(Step::getId)));

            this.lessons.clear();
            this.lessons.addAll(lessonMap.values());
            System.out.println("Loaded " + lessons.size() + " lessons.");

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private Step parseStep(Resource resource, String filename) throws IOException {
        StringBuilder content = new StringBuilder();
        StringBuilder frontMatter = new StringBuilder();
        boolean inFrontMatter = false;
        boolean hasFrontMatter = false;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            int lineCount = 0;
            while ((line = reader.readLine()) != null) {
                lineCount++;
                if (line.trim().equals("---")) {
                    if (lineCount == 1) {
                        inFrontMatter = true;
                        hasFrontMatter = true;
                        continue;
                    }
                    if (inFrontMatter) {
                        inFrontMatter = false;
                        continue;
                    }
                }

                if (inFrontMatter) {
                    frontMatter.append(line).append("\n");
                } else {
                    content.append(line).append("\n");
                }
            }
        }

        Step step = new Step();
        String baseName = filename.replaceAll("\\.mdx?$", "");
        step.setId(baseName);

        // Default title from filename if not in frontmatter
        step.setTitle(formatTitle(baseName));

        if (hasFrontMatter) {
            try {
                JsonNode node = yamlMapper.readTree(frontMatter.toString());
                if (node.has("title"))
                    step.setTitle(node.get("title").asText());
                if (node.has("runCommand"))
                    step.setRunCommand(node.get("runCommand").asText());
                if (node.has("testCommand"))
                    step.setTestCommand(node.get("testCommand").asText());
            } catch (Exception e) {
                System.err.println("Error parsing YAML for " + filename + ": " + e.getMessage());
            }
        }

        // Send Raw Markdown to Frontend
        step.setContent(content.toString());

        return step;
    }

    private String formatTitle(String slug) {
        // Simple humanization: "01-introduction" -> "Introduction"
        String title = slug.replaceAll("^\\d+-", "").replace("-", " ");
        return title.substring(0, 1).toUpperCase() + title.substring(1);
    }

    public List<Lesson> findAll() {
        return lessons;
    }

    public Lesson findById(String id) {
        return lessons.stream().filter(l -> l.getId().equals(id)).findFirst().orElse(null);
    }

    public boolean verifyStep(String lessonId, String stepId) {
        Lesson lesson = findById(lessonId);
        if (lesson == null)
            return false;

        Step step = lesson.getSteps().stream()
                .filter(s -> s.getId().equals(stepId))
                .findFirst()
                .orElse(null);

        if (step == null || step.getTestCommand() == null || step.getTestCommand().isEmpty()) {
            return true;
        }

        try {
            Process process = new ProcessBuilder("/bin/sh", "-c", step.getTestCommand())
                    .start();
            int exitCode = process.waitFor();
            return exitCode == 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
