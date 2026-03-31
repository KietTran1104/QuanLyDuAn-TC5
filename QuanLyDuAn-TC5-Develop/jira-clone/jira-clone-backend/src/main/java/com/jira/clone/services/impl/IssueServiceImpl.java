package com.jira.clone.services.impl;

import com.jira.clone.models.dtos.issue.*;
import com.jira.clone.models.entities.*;
import com.jira.clone.models.enums.IssuePriority;
import com.jira.clone.repositories.*;
import com.jira.clone.services.IssueService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class IssueServiceImpl implements IssueService {

    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;
    private final StatusRepository statusRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    // Counter đơn giản cho issue key (production nên dùng sequence DB)
    public IssueServiceImpl(IssueRepository issueRepository,
                            ProjectRepository projectRepository,
                            StatusRepository statusRepository,
                            UserRepository userRepository,
                            ApplicationEventPublisher eventPublisher) {
        this.issueRepository = issueRepository;
        this.projectRepository = projectRepository;
        this.statusRepository = statusRepository;
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public IssueResponse createIssue(IssueCreateRequest request, Long reporterId) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project không tồn tại."));

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại."));

        // Lấy status: dùng statusId từ request nếu có, không thì lấy cột đầu tiên
        List<Status> statuses = statusRepository.findByProjectIdOrderByBoardPositionAsc(project.getId());
        Status defaultStatus;
        if (request.getStatusId() != null) {
            defaultStatus = statusRepository.findById(request.getStatusId())
                    .orElse(statuses.stream().findFirst()
                            .orElseThrow(() -> new RuntimeException("Project chưa có trạng thái nào.")));
        } else {
            defaultStatus = statuses.stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("Project chưa có trạng thái nào."));
        }

        // Sinh issue key an toàn: dùng MAX thay vì COUNT
        // → tránh trùng key khi issue bị soft-delete
        Long maxNumber = issueRepository.findMaxIssueNumberByProjectId(project.getId());
        long nextNumber = (maxNumber != null ? maxNumber : 0L) + 1;
        String issueKey = project.getKeyPrefix() + "-" + nextNumber;

        // LexoRank: gán vị trí cuối
        String boardPosition = "0|" + String.format("%06d", nextNumber) + ":";

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId()).orElse(null);
        }

        Issue issue = Issue.builder()
                .issueKey(issueKey)
                .project(project)
                .status(defaultStatus)
                .type(request.getType())
                .priority(request.getPriority() != null ? request.getPriority() : IssuePriority.medium)
                .summary(request.getSummary())
                .description(request.getDescription())
                .estimatePoints(request.getEstimatePoints())
                .dueDate(request.getDueDate())
                .reporter(reporter)
                .assignee(assignee)
                .boardPosition(boardPosition)
                .build();
        issue = issueRepository.save(issue);

        return toResponse(issue);
    }

    @Override
    public IssueResponse getIssueById(Long issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue không tồn tại."));
        return toResponse(issue);
    }

    @Override
    public List<IssueResponse> getIssuesByProject(Long projectId) {
        return issueRepository.findByProjectIdOrderByBoardPositionAsc(projectId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<IssueResponse> getIssuesByBoardColumn(Long projectId, Long statusId) {
        return issueRepository
                .findByProjectIdAndStatusIdOrderByBoardPositionAsc(projectId, statusId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Kéo thả Issue trên Board Kanban.
     * Sử dụng Optimistic Locking (@Version) để chống ghi đè khi 2 user kéo thả cùng lúc.
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public IssueResponse moveIssue(Long issueId, IssueMoveRequest request) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue không tồn tại."));

        // Optimistic Locking check - chỉ kiểm tra nếu frontend gửi version
        // Hibernate @Version tự xử lý concurrent conflict ở tầng DB
        if (request.getVersion() != null && !issue.getVersion().equals(request.getVersion())) {
            throw new RuntimeException(
                "Xung đột dữ liệu! Issue đã bị chỉnh sửa bởi người khác. Vui lòng tải lại.");
        }

        Status newStatus = statusRepository.findById(request.getNewStatusId())
                .orElseThrow(() -> new RuntimeException("Status không tồn tại."));

        issue.setStatus(newStatus);
        issue.setBoardPosition(request.getNewBoardPosition());
        issue = issueRepository.save(issue); // @Version tự tăng

        return toResponse(issue);
    }

    @Override
    @Transactional
    public IssueResponse updateIssue(Long issueId, IssueUpdateRequest request) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue không tồn tại."));

        if (request.getSummary() != null) {
            issue.setSummary(request.getSummary());
        }
        if (request.getDescription() != null) {
            issue.setDescription(request.getDescription());
        }
        if (request.getType() != null) {
            issue.setType(request.getType());
        }
        if (request.getPriority() != null) {
            issue.setPriority(request.getPriority());
        }
        if (request.getStatusId() != null) {
            Status newStatus = statusRepository.findById(request.getStatusId())
                    .orElseThrow(() -> new RuntimeException("Status không tồn tại."));
            issue.setStatus(newStatus);
        }
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId()).orElse(null);
            issue.setAssignee(assignee);
        }
        if (request.getDueDate() != null) {
            issue.setDueDate(request.getDueDate());
        }
        if (request.getEstimatePoints() != null) {
            issue.setEstimatePoints(request.getEstimatePoints());
        }
        if (request.getParentIssueId() != null) {
            Issue parent = issueRepository.findById(request.getParentIssueId())
                    .orElseThrow(() -> new RuntimeException("Parent issue không tồn tại."));
            issue.setParentIssue(parent);
            // Tự đổi type sang subtask nếu được gán cha
            if (issue.getType() != com.jira.clone.models.enums.IssueType.subtask) {
                issue.setType(com.jira.clone.models.enums.IssueType.subtask);
            }
        }

        issue = issueRepository.save(issue);
        return toResponse(issue);
    }

    @Override
    @Transactional
    public void deleteIssue(Long issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue không tồn tại."));
        issueRepository.delete(issue); // Soft delete qua @SQLDelete
    }

    private IssueResponse toResponse(Issue i) {
        // Map subtasks (chỉ 1 cấp, không đệ quy)
        List<IssueResponse.SubtaskSummary> subtaskSummaries = (i.getSubtasks() != null)
            ? i.getSubtasks().stream()
                .filter(s -> s.getDeletedAt() == null) // chỉ lấy chưa xóa
                .map(s -> IssueResponse.SubtaskSummary.builder()
                    .id(s.getId())
                    .issueKey(s.getIssueKey())
                    .summary(s.getSummary())
                    .type(s.getType())
                    .priority(s.getPriority())
                    .statusId(s.getStatus().getId())
                    .statusName(s.getStatus().getName())
                    .assigneeId(s.getAssignee() != null ? s.getAssignee().getId() : null)
                    .assigneeName(s.getAssignee() != null ? s.getAssignee().getFullName() : null)
                    .assigneeAvatarUrl(s.getAssignee() != null ? s.getAssignee().getAvatarUrl() : null)
                    .estimatePoints(s.getEstimatePoints())
                    .build())
                .collect(java.util.stream.Collectors.toList())
            : new java.util.ArrayList<>();

        return IssueResponse.builder()
                .id(i.getId())
                .projectId(i.getProject().getId())
                .issueKey(i.getIssueKey())
                .type(i.getType())
                .priority(i.getPriority())
                .summary(i.getSummary())
                .description(i.getDescription())
                .statusId(i.getStatus().getId())
                .statusName(i.getStatus().getName())
                .assigneeId(i.getAssignee() != null ? i.getAssignee().getId() : null)
                .assigneeName(i.getAssignee() != null ? i.getAssignee().getFullName() : null)
                .assigneeAvatarUrl(i.getAssignee() != null ? i.getAssignee().getAvatarUrl() : null)
                .reporterId(i.getReporter().getId())
                .reporterName(i.getReporter().getFullName())
                .reporterAvatarUrl(i.getReporter().getAvatarUrl())
                .boardPosition(i.getBoardPosition())
                .version(i.getVersion())
                .sprintId(i.getSprint() != null ? i.getSprint().getId() : null)
                .sprintName(i.getSprint() != null ? i.getSprint().getName() : null)
                .createdAt(i.getCreatedAt())
                .dueDate(i.getDueDate())
                .estimatePoints(i.getEstimatePoints())
                .parentIssueId(i.getParentIssue() != null ? i.getParentIssue().getId() : null)
                .parentIssueKey(i.getParentIssue() != null ? i.getParentIssue().getIssueKey() : null)
                .subtasks(subtaskSummaries)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<IssueResponse> getSubtasks(Long parentIssueId) {
        return issueRepository.findByParentIssueId(parentIssueId)
                .stream().map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }
}
