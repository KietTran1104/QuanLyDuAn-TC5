import React, { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import { useToast } from './Toast'

const PRIORITY_MAP = {
  highest: { label: 'Cao nhất', color: '#AE2A19', icon: '⬆⬆' },
  high:    { label: 'Cao', color: '#E34935', icon: '⬆' },
  medium:  { label: 'Trung bình', color: '#F4AC00', icon: '⬛' },
  low:     { label: 'Thấp', color: '#0052CC', icon: '⬇' },
  lowest:  { label: 'Thấp nhất', color: '#4C9AFF', icon: '⬇⬇' },
}

const TYPE_MAP = {
  epic:    { label: 'Epic', color: '#904EE2', icon: '⚡' },
  story:   { label: 'Story', color: '#1F845A', icon: '📗' },
  task:    { label: 'Task', color: '#0C66E4', icon: '☑️' },
  bug:     { label: 'Bug', color: '#E34935', icon: '🐛' },
  subtask: { label: 'Sub-task', color: '#0C66E4', icon: '📎' },
}

export default function IssueDetailDrawer({ issueId, onClose, onIssueUpdated, statuses }) {
  const { addToast } = useToast()
  const [issue, setIssue] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('comments')

  // Editable fields
  const [editingSummary, setEditingSummary] = useState(false)
  const [summaryDraft, setSummaryDraft] = useState('')
  const [editingDesc, setEditingDesc] = useState(false)
  const [descDraft, setDescDraft] = useState('')
  const [newComment, setNewComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)

  const drawerRef = useRef(null)

  useEffect(() => {
    if (issueId) fetchIssueData()
  }, [issueId])

  const fetchIssueData = async () => {
    setLoading(true)
    try {
      const [issueRes, commentsRes] = await Promise.all([
        api.getIssue(issueId),
        api.getComments(issueId)
      ])
      setIssue(issueRes.data)
      setSummaryDraft(issueRes.data.summary || '')
      setDescDraft(issueRes.data.description || '')
      setComments(commentsRes.data || [])
    } catch (e) {
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
    } catch (e) {
      addToast('Cập nhật thất bại', 'error')
    }
  }

  const handleSaveSummary = () => {
    if (summaryDraft.trim() && summaryDraft !== issue.summary) {
      handleUpdateField({ summary: summaryDraft.trim() })
    }
    setEditingSummary(false)
  }

  const handleSaveDescription = () => {
    if (descDraft !== (issue.description || '')) {
      handleUpdateField({ description: descDraft })
    }
    setEditingDesc(false)
  }

  const handleSendComment = async () => {
    if (!newComment.trim()) return
    setSendingComment(true)
    try {
      const res = await api.createComment({ issueId, content: newComment.trim() })
      setComments([...comments, res.data])
      setNewComment('')
    } catch (e) {
      addToast('Gửi bình luận thất bại', 'error')
    } finally {
      setSendingComment(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const timeAgo = (dateStr) => {
    if (!dateStr) return ''
    const now = new Date()
    const d = new Date(dateStr)
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60) return 'vừa xong'
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
    return `${Math.floor(diff / 86400)} ngày trước`
  }

  if (!issueId) return null

  const typeInfo = issue ? TYPE_MAP[issue.type?.toLowerCase()] || TYPE_MAP.task : TYPE_MAP.task
  const priorityInfo = issue ? PRIORITY_MAP[issue.priority?.toLowerCase()] || PRIORITY_MAP.medium : PRIORITY_MAP.medium

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(9, 30, 66, 0.54)',
          zIndex: 900, transition: 'opacity 0.3s'
        }}
      />

      {/* Drawer */}
      <div ref={drawerRef} style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '720px', maxWidth: '90vw',
        backgroundColor: '#FFFFFF',
        boxShadow: '-8px 0 24px rgba(9, 30, 66, 0.25)',
        zIndex: 1000,
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.3s ease-out',
        overflowY: 'auto'
      }}>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#626F86' }}>
            Đang tải chi tiết...
          </div>
        ) : issue ? (
          <>
            {/* HEADER */}
            <div style={{ 
              padding: '16px 24px', borderBottom: '1px solid #DFE1E6',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'sticky', top: 0, backgroundColor: '#FFFFFF', zIndex: 2
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>{typeInfo.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: typeInfo.color }}>{issue.issueKey}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button onClick={onClose} title="Đóng" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '4px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#091E4214'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#42526E" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            {/* BODY — 2-column layout */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              
              {/* LEFT (main content) */}
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                
                {/* SUMMARY */}
                {editingSummary ? (
                  <input
                    autoFocus
                    value={summaryDraft}
                    onChange={e => setSummaryDraft(e.target.value)}
                    onBlur={handleSaveSummary}
                    onKeyDown={e => e.key === 'Enter' && handleSaveSummary()}
                    style={{ width: '100%', fontSize: '20px', fontWeight: '600', color: '#172B4D', border: '2px solid #4C9AFF', borderRadius: '3px', padding: '4px 8px', outline: 'none', marginBottom: '16px' }}
                  />
                ) : (
                  <h2 
                    onClick={() => setEditingSummary(true)} 
                    style={{ fontSize: '20px', fontWeight: '600', color: '#172B4D', margin: '0 0 16px', cursor: 'pointer', padding: '4px 8px', borderRadius: '3px', border: '2px solid transparent' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#DFE1E6'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
                  >
                    {issue.summary}
                  </h2>
                )}

                {/* DESCRIPTION */}
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#172B4D', marginBottom: '8px' }}>Mô tả</h4>
                  {editingDesc ? (
                    <div>
                      <textarea
                        autoFocus
                        value={descDraft}
                        onChange={e => setDescDraft(e.target.value)}
                        rows={6}
                        style={{ width: '100%', fontSize: '14px', color: '#172B4D', border: '2px solid #4C9AFF', borderRadius: '3px', padding: '8px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button onClick={handleSaveDescription} style={{ padding: '6px 12px', backgroundColor: '#0052CC', color: 'white', border: 'none', borderRadius: '3px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Lưu</button>
                        <button onClick={() => { setEditingDesc(false); setDescDraft(issue.description || '') }} style={{ padding: '6px 12px', backgroundColor: 'transparent', color: '#42526E', border: 'none', borderRadius: '3px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Hủy</button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => setEditingDesc(true)} 
                      style={{ fontSize: '14px', color: issue.description ? '#172B4D' : '#8590A2', lineHeight: '1.6', cursor: 'pointer', padding: '8px', borderRadius: '3px', border: '2px solid transparent', minHeight: '60px', backgroundColor: '#F4F5F7' }}
                      onMouseOver={e => e.currentTarget.style.borderColor = '#DFE1E6'}
                      onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
                    >
                      {issue.description || 'Nhấn để thêm mô tả...'}
                    </div>
                  )}
                </div>

                {/* TABS: Comments / Activity */}
                <div style={{ borderBottom: '1px solid #DFE1E6', marginBottom: '16px', display: 'flex', gap: '0' }}>
                  {['comments', 'activity'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{ 
                        padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer',
                        borderBottom: activeTab === tab ? '2px solid #0C66E4' : '2px solid transparent',
                        color: activeTab === tab ? '#0C66E4' : '#626F86',
                        fontSize: '14px', fontWeight: activeTab === tab ? '600' : '400'
                      }}
                    >
                      {tab === 'comments' ? `Bình luận (${comments.length})` : 'Hoạt động'}
                    </button>
                  ))}
                </div>

                {activeTab === 'comments' && (
                  <div>
                    {/* New comment box */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0C66E4', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0, marginTop: '2px' }}>T</div>
                      <div style={{ flex: 1 }}>
                        <textarea
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          placeholder="Thêm bình luận..."
                          rows={3}
                          style={{ width: '100%', padding: '8px 12px', border: '2px solid #DFE1E6', borderRadius: '3px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' }}
                          onFocus={e => e.target.style.borderColor = '#4C9AFF'}
                          onBlur={e => e.target.style.borderColor = '#DFE1E6'}
                        />
                        {newComment.trim() && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button 
                              onClick={handleSendComment} 
                              disabled={sendingComment}
                              style={{ padding: '6px 12px', backgroundColor: '#0052CC', color: 'white', border: 'none', borderRadius: '3px', fontSize: '14px', fontWeight: '500', cursor: sendingComment ? 'not-allowed' : 'pointer', opacity: sendingComment ? 0.7 : 1 }}
                            >
                              {sendingComment ? 'Đang gửi...' : 'Lưu'}
                            </button>
                            <button onClick={() => setNewComment('')} style={{ padding: '6px 12px', backgroundColor: 'transparent', color: '#42526E', border: 'none', borderRadius: '3px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Hủy</button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comment list */}
                    {comments.map(c => (
                      <div key={c.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1F845A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0, overflow: 'hidden' }}>
                          {c.userAvatarUrl ? <img src={c.userAvatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : c.userFullName?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#172B4D' }}>{c.userFullName}</span>
                            <span style={{ fontSize: '12px', color: '#8590A2' }}>{timeAgo(c.createdAt)}</span>
                          </div>
                          <div style={{ fontSize: '14px', color: '#172B4D', lineHeight: '1.5', backgroundColor: '#F4F5F7', padding: '8px 12px', borderRadius: '3px' }}>
                            {c.content}
                          </div>
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

              {/* RIGHT SIDEBAR (detail fields) */}
              <div style={{ width: '240px', borderLeft: '1px solid #DFE1E6', padding: '24px 16px', overflowY: 'auto', backgroundColor: '#FAFBFC' }}>
                
                {/* Trạng thái */}
                <DetailField label="Trạng thái">
                  <select 
                    value={issue.statusId || ''} 
                    onChange={e => handleUpdateField({ statusId: Number(e.target.value) })}
                    style={selectStyle}
                  >
                    {(statuses || []).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </DetailField>

                {/* Loại */}
                <DetailField label="Loại">
                  <select
                    value={issue.type || ''}
                    onChange={e => handleUpdateField({ type: e.target.value })}
                    style={selectStyle}
                  >
                    {Object.entries(TYPE_MAP).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>
                </DetailField>

                {/* Ưu tiên */}
                <DetailField label="Ưu tiên">
                  <select
                    value={issue.priority || ''}
                    onChange={e => handleUpdateField({ priority: e.target.value })}
                    style={selectStyle}
                  >
                    {Object.entries(PRIORITY_MAP).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>
                </DetailField>

                <hr style={{ border: 'none', borderTop: '1px solid #EBECF0', margin: '16px 0' }} />

                {/* Người giao */}
                <DetailField label="Người báo cáo">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#626F86', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', overflow: 'hidden' }}>
                      {issue.reporterAvatarUrl ? <img src={issue.reporterAvatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (issue.reporterName?.charAt(0).toUpperCase() || '?')}
                    </div>
                    <span style={{ fontSize: '14px', color: '#172B4D' }}>{issue.reporterName || 'Không rõ'}</span>
                  </div>
                </DetailField>

                {/* Người nhận */}
                <DetailField label="Người được giao">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {issue.assigneeName ? (
                      <>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0C66E4', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', overflow: 'hidden' }}>
                          {issue.assigneeAvatarUrl ? <img src={issue.assigneeAvatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : issue.assigneeName.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '14px', color: '#172B4D' }}>{issue.assigneeName}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: '14px', color: '#8590A2', fontStyle: 'italic' }}>Chưa giao</span>
                    )}
                  </div>
                </DetailField>

                <hr style={{ border: 'none', borderTop: '1px solid #EBECF0', margin: '16px 0' }} />

                {/* Ngày tạo */}
                <DetailField label="Ngày tạo">
                  <span style={{ fontSize: '13px', color: '#626F86' }}>{formatDate(issue.createdAt)}</span>
                </DetailField>

                {/* Ngày hết hạn */}
                <DetailField label="Hạn chót">
                  <span style={{ fontSize: '13px', color: issue.dueDate ? '#172B4D' : '#8590A2' }}>
                    {issue.dueDate ? formatDate(issue.dueDate) : 'Chưa đặt'}
                  </span>
                </DetailField>

              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#AE2A19' }}>
            Không tìm thấy công việc này.
          </div>
        )}
      </div>

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}

// Sub-component for sidebar detail rows
function DetailField({ label, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: '#5E6C84', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
      {children}
    </div>
  )
}

const selectStyle = {
  width: '100%',
  padding: '6px 8px',
  border: '2px solid #DFE1E6',
  borderRadius: '3px',
  fontSize: '13px',
  outline: 'none',
  backgroundColor: '#FFFFFF',
  color: '#172B4D',
  cursor: 'pointer',
  appearance: 'auto'
}
