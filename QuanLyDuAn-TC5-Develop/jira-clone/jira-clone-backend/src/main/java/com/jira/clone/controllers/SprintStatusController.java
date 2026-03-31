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
import com.jira.clone.repositories.IssueRepository;
import com.jira.clone.models.enums.SprintStatus;
import com.jira.clone.models.enums.StatusCategory;

@RestController
@RequestMapping("/api")
public class SprintStatusController {

    private final SprintRepository sprintRepository;
    private final StatusRepository statusRepository;
    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;

    public SprintStatusController(SprintRepository sprintRepository,
                                   StatusRepository statusRepository,
                                   ProjectRepository projectRepository,
                                   IssueRepository issueRepository) {
        this.sprintRepository = sprintRepository;
        this.statusRepository = statusRepository;
        this.projectRepository = projectRepository;
        this.issueRepository = issueRepository;
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

    @PutMapping("/sprints/{id}")
    public ResponseEntity<SprintResponse> updateSprint(@PathVariable Long id, @Valid @RequestBody SprintUpdateRequest request) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sprint không tồn tại."));
        
        if (request.getName() != null) sprint.setName(request.getName());
        if (request.getStartDate() != null) sprint.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) sprint.setEndDate(request.getEndDate());
        if (request.getStatus() != null) sprint.setStatus(request.getStatus());

        sprint = sprintRepository.save(sprint);
        return ResponseEntity.ok(toSprintResponse(sprint));
    }

    @DeleteMapping("/sprints/{id}")
    public ResponseEntity<Map<String, String>> deleteSprint(@PathVariable Long id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sprint không tồn tại."));
        
        List<Issue> sprintIssues = issueRepository.findBySprintId(id);
        sprintIssues.forEach(issue -> {
            issue.setSprint(null);
            issueRepository.save(issue);
        });
        
        sprintRepository.delete(sprint);
        return ResponseEntity.ok(Map.of("message", "Đã xóa Sprint và chuyển các issue về Backlog."));
    }

    @PostMapping("/sprints/{id}/complete")
    public ResponseEntity<Map<String, String>> completeSprint(@PathVariable Long id, @RequestBody SprintCompleteRequest request) {
        Sprint currentSprint = sprintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sprint không tồn tại."));
        
        currentSprint.setStatus(SprintStatus.closed);
        sprintRepository.save(currentSprint);
        
        Sprint destinationSprint = null;
        if (request.getDestinationSprintId() != null) {
            destinationSprint = sprintRepository.findById(request.getDestinationSprintId())
                    .orElseThrow(() -> new RuntimeException("Sprint đích không tồn tại."));
        }
        
        List<Issue> currentIssues = issueRepository.findBySprintId(id);
        for (Issue issue : currentIssues) {
            if (issue.getStatus() != null && issue.getStatus().getCategory() != StatusCategory.done) {
                issue.setSprint(destinationSprint);
                issueRepository.save(issue);
            }
        }
        
        return ResponseEntity.ok(Map.of("message", "Đã đóng Sprint thành công."));
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
