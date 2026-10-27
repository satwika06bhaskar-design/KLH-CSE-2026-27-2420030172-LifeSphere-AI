package com.lifesphere.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(
            @RequestBody ChatRequest request,
            Authentication authentication) {

        if (request.getMessage() == null ||
                request.getMessage().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Please enter a message."));
        }

        try {

            String aiResponse = aiService.generateResponse(
                    request.getMessage().trim());

            return ResponseEntity.ok(
                    Map.of(
                            "response", aiResponse,
                            "user", authentication.getName()));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(Map.of(
                            "message",
                            "AI Service connection failed.",
                            "error",
                            e.getMessage() == null
                                    ? "Unknown error"
                                    : e.getMessage()));
        }
    }

    static class ChatRequest {

        private String message;

        public ChatRequest() {
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}