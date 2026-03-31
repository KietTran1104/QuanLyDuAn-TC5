import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';

// Dữ liệu mẫu tạm thời cho giao diện Timeline
const mockData = [
  { id: 1, type: 'epic', title: 'Triển khai tính năng Kanban', status: 'IN PROGRESS', startOfs: 0, duration: 28, color: '#8777D9' },
  { id: 2, type: 'task', title: 'Thiết kế Database LexoRank', status: 'DONE', parentId: 1, startOfs: 0, duration: 7, color: '#4BCE97' },
  { id: 3, type: 'task', title: 'Xây dựng API Kéo Thả', status: 'IN PROGRESS', parentId: 1, startOfs: 7, duration: 14, color: '#0C66E4' },
  { id: 4, type: 'task', title: 'Tích hợp Frontend (dnd-kit)', status: 'TO DO', parentId: 1, startOfs: 14, duration: 14, color: '#0C66E4' },
  
  { id: 5, type: 'epic', title: 'Nâng cấp bảo mật (Security Auth)', status: 'TO DO', startOfs: 21, duration: 21, color: '#8777D9' },
  { id: 6, type: 'task', title: 'Tích hợp OTP Google Auth', status: 'DONE', parentId: 5, startOfs: 21, duration: 5, color: '#4BCE97' },
  { id: 7, type: 'task', title: 'Chặn truy cập trái phép', status: 'TO DO', parentId: 5, startOfs: 26, duration: 16, color: '#0C66E4' },
  
  { id: 8, type: 'epic', title: 'Thiết kế lại giao diện Dashboard', status: 'IN PROGRESS', startOfs: 35, duration: 30, color: '#8777D9' },
];

