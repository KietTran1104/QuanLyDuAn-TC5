import React, { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import { useToast } from './Toast'

const PRIORITY_MAP = {
  highest: { label: 'Cao nhất', color: '#AE2A19', icon: '⬆⬆' },
  high:    { label: 'Cao',       color: '#E34935', icon: '⬆' },
  medium:  { label: 'Trung bình',color: '#F4AC00', icon: '⬛' },
  low:     { label: 'Thấp',      color: '#0052CC', icon: '⬇' },
  lowest:  { label: 'Thấp nhất', color: '#4C9AFF', icon: '⬇⬇' },
}

const TYPE_MAP = {
  epic:    { label: 'Epic',     color: '#904EE2', icon: '⚡' },
  story:   { label: 'Story',    color: '#1F845A', icon: '📗' },
  task:    { label: 'Task',     color: '#0C66E4', icon: '☑️' },
  bug:     { label: 'Bug',      color: '#E34935', icon: '🐛' },
  subtask: { label: 'Sub-task', color: '#0C66E4', icon: '📎' },
}

const STATUS_CATEGORY_COLOR = { TODO: '#626F86', IN_PROGRESS: '#0C66E4', DONE: '#1F845A' }

export default function IssueDetailDrawer({ issueId, onClose, onIssueUpdated, statuses }) {
  const { addToast } = useToast()
  const [issue, setIssue] = useState(null)
  const [subtasks, setSubtasks] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('comments')

  const [editingSummary, setEditingSummary] = useState(false)
  const [summaryDraft, setSummaryDraft] = useState('')
  const [editingDesc, setEditingDesc] = useState(false)
  const [descDraft, setDescDraft] = useState('')
  const [newComment, setNewComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)

  // Sub-task create
  const [showSubtaskForm, setShowSubtaskForm] = useState(false)
  const [newSubtaskSummary, setNewSubtaskSummary] = useState('')
  const [creatingSubtask, setCreatingSubtask] = useState(false)

  // Sub-task edit
  const [editingSubtaskId, setEditingSubtaskId] = useState(null)
  const [editingSubtaskSummary, setEditingSubtaskSummary] = useState('')

  const subtaskInputRef = useRef(null)
  const subtaskEditRef  = useRef(null)

  useEffect(() => { if (issueId) fetchIssueData() }, [issueId])
  useEffect(() => { if (showSubtaskForm) subtaskInputRef.current?.focus() }, [showSubtaskForm])
  useEffect(() => { if (editingSubtaskId) subtaskEditRef.current?.focus() }, [editingSubtaskId])

  const fetchIssueData = async () => {
    setLoading(true)
    try {
      const [issueRes, commentsRes] = await Promise.all([
        api.getIssue(issueId),
        api.getComments(issueId),
      ])
      setIssue(issueRes.data)
      setSummaryDraft(issueRes.data.summary || '')
      setDescDraft(issueRes.data.description || '')
      setComments(commentsRes.data || [])
      setSubtasks(issueRes.data.subtasks || [])
    } catch {
      addToast('Không thể tải chi tiết công việc', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateField = async (fieldData) => {
    try {
      const res = await api.updateIssue(issueId, fieldData)
      setIssue(res.data)
      if (onIssueUpdated) onIssueUpdated(res.data)
    } catch {
      addToast('Cập nhật thất bại', 'error')
    }
  }

  const handleSaveSummary = () => {
    if (summaryDraft.trim() && summaryDraft !== issue.summary)
      handleUpdateField({ summary: summaryDraft.trim() })
    setEditingSummary(false)
  }

  const handleSaveDescription = () => {
    if (descDraft !== (issue.description || '')) handleUpdateField({ description: descDraft })
    setEditingDesc(false)
  }

  const handleSendComment = async () => {
    if (!newComment.trim()) return
    setSendingComment(true)
    try {
      const res = await api.createComment({ issueId, content: newComment.trim() })
      setComments(prev => [...prev, res.data])
      setNewComment('')
    } catch { addToast('Gửi bình luận thất bại', 'error') }
    finally { setSendingComment(false) }
  }

  // ─── SUB-TASKS: Create ───────────────────────────────────────────────────
  const handleCreateSubtask = async () => {
    const trimmed = newSubtaskSummary.trim()
    if (!trimmed || !issue?.projectId) return
    setCreatingSubtask(true)
    try {
      const res = await api.createIssue({
        projectId: issue.projectId,
        type: 'subtask',
        summary: trimmed,
        statusId: issue.statusId,
      })

      if (res.ok && res.data) {
        // Gán parentIssueId qua updateIssue
        await api.updateIssue(res.data.id, { parentIssueId: Number(issueId) })
        setSubtasks(prev => [...prev, {
          id: res.data.id,
          issueKey: res.data.issueKey,
          summary: trimmed,
          type: 'subtask',
          priority: res.data.priority,
          statusId: res.data.statusId,
          statusName: res.data.statusName,
          assigneeId: res.data.assigneeId,
          assigneeName: res.data.assigneeName,
          assigneeAvatarUrl: res.data.assigneeAvatarUrl,
        }])
        setNewSubtaskSummary('')
        setShowSubtaskForm(false)
        addToast(`Đã tạo sub-task: ${trimmed}`, 'success')
      } else {
        addToast(res.data?.message || 'Tạo sub-task thất bại', 'error')
      }
    } catch { addToast('Lỗi kết nối', 'error') }
    finally { setCreatingSubtask(false) }
  }

  // ─── SUB-TASKS: Update summary ───────────────────────────────────────────
  const handleSaveSubtaskSummary = async (subtaskId) => {
    const trimmed = editingSubtaskSummary.trim()
    if (!trimmed) { setEditingSubtaskId(null); return }
    try {
      const res = await api.updateIssue(subtaskId, { summary: trimmed })
      if (res.ok) {
        setSubtasks(prev => prev.map(s => s.id === subtaskId ? { ...s, summary: trimmed } : s))
      }
    } catch { addToast('Cập nhật sub-task thất bại', 'error') }
    setEditingSubtaskId(null)
  }

  // ─── SUB-TASKS: Update status ────────────────────────────────────────────
  const handleSubtaskStatusChange = async (subtaskId, newStatusId) => {
    try {
      const res = await api.updateIssue(subtaskId, { statusId: Number(newStatusId) })
      if (res.ok) {
        setSubtasks(prev => prev.map(s =>
          s.id === subtaskId
            ? { ...s, statusId: Number(newStatusId), statusName: statuses.find(st => st.id === Number(newStatusId))?.name }
            : s
        ))
      }
    } catch { addToast('Cập nhật trạng thái thất bại', 'error') }
  }

  // ─── SUB-TASKS: Delete ───────────────────────────────────────────────────
  const handleDeleteSubtask = async (subtaskId, subtaskSummary) => {
    if (!window.confirm(`Xóa sub-task "${subtaskSummary}"?`)) return
    try {
      const res = await api.deleteIssue(subtaskId)
      if (res.ok) {
        setSubtasks(prev => prev.filter(s => s.id !== subtaskId))
        addToast('Đã xóa sub-task', 'success')
      }
    } catch { addToast('Xóa thất bại', 'error') }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const timeAgo = (dateStr) => {
    if (!dateStr) return ''
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (diff < 60)    return 'vừa xong'
    if (diff < 3600)  return `${Math.floor(diff / 60)} phút trước`
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
    return `${Math.floor(diff / 86400)} ngày trước`
  }

  if (!issueId) return null

  const typeInfo     = issue ? (TYPE_MAP[issue.type?.toLowerCase()]     || TYPE_MAP.task)   : TYPE_MAP.task
  const priorityInfo = issue ? (PRIORITY_MAP[issue.priority?.toLowerCase()] || PRIORITY_MAP.medium) : PRIORITY_MAP.medium

  // Progress sub-tasks
  const doneStatuses    = (statuses || []).filter(s => s.category === 'DONE').map(s => s.id)
  const subtasksDone    = subtasks.filter(s => doneStatuses.includes(s.statusId)).length
  const subtasksTotal   = subtasks.length
  const subtaskProgress = subtasksTotal > 0 ? Math.round((subtasksDone / subtasksTotal) * 100) : 0

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(9,30,66,0.54)', zIndex: 900 }} />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '760px', maxWidth: '95vw', backgroundColor: '#FFFFFF',
        boxShadow: '-8px 0 32px rgba(9,30,66,0.25)', zIndex: 1000,
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.28s ease-out',
      }}>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#626F86' }}>
            Đang tải chi tiết...
          </div>
        ) : issue ? (
          <>
            {/* HEADER */}
            <div style={{
              padding: '14px 24px', borderBottom: '1px solid #DFE1E6',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'sticky', top: 0, backgroundColor: '#FFFFFF', zIndex: 2,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{typeInfo.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: typeInfo.color }}>{issue.issueKey}</span>
                {issue.parentIssueKey && (
                  <span style={{ fontSize: '12px', color: '#626F86', backgroundColor: '#F1F2F4', padding: '2px 8px', borderRadius: '12px' }}>
                    ↑ {issue.parentIssueKey}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={onClose} title="Đóng" style={iconBtnStyle}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#091E4214'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#42526E" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* BODY */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

              {/* ── LEFT: main content ── */}
              <div style={{ flex: 1, padding: '24px 24px 40px', overflowY: 'auto' }}>

                {/* SUMMARY */}
                {editingSummary ? (
                  <input autoFocus value={summaryDraft}
                    onChange={e => setSummaryDraft(e.target.value)}
                    onBlur={handleSaveSummary}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveSummary(); if (e.key === 'Escape') setEditingSummary(false) }}
                    style={{ width: '100%', fontSize: '20px', fontWeight: '600', color: '#172B4D', border: '2px solid #4C9AFF', borderRadius: '4px', padding: '4px 8px', outline: 'none', marginBottom: '16px', boxSizing: 'border-box' }}
                  />
                ) : (
                  <h2 onClick={() => setEditingSummary(true)}
                    style={{ fontSize: '20px', fontWeight: '600', color: '#172B4D', margin: '0 0 16px', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', border: '2px solid transparent' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#DFE1E6'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}>
                    {issue.summary}
                  </h2>
                )}

                {/* DESCRIPTION */}
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={sectionTitle}>Mô tả</h4>
                  {editingDesc ? (
                    <div>
                      <textarea autoFocus value={descDraft} onChange={e => setDescDraft(e.target.value)} rows={5}
                        style={{ width: '100%', fontSize: '14px', color: '#172B4D', border: '2px solid #4C9AFF', borderRadius: '4px', padding: '8px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6', boxSizing: 'border-box' }} />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button onClick={handleSaveDescription} style={primaryBtn}>Lưu</button>
                        <button onClick={() => { setEditingDesc(false); setDescDraft(issue.description || '') }} style={ghostBtn}>Hủy</button>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => setEditingDesc(true)}
                      style={{ fontSize: '14px', color: issue.description ? '#172B4D' : '#8590A2', lineHeight: '1.6', cursor: 'pointer', padding: '8px', borderRadius: '4px', border: '2px solid transparent', minHeight: '60px', backgroundColor: '#F4F5F7' }}
                      onMouseOver={e => e.currentTarget.style.borderColor = '#DFE1E6'}
                      onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}>
                      {issue.description || 'Nhấn để thêm mô tả...'}
                    </div>
                  )}
                </div>

                {/* ════════════════════════════════════════════════
                    SUB-TASKS SECTION
                ════════════════════════════════════════════════ */}
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h4 style={{ ...sectionTitle, marginBottom: 0 }}>
                      📎 Sub-tasks
                      {subtasksTotal > 0 && (
                        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#626F86', fontWeight: '400' }}>
                          {subtasksDone}/{subtasksTotal} hoàn thành
                        </span>
                      )}
                    </h4>
                    <button
                      onClick={() => setShowSubtaskForm(!showSubtaskForm)}
                      style={{ ...ghostBtn, fontSize: '12px', padding: '3px 10px' }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = '#E4E6EA'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      {showSubtaskForm ? '− Hủy' : '+ Thêm'}
                    </button>
                  </div>

                  {/* Progress bar */}
                  {subtasksTotal > 0 && (
                    <div style={{ height: '4px', backgroundColor: '#DFE1E6', borderRadius: '2px', marginBottom: '10px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${subtaskProgress}%`, height: '100%',
                        backgroundColor: subtaskProgress === 100 ? '#1F845A' : '#0C66E4',
                        borderRadius: '2px', transition: 'width 0.3s ease',
                      }} />
                    </div>
                  )}

                  {/* Sub-task list */}
                  {subtasks.length > 0 && (
                    <div style={{ border: '1px solid #DFE1E6', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px' }}>
                      {subtasks.map((sub, idx) => (
                        <div key={sub.id} style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '8px 12px',
                          borderBottom: idx < subtasks.length - 1 ? '1px solid #EBECF0' : 'none',
                          backgroundColor: 'white',
                          transition: 'background-color 0.15s',
                        }}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = '#FAFBFC'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}>

                          {/* Type icon */}
                          <span style={{ fontSize: '14px', flexShrink: 0 }}>
                            {TYPE_MAP[sub.type?.toLowerCase()]?.icon || '📎'}
                          </span>

                          {/* Key */}
                          <span style={{ fontSize: '11px', color: '#626F86', fontWeight: '600', minWidth: '64px', flexShrink: 0 }}>
                            {sub.issueKey}
                          </span>

                          {/* Summary (editable) */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {editingSubtaskId === sub.id ? (
                              <input
                                ref={subtaskEditRef}
                                value={editingSubtaskSummary}
                                onChange={e => setEditingSubtaskSummary(e.target.value)}
                                onBlur={() => handleSaveSubtaskSummary(sub.id)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSaveSubtaskSummary(sub.id)
                                  if (e.key === 'Escape') setEditingSubtaskId(null)
                                }}
                                style={{ width: '100%', fontSize: '13px', border: '2px solid #4C9AFF', borderRadius: '3px', padding: '2px 6px', outline: 'none', boxSizing: 'border-box' }}
                              />
                            ) : (
                              <span
                                onClick={() => { setEditingSubtaskId(sub.id); setEditingSubtaskSummary(sub.summary) }}
                                title="Nhấn để sửa"
                                style={{
                                  fontSize: '13px', color: '#172B4D', cursor: 'pointer',
                                  display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                  textDecoration: doneStatuses.includes(sub.statusId) ? 'line-through' : 'none',
                                  opacity: doneStatuses.includes(sub.statusId) ? 0.6 : 1,
                                }}>
                                {sub.summary}
                              </span>
                            )}
                          </div>

                          {/* Status select */}
                          <select
                            value={sub.statusId || ''}
                            onChange={e => handleSubtaskStatusChange(sub.id, e.target.value)}
                            style={{
                              fontSize: '11px', border: '1px solid #DFE1E6', borderRadius: '12px',
                              padding: '2px 6px', backgroundColor: '#F1F2F4', color: '#172B4D',
                              cursor: 'pointer', outline: 'none', flexShrink: 0,
                            }}>
                            {(statuses || []).map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>

                          {/* Assignee avatar */}
                          <div title={sub.assigneeName || 'Chưa giao'}
                            style={{
                              width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                              backgroundColor: sub.assigneeName ? '#0C66E4' : '#DFE1E6',
                              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '10px', fontWeight: 'bold', overflow: 'hidden',
                            }}>
                            {sub.assigneeAvatarUrl
                              ? <img src={sub.assigneeAvatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : sub.assigneeName?.charAt(0).toUpperCase() || '?'}
                          </div>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteSubtask(sub.id, sub.summary)}
                            title="Xóa sub-task"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', borderRadius: '3px', lineHeight: 1, flexShrink: 0, color: '#B3BAC5' }}
                            onMouseOver={e => { e.currentTarget.style.color = '#AE2A19'; e.currentTarget.style.backgroundColor = '#FFEBE6' }}
                            onMouseOut={e => { e.currentTarget.style.color = '#B3BAC5'; e.currentTarget.style.backgroundColor = 'transparent' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="3,6 5,6 21,6"/><path d="m19,6-.867,13.142A2,2,0,0,1,16.138,21H7.862a2,2,0,0,1-1.995-1.858L5,6m5,0V4a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1v2"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SUB-TASK CREATE FORM */}
                  {showSubtaskForm && (
                    <div style={{ border: '2px solid #0C66E4', borderRadius: '6px', padding: '8px 10px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(9,30,66,0.1)' }}>
                      <input
                        ref={subtaskInputRef}
                        value={newSubtaskSummary}
                        onChange={e => setNewSubtaskSummary(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleCreateSubtask(); if (e.key === 'Escape') setShowSubtaskForm(false) }}
                        placeholder="Tên sub-task... (Enter để tạo, Esc để hủy)"
                        style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', color: '#172B4D', marginBottom: '8px', boxSizing: 'border-box' }}
                      />
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button onClick={handleCreateSubtask} disabled={creatingSubtask || !newSubtaskSummary.trim()} style={{
                          ...primaryBtn,
                          fontSize: '12px', padding: '3px 10px',
                          opacity: creatingSubtask || !newSubtaskSummary.trim() ? 0.5 : 1,
                          cursor: creatingSubtask || !newSubtaskSummary.trim() ? 'not-allowed' : 'pointer',
                        }}>
                          {creatingSubtask ? '...' : 'Tạo'}
                        </button>
                        <button onClick={() => { setShowSubtaskForm(false); setNewSubtaskSummary('') }} style={{ ...ghostBtn, fontSize: '12px', padding: '3px 8px' }}>Hủy</button>
                        <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#B3BAC5' }}>↵ Tạo · Esc Hủy</span>
                      </div>
                    </div>
                  )}

                  {!showSubtaskForm && subtasks.length === 0 && (
                    <div style={{ fontSize: '13px', color: '#B3BAC5', textAlign: 'center', padding: '12px', borderRadius: '4px', border: '1px dashed #DFE1E6' }}>
                      Chưa có sub-task nào — nhấn "+ Thêm" để tạo
                    </div>
                  )}
                </div>

                {/* TABS: Comments / Activity */}
                <div style={{ borderBottom: '2px solid #DFE1E6', marginBottom: '16px', display: 'flex' }}>
                  {['comments', 'activity'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                      padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer',
                      borderBottom: activeTab === tab ? '2px solid #0C66E4' : '2px solid transparent',
                      marginBottom: '-2px',
                      color: activeTab === tab ? '#0C66E4' : '#626F86',
                      fontSize: '14px', fontWeight: activeTab === tab ? '600' : '400',
                    }}>
                      {tab === 'comments' ? `Bình luận (${comments.length})` : 'Hoạt động'}
                    </button>
                  ))}
                </div>

                {activeTab === 'comments' && (
                  <div>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0C66E4', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>T</div>
                      <div style={{ flex: 1 }}>
                        <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Thêm bình luận..." rows={3}
                          style={{ width: '100%', padding: '8px 12px', border: '2px solid #DFE1E6', borderRadius: '4px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5', boxSizing: 'border-box' }}
                          onFocus={e => e.target.style.borderColor = '#4C9AFF'}
                          onBlur={e => e.target.style.borderColor = '#DFE1E6'} />
                        {newComment.trim() && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button onClick={handleSendComment} disabled={sendingComment} style={{ ...primaryBtn, opacity: sendingComment ? 0.7 : 1 }}>
                              {sendingComment ? 'Đang gửi...' : 'Lưu'}
                            </button>
                            <button onClick={() => setNewComment('')} style={ghostBtn}>Hủy</button>
                          </div>
                        )}
                      </div>
                    </div>

                    {comments.map(c => (
                      <div key={c.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1F845A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0, overflow: 'hidden' }}>
                          {c.userAvatarUrl ? <img src={c.userAvatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : c.userFullName?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '4px', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#172B4D' }}>{c.userFullName}</span>
                            <span style={{ fontSize: '12px', color: '#8590A2' }}>{timeAgo(c.createdAt)}</span>
                          </div>
                          <div style={{ fontSize: '14px', color: '#172B4D', lineHeight: '1.5', backgroundColor: '#F4F5F7', padding: '8px 12px', borderRadius: '4px' }}>{c.content}</div>
                        </div>
                      </div>
                    ))}

                    {comments.length === 0 && (
                      <div style={{ textAlign: 'center', color: '#8590A2', fontSize: '14px', padding: '24px 0' }}>
                        Chưa có bình luận nào. Hãy là người đầu tiên!
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div style={{ textAlign: 'center', color: '#8590A2', fontSize: '14px', padding: '24px 0' }}>
                    Tính năng lịch sử hoạt động đang được phát triển.
                  </div>
                )}
              </div>

              {/* ── RIGHT SIDEBAR ── */}
              <div style={{ width: '240px', borderLeft: '1px solid #DFE1E6', padding: '24px 16px', overflowY: 'auto', backgroundColor: '#FAFBFC', flexShrink: 0 }}>

                <DetailField label="Trạng thái">
                  <select value={issue.statusId || ''} onChange={e => handleUpdateField({ statusId: Number(e.target.value) })} style={selectStyle}>
                    {(statuses || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </DetailField>

                <DetailField label="Loại">
                  <select value={issue.type || ''} onChange={e => handleUpdateField({ type: e.target.value })} style={selectStyle}>
                    {Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </DetailField>

                <DetailField label="Ưu tiên">
                  <select value={issue.priority || ''} onChange={e => handleUpdateField({ priority: e.target.value })} style={selectStyle}>
                    {Object.entries(PRIORITY_MAP).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </DetailField>

                <hr style={{ border: 'none', borderTop: '1px solid #EBECF0', margin: '16px 0' }} />

                <DetailField label="Người báo cáo">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar name={issue.reporterName} url={issue.reporterAvatarUrl} size={24} color="#626F86" />
                    <span style={{ fontSize: '13px', color: '#172B4D' }}>{issue.reporterName || 'Không rõ'}</span>
                  </div>
                </DetailField>

                <DetailField label="Người được giao">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {issue.assigneeName
                      ? <><Avatar name={issue.assigneeName} url={issue.assigneeAvatarUrl} size={24} color="#0C66E4" />
                         <span style={{ fontSize: '13px', color: '#172B4D' }}>{issue.assigneeName}</span></>
                      : <span style={{ fontSize: '13px', color: '#8590A2', fontStyle: 'italic' }}>Chưa giao</span>}
                  </div>
                </DetailField>

                <hr style={{ border: 'none', borderTop: '1px solid #EBECF0', margin: '16px 0' }} />

                <DetailField label="Ngày tạo">
                  <span style={{ fontSize: '12px', color: '#626F86' }}>{formatDate(issue.createdAt)}</span>
                </DetailField>

                <DetailField label="Hạn chót">
                  <input
                    type="datetime-local"
                    value={issue.dueDate ? new Date(new Date(issue.dueDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                    onChange={e => handleUpdateField({ dueDate: e.target.value || null })}
                    style={{ ...selectStyle, padding: '4px 6px' }}
                  />
                </DetailField>

                <DetailField label="Story Points">
                  <input
                    type="number"
                    min="0"
                    placeholder="—"
                    value={issue.estimatePoints ?? ''}
                    onChange={e => handleUpdateField({ estimatePoints: e.target.value === '' ? null : parseInt(e.target.value) })}
                    style={{ ...selectStyle, padding: '4px 8px' }}
                  />
                </DetailField>

                {issue.parentIssueKey && (
                  <DetailField label="Issue cha">
                    <span style={{ fontSize: '12px', color: '#0C66E4', fontWeight: '600' }}>{issue.parentIssueKey}</span>
                  </DetailField>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#AE2A19' }}>
            Không tìm thấy công việc này.
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </>
  )
}

function DetailField({ label, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: '#5E6C84', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
      {children}
    </div>
  )
}

function Avatar({ name, url, size = 24, color = '#626F86' }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.42, fontWeight: 'bold', overflow: 'hidden', flexShrink: 0 }}>
      {url ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : name?.charAt(0).toUpperCase() || '?'}
    </div>
  )
}

const sectionTitle = { fontSize: '13px', fontWeight: '700', color: '#172B4D', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }
const primaryBtn   = { padding: '6px 12px', backgroundColor: '#0C66E4', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }
const ghostBtn     = { padding: '6px 10px', backgroundColor: 'transparent', color: '#42526E', border: '1px solid #DFE1E6', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }
const iconBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.15s' }
const selectStyle  = { width: '100%', padding: '6px 8px', border: '2px solid #DFE1E6', borderRadius: '4px', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF', color: '#172B4D', cursor: 'pointer' }
