import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'

export const instant = false

interface StudentModalityItem {
  id: string
  status: string
  self_reported_level: string | null
  modality: { name: string; slug: string } | null
}

export default async function PerfilPage() {
  await connection()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: studentModalities } = await supabase
    .from('student_modalities')
    .select('*, modality:modalities(name, slug)')
    .eq('student_id', user.id)

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-main pb-24">
      <TopBar profile={profile} title="Meu Perfil" />

      <main className="page-container py-5 flex flex-col gap-5 animate-fade-in">
        
        {/* Card do Perfil com Avatar DS */}
        <div className="card-elevated p-5 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 shadow-lg">
          <Avatar name={profile.full_name} size="xl" gold />
          <div className="flex-1 min-w-0">
            <h1 className="nkfs-h-p text-main font-bold truncate">{profile.full_name}</h1>
            <p className="nkfs-p-m text-muted truncate">{user.email}</p>
            <div className="mt-2.5 flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              <Badge variant="primary">
                {profile.role === 'super_admin' ? 'Sifu — Super Admin' : profile.role === 'admin' ? 'Instrutor' : 'Aluno Matriculado'}
              </Badge>
              <Badge variant={profile.status === 'active' ? 'success' : 'warning'}>
                {profile.status === 'active' ? 'Matrícula Regular' : 'Em Análise'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Modalidades Vinculadas */}
        <section className="card p-5 flex flex-col gap-3">
          <div className="section-header mb-1">
            <h2 className="section-title nkfs-tag-m text-gold">Minhas Modalidades</h2>
            <span className="nkfs-tag-p text-muted">Matrículas</span>
          </div>

          <div className="flex flex-col gap-2">
            {studentModalities && studentModalities.length > 0 ? (
              (studentModalities as unknown as StudentModalityItem[]).map((sm) => (
                <div key={sm.id} className="card-elevated p-3.5 flex justify-between items-center">
                  <div>
                    <span className="nkfs-p-m font-bold text-main">{sm.modality?.name}</span>
                    {sm.self_reported_level && (
                      <span className="nkfs-tag-p text-muted block mt-0.5">
                        Nível: {sm.self_reported_level}
                      </span>
                    )}
                  </div>
                  <Badge variant={sm.status === 'active' ? 'success' : 'warning'}>
                    {sm.status === 'active' ? 'Ativo' : 'Pendente'}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="nkfs-p-m text-muted">Nenhuma modalidade vinculada.</p>
            )}
          </div>
        </section>

        {/* Informações Cadastrais e Documentação */}
        <section className="card p-5 flex flex-col gap-3">
          <div className="section-header mb-1">
            <h2 className="section-title nkfs-tag-m text-gold">Dados de Registro & Matrícula</h2>
            <span className="nkfs-tag-p text-muted">Segurança</span>
          </div>

          <div className="flex justify-between items-center py-2.5 border-b border-[var(--color-border)]">
            <span className="nkfs-p-m text-muted">Data de Nascimento</span>
            <span className="nkfs-p-m text-main font-medium">
              {new Date(profile.birth_date).toLocaleDateString('pt-BR')}
            </span>
          </div>

          {profile.phone && (
            <div className="flex justify-between items-center py-2.5 border-b border-[var(--color-border)]">
              <span className="nkfs-p-m text-muted">Telefone / WhatsApp</span>
              <span className="nkfs-p-m text-main font-medium font-mono">
                {profile.phone}
              </span>
            </div>
          )}

          {profile.guardian_name && (
            <div className="flex justify-between items-center py-2.5 border-b border-[var(--color-border)]">
              <span className="nkfs-p-m text-muted">Responsável Legal</span>
              <span className="nkfs-p-m text-main font-medium">
                {profile.guardian_name}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-2.5 border-b border-[var(--color-border)]">
            <span className="nkfs-p-m text-muted">Regulamento & Filosofia Marcial</span>
            <Badge variant="success">Aceitos</Badge>
          </div>

          <div className="flex justify-between items-center py-2.5 border-b border-[var(--color-border)]">
            <span className="nkfs-p-m text-muted">Direitos de Imagem & Vídeos de Aula</span>
            <Badge variant={profile.image_rights_accepted ? 'success' : 'muted'}>
              {profile.image_rights_accepted ? 'Autorizado' : 'Não autorizado'}
            </Badge>
          </div>

          <div className="flex justify-between items-center py-2.5">
            <span className="nkfs-p-m text-muted">Declaração de Saúde para Prática</span>
            <Badge variant={profile.health_declaration_accepted ? 'success' : 'warning'}>
              {profile.health_declaration_accepted ? 'Válida' : 'Pendente'}
            </Badge>
          </div>
        </section>

      </main>

      <BottomNav />
    </div>
  )
}