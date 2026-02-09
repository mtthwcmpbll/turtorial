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
    private final boolean environmentScriptsEnabled;

    public LessonService(LessonRepository lessonRepository, CommandExecutor commandExecutor,
            @org.springframework.beans.factory.annotation.Value("${turtorial.lessons.environmentScripts.enabled:false}") boolean environmentScriptsEnabled) {
        this.lessonRepository = lessonRepository;
        this.commandExecutor = commandExecutor;
        this.environmentScriptsEnabled = environmentScriptsEnabled;
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
        if (!environmentScriptsEnabled) {
            return true;
        }
        Step step = findStep(lessonId, stepId);

        if (step == null || step.getBeforeCommand() == null || step.getBeforeCommand().isEmpty()) {
            return true;
        }

        return commandExecutor.execute(step.getBeforeCommand());
    }

    public boolean runAfterStep(String lessonId, String stepId) {
        if (!environmentScriptsEnabled) {
            return true;
        }
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
