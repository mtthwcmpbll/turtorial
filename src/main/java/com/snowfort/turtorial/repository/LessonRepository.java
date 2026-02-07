package com.snowfort.turtorial.repository;

import com.snowfort.turtorial.model.Lesson;
import java.util.List;

public interface LessonRepository {
    List<Lesson> findAll();
    Lesson findById(String id);
}
