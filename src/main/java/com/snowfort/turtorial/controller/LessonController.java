package com.snowfort.turtorial.controller;

import com.snowfort.turtorial.model.Lesson;
import com.snowfort.turtorial.service.LessonService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@CrossOrigin(origins = "*")
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    @GetMapping
    public List<Lesson> getAllLessons() {
        return lessonService.findAll();
    }

    @GetMapping("/{id}")
    public Lesson getLessonById(@PathVariable String id) {
        return lessonService.findById(id);
    }

    @PostMapping("/{lessonId}/steps/{stepId}/verify")
    public boolean verifyStep(@PathVariable String lessonId, @PathVariable String stepId) {
        return lessonService.verifyStep(lessonId, stepId);
    }

    @PostMapping("/{lessonId}/steps/{stepId}/runBefore")
    public boolean runBeforeStep(@PathVariable String lessonId, @PathVariable String stepId) {
        return lessonService.runBeforeStep(lessonId, stepId);
    }

    @PostMapping("/{lessonId}/steps/{stepId}/runAfter")
    public boolean runAfterStep(@PathVariable String lessonId, @PathVariable String stepId) {
        return lessonService.runAfterStep(lessonId, stepId);
    }
}
