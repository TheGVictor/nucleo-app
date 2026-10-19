import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  ExamManager,
  type StudentCandidateOption,
  type StudentCandidateModality,
} from '@/components/admin/ExamManager'
import { getExamListsAction } from '@/app/admin/exames/actions'

export const instant = false


interface RawModality {
  id: string
  name: string
  slug: string
}

interface RawGraduation {
  id: string
  modality_id: string
  level_name: string
  level_order: number
  color_hex: string | null
}

export default async function AdminExamesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['instructor', 'admin', 'super_admin'].includes(profile.role)) {
    redirect('/aluno')
  }

  const adminClient = createAdminClient()

  const [modalitiesRes, graduationsRes, examListsRes, studentsRes] = await Promise.all([
    adminClient.from('modalities').select('id, name, slug').order('name'),
    adminClient
      .from('graduations')
      .select('id, modality_id, level_name, level_order, color_hex')
      .order('level_order', { ascending: true }),
    getExamListsAction(),
    adminClient
      .from('profiles')
      .select(`
        id,
        full_name,
        status,
        student_modalities(
          status,
          modality_id,
          self_reported_level,
          modality:modalities(id, name, slug),
          approved_graduation:graduations(id, level_name, color_hex, level_order)
        )
      `)
      .neq('role', 'super_admin')
      .order('full_name', { ascending: true }),
  ])

  const modalities = (modalitiesRes.data as RawModality[]) ?? []
  const graduations = (graduationsRes.data as RawGraduation[]) ?? []
  const examLists = examListsRes.data ?? []

  interface RawStudentModality {
    status?: string
    modality_id?: string
    self_reported_level?: string | null
    modality?: { id?: string; name?: string; slug?: string } | Array<{ id?: string; name?: string; slug?: string }> | null
    approved_graduation?:
      | { id?: string; level_name?: string; color_hex?: string | null; level_order?: number }
      | Array<{ id?: string; level_name?: string; color_hex?: string | null; level_order?: number }>
      | null
  }

  interface RawStudentProfile {
    id: string
    full_name: string | null
    status?: string
    student_modalities?: RawStudentModality | RawStudentModality[] | null
  }

  const rawStudents = (studentsRes.data as unknown as RawStudentProfile[]) ?? []
  const students: StudentCandidateOption[] = rawStudents
    .filter((s) => s.full_name && s.full_name.trim().length > 0 && s.status !== 'rejected')
    .map((s) => {
      const modalitiesList = Array.isArray(s.student_modalities)
        ? s.student_modalities
        : s.student_modalities
        ? [s.student_modalities]
        : []

      const mappedMods: StudentCandidateModality[] = modalitiesList.map((sm) => {
        const rawMod = sm.modality
        const mod = Array.isArray(rawMod) ? rawMod[0] : rawMod
        const rawGrad = sm.approved_graduation
        const gradObj = Array.isArray(rawGrad) ? rawGrad[0] : rawGrad

        return {
          modality_id: sm.modality_id || mod?.id || '',
          modality_name: mod?.name || 'Modalidade',
          current_graduation_id: gradObj?.id || null,
          graduation_name: gradObj?.level_name || sm.self_reported_level || 'Iniciante',
          graduation_color: gradObj?.color_hex || undefined,
          level_order: gradObj?.level_order ?? 0,
        }
      })

      return {
        id: s.id,
        full_name: s.full_name?.trim() || 'Sem nome',
        modalities: mappedMods,
      }
    })

  return (
    <main className="page-container py-5 sm:py-6 flex flex-col gap-5 sm:gap-6 animate-fade-in">
      <div className="section-header pb-2 border-b border-[var(--color-border)]">
        <div>
          <h1 className="nkfs-h-m text-main font-bold">
            {profile.role === 'super_admin' ? 'Banca & Homologação de Exames' : 'Listas de Exame ao Sifu'}
          </h1>
          <p className="nkfs-p-m text-muted mt-0.5">
            {profile.role === 'super_admin'
              ? 'Gerencie e homologue as listas de candidatos enviadas pelos instrutores da escola.'
              : 'Selecione seus alunos aptos, indique as próximas faixas e submeta a lista oficial ao Sifu.'}
          </p>
        </div>
      </div>

      <ExamManager
        initialLists={examLists}
        modalities={modalities}
        graduations={graduations}
        students={students}
        currentUserRole={profile.role}
        currentUserId={user.id}
      />
    </main>
  )
}
