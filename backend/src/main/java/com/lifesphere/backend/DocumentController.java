package com.lifesphere.backend;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

        private final DocumentRepository documentRepository;
        private final UserRepository userRepository;
        private final AiService aiService;

        private final Path uploadDirectory = Paths.get("uploads")
                        .toAbsolutePath()
                        .normalize();

        public DocumentController(
                        DocumentRepository documentRepository,
                        UserRepository userRepository,
                        AiService aiService) {

                this.documentRepository = documentRepository;
                this.userRepository = userRepository;
                this.aiService = aiService;

                try {
                        Files.createDirectories(uploadDirectory);
                } catch (IOException e) {
                        throw new RuntimeException(
                                        "Could not create upload directory.",
                                        e);
                }
        }

        // =====================================================
        // UPLOAD DOCUMENT
        // =====================================================

        @PostMapping("/upload")
        public ResponseEntity<?> uploadDocument(
                        @RequestParam("file") MultipartFile file,
                        Authentication authentication) {

                try {

                        if (file == null || file.isEmpty()) {
                                return ResponseEntity
                                                .badRequest()
                                                .body("Please select a file.");
                        }

                        String originalFileName = file.getOriginalFilename();

                        if (originalFileName == null ||
                                        originalFileName.isBlank()) {

                                return ResponseEntity
                                                .badRequest()
                                                .body("Invalid file name.");
                        }

                        String fileExtension = getFileExtension(originalFileName);

                        if (!isAllowedFileType(fileExtension)) {

                                return ResponseEntity
                                                .status(HttpStatus.BAD_REQUEST)
                                                .body(
                                                                "File type not supported. " +
                                                                                "Allowed: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG.");
                        }

                        String email = authentication.getName();

                        User user = userRepository
                                        .findByEmail(email)
                                        .orElse(null);

                        if (user == null) {
                                return ResponseEntity
                                                .status(HttpStatus.UNAUTHORIZED)
                                                .body("User not found.");
                        }

                        // -------------------------------------------------
                        // Create safe stored file name
                        // -------------------------------------------------

                        String storedFileName = UUID.randomUUID()
                                        + "_"
                                        + sanitizeFileName(
                                                        originalFileName);

                        Path targetPath = uploadDirectory.resolve(
                                        storedFileName);

                        // -------------------------------------------------
                        // Save physical file
                        // -------------------------------------------------

                        Files.copy(
                                        file.getInputStream(),
                                        targetPath,
                                        StandardCopyOption.REPLACE_EXISTING);

                        // -------------------------------------------------
                        // Save database record
                        // -------------------------------------------------

                        String contentType = file.getContentType() != null
                                        ? file.getContentType()
                                        : "application/octet-stream";

                        Document document = new Document(
                                        originalFileName,
                                        contentType,
                                        file.getSize(),
                                        targetPath.toString(),
                                        LocalDateTime.now(),
                                        user);

                        Document savedDocument = documentRepository.save(document);

                        // -------------------------------------------------
                        // Send supported files to RAG
                        // -------------------------------------------------

                        if (isRagSupportedFileType(fileExtension)) {

                                try {

                                        Map<?, ?> ragResult = aiService.ingestDocument(
                                                        targetPath,
                                                        originalFileName,
                                                        savedDocument.getId(),
                                                        contentType);

                                        System.out.println(
                                                        "RAG ingestion successful: "
                                                                        + ragResult);

                                } catch (Exception ragException) {

                                        /*
                                         * The document is already safely stored
                                         * in the Documents module.
                                         *
                                         * If RAG ingestion fails, we do NOT delete
                                         * the user's document.
                                         */

                                        System.err.println(
                                                        "RAG ingestion failed for "
                                                                        + originalFileName);

                                        ragException.printStackTrace();
                                }
                        }

                        // -------------------------------------------------
                        // Return document information
                        // -------------------------------------------------

                        return ResponseEntity
                                        .status(HttpStatus.CREATED)
                                        .body(
                                                        new DocumentResponse(
                                                                        savedDocument.getId(),
                                                                        savedDocument.getFileName(),
                                                                        savedDocument.getFileType(),
                                                                        savedDocument.getFileSize(),
                                                                        savedDocument.getUploadedAt()));

                } catch (IOException e) {

                        return ResponseEntity
                                        .status(
                                                        HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body("Could not upload file.");
                }
        }

        // =====================================================
        // GET USER DOCUMENTS
        // =====================================================

        @GetMapping
        public ResponseEntity<?> getDocuments(
                        Authentication authentication) {

                String email = authentication.getName();

                User user = userRepository
                                .findByEmail(email)
                                .orElse(null);

                if (user == null) {
                        return ResponseEntity
                                        .status(HttpStatus.UNAUTHORIZED)
                                        .body("User not found.");
                }

                List<Document> documents = documentRepository.findByUserId(
                                user.getId());

                List<DocumentResponse> response = documents.stream()
                                .map(document -> new DocumentResponse(
                                                document.getId(),
                                                document.getFileName(),
                                                document.getFileType(),
                                                document.getFileSize(),
                                                document.getUploadedAt()))
                                .toList();

                return ResponseEntity.ok(response);
        }

        // =====================================================
        // DOWNLOAD DOCUMENT
        // =====================================================

        @GetMapping("/{id}/download")
        public ResponseEntity<?> downloadDocument(
                        @PathVariable Long id,
                        Authentication authentication) {

                try {

                        String email = authentication.getName();

                        User user = userRepository
                                        .findByEmail(email)
                                        .orElse(null);

                        if (user == null) {
                                return ResponseEntity
                                                .status(HttpStatus.UNAUTHORIZED)
                                                .body("User not found.");
                        }

                        Document document = documentRepository
                                        .findById(id)
                                        .orElse(null);

                        if (document == null) {
                                return ResponseEntity
                                                .status(HttpStatus.NOT_FOUND)
                                                .body("Document not found.");
                        }

                        // Security check
                        if (!document.getUser().getId()
                                        .equals(user.getId())) {

                                return ResponseEntity
                                                .status(HttpStatus.FORBIDDEN)
                                                .body(
                                                                "You do not have permission " +
                                                                                "to access this document.");
                        }

                        Path filePath = Paths.get(
                                        document.getFilePath())
                                        .toAbsolutePath()
                                        .normalize();

                        // Security check
                        if (!filePath.startsWith(
                                        uploadDirectory)) {

                                return ResponseEntity
                                                .status(HttpStatus.FORBIDDEN)
                                                .body("Invalid file path.");
                        }

                        if (!Files.exists(filePath) ||
                                        !Files.isRegularFile(filePath)) {

                                return ResponseEntity
                                                .status(HttpStatus.NOT_FOUND)
                                                .body("File not found on server.");
                        }

                        Resource resource = new UrlResource(
                                        filePath.toUri());

                        String contentType = document.getFileType();

                        if (contentType == null ||
                                        contentType.isBlank()) {

                                contentType = Files.probeContentType(
                                                filePath);
                        }

                        if (contentType == null) {
                                contentType = "application/octet-stream";
                        }

                        return ResponseEntity
                                        .ok()
                                        .contentType(
                                                        MediaType.parseMediaType(
                                                                        contentType))
                                        .header(
                                                        HttpHeaders.CONTENT_DISPOSITION,
                                                        ContentDisposition
                                                                        .attachment()
                                                                        .filename(
                                                                                        document.getFileName())
                                                                        .build()
                                                                        .toString())
                                        .contentLength(
                                                        Files.size(filePath))
                                        .body(resource);

                } catch (IOException e) {

                        return ResponseEntity
                                        .status(
                                                        HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(
                                                        "Could not download document.");
                }
        }

        // =====================================================
        // DELETE DOCUMENT
        // =====================================================

        @DeleteMapping("/{id}")
        public ResponseEntity<?> deleteDocument(
                        @PathVariable Long id,
                        Authentication authentication) {

                try {

                        String email = authentication.getName();

                        User user = userRepository
                                        .findByEmail(email)
                                        .orElse(null);

                        if (user == null) {
                                return ResponseEntity
                                                .status(HttpStatus.UNAUTHORIZED)
                                                .body("User not found.");
                        }

                        Document document = documentRepository
                                        .findById(id)
                                        .orElse(null);

                        if (document == null) {
                                return ResponseEntity
                                                .status(HttpStatus.NOT_FOUND)
                                                .body("Document not found.");
                        }

                        // Security check
                        if (!document.getUser().getId()
                                        .equals(user.getId())) {

                                return ResponseEntity
                                                .status(HttpStatus.FORBIDDEN)
                                                .body(
                                                                "You do not have permission " +
                                                                                "to delete this document.");
                        }

                        Path filePath = Paths.get(
                                        document.getFilePath())
                                        .toAbsolutePath()
                                        .normalize();

                        // Security check
                        if (!filePath.startsWith(
                                        uploadDirectory)) {

                                return ResponseEntity
                                                .status(HttpStatus.FORBIDDEN)
                                                .body("Invalid file path.");
                        }

                        // Delete physical file
                        Files.deleteIfExists(filePath);

                        // Delete database record
                        documentRepository.delete(document);

                        // Delete RAG chunks
                        try {

                                Map<?, ?> ragResult = aiService.deleteDocumentFromRag(
                                                document.getId());

                                System.out.println(
                                                "RAG deletion successful: "
                                                                + ragResult);

                        } catch (Exception ragException) {

                                System.err.println(
                                                "RAG deletion failed for document ID: "
                                                                + document.getId());

                                ragException.printStackTrace();
                        }

                        return ResponseEntity.ok(
                                        "Document deleted successfully.");

                } catch (IOException e) {

                        return ResponseEntity
                                        .status(
                                                        HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(
                                                        "Could not delete document.");
                }
        }

        // =====================================================
        // FILE EXTENSION
        // =====================================================

        private String getFileExtension(
                        String fileName) {

                int lastDot = fileName.lastIndexOf(".");

                if (lastDot == -1) {
                        return "";
                }

                return fileName
                                .substring(lastDot + 1)
                                .toLowerCase();
        }

        // =====================================================
        // ALLOWED FILE TYPES
        // =====================================================

        private boolean isAllowedFileType(
                        String extension) {

                return extension.equals("pdf")
                                || extension.equals("doc")
                                || extension.equals("docx")
                                || extension.equals("txt")
                                || extension.equals("png")
                                || extension.equals("jpg")
                                || extension.equals("jpeg");
        }

        // =====================================================
        // RAG SUPPORTED FILE TYPES
        // =====================================================

        private boolean isRagSupportedFileType(
                        String extension) {

                return extension.equals("pdf")
                                || extension.equals("docx")
                                || extension.equals("txt");
        }

        // =====================================================
        // SANITIZE FILE NAME
        // =====================================================

        private String sanitizeFileName(
                        String fileName) {

                return fileName.replaceAll(
                                "[^a-zA-Z0-9._-]",
                                "_");
        }

        // =====================================================
        // RESPONSE DTO
        // =====================================================

        static class DocumentResponse {

                private Long id;
                private String fileName;
                private String fileType;
                private Long fileSize;
                private LocalDateTime uploadedAt;

                public DocumentResponse(
                                Long id,
                                String fileName,
                                String fileType,
                                Long fileSize,
                                LocalDateTime uploadedAt) {

                        this.id = id;
                        this.fileName = fileName;
                        this.fileType = fileType;
                        this.fileSize = fileSize;
                        this.uploadedAt = uploadedAt;
                }

                public Long getId() {
                        return id;
                }

                public String getFileName() {
                        return fileName;
                }

                public String getFileType() {
                        return fileType;
                }

                public Long getFileSize() {
                        return fileSize;
                }

                public LocalDateTime getUploadedAt() {
                        return uploadedAt;
                }
        }
}