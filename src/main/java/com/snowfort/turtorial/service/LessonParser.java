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
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class LessonParser {

    private final ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());
    private static final Pattern FRONTMATTER_PATTERN = Pattern.compile(
            "^---\\s*\\R(.*?)\\R---\\s*(?:\\R(.*))?$",
            Pattern.DOTALL | Pattern.MULTILINE);

    private final boolean failOnError;
    private JsonSchema schema;

    public LessonParser(@Value("${turtorial.lessons.frontmatter.validation.fail-on-error:true}") boolean failOnError) {
        this.failOnError = failOnError;
    }

    @PostConstruct
    public void init() {
        loadSchema();
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

    public void parseLessonMetadata(Resource resource, Lesson lesson) {
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

    public Step parseStep(Resource resource, String filename, boolean devMode) throws IOException {
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

                mapStepFields(step, node, filename);

            } catch (Exception e) {
                if (failOnError) {
                    throw new RuntimeException("Error parsing YAML for " + filename, e);
                }
                System.err.println("Error parsing YAML for " + filename + ": " + e.getMessage());
            }
        }

        step.setContent(content);

        if (step.getOrder() == null) {
            step.setOrder(Integer.MAX_VALUE);
        }

        return step;
    }

    private void mapStepFields(Step step, JsonNode node, String filename) {
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
    }

    public String formatTitle(String slug) {
        String title = slug.replaceAll("^\\d+-", "").replace("-", " ");
        if (title.isEmpty())
            return title;
        return title.substring(0, 1).toUpperCase() + title.substring(1);
    }
}
