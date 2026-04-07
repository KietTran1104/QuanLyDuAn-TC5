import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import ProjectPinModal from './ProjectPinModal'
import LoadingScreen from './LoadingScreen'

export default function ProjectGuard({ children }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    const checkPin = async () => {
      setLoading(true)
      try {
        const res = await api.getProject(id)
        if (res.ok) {
          const proj = res.data
          setProject(proj)
          
          // Check if project has PIN
          if (!proj.pin) {
            setIsVerified(true)
          } else {
            // Check session storage
            const sessionKey = `project_unlock_${id}`
            if (sessionStorage.getItem(sessionKey) === 'true') {
              setIsVerified(true)
            } else {
              setIsVerified(false)
            }
          }
        }
      } catch (err) {
        console.error('Error checking project PIN:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      checkPin()
    }
  }, [id])

  const handleVerify = () => {
    sessionStorage.setItem(`project_unlock_${id}`, 'true')
    setIsVerified(true)
  }

  const handleCancel = () => {
    navigate('/projects')
  }

  if (loading) return <LoadingScreen />

  if (!isVerified && project?.pin) {
    return (
      <ProjectPinModal 
        project={project} 
        onVerify={handleVerify} 
        onCancel={handleCancel} 
      />
    )
  }

  return children
}
