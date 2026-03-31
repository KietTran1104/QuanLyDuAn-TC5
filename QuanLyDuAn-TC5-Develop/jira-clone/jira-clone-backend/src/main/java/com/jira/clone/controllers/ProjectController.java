package com.jira.clone.controllers;

import com.jira.clone.models.dtos.project.*;
import com.jira.clone.services.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody ProjectCreateRequest request,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(projectService.createProject(request, userId));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getProjectById(projectId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ProjectResponse>> getMyProjects(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(projectService.getProjectsByUserId(userId));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<?> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa project thành công."));
    }

    @PostMapping("/{projectId}/members")
    public ResponseEntity<ProjectMemberResponse> addMember(
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectMemberRequest request) {
        return ResponseEntity.ok(projectService.addMember(projectId, request));
    }

    @GetMapping("/{projectId}/members")
    public ResponseEntity<List<ProjectMemberResponse>> getMembers(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getMembers(projectId));
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable Long projectId, @PathVariable Long userId) {
        projectService.removeMember(projectId, userId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa thành viên."));
    }

    /** Lấy vai trò của bản thân trong dự án */
    @GetMapping("/{projectId}/my-role")
    public ResponseEntity<Map<String, String>> getMyRole(
            @PathVariable Long projectId,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        String role = projectService.getMyRoleInProject(projectId, userId);
        return ResponseEntity.ok(Map.of("role", role));
    }

    /** Cập nhật vai trò cho một thành viên */
    @PutMapping("/{projectId}/members/{userId}/role")
    public ResponseEntity<ProjectMemberResponse> updateMemberRole(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            @RequestBody Map<String, Long> body) {
        Long roleId = body.get("roleId");
        return ResponseEntity.ok(projectService.updateMemberRole(projectId, userId, roleId));
    }
}
