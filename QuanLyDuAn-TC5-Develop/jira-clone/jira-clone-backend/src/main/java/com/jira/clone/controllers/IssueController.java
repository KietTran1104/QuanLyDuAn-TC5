package com.jira.clone.controllers;

import com.jira.clone.models.dtos.issue.*;
import com.jira.clone.services.IssueService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @PostMapping
    public ResponseEntity<IssueResponse> createIssue(
            @Valid @RequestBody IssueCreateRequest request,
            Authentication auth) {
        Long reporterId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(issueService.createIssue(request, reporterId));
    }

    @GetMapping("/{issueId}")
    public ResponseEntity<IssueResponse> getIssue(@PathVariable Long issueId) {
        return ResponseEntity.ok(issueService.getIssueById(issueId));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<IssueResponse>> getIssuesByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(issueService.getIssuesByProject(projectId));
    }

    @GetMapping("/board/{projectId}/{statusId}")
    public ResponseEntity<List<IssueResponse>> getBoardColumn(
            @PathVariable Long projectId, @PathVariable Long statusId) {
        return ResponseEntity.ok(issueService.getIssuesByBoardColumn(projectId, statusId));
    }

    /** Kéo thả Issue trên Board Kanban (LexoRank + Optimistic Locking) */
    @PutMapping("/{issueId}/move")
    public ResponseEntity<IssueResponse> moveIssue(
            @PathVariable Long issueId,
            @Valid @RequestBody IssueMoveRequest request) {
        return ResponseEntity.ok(issueService.moveIssue(issueId, request));
    }

    @PutMapping("/{issueId}")
    public ResponseEntity<IssueResponse> updateIssue(
            @PathVariable Long issueId,
            @Valid @RequestBody IssueUpdateRequest request) {
        return ResponseEntity.ok(issueService.updateIssue(issueId, request));
    }

    @GetMapping("/{issueId}/subtasks")
    public ResponseEntity<List<IssueResponse>> getSubtasks(@PathVariable Long issueId) {
        return ResponseEntity.ok(issueService.getSubtasks(issueId));
    }

    @DeleteMapping("/{issueId}")
    public ResponseEntity<?> deleteIssue(@PathVariable Long issueId) {
        issueService.deleteIssue(issueId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa issue."));
    }
}
