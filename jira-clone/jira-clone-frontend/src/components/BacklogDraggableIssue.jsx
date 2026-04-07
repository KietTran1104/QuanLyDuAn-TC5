import React, { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'

export default function BacklogDraggableIssue({ issue, onClick, isSubtask, onAddSubtask }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `issue-${issue.id}`,
    data: {
      type: 'Issue',
      issue
    },
    disabled: isSubtask // Optionally disable subtask dragging if it complicates things, or keep it.
  })

  const getStatusBadge = (statusName) => {
    const colors = {
      'TODO': { bg: '#F1F2F4', color: '#626F86' },
      'IN PROGRESS': { bg: '#E9F2FF', color: '#0C66E4' },
      'DONE': { bg: '#DCFFF1', color: '#1F845A' },
    }
    const c = colors[statusName?.toUpperCase()] || colors['TODO']
    return c
  }
  
  const getTypeIcon = (type) => {
    const lowerType = type?.toLowerCase();
    if (lowerType === 'bug') return <div style={{ width: '14px', height: '14px', backgroundColor: '#E34935', borderRadius: '3px' }}></div>;
    if (lowerType === 'story') return <div style={{ width: '14px', height: '14px', backgroundColor: '#1F845A', borderRadius: '3px' }}></div>;
    if (lowerType === 'subtask') return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4C9AFF" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    );
    return <div style={{ width: '14px', height: '14px', backgroundColor: '#0C66E4', borderRadius: '3px' }}></div>;
  }

  const badge = getStatusBadge(issue.statusName)

  const rowStyle = {
    display: 'flex', alignItems: 'center', height: '36px', padding: isSubtask ? '0 16px 0 48px' : '0 16px',
    borderBottom: '1px solid #EBECF0', 
    backgroundColor: isDragging ? '#F4F5F7' : '#FFFFFF', 
    opacity: isDragging ? 0.4 : 1,
    cursor: isSubtask ? 'default' : 'grab',
    transition: 'background 0.1s',
    position: 'relative'
  }

  const hasSubtasks = issue.subtasks && issue.subtasks.length > 0;

  return (
    <div ref={setNodeRef} style={{ display: 'flex', flexDirection: 'column' }}>
      {/* PARENT ROW */}
      <div 
        style={rowStyle}
        {...(!isSubtask ? { ...attributes, ...listeners } : {})}
        onClick={onClick}
        onMouseOver={e => { if(!isDragging) e.currentTarget.style.backgroundColor = '#F1F2F4' }}
        onMouseOut={e => { if(!isDragging) e.currentTarget.style.backgroundColor = '#FFFFFF' }}
      >
        {/* Chevron for expansion */}
        {!isSubtask && (
          <div 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '3px', marginRight: '4px' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#091E4214'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
             {hasSubtasks && (
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#626F86" strokeWidth="2" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.1s' }}>
                 <path d="M9 18l6-6-6-6"/>
               </svg>
             )}
          </div>
        )}
        
        <div style={{ marginRight: '8px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {getTypeIcon(issue.type)}
        </div>
        
        <span style={{ fontSize: '13px', color: '#0C66E4', fontWeight: '600', marginRight: '8px', flexShrink: 0 }}>{issue.issueKey}</span>
        
        <span style={{ fontSize: '13px', color: '#172B4D', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.summary}</span>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Quick Add Subtask Button */}
            {!isSubtask && onAddSubtask && (
              <button 
                onClick={(e) => { e.stopPropagation(); onAddSubtask(issue); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '3px', color: '#626F86', display: 'flex', alignItems: 'center' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#091E4214'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Tạo sub-task"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            )}
            
            <span style={{ fontSize: '12px', color: '#626F86', width: '80px', textAlign: 'right' }}>{issue.assigneeName || '--'}</span>
            
            <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: badge.bg, color: badge.color, padding: '2px 6px', borderRadius: '3px', width: '90px', textAlign: 'center' }}>
              {issue.statusName?.toUpperCase() || 'TODO'}
            </span>
        </div>
      </div>

      {/* CHILDREN RENDERING */}
      {isExpanded && hasSubtasks && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {issue.subtasks.map(sub => (
            <BacklogDraggableIssue 
                key={sub.id} 
                issue={sub} 
                isSubtask={true} 
                onClick={() => onClick(sub.id)} // Pass sub-task ID to open specifically
            />
          ))}
        </div>
      )}
    </div>
  )
}
