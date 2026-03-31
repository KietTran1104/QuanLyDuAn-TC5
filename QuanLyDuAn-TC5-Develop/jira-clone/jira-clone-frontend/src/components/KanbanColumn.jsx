import React, { useState } from 'react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import KanbanIssue from './KanbanIssue';
import QuickCreateIssue from './QuickCreateIssue';

export default function KanbanColumn({ column, issues, onIssueClick, isOver: isOverProp, onQuickCreate, projectId }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  // ── useSortable: để KÉO CỘT ngang (horizontal reorder) ──
  // Chỉ spread listeners lên phần HEADER — không làm ảnh hưởng đến click issue
  const {
    attributes,
    listeners,
    setNodeRef: setColumnRef,
    transform,
    transition,
    isDragging: isColumnDragging,
  } = useSortable({
    id: column.id,
    data: { type: 'Column', column },
  });

  // ── useDroppable RIÊNG cho phần thân cột: nhận ISSUE thả vào ──
  // Dùng id khác với column.id để tránh conflict với useSortable
  const { setNodeRef: setBodyRef, isOver: isBodyOver } = useDroppable({
    id: `col-body-${column.id}`,
    data: { type: 'ColumnBody', column },
  });

  const isHighlighted = isOverProp || isBodyOver;

  return (
    <div
      ref={setColumnRef}
      style={{
        width: '280px',
        minWidth: '280px',
        flexShrink: 0,
        backgroundColor: '#F1F2F4',
        borderRadius: '8px',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isColumnDragging ? 0.35 : 1,
        boxShadow: isColumnDragging ? '0 8px 24px rgba(9,30,66,0.2)' : 'none',
        outline: isColumnDragging ? '2px solid #0C66E4' : 'none',
      }}
    >
      {/* ── HEADER: drag handle CHỈ cho kéo cột ── */}
      <div
        {...attributes}
        {...listeners}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 12px 8px',
          cursor: 'grab',
          borderRadius: '8px 8px 0 0',
          userSelect: 'none',
          transition: 'background-color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(9,30,66,0.06)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        title="Kéo để di chuyển cột"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Icon kéo 6 chấm */}
          <svg width="10" height="14" viewBox="0 0 10 14" fill="#B3BAC5">
            <circle cx="3" cy="2.5" r="1.5" /><circle cx="7" cy="2.5" r="1.5" />
            <circle cx="3" cy="7"   r="1.5" /><circle cx="7" cy="7"   r="1.5" />
            <circle cx="3" cy="11.5" r="1.5"/><circle cx="7" cy="11.5" r="1.5"/>
          </svg>
          <span style={{
            fontSize: '12px', fontWeight: '700', color: '#5E6C84',
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            {column.name}
          </span>
        </div>
        <span style={{
          backgroundColor: '#DFE1E6', color: '#5E6C84',
          padding: '1px 7px', borderRadius: '12px', fontSize: '11px', fontWeight: '700',
        }}>
          {issues.length}
        </span>
      </div>

      {/* ── BODY: vùng nhận issue thả vào ── */}
      <div
        ref={setBodyRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '0 10px 10px',
          minHeight: '80px',
          backgroundColor: isHighlighted ? '#E4E6EA' : 'transparent',
          borderRadius: '0 0 8px 8px',
          transition: 'background-color 0.15s',
        }}
      >
        <SortableContext items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {issues.map(iss => (
            <KanbanIssue key={iss.id} issue={iss} onIssueClick={onIssueClick} />
          ))}
        </SortableContext>

        {/* Placeholder khi cột rỗng */}
        {issues.length === 0 && (
          <div style={{
            flex: 1, minHeight: '60px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#B3BAC5', fontSize: '12px',
            border: `2px dashed ${isHighlighted ? '#0C66E4' : '#DFE1E6'}`,
            borderRadius: '6px',
            transition: 'border-color 0.15s',
          }}>
            Thả issue vào đây
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      {showCreateForm ? (
        <div style={{ padding: '0 2px 8px' }}>
          <QuickCreateIssue
            column={column}
            projectId={projectId}
            onCreated={async (summary, statusId) => {
              await onQuickCreate(summary, statusId);
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            height: '34px', backgroundColor: 'transparent', border: 'none',
            color: '#626F86', fontSize: '13px', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '6px',
            borderRadius: '0 0 8px 8px', cursor: 'pointer',
            padding: '0 12px', transition: 'background-color 0.15s', width: '100%',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(9,30,66,0.06)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span> Tạo issue
        </button>
      )}
    </div>
  );
}
