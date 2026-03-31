package com.jira.clone.controllers;

import com.jira.clone.models.dtos.audit.*;
import com.jira.clone.models.dtos.collaboration.NotificationResponse;
import com.jira.clone.models.entities.*;
import com.jira.clone.repositories.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class AuditController {

    private final NotificationRepository notificationRepository;
    private final UserStarRepository userStarRepository;
    private final UserViewHistoryRepository userViewHistoryRepository;
    private final IssueActivityLogRepository issueActivityLogRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;

    public AuditController(NotificationRepository notificationRepository,
                            UserStarRepository userStarRepository,
                            UserViewHistoryRepository userViewHistoryRepository,
                            IssueActivityLogRepository issueActivityLogRepository,
                            UserRepository userRepository,
                            ProjectRepository projectRepository,
                            IssueRepository issueRepository) {
        this.notificationRepository = notificationRepository;
        this.userStarRepository = userStarRepository;
        this.userViewHistoryRepository = userViewHistoryRepository;
        this.issueActivityLogRepository = issueActivityLogRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.issueRepository = issueRepository;
    }

    // ═══════ NOTIFICATION ═══════

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationResponse>> getNotifications(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream().map(n -> NotificationResponse.builder()
                        .id(n.getId())
                        .actorId(n.getActor().getId()).actorName(n.getActor().getFullName())
                        .actorAvatarUrl(n.getActor().getAvatarUrl())
                        .issueId(n.getIssue().getId()).issueKey(n.getIssue().getIssueKey())
                        .issueSummary(n.getIssue().getSummary())
                        .type(n.getType()).isRead(n.getIsRead())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList()));
    }

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        long count = notificationRepository.countByRecipientIdAndIsReadFalse(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification không tồn tại."));
        n.setIsRead(true);
        notificationRepository.save(n);
        return ResponseEntity.ok(Map.of("message", "Đã đánh dấu đọc."));
    }

    // ═══════ USER STAR ═══════

    @PostMapping("/stars")
    public ResponseEntity<?> toggleStar(@Valid @RequestBody UserStarRequest request, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        User user = userRepository.findById(userId).orElseThrow();

        UserStar star = UserStar.builder().user(user).build();
        if (request.getProjectId() != null) {
            star.setProject(projectRepository.findById(request.getProjectId()).orElseThrow());
        }
        if (request.getIssueId() != null) {
            star.setIssue(issueRepository.findById(request.getIssueId()).orElseThrow());
        }
        userStarRepository.save(star);
        return ResponseEntity.ok(Map.of("message", "Đã đánh dấu sao."));
    }

    @GetMapping("/stars")
    public ResponseEntity<List<UserStarResponse>> getStars(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(userStarRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(s -> UserStarResponse.builder()
                        .id(s.getId())
                        .projectId(s.getProject() != null ? s.getProject().getId() : null)
                        .projectName(s.getProject() != null ? s.getProject().getName() : null)
                        .issueId(s.getIssue() != null ? s.getIssue().getId() : null)
                        .issueKey(s.getIssue() != null ? s.getIssue().getIssueKey() : null)
                        .issueSummary(s.getIssue() != null ? s.getIssue().getSummary() : null)
                        .createdAt(s.getCreatedAt())
                        .build())
                .collect(Collectors.toList()));
    }

    // ═══════ ACTIVITY LOG ═══════

    @GetMapping("/activity-logs/issue/{issueId}")
    public ResponseEntity<List<IssueActivityLogResponse>> getActivityLogs(@PathVariable Long issueId) {
        return ResponseEntity.ok(issueActivityLogRepository.findByIssueIdOrderByCreatedAtDesc(issueId)
                .stream().map(log -> IssueActivityLogResponse.builder()
                        .id(log.getId())
                        .userId(log.getUser().getId())
                        .userFullName(log.getUser().getFullName())
                        .userAvatarUrl(log.getUser().getAvatarUrl())
                        .actionType(log.getActionType())
                        .payload(log.getPayload())
                        .createdAt(log.getCreatedAt())
                        .build())
                .collect(Collectors.toList()));
    }
}
