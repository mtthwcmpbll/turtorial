# Feature: Native Image Build & Secure Local Execution

## Description
As a product manager, I want the application to build as a native binary using Spring Boot's GraalVM support. This will allow the application to run as a completely self-contained binary, providing faster startup times and lower memory footprint.

When running in this native mode, the user should be able to interact with their local environment (e.g., via the terminal). However, for security reasons, any lesson scripts (defined in `before` or `after` steps) must be **disabled by default**. A new application property should be introduced to explicitly enable these scripts if the user desires.

Additionally, the Docker image distribution should be updated to use this native binary for performance optimizations. The CI/CD pipeline (GitHub Actions) must be updated to handle the native build process.

## Technical Requirements
- Enable GraalVM Native Image support in the Maven build.
- Ensure compatibility of third-party libraries (specifically `pty4j` for terminal access) with Native Image.
- Implement a security toggle for script execution:
  - Property: `turtorial.scripts.enabled` (or similar).
  - Default behavior:
    - **Native Mode:** Defaults to `false`.
    - **JVM/Docker Mode:** Defaults to `true` (or preserves existing behavior).
- Update `Dockerfile` to use the native executable.
- Update `.github/workflows/release.yml` to install GraalVM and run the native build.

## Acceptance Criteria

### 1. Native Build Support
- [ ] The application can be built successfully using `./mvnw -Pnative native:compile`.
- [ ] The resulting binary is standalone and does not require a separate JVM to run.

### 2. Native Application Functionality
- [ ] The native binary starts up successfully.
- [ ] **Terminal Interaction:** The integrated terminal works correctly, allowing users to interact with their local shell/environment.
- [ ] Frontend assets are served correctly.

### 3. Security & Configuration
- [ ] **Default Security:** When running the native binary, lesson scripts (`before`, `after`, `testCommand`) do **not** execute by default.
- [ ] **Override:** The user can enable scripts by passing a property flag (e.g., `./turtorial -Dturtorial.scripts.enabled=true` or `--turtorial.scripts.enabled=true`).
- [ ] **Verification:**
    - Verify scripts are skipped in native mode by default.
    - Verify scripts run when explicitly enabled.

### 4. Docker & Distribution
- [ ] The `Dockerfile` is updated to package the native binary.
- [ ] The Docker image size is optimized (compared to the JVM-based image).
- [ ] The Docker container runs successfully.

### 5. CI/CD Integration
- [ ] The `Release` GitHub Action successfully builds the native image.
- [ ] The `Release` action pushes the native-based Docker image to the registry.
