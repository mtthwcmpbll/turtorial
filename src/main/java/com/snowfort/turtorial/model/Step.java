package com.snowfort.turtorial.model;

public class Step {
    private String id;
    private String title;
    private String content;
    private String testCommand;
    private String beforeCommand;
    private String afterCommand;
    private Integer order;
    private String section;
    private java.util.List<QuizQuestion> quizzes;

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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getTestCommand() {
        return testCommand;
    }

    public void setTestCommand(String testCommand) {
        this.testCommand = testCommand;
    }

    public String getBeforeCommand() {
        return beforeCommand;
    }

    public void setBeforeCommand(String beforeCommand) {
        this.beforeCommand = beforeCommand;
    }

    public String getAfterCommand() {
        return afterCommand;
    }

    public void setAfterCommand(String afterCommand) {
        this.afterCommand = afterCommand;
    }

    public Integer getOrder() {
        return order;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public java.util.List<QuizQuestion> getQuizzes() {
        return quizzes;
    }

    public void setQuizzes(java.util.List<QuizQuestion> quizzes) {
        this.quizzes = quizzes;
    }
}
