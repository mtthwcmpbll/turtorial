package com.snowfort.turtorial.model;

public class Lesson {
    private String id;
    private String title;
    private String description;
    private String content;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    private boolean draft;

    public boolean isDraft() {
        return draft;
    }

    public void setDraft(boolean draft) {
        this.draft = draft;
    }

    private java.util.List<Step> steps;

    public java.util.List<Step> getSteps() {
        return steps;
    }

    public void setSteps(java.util.List<Step> steps) {
        this.steps = steps;
    }
}
