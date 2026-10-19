export type UserRole = 'student' | 'instructor' | 'admin' | 'super_admin'
export type UserStatus = 'pending_approval' | 'active' | 'suspended' | 'rejected'
export type ExamListStatus = 'pending' | 'approved' | 'reviewed' | 'completed'

export interface Profile {
  id: string
  full_name: string
  cpf: string | null
  birth_date: string
  phone: string | null
  photo_url: string | null
  role: UserRole
  status: UserStatus
  guardian_name: string | null
  guardian_cpf: string | null
  guardian_phone: string | null
  terms_accepted: boolean
  image_rights_accepted: boolean
  health_declaration_accepted: boolean
  created_at: string
  updated_at: string
}

export interface Modality {
  id: string
  name: string
  slug: string
  description: string | null
}

export interface Graduation {
  id: string
  modality_id: string
  level_name: string
  level_order: number
  color_hex: string | null
}

export interface StudentModality {
  id: string
  student_id: string
  modality_id: string
  self_reported_level: string | null
  approved_graduation_id: string | null
  status: UserStatus
  enrolled_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  event_date: string | null
  category: string
  modality_id: string | null
  author_id: string | null
  created_at: string
}

export interface ClassSchedule {
  id: string
  modality_id: string
  title: string
  day_of_week: number
  start_time: string
  end_time: string
  active: boolean
}

export interface Video {
  id: string
  modality_id: string
  min_graduation_id: string | null
  title: string
  description: string | null
  category: string
  video_url: string
  duration_seconds: number | null
  created_at: string
}

export interface Attendance {
  id: string
  student_id: string
  class_schedule_id: string | null
  class_date: string
  present: boolean
  recorded_by: string | null
  created_at: string
}

export interface TechnicalProgress {
  id: string
  student_id: string
  modality_id: string
  evaluation_date: string
  posture_score: number | null
  technique_score: number | null
  focus_score: number | null
  notes: string | null
  instructor_id: string | null
  created_at: string
}

export interface ExamList {
  id: string
  title: string
  modality_id: string | null
  instructor_id: string
  notes: string | null
  status: ExamListStatus
  created_at: string
  updated_at: string
  reviewed_by: string | null
  reviewed_at: string | null
}

export interface ExamListCandidate {
  id: string
  exam_list_id: string
  student_id: string
  target_graduation_id: string | null
  instructor_notes: string | null
  created_at: string
}