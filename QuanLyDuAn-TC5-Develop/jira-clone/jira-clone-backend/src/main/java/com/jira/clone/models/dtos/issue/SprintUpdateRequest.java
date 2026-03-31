package com.jira.clone.models.dtos.issue;

import com.jira.clone.models.enums.SprintStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SprintUpdateRequest {
    @NotBlank(message = "Sprint name is required")
    private String name;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private SprintStatus status;
}
