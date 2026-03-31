import React, { useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function KanbanIssue({ issue, onIssueClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: issue.id,
    data: {
      type: 'Issue',
      issue
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCDFE4',
    borderRadius: '4px',
    padding: '12px',
    cursor: 'grab',
    boxShadow: isDragging ? '0 4px 8px rgba(9,30,66,0.25)' : '0 1px 1px rgba(9,30,66,0.25)',
    zIndex: isDragging ? 2 : 1,
    position: 'relative'
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'highest': return '#AE2A19';
      case 'high': return '#E34935';
      case 'medium': return '#F4AC00';
      case 'low': return '#0052CC';
      default: return '#8590A2';
    }
  };

  const getTypeColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'bug': return '#E34935';
      case 'story': return '#1F845A';
      case 'task': return '#0C66E4';
      default: return '#626F86';
    }
  };

  const clickRef = useRef(false);
  // Lưu pointer down time để phân biệt click vs drag
  const pointerDownTimeRef = useRef(0);

  // Merge custom handler với dnd-kit listener để KHÔNG phá vỡ drag activation
  const handlePointerDown = (e) => {
    clickRef.current = true;
    pointerDownTimeRef.current = Date.now();
    // Gọi dnd-kit listener để kích hoạt drag (QUAN TRỌNG!)
    if (listeners?.onPointerDown) {
      listeners.onPointerDown(e);
    }
  };

  const handlePointerMove = () => {
    // Nếu di chuyển con trỏ, đây là drag chứ không phải click
    if (Date.now() - pointerDownTimeRef.current > 50) {
      clickRef.current = false;
    }
  };

  const handlePointerUp = () => {
    if (clickRef.current && onIssueClick) {
      onIssueClick(issue.id);
    }
    clickRef.current = false;
  };

  // Tách listeners: bỏ onPointerDown ra khỏi spread vì đã merge vào handlePointerDown
  const { onPointerDown: _dndPointerDown, ...restListeners } = listeners || {};

  return (
    <div 
      ref={setNodeRef} style={style} {...attributes} {...restListeners}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div style={{ fontSize: '14px', color: '#172B4D', marginBottom: '12px', lineHeight: '1.4' }}>
        {issue.summary}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: getTypeColor(issue.type), borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '2px' }}></div>
          </div>
          <span style={{ fontSize: '12px', color: '#626F86', fontWeight: '600' }}>{issue.issueKey}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getPriorityColor(issue.priority)} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 19 12 5 12 19"/><polyline points="5 12 12 5 19 12"/></svg>
          
          {issue.assigneeName ? (
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0C66E4', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', overflow: 'hidden' }}>
              {issue.assigneeAvatarUrl ? (
                <img src={issue.assigneeAvatarUrl} alt="assignee" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                issue.assigneeName.charAt(0).toUpperCase()
              )}
            </div>
          ) : (
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px dashed #626F86', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#626F86" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
