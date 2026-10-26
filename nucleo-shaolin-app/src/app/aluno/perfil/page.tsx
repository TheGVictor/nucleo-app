import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'
import { getRequestUserProfile, getRequestStudentModalities } from '@/lib/user-cache'
import { InstallAppButton } from '@/components/pwa/InstallPwa'

interface StudentModalityItem {
  id: string
  status: string
  self_reported_level: string | null
  modality: { name: string; slug: string } | null
}

export default async function PerfilPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile, studentModalities] = await Promise.all([
    getRequestUserProfile(user.id),
    getRequestStudentModalities(user.id),
  ])

  if (!profile) redirect('/login')

  return (
    <main className="page-container py-5 flex flex-col gap-5 animate-fade-in">
      {/* Card do Perfil */}
      <div className="card-elevated p-5 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 shadow-md">
        <Avatar name={profile.full_name} size="xl" gold />
        <div className="flex-1 min-w-0">
          <h1 className="nkfs-h-p text-main font-bold truncate">{profile.full_name}</h1>
          <p className="text-xs text-muted truncate mt-0.5">{user.email}</p>
          <div className="mt-2 flex items-center gap-2 justify-center sm:justify-start flex-wrap text-xs">
            <span className="font-semibold text-gold">
              {profile.role === 'super_admin' ? 'Sifu • Super Admin' : profile.role === 'admin' ? 'Instrutor' : 'Praticante Oficial'}
            </span>
            <span className="text-faint">•</span>
            <span className="text-emerald-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {profile.status === 'active' ? 'Matrícula Ativa' : 'Em Análise'}
            </span>
          </div>
        </div>
      </div>

      {/* Modalidades Vinculadas */}
      <section className="card p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1 border-b border-[var(--color-border)]">
          <h2 className="nkfs-h-p text-main font-bold">Minhas Modalidades</h2>
          <span className="text-xs text-muted">Matrículas</span>
        </div>

        <div className="flex flex-col gap-2">
          {studentModalities && studentModalities.length > 0 ? (
            (studentModalities as unknown as StudentModalityItem[]).map((sm) => (
              <div key={sm.id} className="card-elevated p-3.5 flex justify-between items-center">
                <div>
                  <span className="nkfs-p-m font-bold text-main">{sm.modality?.name}</span>
                  {sm.self_reported_level && (
                    <span className="text-xs text-muted block mt-0.5">
                      Nível: {sm.self_reported_level}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-emerald-500">
                  {sm.status === 'active' ? '✓ Ativo' : 'Pendente'}
                </span>
              </div>
            ))
          ) : (
            <p className="nkfs-p-m text-muted">Nenhuma modalidade vinculada.</p>
          )}
        </div>
      </section>

      {/* Informações Cadastrais e Documentação */}
      <section className="card p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1 border-b border-[var(--color-border)]">
          <h2 className="nkfs-h-p text-main font-bold">Dados de Registro & Matrícula</h2>
          <span className="text-xs text-muted">Documentação</span>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[var(--color-border)] text-xs sm:text-sm">
          <span className="text-muted">Data de Nascimento</span>
          <span className="text-main font-medium">
            {new Date(profile.birth_date).toLocaleDateString('pt-BR')}
          </span>
        </div>

        {profile.phone && (
          <div className="flex justify-between items-center py-2.5 border-b border-[var(--color-border)] text-xs sm:text-sm">
            <span className="text-muted">Telefone / WhatsApp</span>
            <span className="text-main font-medium font-mono">
              {profile.phone}
            </span>
          </div>
        )}

        {profile.guardian_name && (
          <div className="flex justify-between items-center py-2.5 border-b border-[var(--color-border)] text-xs sm:text-sm">
            <span className="text-muted">Responsável Legal</span>
            <span className="text-main font-medium">
              {profile.guardian_name}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center py-2.5 border-b border-[var(--color-border)] text-xs sm:text-sm">
          <span className="text-muted">Regulamento & Filosofia Marcial</span>
          <span className="text-emerald-500 font-semibold text-xs">✓ Aceitos</span>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[var(--color-border)] text-xs sm:text-sm">
          <span className="text-muted">Direitos de Imagem & Vídeos de Aula</span>
          <span className={`text-xs font-semibold ${profile.image_rights_accepted ? 'text-emerald-500' : 'text-muted'}`}>
            {profile.image_rights_accepted ? '✓ Autorizado' : 'Não autorizado'}
          </span>
        </div>

        <div className="flex justify-between items-center py-2.5 text-xs sm:text-sm">
          <span className="text-muted">Declaração de Saúde para Prática</span>
          <span className={`text-xs font-semibold ${profile.health_declaration_accepted ? 'text-emerald-500' : 'text-amber-500'}`}>
            {profile.health_declaration_accepted ? '✓ Válida' : 'Pendente'}
          </span>
        </div>
      </section>

      {/* Opção PWA: Instalar Aplicativo no Celular */}
      <section className="card p-5 flex flex-col gap-3.5 border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📲</span>
            <h2 className="nkfs-h-p text-main font-bold">Aplicativo no Celular</h2>
          </div>
          <span className="text-xs text-gold font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
            Acesso 1 Toque
          </span>
        </div>
        <p className="text-xs text-muted leading-relaxed">
          Adicione o <strong>Núcleo Shaolin</strong> à tela inicial do seu celular (iPhone ou Android) para usar como um aplicativo nativo em tela cheia, sem precisar digitar o endereço da web no navegador.
        </p>
        <InstallAppButton />
      </section>
    </main>
  )
}