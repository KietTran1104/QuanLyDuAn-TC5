import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../services/api'
import { useToast } from '../components/Toast'
import { 
  DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, 
  useSensor, useSensors, defaultDropAnimationSideEffects 
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import KanbanColumn from '../components/KanbanColumn'
import KanbanIssue from '../components/KanbanIssue'
import IssueDetailDrawer from '../components/IssueDetailDrawer'

export default function BoardPage({ onLogout }) {
  const { id } = useParams()
  const { addToast } = useToast()
  
  const [columns, setColumns] = useState([])
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [activeIssue, setActiveIssue] = useState(null)
  const [selectedIssueId, setSelectedIssueId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    fetchBoardData()
  }, [id])

  const fetchBoardData = async () => {
    setLoading(true)
    try {
      const [statusRes, issueRes] = await Promise.all([
        api.getStatusesByProject(id),
        api.getIssuesByProject(id)
      ])
      setColumns(statusRes.data || [])
      setIssues(issueRes.data || [])
    } catch (e) {
      addToast('error', 'Lỗi khi tải dữ liệu bảng')
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (event) => {
    const { active } = event
    const draggedIssue = issues.find(i => i.id === active.id)
    setActiveIssue(draggedIssue)
  }

  const handleDragOver = () => {}

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveIssue(null)

    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Issue'
    const isOverTask = over.data.current?.type === 'Issue'
    const isOverColumn = over.data.current?.type === 'Column'

    let newStatusId = null
    
    const activeIndex = issues.findIndex(i => i.id === activeId)
    const activeIssueData = issues[activeIndex]

    if (isActiveTask && isOverTask) {
      const overIndex = issues.findIndex(i => i.id === overId)
      newStatusId = issues[overIndex].statusId
      
      setIssues(prev => {
        const next = [...prev]
        next[activeIndex] = { ...next[activeIndex], statusId: newStatusId }
        return arrayMove(next, activeIndex, overIndex)
      })
    } 
    else if (isActiveTask && isOverColumn) {
      newStatusId = overId
      setIssues(prev => {
        const next = [...prev]
        next[activeIndex] = { ...next[activeIndex], statusId: newStatusId }
        return next
      })
    }

    if (newStatusId && newStatusId !== activeIssueData.statusId) {
      try {
        await api.moveIssue(activeId, {
          newStatusId: newStatusId,
        })
      } catch (e) {
        addToast('error', 'Cập nhật trạng thái thất bại')
        fetchBoardData()
      }
    }
  }

  // When the drawer updates an issue, sync it in our local state
  const handleIssueUpdated = (updatedIssue) => {
    setIssues(prev => prev.map(i => i.id === updatedIssue.id ? updatedIssue : i))
  }

  // Called from KanbanIssue click
  const handleIssueClick = (issueId) => {
    setSelectedIssueId(issueId)
  }

  return (
    <Layout projectId={id || 'WEB'} onLogout={onLogout}>
      
      {/* TOOLBAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#172B4D', margin: 0 }}>Bảng nội dung (Kanban)</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex' }}>
            {['K', 'M', 'D', 'H'].map((initial, i) => (
              <div key={i} title="Team Member" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: ['#0C66E4', '#1F845A', '#A54800', '#626F86'][i], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', border: '2px solid white', marginLeft: i > 0 ? '-8px' : '0' }}>
                {initial}
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#626F86' }}>Đang tải bảng...</div>
      ) : (
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', minHeight: '600px' }}>
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCorners} 
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {columns.map((col) => {
              const columnIssues = issues.filter(i => i.statusId === col.id)
              return <KanbanColumn key={col.id} column={col} issues={columnIssues} onIssueClick={handleIssueClick} />
            })}
            
            <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
              {activeIssue ? <KanbanIssue issue={activeIssue} /> : null}
            </DragOverlay>
          </DndContext>
          
          <div style={{ width: '280px', minWidth: '280px', backgroundColor: 'transparent', border: '2px dashed #DCDFE4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', height: '48px', color: '#626F86', fontSize: '14px', fontWeight: 'bold' }}>
            + Tạo cột mới
          </div>
        </div>
      )}

      {/* Issue Detail Drawer */}
      {selectedIssueId && (
        <IssueDetailDrawer 
          issueId={selectedIssueId}
          statuses={columns}
          onClose={() => setSelectedIssueId(null)}
          onIssueUpdated={handleIssueUpdated}
        />
      )}

    </Layout>
  )
}
