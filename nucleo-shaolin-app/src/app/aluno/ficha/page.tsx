import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { TechnicalSheet } from '@/components/technical/TechnicalSheet'
import { getStudentTechnicalSheetAction } from '@/app/admin/attendance/technicalActions'

interface GraduationHistoryItem {
  id: string
  promoted_at: string
  notes: string | null
  modality: { name: string } | null
  graduation: { level_name: string; color_hex: string | null } | null
}

export default async function AlunoFichaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Carrega Perfil, Histórico de Graduações e a Ficha Técnica
  const [profileRes, gradHistoryRes, technicalSheetRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('graduation_history')
      .select('*, modality:modalities(name), graduation:graduations(level_name, color_hex)')
      .eq('student_id', user.id)
      .order('promoted_at', { ascending: false }),
    getStudentTechnicalSheetAction(user.id),
  ])

  const profile = profileRes.data
  if (!profile) redirect('/login')

  const graduationHistory = gradHistoryRes.data
  const technicalData = technicalSheetRes.data

  return (
    <main className="page-container py-5 flex flex-col gap-6 animate-fade-in">
      {/* ── CABEÇALHO DO ALUNO COM STATUS MARCIAL ──────────────── */}
      <div className="card-gold p-6 text-center flex flex-col items-center relative overflow-hidden shadow-gold">
        <Avatar name={profile.full_name} size="xl" gold />
        <h1 className="nkfs-h-m text-main font-extrabold mt-3">{profile.full_name}</h1>
        <p className="nkfs-p-m text-muted mt-0.5">Registro Oficial do Praticante</p>

        <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
          <Badge variant="gold">Aluno Oficial Shaolin</Badge>
          <Badge variant="success">Matrícula Ativa</Badge>
          <span className="nkfs-tag-p text-faint">
            Membro desde{' '}
            {new Date(profile.created_at).toLocaleDateString('pt-BR', {
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* ── FICHA DE ACOMPANHAMENTO TÉCNICO OFICIAL ─────────────── */}
      <section className="flex flex-col gap-3">
        <div className="section-header">
          <div className="flex items-center gap-2">
            <h2 className="section-title nkfs-tag-m text-gold">
              Ficha de Acompanhamento Técnico
            </h2>
            <Badge variant="gold">
              {technicalData?.graduationName || 'Faixa Oficial'}
            </Badge>
          </div>
          <span className="nkfs-tag-p text-muted">Controle de Técnicas & Katis</span>
        </div>

        {technicalData ? (
          <TechnicalSheet
            student={technicalData.student}
            initialState={technicalData.sheetState}
            isInstructor={false}
            modalityName={technicalData.modalityName}
            graduationName={technicalData.graduationName}
            graduationColor={technicalData.graduationColor}
          />
        ) : (
          <div className="card p-6 text-center">
            <p className="nkfs-p-m text-muted">Carregando ficha técnica...</p>
          </div>
        )}
      </section>

      {/* ── HISTÓRICO DE GRADUAÇÕES ─────────────────────────────── */}
      {graduationHistory && graduationHistory.length > 0 && (
        <section className="card p-5 flex flex-col gap-4">
          <div className="section-header">
            <h3 className="nkfs-h-p text-main font-bold">
              Histórico de Graduações
            </h3>
            <Badge variant="gold">{graduationHistory.length} registros</Badge>
          </div>

          <div className="flex flex-col gap-2">
            {(graduationHistory as unknown as GraduationHistoryItem[]).map((h) => (
              <div
                key={h.id}
                className="card-elevated p-3 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-8 rounded-full shadow-xs"
                    style={{ backgroundColor: h.graduation?.color_hex ?? '#ccc' }}
                  />
                  <div>
                    <span className="nkfs-p-m font-bold text-main block">
                      {h.graduation?.level_name}
                    </span>
                    <span className="nkfs-tag-p text-muted">
                      {h.modality?.name}
                    </span>
                  </div>
                </div>
                <span className="nkfs-tag-p text-faint">
                  {new Date(h.promoted_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}