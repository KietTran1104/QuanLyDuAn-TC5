package com.jira.clone.repositories;

import com.jira.clone.models.entities.IssueLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueLinkRepository extends JpaRepository<IssueLink, Long> {
    List<IssueLink> findBySourceIssueId(Long sourceIssueId);
    List<IssueLink> findByTargetIssueId(Long targetIssueId);
}
