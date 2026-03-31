package com.jira.clone.models.dtos.issue;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IssueMoveRequest {

    // When moving task to a new column on Kanban board
    @NotNull(message = "Target status ID is required")
    private Long newStatusId;

    // LexoRank position calculated by frontend based on where task is dropped
    @NotBlank(message = "New board position is required")
    private String newBoardPosition;

    // Optional: version for optimistic locking. Nếu null thì bỏ qua check thủ công,
    // Hibernate @Version vẫn xử lý concurrent conflict ở tầng DB.
    private Integer version;
}
