package com.jira.clone.models.dtos.issue;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import com.jira.clone.models.enums.IssueType;
import com.jira.clone.models.enums.IssuePriority;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class IssueResponse {
    private Long id;
    private Long projectId;  // cần thiết khi tạo sub-task
    private String issueKey; // Vd: TAT-123
    private IssueType type;
    private IssuePriority priority;
    private String summary;
    private String description;
    
    private Long statusId;
    private String statusName;
    
    private Long assigneeId;
    private String assigneeName;
    private String assigneeAvatarUrl;
    
    private Long reporterId;
    private String reporterName;
    private String reporterAvatarUrl;
    
    private String boardPosition; // LexoRank string
    private Integer version; // For optimistic locking
    
    private Long sprintId;
    private String sprintName;
    
    private LocalDateTime createdAt;
    private LocalDateTime dueDate;
    private Integer estimatePoints;

    // Sub-task fields
    private Long parentIssueId;
    private String parentIssueKey;
    private List<SubtaskSummary> subtasks;

    /** DTO tóm tắt subtask (tránh nested vô hạn) */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SubtaskSummary {
        private Long id;
        private Long projectId;
        private String issueKey;
        private String summary;
        private IssueType type;
        private IssuePriority priority;
        private Long statusId;
        private String statusName;
        private Long assigneeId;
        private String assigneeName;
        private String assigneeAvatarUrl;
        private Integer estimatePoints;
    }
}
