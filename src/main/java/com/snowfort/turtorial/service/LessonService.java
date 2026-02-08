package com.snowfort.turtorial.service;

import com.snowfort.turtorial.model.Lesson;
import com.snowfort.turtorial.model.Step;
import com.snowfort.turtorial.repository.LessonRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LessonService {

    private final LessonRepository lessonRepository;
    private final CommandExecutor commandExecutor;

    public LessonService(LessonRepository lessonRepository, CommandExecutor commandExecutor) {
        this.lessonRepository = lessonRepository;
        this.commandExecutor = commandExecutor;
    }

    // Deprecated: Only used for tests that haven't been migrated yet to use Repository directly
    // Ideally this should be removed and tests updated to use Repository or mocked properly
    public void init() {
       // No-op as repository initializes itself
    }

    public List<Lesson> findAll() {
        return lessonRepository.findAll();
    }

    public Lesson findById(String id) {
        return lessonRepository.findById(id);
    }

    public boolean verifyStep(String lessonId, String stepId) {
        Step step = findStep(lessonId, stepId);

        if (step == null || step.getTestCommand() == null || step.getTestCommand().isEmpty()) {
            return true;
        }

        return commandExecutor.execute(step.getTestCommand());
    }

    public boolean runBeforeStep(String lessonId, String stepId) {
        Step step = findStep(lessonId, stepId);

        if (step == null || step.getBeforeCommand() == null || step.getBeforeCommand().isEmpty()) {
            return true;
        }

        return commandExecutor.execute(step.getBeforeCommand());
    }

    public boolean runAfterStep(String lessonId, String stepId) {
        Step step = findStep(lessonId, stepId);

        if (step == null || step.getAfterCommand() == null || step.getAfterCommand().isEmpty()) {
            return true;
        }

        return commandExecutor.execute(step.getAfterCommand());
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
}
