import React, { useState } from 'react'

export default function ProjectPinModal({ project, onVerify, onCancel }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pin === project.pin) {
      onVerify()
    } else {
      setError('Mã PIN không chính xác. Vui lòng thử lại.')
      setPin('')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(9, 30, 66, 0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '12px', width: '400px',
        padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        textAlign: 'center'
      }}>
        <div style={{ 
          width: '64px', height: '64px', backgroundColor: '#E9F2FF', 
          borderRadius: '50%', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', margin: '0 auto 20px' 
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0052CC" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#172B4D', margin: '0 0 8px 0' }}>Dự án được bảo vệ</h2>
        <p style={{ color: '#626F86', fontSize: '14px', marginBottom: '24px' }}>
          Vui lòng nhập mã PIN 4 chữ số để truy cập vào dự án <strong>{project.name}</strong>.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
            <input 
              type="password"
              maxLength="4"
              autoFocus
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '')
                setPin(val)
                if (error) setError('')
              }}
              placeholder="••••"
              style={{ 
                width: '120px', height: '48px', fontSize: '24px', textAlign: 'center', 
                letterSpacing: '8px', border: '2px solid #DFE1E6', borderRadius: '8px',
                outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#4C9AFF'}
              onBlur={e => e.target.style.borderColor = '#DFE1E6'}
            />
          </div>

          {error && <p style={{ color: '#DE350B', fontSize: '13px', margin: '0 0 16px 0', fontWeight: '500' }}>{error}</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              type="submit" 
              style={{ 
                height: '40px', backgroundColor: '#0052CC', color: '#FFF', 
                border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#0747A6'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#0052CC'}
            >
              Xác nhận
            </button>
            <button 
              type="button" 
              onClick={onCancel}
              style={{ 
                height: '40px', backgroundColor: 'transparent', color: '#44546F', 
                border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer'
              }}
            >
              Quay lại danh sách
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
