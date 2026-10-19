import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { StudentHub, type DetailedStudent } from '@/components/admin/StudentHub'

export const instant = false


interface RawModalityObj {
  id: string
  name: string
}

interface RawGradObj {
  level_name: string
  color_hex: string | null
}

interface RawStudentModObj {
  id: string
  status: string
  self_reported_level: string | null
  modality: RawModalityObj | RawModalityObj[] | null
  approved_graduation: RawGradObj | RawGradObj[] | null
}

export default async function AdminAlunosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['instructor', 'admin', 'super_admin'].includes(profile.role)) {
    redirect('/aluno')
  }

  const adminClient = createAdminClient()

  // Busca todos os alunos cadastrados com suas modalidades, graduação e contagem de presenças
  const { data: rawStudents } = await adminClient
    .from('profiles')
    .select(`
      id,
      full_name,
      cpf,
      phone,
      birth_date,
      photo_url,
      role,
      status,
      guardian_name,
      guardian_phone,
      created_at,
      student_modalities(
        id,
        status,
        self_reported_level,
        modality:modalities(id, name),
        approved_graduation:graduations(level_name, color_hex)
      ),
      attendance:attendance!attendance_student_id_fkey(id)
    `)
    .neq('role', 'super_admin')
    .order('full_name', { ascending: true })

  const students: DetailedStudent[] = (rawStudents ?? []).map((s) => {
    const rawModalities = (Array.isArray(s.student_modalities) ? s.student_modalities : []) as RawStudentModObj[]

    const modalitiesList = rawModalities.map((sm) => {
      const rawMod = sm.modality
      const mod = Array.isArray(rawMod) ? rawMod[0] : rawMod
      const rawGrad = sm.approved_graduation
      const grad = Array.isArray(rawGrad) ? rawGrad[0] : rawGrad
      const name = mod?.name ?? 'Kung Fu Shaolin'

      let short = 'CLF'
      const norm = name.toLowerCase()
      if (norm.includes('tai')) short = 'Tai Chi'
      else if (norm.includes('sanda')) short = 'Sanda'
      else if (norm.includes('tang')) short = 'Tang Lang'
      else if (norm.includes('choy') || norm.includes('kung')) short = 'CLF'
      else short = name.slice(0, 7)

      return {
        id: sm.id,
        modalityName: name,
        shortName: short,
        graduationName: grad?.level_name ?? sm.self_reported_level ?? 'Faixa Branca',
        graduationColor: grad?.color_hex ?? '#FF8C00',
      }
    })

    const activeMod = rawModalities[0]
    const rawModality = activeMod?.modality
    const modalityName = Array.isArray(rawModality) ? rawModality[0]?.name : rawModality?.name ?? 'Kung Fu Shaolin'
    const modalityId = Array.isArray(rawModality) ? rawModality[0]?.id : rawModality?.id ?? ''

    const rawGrad = activeMod?.approved_graduation
    const grad = Array.isArray(rawGrad) ? rawGrad[0] : rawGrad
    const graduationName = grad?.level_name ?? activeMod?.self_reported_level ?? 'Faixa Laranja'
    const graduationColor = grad?.color_hex ?? '#FF8C00'

    const attList = (s.attendance as unknown as { id: string }[]) ?? []

    return {
      id: s.id,
      full_name: s.full_name,
      cpf: s.cpf,
      phone: s.phone,
      birth_date: s.birth_date,
      photo_url: s.photo_url,
      role: s.role,
      status: s.status,
      guardian_name: s.guardian_name,
      guardian_phone: s.guardian_phone,
      created_at: s.created_at,
      modalityName,
      modalityId,
      graduationName,
      graduationColor,
      attendanceCount: attList.length,
      modalitiesList,
    }
  })

  return (
    <main className="page-container py-5 sm:py-6 flex flex-col gap-5 sm:gap-6 animate-fade-in">
      {/* Cabeçalho da Central de Alunos */}
      <div className="section-header pb-2 border-b border-[var(--color-border)]">
        <div>
          <h1 className="nkfs-h-m text-main font-bold">Gestão & Busca de Alunos</h1>
          <p className="nkfs-p-m text-muted mt-0.5">
            Acompanhe o desenvolvimento técnico, preencha a ficha de treino ou envie recados personalizados.
          </p>
        </div>
      </div>

      <StudentHub initialStudents={students} currentUserRole={profile.role} />
    </main>
  )
}
