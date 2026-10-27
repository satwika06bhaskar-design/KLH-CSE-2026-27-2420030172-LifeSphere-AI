package com.lifesphere.backend;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.nio.file.Path;
import java.util.Map;

@Service
public class AiService {

    private final RestClient restClient;

    public AiService() {
        this.restClient = RestClient.builder()
                .baseUrl("http://localhost:5000")
                .build();
    }

    // =====================================================
    // CHAT
    // =====================================================

    public String generateResponse(String message) {

        Map<String, String> requestBody = Map.of("message", message);

        Map<?, ?> result = restClient.post()
                .uri("/generate")
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        if (result == null) {
            throw new RuntimeException(
                    "AI Service returned no response.");
        }

        Object response = result.get("response");

        if (response == null) {
            throw new RuntimeException(
                    "AI Service response field is missing.");
        }

        return response.toString();
    }

    // =====================================================
    // DOCUMENT INGESTION
    // =====================================================

    public Map<?, ?> ingestDocument(
            Path filePath,
            String fileName,
            Long documentId,
            String contentType) {

        FileSystemResource fileResource = new FileSystemResource(filePath.toFile());

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        body.add("file", fileResource);
        body.add("fileName", fileName);
        body.add("documentId", documentId.toString());
        body.add(
                "contentType",
                contentType != null
                        ? contentType
                        : "application/octet-stream");

        Map<?, ?> result = restClient.post()
                .uri("/ingest")
                .contentType(
                        MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(Map.class);

        if (result == null) {
            throw new RuntimeException(
                    "AI Service returned no ingestion response.");
        }

        return result;
    }

    // =====================================================
    // DELETE DOCUMENT FROM RAG
    // =====================================================

    public Map<?, ?> deleteDocumentFromRag(
            Long documentId) {

        Map<?, ?> result = restClient.delete()
                .uri(uriBuilder -> uriBuilder
                        .path("/documents/{id}")
                        .build(documentId))
                .retrieve()
                .body(Map.class);

        if (result == null) {
            throw new RuntimeException(
                    "AI Service returned no deletion response.");
        }

        return result;
    }
}