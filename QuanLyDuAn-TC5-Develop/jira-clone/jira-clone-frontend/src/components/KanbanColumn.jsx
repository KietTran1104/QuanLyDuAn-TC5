import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import KanbanIssue from './KanbanIssue';

export default function KanbanColumn({ column, issues, onIssueClick }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column
    }
  });

  return (
    <div 
      style={{ 
        width: '280px', 
        minWidth: '280px', 
        backgroundColor: isOver ? '#EBECF0' : '#F1F2F4', 
        borderRadius: '8px', 
        padding: '12px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px',
        transition: 'background-color 0.2s ease'
      }}
    >
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#626F86', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{column.name}</span>
        <span style={{ backgroundColor: '#DFE1E6', padding: '2px 6px', borderRadius: '12px', fontSize: '11px' }}>{issues.length}</span>
      </div>
      
      {/* We set a minHeight so empty columns are still droppable areas */}
      <div ref={setNodeRef} style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '100px', flex: 1 }}>
        <SortableContext items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {issues.map(iss => (
            <KanbanIssue key={iss.id} issue={iss} onIssueClick={onIssueClick} />
          ))}
        </SortableContext>
      </div>
      
      <button style={{ height: '36px', backgroundColor: 'transparent', border: 'none', color: '#626F86', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '4px', cursor: 'pointer', padding: '0 8px', marginTop: '4px', transition: 'background-color 0.2s' }} onMouseOver={e => e.target.style.backgroundColor = '#091E4214'} onMouseOut={e => e.target.style.backgroundColor = 'transparent'}>
        + Tạo issue
      </button>
    </div>
  );
}
