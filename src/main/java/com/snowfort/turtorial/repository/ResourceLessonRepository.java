package com.snowfort.turtorial.repository;

import com.snowfort.turtorial.model.Lesson;
import com.snowfort.turtorial.model.Step;
import com.snowfort.turtorial.service.LessonParser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Repository;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.*;

@Repository
public class ResourceLessonRepository implements LessonRepository {

    private final LessonParser lessonParser;
    private final String lessonsDirectory;
    private final boolean devMode;
    private final boolean failOnError;

    private final List<Lesson> lessons = new ArrayList<>();

    public ResourceLessonRepository(
            LessonParser lessonParser,
            @Value("${turtorial.lessons.directory}") String lessonsDirectory,
            @Value("${turtorial.dev-mode:false}") boolean devMode,
            @Value("${turtorial.lessons.frontmatter.validation.fail-on-error:true}") boolean failOnError) {
        this.lessonParser = lessonParser;
        this.lessonsDirectory = lessonsDirectory;
        this.devMode = devMode;
        this.failOnError = failOnError;
    }

    @PostConstruct
    public void init() {
        loadLessons();
    }

    public void loadLessons() {
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            String locationPattern;

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

            Map<String, Lesson> lessonMap = new TreeMap<>();

            for (Resource resource : resources) {
                try {
                    String path = resource.getURL().getPath();
                    boolean isStep = path.endsWith(".md") || path.endsWith(".mdx");
                    boolean isMetadata = path.endsWith("lesson.yml") || path.endsWith("lesson.yaml");

                    if (!isStep && !isMetadata) {
                        continue;
                    }

                    String relativePath = getRelativePath(resource);

                    if (relativePath == null) {
                        System.err.println("Could not determine relative path for " + resource.getDescription());
                        continue;
                    }

                    if (relativePath.startsWith("/")) {
                        relativePath = relativePath.substring(1);
                    }

                    String[] segments = relativePath.split("/");

                    if (segments.length < 2)
                        continue;

                    String lessonDir = segments[segments.length - 2];
                    String filename = segments[segments.length - 1];

                    Lesson lesson = lessonMap.computeIfAbsent(lessonDir, k -> {
                        Lesson l = new Lesson();
                        l.setId(k);
                        l.setTitle(lessonParser.formatTitle(k));
                        l.setSteps(new ArrayList<>());
                        return l;
                    });

                    if (isMetadata) {
                        lessonParser.parseLessonMetadata(resource, lesson);
                    } else {
                        Step step = lessonParser.parseStep(resource, filename, devMode);
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
        String cleanConfigDir = lessonsDirectory.replace("classpath:", "").replace("file:", "");

        int index = fullPath.indexOf(cleanConfigDir);
        if (index != -1) {
            return fullPath.substring(index + cleanConfigDir.length());
        }

        if (lessonsDirectory.contains("lessons")) {
            String[] parts = fullPath.split("/lessons/");
            if (parts.length >= 2) {
                return parts[1];
            }
        }

        if (resource.isFile()) {
            java.io.File root = new java.io.File(lessonsDirectory.replace("file:", ""));
            java.io.File file = resource.getFile();
            return file.getAbsolutePath().replace(root.getAbsolutePath(), "");
        }

        return null;
    }

    @Override
    public List<Lesson> findAll() {
        return lessons;
    }

    @Override
    public Lesson findById(String id) {
        return lessons.stream().filter(l -> l.getId().equals(id)).findFirst().orElse(null);
    }
}
