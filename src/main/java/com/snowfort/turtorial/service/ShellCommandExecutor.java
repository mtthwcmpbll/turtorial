package com.snowfort.turtorial.service;

import org.springframework.stereotype.Service;

@Service
public class ShellCommandExecutor implements CommandExecutor {
    @Override
    public boolean execute(String command) {
        try {
            Process process = new ProcessBuilder("/bin/sh", "-c", command)
                    .redirectOutput(ProcessBuilder.Redirect.DISCARD)
                    .redirectError(ProcessBuilder.Redirect.DISCARD)
                    .start();
            int exitCode = process.waitFor();
            return exitCode == 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
