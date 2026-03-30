import React, { useState } from 'react'
import { api } from '../services/api'
import { useToast } from './Toast'

export default function CreateProjectModal({ onClose, onProjectCreated }) {
  const [name, setName] = useState('')
  const [keyPrefix, setKeyPrefix] = useState('')
  const [templateType, setTemplateType] = useState('scrum')
  const addToast = useToast()
  const [loading, setLoading] = useState(false)

  // Auto-generate key prefix safely when name changes
  const handleNameChange = (e) => {
    const newName = e.target.value
    setName(newName)
    if (!keyPrefix || keyPrefix === generateKeyPrefix(name)) {
      setKeyPrefix(generateKeyPrefix(newName))
    }
  }

  const generateKeyPrefix = (str) => {
    if (!str) return ''
    const words = str.trim().split(/\s+/)
    if (words.length === 1) {
      return words[0].substring(0, 3).toUpperCase()
    }
    return words.map(w => w[0]).join('').substring(0, 5).toUpperCase()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !keyPrefix) return addToast('warning', 'Vui lòng điền đủ thông tin')
    
    setLoading(true)
    try {
      const res = await api.createProject({
        name,
        keyPrefix: keyPrefix.toUpperCase(),
        templateType
      })
      addToast('success', 'Tạo dự án thành công')
      if (onProjectCreated) onProjectCreated(res.data)
      onClose()
    } catch (err) {
      addToast('error', err.response?.data?.message || 'Tạo dự án thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(9, 30, 66, 0.54)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '3px', width: '600px',
        boxShadow: '0 8px 16px -4px rgba(9,30,66,0.25)', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '500', color: '#172B4D', margin: 0 }}>Tạo dự án mới</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#42526E" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', flex: 1 }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5E6C84', marginBottom: '8px' }}>Tên dự án *</label>
            <input 
              type="text" 
              value={name} 
              onChange={handleNameChange}
              placeholder="Ví dụ: Hệ thống quản lý nhân sự..."
              style={{ width: '100%', padding: '8px 12px', borderRadius: '3px', border: '2px solid #DFE1E6', fontSize: '14px', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#4C9AFF'}
              onBlur={e => e.target.style.borderColor = '#DFE1E6'}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5E6C84', marginBottom: '8px' }}>Mã dự án (Key) *</label>
            <input 
              type="text" 
              value={keyPrefix} 
              onChange={(e) => setKeyPrefix(e.target.value.toUpperCase())}
              style={{ width: '100px', padding: '8px 12px', borderRadius: '3px', border: '2px solid #DFE1E6', fontSize: '14px', outline: 'none', textTransform: 'uppercase' }}
            />
            <div style={{ fontSize: '11px', color: '#6B778C', marginTop: '4px' }}>Dùng làm tiền tố cho các thẻ việc (ví dụ: HR-1, HR-2)</div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5E6C84', marginBottom: '8px' }}>Mẫu giao diện (Template)</label>
            <select 
              value={templateType} 
              onChange={(e) => setTemplateType(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '3px', border: '2px solid #DFE1E6', fontSize: '14px', outline: 'none', backgroundColor: '#FAFBFC' }}
            >
              <option value="scrum">Scrum (Phù hợp quản lý theo Sprint)</option>
              <option value="kanban">Kanban (Phù hợp dòng chảy công việc liên tục)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 12px', borderRadius: '3px', border: 'none', backgroundColor: 'transparent', color: '#42526E', fontWeight: '500', cursor: 'pointer' }}>
              Hủy
            </button>
            <button type="submit" disabled={loading} style={{ padding: '8px 16px', borderRadius: '3px', border: 'none', backgroundColor: '#0052CC', color: 'white', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Đang tạo...' : 'Tạo dự án'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
