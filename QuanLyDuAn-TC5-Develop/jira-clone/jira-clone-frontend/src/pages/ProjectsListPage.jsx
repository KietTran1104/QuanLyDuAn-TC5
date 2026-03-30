import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../services/api'
import { useToast } from '../components/Toast'
import CreateProjectModal from '../components/CreateProjectModal'

export default function ProjectsListPage({ onLogout }) {
  const [activeTab, setActiveTab] = useState('all')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  
  const { addToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await api.getMyProjects()
      setProjects(res.data)
    } catch (e) {
      addToast('error', 'Không thể tải danh sách dự án. Vui lòng tải lại trang.')
    } finally {
      setLoading(false)
    }
  }

  // The backend might not support starred feature yet, but we mock it frontend-side for now
  const filtered = projects.filter(p => activeTab === 'all' || (activeTab === 'starred' && p.starred))

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}/board`)
  }

  return (
    <Layout onLogout={onLogout}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#172B4D', margin: 0 }}>Dự án</h1>
        <button 
          onClick={() => setShowModal(true)}
          style={{ height: '32px', padding: '0 12px', backgroundColor: '#0C66E4', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          + Tạo dự án
        </button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #DCDFE4', marginBottom: '24px' }}>
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'mine', label: 'Của tôi' },
          { id: 'starred', label: '⭐ Đã đánh dấu' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #0C66E4' : '2px solid transparent', color: activeTab === tab.id ? '#0C66E4' : '#626F86', fontSize: '14px', fontWeight: activeTab === tab.id ? '600' : '500', cursor: 'pointer' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#626F86' }}>Đang tải danh sách dự án...</div>
      ) : filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map(project => (
            <div 
              key={project.id} 
              onClick={() => handleProjectClick(project.id)}
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #DCDFE4', borderRadius: '8px', padding: '16px', cursor: 'pointer', position: 'relative', transition: 'box-shadow 0.2s', ':hover': { boxShadow: '0 4px 8px rgba(9,30,66,0.1)' } }}
            >
              
              <button style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#626F86" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: project.iconUrl || '#0C66E4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 'bold' }}>
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#172B4D', marginBottom: '2px' }}>{project.name}</div>
                  <div style={{ fontSize: '12px', color: '#626F86' }}>Khóa: {project.keyPrefix}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #EBECF0', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', backgroundColor: '#F1F2F4', color: '#626F86', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {project.templateType || 'Scrum'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#8590A2' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    {project.membersCount || 1}
                  </div>
                </div>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); /* TODO: api.toggleStar */ }} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={project.starred ? '#F4AC00' : 'none'} stroke={project.starred ? '#F4AC00' : '#8590A2'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#DCDFE4" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#172B4D', marginBottom: '8px' }}>Bạn chưa có dự án nào</div>
          <p style={{ fontSize: '14px', color: '#626F86', margin: 0 }}>Tạo một dự án mới để bắt đầu quản lý công việc.</p>
        </div>
      )}

      {showModal && (
        <CreateProjectModal 
          onClose={() => setShowModal(false)}
          onProjectCreated={(newProject) => {
            setProjects([...projects, newProject])
          }}
        />
      )}
    </Layout>
  )
}
