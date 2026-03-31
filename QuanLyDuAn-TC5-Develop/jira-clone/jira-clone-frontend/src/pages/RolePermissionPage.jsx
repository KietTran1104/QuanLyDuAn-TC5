import { useState } from 'react'
import Layout from '../components/Layout'

export default function RolePermissionPage({ onLogout }) {
  const [activeRole, setActiveRole] = useState('Admin')

  const roles = [
    { name: 'Admin', count: 1 },
    { name: 'Project Manager', count: 3 },
    { name: 'Developer', count: 8 },
    { name: 'Viewer', count: 2 },
  ]

  const modules = ['Project', 'Issue', 'Comment', 'Sprint', 'Member', 'Settings']
  const perms = ['Xem', 'Tạo', 'Sửa', 'Xóa']

  return (
    <Layout onLogout={onLogout}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#172B4D', margin: '0 0 24px 0' }}>Vai trò & Quyền</h1>
      
      <div style={{ display: 'flex', gap: '32px' }}>
        
        {/* Left Column: Roles List */}
        <div style={{ width: '240px', backgroundColor: '#FFFFFF', border: '1px solid #DCDFE4', borderRadius: '8px', padding: '16px', alignSelf: 'flex-start' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8590A2', textTransform: 'uppercase', marginBottom: '12px' }}>
            Danh sách vai trò
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
            {roles.map(r => (
              <div 
                key={r.name}
                onClick={() => setActiveRole(r.name)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', backgroundColor: activeRole === r.name ? '#E9F2FF' : 'transparent', color: activeRole === r.name ? '#0C66E4' : '#172B4D', fontWeight: activeRole === r.name ? '600' : '500' }}
              >
                <span>{r.name}</span>
                <span style={{ fontSize: '12px', color: '#626F86', backgroundColor: '#F1F2F4', padding: '0 6px', borderRadius: '3px' }}>{r.count}</span>
              </div>
            ))}
          </div>

          <button style={{ width: '100%', height: '32px', backgroundColor: '#FFFFFF', border: '1px solid #DCDFE4', borderRadius: '4px', color: '#172B4D', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}>
            + Tạo vai trò mới
          </button>
        </div>

        {/* Right Column: Permission Matrix */}
        <div style={{ flex: 1, backgroundColor: '#FFFFFF', border: '1px solid #DCDFE4', borderRadius: '8px', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#172B4D', margin: '0 0 8px 0' }}>Phân quyền: {activeRole}</h2>
              <p style={{ fontSize: '14px', color: '#626F86', margin: 0 }}>Chọn các quyền mà vai trò này được phép thực hiện trong hệ thống.</p>
            </div>
            
            <button style={{ height: '32px', padding: '0 16px', backgroundColor: '#0C66E4', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Lưu thay đổi
            </button>
          </div>

          <div style={{ border: '1px solid #DCDFE4', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', backgroundColor: '#F7F8F9', borderBottom: '1px solid #DCDFE4', padding: '12px 16px', fontSize: '12px', fontWeight: 'bold', color: '#626F86', textTransform: 'uppercase' }}>
              <div style={{ flex: 2 }}>Module</div>
              {perms.map(p => <div key={p} style={{ flex: 1, textAlign: 'center' }}>{p}</div>)}
            </div>
            
            {modules.map((m, i) => (
              <div key={m} style={{ display: 'flex', borderBottom: i === modules.length - 1 ? 'none' : '1px solid #EBECF0', padding: '16px', alignItems: 'center' }}>
                <div style={{ flex: 2, fontSize: '14px', fontWeight: '600', color: '#172B4D' }}>{m}</div>
                {perms.map(p => (
                  <div key={p} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <input 
                      type="checkbox" 
                      defaultChecked={activeRole === 'Admin' || (activeRole !== 'Viewer' && p !== 'Xóa') || p === 'Xem'}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }} 
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

        </div>

      </div>
    </Layout>
  )
}