const MONTHS = ['Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
const DAY_WIDTH = 12; // 1 ngày = 12px

export default function ProjectTimelinePage({ onLogout }) {
  const { id } = useParams();

  return (
    <Layout onLogout={onLogout}>
      {/* Container kéo toàn tràn màn hình (ghi đè padding: 32px của Layout bằng margin âm) */}
      <div style={{ 
        margin: '-32px', 
        height: 'calc(100vh - 56px)', 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: 'var(--color-surface)',
        overflow: 'hidden'
      }}>
        
        {/* ── HEADER TOOLBAR ── */}
        <div style={{ 
          height: '64px',
          padding: '0 var(--space-300)', 
          borderBottom: '1px solid var(--color-border)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)' }}>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'var(--color-text)' }}>Roadmap (Timeline)</h1>
            
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)', margin: '0 8px' }}></div>
            
            {/* Mock Search Bar */}
            <div style={{ 
              display: 'flex', alignItems: 'center', width: '200px', height: '32px', 
              border: '2px solid var(--color-border)', borderRadius: 'var(--radius-normal)', 
              padding: '0 8px', backgroundColor: 'var(--color-bg-sunken)' 
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8590A2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span style={{ fontSize: '12px', color: '#8590A2', marginLeft: '8px' }}>Tìm kiếm...</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)' }}>
            <button style={{ 
              padding: '6px 12px', background: 'transparent', border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-normal)', color: 'var(--color-text-subtle)', fontWeight: 500,
              fontSize: '12px', cursor: 'pointer'
            }}>Hôm nay</button>
            <button style={{ 
              padding: '6px 12px', background: 'var(--color-surface-hovered)', border: 'none', 
              borderRadius: 'var(--radius-normal)', color: 'var(--color-text)', fontWeight: 600,
              fontSize: '12px', cursor: 'pointer'
            }}>Tháng</button>
          </div>
        </div>

        {/* ── GANTT CHART BODY ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* LẼ TRÁI (LEFT PANE) - DANH SÁCH ISSUE */}
          <div style={{ 
            width: '320px', 
            minWidth: '320px', 
            borderRight: '1px solid var(--color-border)', 
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: 'var(--color-surface)' 
          }}>
            {/* Tiêu đề cột */}
            <div style={{ 
              height: '44px', borderBottom: '1px solid var(--color-border)', 
              display: 'flex', alignItems: 'center', padding: '0 16px', 
              fontSize: '12px', fontWeight: 600, color: 'var(--color-text-subtle)',
              backgroundColor: 'var(--color-bg-sunken)'
            }}>
              <span style={{ flex: 1 }}>Tên công việc</span>
              <span style={{ width: '80px', textAlign: 'right' }}>Trạng thái</span>
            </div>
            
            {/* Danh sách Row */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {mockData.map(item => (
                <div key={item.id} style={{ 
                  height: '48px', 
                  borderBottom: '1px solid var(--color-border-subtle)', 
                  display: 'flex', alignItems: 'center', 
                  padding: `0 16px 0 ${item.type === 'task' ? '40px' : '16px'}`,
                  cursor: 'pointer'
                }}>
                  {item.type === 'epic' ? (
                     <div style={{ width: '20px', height: '20px', backgroundColor: '#8777D9', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                     </div>
                  ) : (
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#0C66E4', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                  
                  <span style={{ flex: 1, fontSize: '13px', color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: item.type === 'epic' ? 600 : 400 }}>
                    {item.title}
                  </span>
                  
                  <div style={{ width: '80px', display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ 
                      fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px',
                      backgroundColor: item.status === 'DONE' ? 'var(--color-success-bg)' : item.status === 'IN PROGRESS' ? 'var(--color-info-bg)' : 'var(--color-surface-hovered)',
                      color: item.status === 'DONE' ? 'var(--color-success)' : item.status === 'IN PROGRESS' ? 'var(--color-info)' : 'var(--color-text-subtle)'
                    }}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LẼ PHẢI (RIGHT PANE) - TRỤC THỜI GIAN GANTT */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            overflowX: 'auto', 
            backgroundColor: 'var(--color-bg-sunken)',
            position: 'relative'
          }}>
            {/* Header Tháng */}
            <div style={{ 
              height: '44px', width: '2000px', display: 'flex', borderBottom: '1px solid var(--color-border)', 
              backgroundColor: 'var(--color-surface)', position: 'sticky', top: 0, zIndex: 10
            }}>
              {MONTHS.map(month => (
                <div key={month} style={{ 
                  width: `${30 * DAY_WIDTH}px`, // Giả sử tháng 30 ngày
                  borderRight: '1px solid var(--color-border-subtle)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 600, color: 'var(--color-text-subtle)', letterSpacing: '0.05em'
                }}>
                  {month}
                </div>
              ))}
            </div>
            
            {/* Body Grid Line */}
            <div style={{ 
              minWidth: '2000px', flex: 1, position: 'relative',
              backgroundSize: `${DAY_WIDTH * 7}px 100%`, // Each column grid represents 1 week (7 days)
              backgroundImage: 'linear-gradient(to right, var(--color-border-subtle) 1px, transparent 1px)'
            }}>
              
              {/* Vạch kẻ Today (Hôm nay) */}
              <div style={{ 
                position: 'absolute', top: 0, bottom: 0, left: `${25 * DAY_WIDTH}px`, 
                width: '2px', backgroundColor: '#FF5630', zIndex: 5 
              }}>
                <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF5630' }}></div>
              </div>

              {/* Vẽ các Thanh (Bars) tương ứng từng issue */}
              {mockData.map((item, index) => {
                const topPxls = index * 48; // Mỗi hàng cao 48px
                return (
                  <div key={item.id} style={{ 
                    position: 'absolute', 
                    top: `${topPxls + 8}px`, // Căn giữa hàng (48 - 32) / 2 = 8
                    left: `${item.startOfs * DAY_WIDTH}px`, 
                    width: `${item.duration * DAY_WIDTH}px`,
                    height: '32px',
                    backgroundColor: item.color,
                    borderRadius: 'var(--radius-normal)',
                    opacity: 0.9,
                    boxShadow: 'var(--shadow-raised)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', padding: '0 12px',
                    color: 'white', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden'
                  }}>
                    {item.duration > 3 && item.title}
                  </div>
                );
              })}

            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
