import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Users } from 'lucide-react'
import classService from '@/services/classService'

const StudentList = ({ classId }) => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const response = await classService.getStudentsInClass(classId)
        const studentData = response.data?.data || []
        setStudents(studentData)
      } catch (error) {
        console.error('Lỗi khi tải danh sách sinh viên:', error)
      } finally {
        setLoading(false)
      }
    }

    if (classId) {
      fetchStudents()
    }
  }, [classId])

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase()
    return (
      student.ten?.toLowerCase().includes(searchLower)
    )
  })

  const getAvatarDisplay = (student) => {
    if (student.avatar) {
      return (
        <img 
          src={student.avatar} 
          alt={student.ten} 
          className="w-10 h-10 rounded-full object-cover"
        />
      )
    }
    
    // Get initials from last name (Vietnamese pattern: Họ Đệm Tên)
    const userName = student.ten?.trim() || student.email?.split('@')[0] || ''
    let initials = '?'
    if (userName && userName.length > 0) {
      const nameParts = userName.trim().split(/\s+/)
      const firstName = nameParts[nameParts.length - 1]
      initials = firstName.charAt(0).toUpperCase()
    } else if (student.email) {
      initials = student.email.charAt(0).toUpperCase()
    }
    
    // Random color based on student id/email (consistent for same student)
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500']
    const seedString = student.id || student.email || userName || 'default'
    
    // Simple hash function
    let hash = 0
    for (let i = 0; i < seedString.length; i++) {
      hash = seedString.charCodeAt(i) + ((hash << 5) - hash)
    }
    const colorIndex = Math.abs(hash) % colors.length
    const bgColor = colors[colorIndex]
    
    return (
      <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-semibold`}>
        {initials}
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            <CardTitle className="text-xl">Danh sách sinh viên</CardTitle>
            <Badge variant="secondary" className="ml-2">
              {filteredStudents.length} sinh viên
            </Badge>
          </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm theo tên sinh viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'Không tìm thấy sinh viên phù hợp' : 'Chưa có sinh viên nào trong lớp'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student, index) => (
              <div
                key={student.id || index}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {getAvatarDisplay(student)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {student.ten}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default StudentList
