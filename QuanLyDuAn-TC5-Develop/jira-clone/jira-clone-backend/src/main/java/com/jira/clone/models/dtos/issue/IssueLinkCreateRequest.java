package com.jira.clone.models.dtos.issue;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import com.jira.clone.models.enums.IssueLinkType;

@Data
public class IssueLinkCreateRequest {
    @NotNull(message = "Source Issue ID is required")
    private Long sourceIssueId;

    @NotNull(message = "Target Issue ID is required")
    private Long targetIssueId;

    @NotNull(message = "Link Type is required")
    private IssueLinkType linkType;
}
