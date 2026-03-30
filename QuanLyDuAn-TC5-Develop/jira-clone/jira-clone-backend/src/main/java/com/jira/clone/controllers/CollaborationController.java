package com.jira.clone.controllers;

import com.jira.clone.models.dtos.collaboration.*;
import com.jira.clone.models.entities.*;
import com.jira.clone.repositories.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class CollaborationController {

    private final CommentRepository commentRepository;
    private final LabelRepository labelRepository;
    private final AttachmentRepository attachmentRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public CollaborationController(CommentRepository commentRepository,
                                    LabelRepository labelRepository,
                                    AttachmentRepository attachmentRepository,
                                    IssueRepository issueRepository,
                                    UserRepository userRepository,
                                    ProjectRepository projectRepository) {
        this.commentRepository = commentRepository;
        this.labelRepository = labelRepository;
        this.attachmentRepository = attachmentRepository;
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }

    // ═══════ COMMENT ═══════

    @PostMapping("/comments")
    public ResponseEntity<CommentResponse> createComment(
            @Valid @RequestBody CommentCreateRequest request, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        Issue issue = issueRepository.findById(request.getIssueId())
                .orElseThrow(() -> new RuntimeException("Issue không tồn tại."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại."));

        Comment comment = Comment.builder()
                .issue(issue).user(user).content(request.getContent()).build();
        comment = commentRepository.save(comment);

        return ResponseEntity.ok(CommentResponse.builder()
                .id(comment.getId()).issueId(issue.getId())
                .userId(user.getId()).userFullName(user.getFullName())
                .userAvatarUrl(user.getAvatarUrl())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt()).updatedAt(comment.getUpdatedAt())
                .build());
    }

    @GetMapping("/comments/issue/{issueId}")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long issueId) {
        return ResponseEntity.ok(commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId)
                .stream().map(c -> CommentResponse.builder()
                        .id(c.getId()).issueId(c.getIssue().getId())
                        .userId(c.getUser().getId()).userFullName(c.getUser().getFullName())
                        .userAvatarUrl(c.getUser().getAvatarUrl())
                        .content(c.getContent())
                        .createdAt(c.getCreatedAt()).updatedAt(c.getUpdatedAt())
                        .build())
                .collect(java.util.stream.Collectors.toList()));
    }

    // ═══════ LABEL ═══════

    @PostMapping("/labels")
    public ResponseEntity<LabelResponse> createLabel(@Valid @RequestBody LabelCreateRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project không tồn tại."));
        Label label = Label.builder()
                .project(project).name(request.getName())
                .colorHex(request.getColorHex() != null ? request.getColorHex() : "#0052CC")
                .build();
        label = labelRepository.save(label);
        return ResponseEntity.ok(LabelResponse.builder()
                .id(label.getId()).name(label.getName()).colorHex(label.getColorHex()).build());
    }

    @GetMapping("/labels/project/{projectId}")
    public ResponseEntity<List<LabelResponse>> getLabels(@PathVariable Long projectId) {
        return ResponseEntity.ok(labelRepository.findByProjectId(projectId)
                .stream().map(l -> LabelResponse.builder()
                        .id(l.getId()).name(l.getName()).colorHex(l.getColorHex()).build())
                .collect(Collectors.toList()));
    }

    // ═══════ ATTACHMENT ═══════

    @GetMapping("/attachments/issue/{issueId}")
    public ResponseEntity<List<AttachmentResponse>> getAttachments(@PathVariable Long issueId) {
        return ResponseEntity.ok(attachmentRepository.findByIssueIdOrderByUploadedAtDesc(issueId)
                .stream().map(a -> AttachmentResponse.builder()
                        .id(a.getId()).issueId(a.getIssue().getId())
                        .uploaderId(a.getUploader().getId())
                        .uploaderName(a.getUploader().getFullName())
                        .fileName(a.getFileName()).fileUrl(a.getFileUrl())
                        .fileSize(a.getFileSize()).fileType(a.getFileType())
                        .uploadedAt(a.getUploadedAt())
                        .build())
                .collect(Collectors.toList()));
    }
}
