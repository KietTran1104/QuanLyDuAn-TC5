package com.jira.clone.controllers;

import com.jira.clone.models.dtos.issue.*;
import com.jira.clone.repositories.SprintRepository;
import com.jira.clone.repositories.StatusRepository;
import com.jira.clone.models.entities.*;
import com.jira.clone.repositories.ProjectRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class SprintStatusController {

    private final SprintRepository sprintRepository;
    private final StatusRepository statusRepository;
    private final ProjectRepository projectRepository;

    public SprintStatusController(SprintRepository sprintRepository,
                                   StatusRepository statusRepository,
                                   ProjectRepository projectRepository) {
        this.sprintRepository = sprintRepository;
        this.statusRepository = statusRepository;
        this.projectRepository = projectRepository;
    }

    // ═══════ SPRINT ENDPOINTS ═══════

    @PostMapping("/sprints")
    public ResponseEntity<SprintResponse> createSprint(@Valid @RequestBody SprintCreateRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project không tồn tại."));
        Sprint sprint = Sprint.builder()
                .project(project).name(request.getName())
                .startDate(request.getStartDate()).endDate(request.getEndDate())
                .build();
        sprint = sprintRepository.save(sprint);
        return ResponseEntity.ok(toSprintResponse(sprint));
    }

    @GetMapping("/sprints/project/{projectId}")
    public ResponseEntity<List<SprintResponse>> getSprintsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(sprintRepository.findByProjectId(projectId)
                .stream().map(this::toSprintResponse).collect(Collectors.toList()));
    }

    // ═══════ STATUS ENDPOINTS ═══════

    @PostMapping("/statuses")
    public ResponseEntity<StatusResponse> createStatus(@Valid @RequestBody StatusCreateRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project không tồn tại."));
        Status status = Status.builder()
                .project(project).name(request.getName())
                .category(request.getCategory())
                .boardPosition(request.getBoardPosition() != null ? request.getBoardPosition() : 0)
                .build();
        status = statusRepository.save(status);
        return ResponseEntity.ok(toStatusResponse(status));
    }

    @GetMapping("/statuses/project/{projectId}")
    public ResponseEntity<List<StatusResponse>> getStatusesByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(statusRepository.findByProjectIdOrderByBoardPositionAsc(projectId)
                .stream().map(this::toStatusResponse).collect(Collectors.toList()));
    }

    private SprintResponse toSprintResponse(Sprint s) {
        return SprintResponse.builder()
                .id(s.getId()).name(s.getName())
                .startDate(s.getStartDate()).endDate(s.getEndDate())
                .status(s.getStatus()).build();
    }

    private StatusResponse toStatusResponse(Status s) {
        return StatusResponse.builder()
                .id(s.getId()).name(s.getName())
                .category(s.getCategory()).boardPosition(s.getBoardPosition())
                .build();
    }
}
