package com.jira.clone.repositories;

import com.jira.clone.models.entities.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {
    Optional<Issue> findByIssueKey(String issueKey);
    List<Issue> findByProjectId(Long projectId);
    List<Issue> findByProjectIdOrderByBoardPositionAsc(Long projectId);
    List<Issue> findByAssigneeId(Long assigneeId);
    List<Issue> findBySprintId(Long sprintId);
    
    // Lấy danh sách Issue cho 1 Cột trong Board và Sắp xếp hoàn hảo bằng thẻ LexoRank
    List<Issue> findByProjectIdAndStatusIdOrderByBoardPositionAsc(Long projectId, Long statusId);

    // Lấy subtasks của một issue cha
    List<Issue> findByParentIssueId(Long parentIssueId);

    /**
     * Lấy số lớn nhất đã dùng trong issueKey của project (bao gồm cả đã xóa).
     * Dùng native query để bỏ qua @SQLRestriction (deleted_at IS NULL).
     * Trả về null nếu chưa có issue nào.
     */
    @org.springframework.data.jpa.repository.Query(
        value = "SELECT MAX(CAST(SUBSTRING_INDEX(issue_key, '-', -1) AS UNSIGNED)) FROM issues WHERE project_id = :projectId",
        nativeQuery = true
    )
    Long findMaxIssueNumberByProjectId(@org.springframework.data.repository.query.Param("projectId") Long projectId);
}
