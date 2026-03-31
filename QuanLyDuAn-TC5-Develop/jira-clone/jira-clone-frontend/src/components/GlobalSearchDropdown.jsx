import React from 'react'
import { Link } from 'react-router-dom'

export default function GlobalSearchDropdown({ onClose }) {
  // Common styles
  const sectionTitleStyle = {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    fontSize: '11px',
    marginBottom: '16px'
  }

  const itemHover = (e) => (e.currentTarget.style.backgroundColor = '#091E420F')
  const itemOut = (e) => (e.currentTarget.style.backgroundColor = 'transparent')
  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    textDecoration: 'none'
  }

  const badgeStyle = {
    padding: '4px 12px',
    backgroundColor: '#F4F5F7',
    color: '#42526E',
    fontSize: '11px',
    fontWeight: '600',
    borderRadius: '16px',
    cursor: 'pointer'
  }

  return (
    <>
      <div 
        style={{ position: 'fixed', inset: 0, zIndex: 110 }} 
        onClick={onClose}
      />
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '800px',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 8px 16px -4px rgba(9,30,66,0.25), 0 0 1px rgba(9,30,66,0.31)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 120,
        overflow: 'hidden',
        border: '1px solid #DFE1E6'
      }}>
        {/* Main 2-column layout */}
        <div style={{ display: 'flex', minHeight: '400px' }}>
          
          {/* Left Column: History & Context */}
          <div style={{ width: '60%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Recently Viewed */}
            <section>
              <h3 style={sectionTitleStyle}>Đã xem gần đây</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Link to="#" style={itemStyle} onMouseOver={itemHover} onMouseOut={itemOut}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#36B37E" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12.5l3 3 5-6"/></svg>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#172B4D' }}>TAT-5 Cơ chế bắn súng</span>
                    <span style={{ fontSize: '12px', color: '#626F86' }}>Dự án phần mềm • Task</span>
                  </div>
                </Link>
                <Link to="#" style={itemStyle} onMouseOver={itemHover} onMouseOut={itemOut}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#0C66E4" stroke="white" strokeWidth="2"><rect x="5" y="4" width="14" height="16" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="11" y2="17"/></svg>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#172B4D' }}>TAT-4 Di chuyển nhân vật</span>
                    <span style={{ fontSize: '12px', color: '#626F86' }}>Dự án phần mềm • Story</span>
                  </div>
                </Link>
                <Link to="#" style={itemStyle} onMouseOver={itemHover} onMouseOut={itemOut}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF5630" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#172B4D' }}>TAT-1 Lỗi cấu hình ban đầu</span>
                    <span style={{ fontSize: '12px', color: '#626F86' }}>Dự án phần mềm • Bug</span>
                  </div>
                </Link>
              </div>
            </section>

            {/* Recent Boards, Projects */}
            <section>
              <h3 style={sectionTitleStyle}>Bảng, Dự án, và Bộ lọc</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <Link to="#" style={itemStyle} onMouseOver={itemHover} onMouseOut={itemOut}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#0C66E4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M4 14l8-8 8 8"/></svg>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#172B4D', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Tìm kiếm nâng cao</span>
                    <span style={{ fontSize: '11px', color: '#626F86', textTransform: 'uppercase' }}>Bộ lọc</span>
                  </div>
                </Link>
                <Link to="#" style={itemStyle} onMouseOver={itemHover} onMouseOut={itemOut}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#36B37E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#172B4D', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Dự án phần mềm</span>
                    <span style={{ fontSize: '11px', color: '#626F86', textTransform: 'uppercase' }}>Dự án</span>
                  </div>
                </Link>
              </div>
            </section>
          </div>

          {/* Right Column: Filters */}
          <div style={{ width: '40%', padding: '24px', backgroundColor: '#FAFBFC', borderLeft: '1px solid #DFE1E6', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Last Updated */}
            <section>
              <h3 style={sectionTitleStyle}>Cập nhật lần cuối</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ ...badgeStyle, backgroundColor: '#E9F2FF', color: '#0C66E4' }} onMouseOver={e => e.currentTarget.style.backgroundColor='#DEEBFF'} onMouseOut={e => e.currentTarget.style.backgroundColor='#E9F2FF'}>Mọi lúc</span>
                <span style={badgeStyle} onMouseOver={e => e.currentTarget.style.backgroundColor='#EBECF0'} onMouseOut={e => e.currentTarget.style.backgroundColor='#F4F5F7'}>Hôm nay</span>
                <span style={badgeStyle} onMouseOver={e => e.currentTarget.style.backgroundColor='#EBECF0'} onMouseOut={e => e.currentTarget.style.backgroundColor='#F4F5F7'}>Hôm qua</span>
                <span style={badgeStyle} onMouseOver={e => e.currentTarget.style.backgroundColor='#EBECF0'} onMouseOut={e => e.currentTarget.style.backgroundColor='#F4F5F7'}>Tuần trước</span>
              </div>
            </section>

            {/* Filter by Assignee */}
            <section>
              <h3 style={sectionTitleStyle}>Lọc theo người nhận</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#0C66E4' }} />
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#FF5630', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>A</div>
                  <span style={{ fontSize: '13px', color: '#172B4D' }}>Alex Rivers</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#0C66E4' }} />
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#6554C0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>S</div>
                  <span style={{ fontSize: '13px', color: '#172B4D' }}>Sarah Chen</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#0C66E4' }} />
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#DFE1E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#42526E" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </div>
                  <span style={{ fontSize: '13px', color: '#172B4D' }}>Chưa giao</span>
                </label>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid #DFE1E6', backgroundColor: '#F4F5F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link to="#" style={{ fontSize: '12px', fontWeight: '600', color: '#0C66E4', textDecoration: 'none' }} onMouseOver={e=>e.currentTarget.style.textDecoration='underline'} onMouseOut={e=>e.currentTarget.style.textDecoration='none'}>Bảng</Link>
            <Link to="/projects" style={{ fontSize: '12px', fontWeight: '600', color: '#0C66E4', textDecoration: 'none' }} onMouseOver={e=>e.currentTarget.style.textDecoration='underline'} onMouseOut={e=>e.currentTarget.style.textDecoration='none'}>Dự án</Link>
            <Link to="#" style={{ fontSize: '12px', fontWeight: '600', color: '#0C66E4', textDecoration: 'none' }} onMouseOver={e=>e.currentTarget.style.textDecoration='underline'} onMouseOut={e=>e.currentTarget.style.textDecoration='none'}>Bộ lọc</Link>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link to="#" style={{ fontSize: '12px', fontWeight: '600', color: '#172B4D', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }} onMouseOver={e=>e.currentTarget.style.color='#0052CC'} onMouseOut={e=>e.currentTarget.style.color='#172B4D'}>
              Xem tất cả
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
