# Agentic Workflow Instructions

This document outlines the standard operating procedures for building features and contributing to the Turtorial codebase.

## 1. Test-Driven Development (TDD)

**Always write failing tests first.**

*   **Backend (Java/Spring Boot):**
    *   Use JUnit 5 for unit and integration tests.
    *   Ensure new services and components are tested in isolation where possible.
    *   Run tests via `./mvnw test`.

*   **Frontend (React/TypeScript):**
    *   Use Vitest for unit testing logic and components.
    *   Use Playwright for end-to-end and component testing.
    *   Ensure new components have accompanying tests.
    *   Run tests via `npm run test` (Vitest) or `npm run e2e` (Playwright).

## 2. Frontend Component Architecture

**Keep components independent, decoupled, and testable.**

*   **Storybook:** Develop and test UI components in isolation using Storybook (`npm run storybook`).
*   **Decoupling:** Avoid tight coupling between components. Use props and composition to maximize reusability.
*   **State Management:** Keep state local where possible, or lift it up responsibly. Avoid global state pollution.

## 3. Feature Independence & Decoupling

*   **Modularity:** Design features to be modular and self-contained.
*   **Separation of Concerns:** Clearly separate business logic from presentation and data access.
*   **Interfaces:** Use interfaces to define contracts between modules, facilitating easier testing and refactoring.

## 4. Documentation & Lesson Updates

**When adding a new feature, you MUST document it for users.**

*   **Target Audience:** Lesson authors (users writing tutorials).
*   **Location:** The default lesson included on the classpath (`src/main/resources/lessons/introduction`).
*   **Requirement:**
    *   Add a new step or section to the default lesson explaining how the feature works and how to use it.
    *   Provide clear examples and code snippets.
    *   Ensure the documentation is visible immediately when a user starts the application.
*   **Why:** This ensures that new capabilities are immediately discoverable and usable by the community.

## 5. Source of Truth

This `AGENTS.md` file is the single source of truth for agent instructions. It is symlinked to various agent-specific configuration files (e.g., `CLAUDE.md`, `GEMINI.md`, `.cursorrules`, etc.) to ensure consistency across different AI assistants.
