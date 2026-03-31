package com.jira.clone.models.dtos.issue;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import com.jira.clone.models.enums.IssueType;
import com.jira.clone.models.enums.IssuePriority;

@Data
public class IssueCreateRequest {
    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Type is required")
    private IssueType type;

    private IssuePriority priority;

    @NotBlank(message = "Summary is required")
    private String summary;

    private String description;
    
    private Long assigneeId;
    private Long sprintId;
    private Long parentIssueId;
}
