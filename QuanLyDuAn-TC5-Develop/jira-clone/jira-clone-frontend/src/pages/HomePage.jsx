import Layout from '../components/Layout'
import { useUser } from '../components/UserContext'

export default function HomePage({ auth, onLogout }) {
  const { user } = useUser() || {}
  const userName = user?.fullName || auth?.name || 'User'

  return (
    <Layout onLogout={onLogout}>
      <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#172B4D', marginBottom: '24px' }}>
        Chào buổi sáng, {userName}! 👋
      </h1>

      {/* DUOC GHI DAU SAO */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#8590A2', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
          Được ghi dấu sao
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {/* Card 1 */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #DCDFE4', borderRadius: '8px', padding: '16px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', backgroundColor: '#0C66E4', borderRadius: '6px' }}></div>
              <div style={{ marginLeft: '12px', flex: 1, fontSize: '14px', fontWeight: '600', color: '#172B4D' }}>Website Bán Hàng</div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#F4AC00" stroke="#F4AC00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #EBECF0', paddingTop: '10px' }}>
              <span style={{ fontSize: '11px', backgroundColor: '#F1F2F4', color: '#626F86', padding: '2px 6px', borderRadius: '3px' }}>Scrum</span>
              <span style={{ fontSize: '12px', color: '#8590A2' }}>4 thành viên</span>
            </div>
          </div>
          
          {/* Card 2 */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #DCDFE4', borderRadius: '8px', padding: '16px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', backgroundColor: '#1F845A', borderRadius: '6px' }}></div>
              <div style={{ marginLeft: '12px', flex: 1, fontSize: '14px', fontWeight: '600', color: '#172B4D' }}>App Mobile iOS</div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#F4AC00" stroke="#F4AC00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #EBECF0', paddingTop: '10px' }}>
              <span style={{ fontSize: '11px', backgroundColor: '#F1F2F4', color: '#626F86', padding: '2px 6px', borderRadius: '3px' }}>Kanban</span>
              <span style={{ fontSize: '12px', color: '#8590A2' }}>6 thành viên</span>
            </div>
          </div>
          
          {/* Card 3 */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #DCDFE4', borderRadius: '8px', padding: '16px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', backgroundColor: '#A54800', borderRadius: '6px' }}></div>
              <div style={{ marginLeft: '12px', flex: 1, fontSize: '14px', fontWeight: '600', color: '#172B4D' }}>Hệ thống API</div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#C1C7D0" stroke="#C1C7D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #EBECF0', paddingTop: '10px' }}>
              <span style={{ fontSize: '11px', backgroundColor: '#F1F2F4', color: '#626F86', padding: '2px 6px', borderRadius: '3px' }}>Scrum</span>
              <span style={{ fontSize: '12px', color: '#8590A2' }}>2 thành viên</span>
            </div>
          </div>
        </div>
      </div>

      {/* DUOC GIAO CHO TOI */}
      <div>
        <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#8590A2', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
          Được giao cho tôi
        </h2>
        
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #DCDFE4', borderRadius: '8px', overflow: 'hidden' }}>
          
          {/* Header Row */}
          <div style={{ display: 'flex', height: '40px', backgroundColor: '#F7F8F9', borderBottom: '1px solid #DCDFE4', alignItems: 'center', padding: '0 16px', fontSize: '12px', fontWeight: '600', color: '#8590A2', textTransform: 'uppercase' }}>
            <div style={{ flex: 2 }}>Issue</div>
            <div style={{ flex: 1.5 }}>Dự án</div>
            <div style={{ flex: 1 }}>Trạng thái</div>
            <div style={{ flex: 1 }}>Ngày hết hạn</div>
          </div>

          {/* Rows */}
          {[
            { id: 'PRJ-14', title: 'Xây dựng API đăng nhập', project: 'Website Bán Hàng', status: 'Todo', statusColor: '#F1F2F4', textColor: '#626F86', iconColor: '#A54800', date: '30/03/2026' },
            { id: 'PRJ-18', title: 'Thiết kế hệ thống DB', project: 'Hệ thống API', status: 'In Progress', statusColor: '#FFF7D6', textColor: '#A54800', iconColor: '#0C66E4', date: '02/04/2026' },
            { id: 'IOS-04', title: 'Sửa lỗi Push Notification', project: 'App Mobile iOS', status: 'Done', statusColor: '#DCFFF1', textColor: '#1F845A', iconColor: '#AE2A19', date: 'B hôm nay' }
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', height: '48px', alignItems: 'center', padding: '0 16px', borderBottom: i === 2 ? 'none' : '1px solid #EBECF0', cursor: 'pointer', transition: 'background 0.1s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F1F2F4'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}>
              <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '14px', height: '14px', backgroundColor: row.iconColor, borderRadius: '2px' }}></div>
                <span style={{ fontSize: '12px', color: '#0C66E4' }}>{row.id}</span>
                <span style={{ fontSize: '14px', color: '#172B4D' }}>{row.title}</span>
              </div>
              <div style={{ flex: 1.5, fontSize: '12px', color: '#626F86' }}>{row.project}</div>
              <div style={{ flex: 1 }}>
                <span style={{ backgroundColor: row.statusColor, color: row.textColor, fontSize: '11px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '3px' }}>{row.status}</span>
              </div>
              <div style={{ flex: 1, fontSize: '13px', color: '#626F86' }}>{row.date}</div>
            </div>
          ))}

        </div>
      </div>

    </Layout>
  )
}
