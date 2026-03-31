import { useState, useRef, useEffect } from 'react';

/**
 * Form tạo issue nhanh — nhúng thẳng vào cột Kanban.
 * UX giống Jira: click "+ Tạo issue" → textarea xuất hiện
 *               Enter/blur → tạo; Escape → hủy
 */
export default function QuickCreateIssue({ column, projectId, onCreated, onCancel }) {
  const [summary, setSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  // Auto-focus khi component mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize textarea theo nội dung
  const handleChange = (e) => {
    setSummary(e.target.value);
    setError('');
    // Auto resize
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleSubmit = async () => {
    const trimmed = summary.trim();
    if (!trimmed) {
      setError('Vui lòng nhập tên issue');
      textareaRef.current?.focus();
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreated(trimmed, column.id);
      setSummary('');
      // Không đóng form — cho phép tạo nhiều issue liên tiếp
      textareaRef.current?.focus();
      textareaRef.current?.select();
    } catch (e) {
      setError('Tạo issue thất bại. Thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();   // không xuống dòng
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        border: `2px solid ${error ? '#E34935' : '#0C66E4'}`,
        borderRadius: '6px',
        padding: '8px',
        boxShadow: '0 2px 8px rgba(9,30,66,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
      // Ngăn dnd-kit kích hoạt drag khi gõ trong form
      onPointerDown={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Textarea nhập tóm tắt */}
      <textarea
        ref={textareaRef}
        value={summary}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Nhập tên issue... (Enter để tạo, Esc để hủy)"
        rows={2}
        style={{
          width: '100%',
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontSize: '14px',
          color: '#172B4D',
          lineHeight: '1.5',
          fontFamily: 'inherit',
          backgroundColor: 'transparent',
          boxSizing: 'border-box',
          minHeight: '36px',
          overflow: 'hidden',
        }}
      />

      {/* Error */}
      {error && (
        <span style={{ fontSize: '12px', color: '#E34935' }}>{error}</span>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !summary.trim()}
          style={{
            padding: '4px 12px',
            backgroundColor: isSubmitting || !summary.trim() ? '#DFE1E6' : '#0C66E4',
            color: isSubmitting || !summary.trim() ? '#A5ADBA' : 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: isSubmitting || !summary.trim() ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.15s',
          }}
        >
          {isSubmitting ? '...' : 'Tạo'}
        </button>

        <button
          onClick={onCancel}
          style={{
            padding: '4px 8px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '4px',
            fontSize: '13px',
            color: '#626F86',
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F2F4'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          Hủy
        </button>

        <span style={{
          marginLeft: 'auto',
          fontSize: '11px',
          color: '#B3BAC5',
        }}>
          ↵ Tạo · Esc Hủy
        </span>
      </div>
    </div>
  );
}
