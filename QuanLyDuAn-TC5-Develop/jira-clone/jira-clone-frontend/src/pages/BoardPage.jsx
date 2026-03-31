import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../services/api'
import { useToast } from '../components/Toast'
import { compareBoardPosition, calculateNewBoardPosition } from '../services/lexorank'
import {
  DndContext, DragOverlay,
  KeyboardSensor, PointerSensor,
  useSensor, useSensors,
  defaultDropAnimationSideEffects,
  MeasuringStrategy,
  closestCorners,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates,
  horizontalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import KanbanColumn from '../components/KanbanColumn'
import KanbanIssue from '../components/KanbanIssue'
import IssueDetailDrawer from '../components/IssueDetailDrawer'

function sortIssuesByPosition(list) {
  return [...list].sort((a, b) => compareBoardPosition(a.boardPosition, b.boardPosition))
}

function sameId(a, b) {
  return String(a) === String(b)
}

/** Trích xuất column.id từ droppable id (hỗ trợ cả "col-body-5" và số 5) */
function extractColumnId(droppableId) {
  const s = String(droppableId)
  if (s.startsWith('col-body-')) return s.replace('col-body-', '')
  return s
}

/** Kiểm tra id có phải là droppable của cột không */
function isColumnDroppable(id, columns) {
  const colId = extractColumnId(id)
  return columns.some(c => sameId(c.id, colId))
}

export default function BoardPage({ onLogout }) {
  const { id } = useParams()
  const { addToast } = useToast()

  const [columns, setColumns]         = useState([])
  const [issues, setIssues]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [overColumnId, setOverColumnId] = useState(null) // kiểm soát isOver prop

  const [activeColumn, setActiveColumn] = useState(null)
  const [activeIssue,  setActiveIssue]  = useState(null)
  const [selectedIssueId, setSelectedIssueId] = useState(null)

  const columnsSnapshotRef = useRef([])
  const issuesSnapshotRef  = useRef([])
  const lastOverIdRef      = useRef(null)   // cho collision detection

  // Refs để dùng trong useCallback mà không cần dependency
  const columnsRef = useRef(columns)
  const issuesRef  = useRef(issues)
  useEffect(() => { columnsRef.current = columns }, [columns])
  useEffect(() => { issuesRef.current = issues }, [issues])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => { fetchBoardData() }, [id])

  const fetchBoardData = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [statusRes, issueRes] = await Promise.all([
        api.getStatusesByProject(id),
        api.getIssuesByProject(id),
      ])
      setColumns(statusRes.data || [])
      setIssues(sortIssuesByPosition(issueRes.data || []))
    } catch {
      if (!silent) addToast('Lỗi khi tải dữ liệu bảng', 'error')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Custom collision detection
  // Khi kéo cột → closestCorners trong các cột
  // Khi kéo issue → pointerWithin (ưu tiên) → rectIntersection → closestCorners
  // ─────────────────────────────────────────────────────────────────────────
  const collisionDetection = useCallback((args) => {
    const cols = columnsRef.current

    // Đang kéo CỘT: chỉ tìm các cột khác
    if (activeColumn) {
      return closestCorners({
        ...args,
        droppableContainers: args.droppableContainers.filter(c =>
          cols.some(col => sameId(col.id, c.id))
        ),
      })
    }

    // Đang kéo ISSUE: dùng pointerWithin trước rồi rectIntersection
    const pointerHits = pointerWithin(args)
    const hits = pointerHits.length > 0 ? pointerHits : rectIntersection(args)

    let overId = getFirstCollision(hits, 'id')

    if (overId != null) {
      const colIdStr = extractColumnId(overId)
      const isAColumn = cols.some(c => sameId(c.id, colIdStr))

      if (isAColumn) {
        // Hover vào vùng thân cột → tìm issue gần nhất trong cột đó
        const colIssues = issuesRef.current.filter(i => sameId(i.statusId, colIdStr))
        if (colIssues.length > 0) {
          const closest = closestCorners({
            ...args,
            droppableContainers: args.droppableContainers.filter(c =>
              colIssues.some(i => sameId(i.id, c.id))
            ),
          })
          if (closest.length > 0) {
            overId = closest[0].id
          }
        }
      }

      lastOverIdRef.current = overId
      return [{ id: overId }]
    }

    // Fallback: dùng overId lần trước nếu con trỏ ra ngoài tạm thời
    return lastOverIdRef.current ? [{ id: lastOverIdRef.current }] : []
  }, [activeColumn])

  // ─────────────────────────────────────────────────────────────────────────
  // Drag Start
  // ─────────────────────────────────────────────────────────────────────────
  const handleDragStart = useCallback((event) => {
    const { active } = event
    const type = active.data.current?.type

    if (type === 'Column') {
      const col = columnsRef.current.find(c => sameId(c.id, active.id))
      setActiveColumn(col || null)
      columnsSnapshotRef.current = columnsRef.current
    } else if (type === 'Issue') {
      const iss = issuesRef.current.find(i => sameId(i.id, active.id))
      setActiveIssue(iss || null)
      issuesSnapshotRef.current = issuesRef.current
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // Drag Over — CHỈ cập nhật statusId khi issue đi qua cột KHÁC
  // Không cập nhật khi di chuyển trong cùng cột → tránh giật
  // ─────────────────────────────────────────────────────────────────────────
  const handleDragOver = useCallback((event) => {
    const { active, over } = event
    if (!over) return
    if (active.data.current?.type !== 'Issue') return   // chỉ xử lý issue drag

    const activeId = active.id
    const overId   = over.id

    // Tìm statusId của over target
    let newStatusId = null
    const overType = over.data.current?.type

    if (overType === 'Issue') {
      // over là issue → lấy statusId của nó
      const overIssue = issuesRef.current.find(i => sameId(i.id, overId))
      newStatusId = overIssue?.statusId
    } else if (overType === 'ColumnBody') {
      // over là phần body cột (id = "col-body-X")
      newStatusId = over.data.current?.column?.id
    } else if (overType === 'Column') {
      newStatusId = over.data.current?.column?.id
    }

    if (newStatusId == null) return

    const activeIssue = issuesRef.current.find(i => sameId(i.id, activeId))
    if (!activeIssue) return

    // CHỈ cập nhật khi thật sự đổi cột → tránh re-render thừa
    if (sameId(newStatusId, activeIssue.statusId)) return

    setOverColumnId(String(newStatusId))
    setIssues(prev => prev.map(i =>
      sameId(i.id, activeId) ? { ...i, statusId: newStatusId } : i
    ))
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // Drag End
  // ─────────────────────────────────────────────────────────────────────────
  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event
    setActiveColumn(null)
    setActiveIssue(null)
    setOverColumnId(null)
    lastOverIdRef.current = null

    if (!over) {
      // Cancel → rollback
      if (columnsSnapshotRef.current.length) setColumns(columnsSnapshotRef.current)
      if (issuesSnapshotRef.current.length)  setIssues(issuesSnapshotRef.current)
      columnsSnapshotRef.current = []
      issuesSnapshotRef.current  = []
      return
    }

    const type = active.data.current?.type

    // ══ CASE 1: Kéo thả CỘT ══════════════════════════════════════════════
    if (type === 'Column') {
      const cols = columnsRef.current
      const activeColId = active.id
      const overColId   = over.id

      if (sameId(activeColId, overColId)) { columnsSnapshotRef.current = []; return }

      const oldIdx = cols.findIndex(c => sameId(c.id, activeColId))
      const newIdx = cols.findIndex(c => sameId(c.id, overColId))

      if (oldIdx === -1 || newIdx === -1) { columnsSnapshotRef.current = []; return }

      const reordered = arrayMove(cols, oldIdx, newIdx)
      const positions = reordered.map((col, idx) => ({
        statusId: col.id,
        boardPosition: idx,
      }))

      const optimistic = reordered.map((col, idx) => ({ ...col, boardPosition: idx }))
      setColumns(optimistic)
      columnsSnapshotRef.current = []

      try {
        const res = await api.reorderStatuses(positions)
        if (res.ok && res.data) {
          setColumns(res.data)
        } else {
          addToast(res.data?.message || 'Sắp xếp cột thất bại', 'error')
          setColumns(columnsSnapshotRef.current)
          fetchBoardData(true)
        }
      } catch {
        addToast('Mất kết nối khi sắp xếp cột', 'error')
        setColumns(columnsSnapshotRef.current)
        columnsSnapshotRef.current = []
        fetchBoardData(true)
      }
      return
    }

    // ══ CASE 2: Kéo thả ISSUE (LexoRank) ══════════════════════════════════
    if (type === 'Issue') {
      const currentIssues = issuesRef.current
      const activeId = active.id
      const overId   = over.id

      const activeIssueData = currentIssues.find(i => sameId(i.id, activeId))
      if (!activeIssueData) { issuesSnapshotRef.current = []; return }

      // Xác định statusId đích
      let targetStatusId = activeIssueData.statusId
      const overType = over.data.current?.type
      if (overType === 'Issue') {
        const overIssue = currentIssues.find(i => sameId(i.id, overId))
        targetStatusId = overIssue?.statusId ?? targetStatusId
      } else if (overType === 'ColumnBody' || overType === 'Column') {
        targetStatusId = over.data.current?.column?.id ?? targetStatusId
      }

      // Issues đích (không có activeIssue)
      const destIssues = currentIssues
        .filter(i => sameId(i.statusId, targetStatusId) && !sameId(i.id, activeId))

      // Tính insertIndex
      let insertIndex = destIssues.length
      if (overType === 'Issue') {
        const overInDest = destIssues.findIndex(i => sameId(i.id, overId))
        if (overInDest !== -1) {
          const snap = issuesSnapshotRef.current
          const sameCol = snap.filter(i => sameId(i.statusId, targetStatusId))
          const aIdx = sameCol.findIndex(i => sameId(i.id, activeId))
          const oIdx = sameCol.findIndex(i => sameId(i.id, overId))
          insertIndex = aIdx < oIdx ? overInDest + 1 : overInDest
        }
      }

      const newBoardPosition = calculateNewBoardPosition(destIssues, insertIndex)
      const optimisticIssue  = {
        ...activeIssueData,
        statusId: targetStatusId,
        boardPosition: newBoardPosition,
      }

      setIssues(prev => sortIssuesByPosition([
        ...prev.filter(i => !sameId(i.id, activeId)),
        optimisticIssue,
      ]))
      issuesSnapshotRef.current = []

      try {
        const res = await api.moveIssue(activeIssueData.id, {
          newStatusId: targetStatusId,
          newBoardPosition: newBoardPosition,
          version: activeIssueData.version ?? null,
        })

        if (res.ok && res.data) {
          setIssues(prev => sortIssuesByPosition(
            prev.map(i => sameId(i.id, activeId)
              ? { ...optimisticIssue, version: res.data.version }
              : i
            )
          ))
        } else {
          addToast(res.data?.message || 'Cập nhật vị trí thất bại', 'error')
          setIssues(issuesSnapshotRef.current)
          issuesSnapshotRef.current = []
          fetchBoardData(true)
        }
      } catch {
        addToast('Mất kết nối, đã khôi phục', 'error')
        setIssues(issuesSnapshotRef.current)
        issuesSnapshotRef.current = []
        fetchBoardData(true)
      }
    }
  }, [id])

  const handleIssueUpdated = (updatedIssue) => {
    setIssues(prev => sortIssuesByPosition(
      prev.map(i => i.id === updatedIssue.id ? updatedIssue : i)
    ))
  }

  // ─── Quick Create Issue inline trong cột ───
  const handleQuickCreate = async (summary, statusId) => {
    try {
      const res = await api.createIssue({
        projectId: Number(id),
        type: 'task',                // mặc định Task, user có thể đổi sau trong drawer
        summary,
        statusId: Number(statusId),
      })

      if (res.ok && res.data) {
        // Thêm issue mới vào state ngay (không reload toàn bộ)
        setIssues(prev => sortIssuesByPosition([...prev, res.data]))
        addToast(`Đã tạo: ${summary}`, 'success')
      } else {
        const msg = res.data?.message || 'Tạo issue thất bại'
        addToast(msg, 'error')
        throw new Error(msg)
      }
    } catch (e) {
      addToast(e.message || 'Lỗi kết nối server', 'error')
      throw e   // cho QuickCreateIssue hiển lỗi
    }
  }

  const handleIssueClick = (issueId) => setSelectedIssueId(issueId)

  const columnIds = columns.map(c => c.id)

  return (
    <Layout projectId={id || 'WEB'} onLogout={onLogout}>

      {/* TOOLBAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#172B4D', margin: 0 }}>
            Bảng nội dung (Kanban)
          </h1>
          <span style={{
            fontSize: '11px', color: '#626F86', backgroundColor: '#F1F2F4',
            padding: '2px 8px', borderRadius: '12px', border: '1px solid #DFE1E6',
          }}>
            ⠿ Kéo header cột để sắp xếp
          </span>
        </div>
        <div style={{ display: 'flex' }}>
          {['K', 'M', 'D', 'H'].map((initial, i) => (
            <div key={i} title="Team Member" style={{
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: ['#0C66E4', '#1F845A', '#A54800', '#626F86'][i],
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
              border: '2px solid white', marginLeft: i > 0 ? '-8px' : '0',
            }}>{initial}</div>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#626F86' }}>Đang tải bảng...</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', minHeight: '600px', alignItems: 'flex-start' }}>

              {columns.map((col) => {
                const columnIssues = issues.filter(i => sameId(i.statusId, col.id))
                return (
                  <KanbanColumn
                    key={col.id}
                    column={col}
                    issues={columnIssues}
                    onIssueClick={handleIssueClick}
                    isOver={overColumnId != null && sameId(overColumnId, col.id)}
                    projectId={id}
                    onQuickCreate={handleQuickCreate}
                  />
                )
              })}

              <div style={{
                width: '260px', minWidth: '260px', flexShrink: 0,
                backgroundColor: 'transparent',
                border: '2px dashed #DCDFE4', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', height: '48px', color: '#626F86',
                fontSize: '14px', fontWeight: '600',
              }}>
                + Tạo cột mới
              </div>

            </div>
          </SortableContext>

          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } })
          }}>
            {activeColumn ? (
              <ColumnDragOverlay
                column={activeColumn}
                issues={issues.filter(i => sameId(i.statusId, activeColumn.id))}
              />
            ) : activeIssue ? (
              <KanbanIssue issue={activeIssue} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

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

/** Preview cột trong DragOverlay */
function ColumnDragOverlay({ column, issues }) {
  return (
    <div style={{
      width: '280px', backgroundColor: '#E8F0FE',
      border: '2px solid #0C66E4', borderRadius: '8px',
      padding: '10px 12px', opacity: 0.92,
      boxShadow: '0 16px 40px rgba(9,30,66,0.3)', cursor: 'grabbing',
    }}>
      <div style={{
        fontSize: '12px', fontWeight: '700', color: '#0C66E4',
        textTransform: 'uppercase', marginBottom: '8px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>{column.name}</span>
        <span style={{ backgroundColor: '#0C66E4', color: 'white', padding: '1px 7px', borderRadius: '12px', fontSize: '11px' }}>
          {issues.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {issues.slice(0, 3).map(issue => (
          <div key={issue.id} style={{
            backgroundColor: 'white', border: '1px solid #DCDFE4',
            borderRadius: '4px', padding: '7px 10px',
            fontSize: '13px', color: '#172B4D',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {issue.summary}
          </div>
        ))}
        {issues.length > 3 && (
          <div style={{ fontSize: '12px', color: '#0C66E4', textAlign: 'center', padding: '2px' }}>
            +{issues.length - 3} issue khác
          </div>
        )}
      </div>
    </div>
  )
}
