package com.jira.clone.services;

import com.jira.clone.models.dtos.issue.*;
import java.util.List;

public interface IssueService {
    IssueResponse createIssue(IssueCreateRequest request, Long reporterId);
    IssueResponse getIssueById(Long issueId);
    List<IssueResponse> getIssuesByProject(Long projectId);
    List<IssueResponse> getIssuesByBoardColumn(Long projectId, Long statusId);
    IssueResponse moveIssue(Long issueId, IssueMoveRequest request);
    IssueResponse updateIssue(Long issueId, IssueUpdateRequest request);
    void deleteIssue(Long issueId);
}
