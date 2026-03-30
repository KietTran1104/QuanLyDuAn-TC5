import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../services/api'
import { useToast } from '../components/Toast'
import IssueDetailDrawer from '../components/IssueDetailDrawer'

export default function BacklogPage({ onLogout }) {
  const { id } = useParams()
  const addToast = useToast()

  const [sprints, setSprints] = useState([])
  const [issues, setIssues] = useState([])
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState({})
  const [selectedIssueId, setSelectedIssueId] = useState(null)

  // Quick-create issue
  const [creatingIn, setCreatingIn] = useState(null) // 'backlog' or sprint id
  const [newSummary, setNewSummary] = useState('')

  useEffect(() => {
    fetchBacklogData()
  }, [id])

  const fetchBacklogData = async () => {
    setLoading(true)
    try {
      const [sprintRes, issueRes, statusRes] = await Promise.all([
        api.getSprintsByProject(id),
        api.getIssuesByProject(id),
        api.getStatusesByProject(id),
      ])
      setSprints(sprintRes.data || [])
      setIssues(issueRes.data || [])
      setStatuses(statusRes.data || [])

      // Expand all sections by default
      const expanded = { backlog: true }
      ;(sprintRes.data || []).forEach(s => expanded[s.id] = true)
      setExpandedSections(expanded)
    } catch (e) {
      addToast('error', 'Không thể tải Backlog')
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const getSprintIssues = (sprintId) => issues.filter(i => i.sprintId === sprintId)
  const getBacklogIssues = () => issues.filter(i => !i.sprintId)

  const handleQuickCreate = async (sprintId) => {
    if (!newSummary.trim()) return
    try {
      const res = await api.createIssue({
        projectId: Number(id),
        type: 'task',
        summary: newSummary.trim(),
        sprintId: sprintId || null,
      })
      setIssues([...issues, res.data])
      setNewSummary('')
      setCreatingIn(null)
      addToast('success', 'Đã tạo issue')
    } catch (e) {
      addToast('error', 'Tạo issue thất bại')
    }
  }

  const handleCreateSprint = async () => {
    try {
      const sprintNum = sprints.length + 1
      const now = new Date()
      const end = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
      const res = await api.createSprint({
        projectId: Number(id),
        name: `Sprint ${sprintNum}`,
        startDate: now.toISOString(),
        endDate: end.toISOString(),
      })
      setSprints([...sprints, res.data])
      setExpandedSections(prev => ({ ...prev, [res.data.id]: true }))
      addToast('success', `Đã tạo Sprint ${sprintNum}`)
    } catch (e) {
      addToast('error', 'Tạo Sprint thất bại')
    }
  }

  const getStatusBadge = (statusName) => {
    const colors = {
      'TODO': { bg: '#F1F2F4', color: '#626F86' },
      'IN PROGRESS': { bg: '#E9F2FF', color: '#0C66E4' },
      'DONE': { bg: '#DCFFF1', color: '#1F845A' },
    }
    const c = colors[statusName?.toUpperCase()] || colors['TODO']
    return c
  }

  const formatSprintDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return `${d.getDate()}/${d.getMonth() + 1}`
  }

  const rowStyle = {
    display: 'flex', alignItems: 'center', height: '40px', padding: '0 16px',
    borderBottom: '1px solid #EBECF0', backgroundColor: '#FFFFFF', cursor: 'pointer',
    transition: 'background 0.1s'
  }

  const renderIssueRow = (iss) => {
    const badge = getStatusBadge(iss.statusName)
    return (
      <div 
        key={iss.id} style={rowStyle}
        onClick={() => setSelectedIssueId(iss.id)}
        onMouseOver={e => e.currentTarget.style.backgroundColor = '#F1F2F4'}
        onMouseOut={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
      >
        <div style={{ width: '16px', height: '16px', backgroundColor: iss.type === 'bug' ? '#E34935' : iss.type === 'story' ? '#1F845A' : '#0C66E4', borderRadius: '4px', marginRight: '8px', flexShrink: 0 }}></div>
        <span style={{ fontSize: '13px', color: '#0C66E4', fontWeight: '600', marginRight: '12px', flexShrink: 0 }}>{iss.issueKey}</span>
        <span style={{ fontSize: '14px', color: '#172B4D', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{iss.summary}</span>
        <span style={{ fontSize: '12px', color: '#626F86', width: '80px', textAlign: 'right', marginRight: '16px', flexShrink: 0 }}>{iss.assigneeName || 'Chưa giao'}</span>
        <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: badge.bg, color: badge.color, padding: '2px 6px', borderRadius: '3px', width: '100px', textAlign: 'center', flexShrink: 0 }}>
          {iss.statusName || 'TODO'}
        </span>
      </div>
    )
  }

  const renderCreateRow = (sectionKey) => (
    creatingIn === sectionKey ? (
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', backgroundColor: '#FFFFFF', gap: '8px' }}>
        <input
          autoFocus
          value={newSummary}
          onChange={e => setNewSummary(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleQuickCreate(sectionKey === 'backlog' ? null : sectionKey); if (e.key === 'Escape') { setCreatingIn(null); setNewSummary('') } }}
          placeholder="Nhập tiêu đề issue rồi nhấn Enter..."
          style={{ flex: 1, height: '32px', border: '2px solid #4C9AFF', borderRadius: '3px', padding: '0 8px', fontSize: '14px', outline: 'none' }}
        />
        <button onClick={() => { setCreatingIn(null); setNewSummary('') }} style={{ background: 'none', border: 'none', color: '#626F86', cursor: 'pointer', fontSize: '14px' }}>Hủy</button>
      </div>
    ) : (
      <div
        onClick={() => setCreatingIn(sectionKey)}
        style={{ padding: '12px 16px', backgroundColor: '#FFFFFF', color: '#626F86', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'color 0.2s' }}
        onMouseOver={e => e.currentTarget.style.color = '#0C66E4'}
        onMouseOut={e => e.currentTarget.style.color = '#626F86'}
      >
        + Tạo issue
      </div>
    )
  )

  if (loading) {
    return (
      <Layout projectId={id} onLogout={onLogout}>
        <div style={{ padding: '40px', textAlign: 'center', color: '#626F86' }}>Đang tải Backlog...</div>
      </Layout>
    )
  }

  return (
    <Layout projectId={id || 'WEB'} onLogout={onLogout}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#172B4D', margin: 0 }}>Backlog</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', width: '200px' }}>
            <input type="text" placeholder="Tìm kiếm backlog..." style={{ width: '100%', height: '36px', backgroundColor: '#FFFFFF', border: '2px solid #DCDFE4', borderRadius: '4px', padding: '0 12px', fontSize: '14px', outline: 'none' }} />
          </div>
        </div>
      </div>

      {/* SPRINT SECTIONS */}
      {sprints.map(sprint => {
        const sprintIssues = getSprintIssues(sprint.id)
        return (
          <div key={sprint.id} style={{ backgroundColor: '#F7F8F9', border: '1px solid #DCDFE4', borderRadius: '8px', marginBottom: '16px', overflow: 'hidden' }}>
            <div 
              onClick={() => toggleSection(sprint.id)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F1F2F4', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#626F86" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expandedSections[sprint.id] ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M9 18l6-6-6-6"/>
                </svg>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#172B4D' }}>
                  {sprint.name} {sprint.startDate && sprint.endDate ? `(${formatSprintDate(sprint.startDate)} - ${formatSprintDate(sprint.endDate)})` : ''}
                </span>
                <span style={{ fontSize: '12px', color: '#626F86' }}>{sprintIssues.length} issues</span>
                {sprint.status && (
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '3px', backgroundColor: sprint.status === 'active' ? '#E9F2FF' : '#F1F2F4', color: sprint.status === 'active' ? '#0C66E4' : '#626F86' }}>
                    {sprint.status === 'active' ? 'Đang chạy' : sprint.status === 'completed' ? 'Đã xong' : 'Chưa bắt đầu'}
                  </span>
                )}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation() }}
                style={{ height: '28px', padding: '0 12px', backgroundColor: '#F1F2F4', color: '#172B4D', fontSize: '13px', fontWeight: 'bold', border: '1px solid #DCDFE4', borderRadius: '4px', cursor: 'pointer' }}
              >
                Bắt đầu Sprint
              </button>
            </div>
            
            {expandedSections[sprint.id] && (
              <div>
                {sprintIssues.length > 0 ? sprintIssues.map(renderIssueRow) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#8590A2', fontSize: '14px' }}>
                    Kéo thả issue vào đây hoặc tạo mới bên dưới.
                  </div>
                )}
                {renderCreateRow(sprint.id)}
              </div>
            )}
          </div>
        )
      })}

      {/* BACKLOG SECTION */}
      <div style={{ backgroundColor: '#F7F8F9', border: '1px solid #DCDFE4', borderRadius: '8px', overflow: 'hidden' }}>
        <div 
          onClick={() => toggleSection('backlog')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F1F2F4', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#626F86" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expandedSections['backlog'] ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
              <path d="M9 18l6-6-6-6"/>
            </svg>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#172B4D' }}>Backlog</span>
            <span style={{ fontSize: '12px', color: '#626F86' }}>{getBacklogIssues().length} issues</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); handleCreateSprint() }}
            style={{ height: '28px', padding: '0 12px', backgroundColor: '#F1F2F4', color: '#172B4D', fontSize: '13px', fontWeight: 'bold', border: '1px solid #DCDFE4', borderRadius: '4px', cursor: 'pointer' }}
          >
            Tạo Sprint
          </button>
        </div>
        
        {expandedSections['backlog'] && (
          <div>
            {getBacklogIssues().length > 0 ? getBacklogIssues().map(renderIssueRow) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#8590A2', fontSize: '14px' }}>
                Backlog trống. Tạo issue mới để bắt đầu!
              </div>
            )}
            {renderCreateRow('backlog')}
          </div>
        )}
      </div>

      {/* Issue Detail Drawer */}
      {selectedIssueId && (
        <IssueDetailDrawer 
          issueId={selectedIssueId}
          statuses={statuses}
          onClose={() => setSelectedIssueId(null)}
          onIssueUpdated={(updated) => setIssues(prev => prev.map(i => i.id === updated.id ? updated : i))}
        />
      )}

    </Layout>
  )
}
