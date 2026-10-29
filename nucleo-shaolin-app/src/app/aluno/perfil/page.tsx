import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import {
  getRequestAuthUser,
  getRequestUserProfile,
  getRequestStudentModalities,
} from '@/lib/user-cache'
import { getCachedModalities } from '@/lib/cached-queries'
import { InstallAppButton } from '@/components/pwa/InstallPwa'
import { getBeltTheme } from '@/lib/beltTheme'
import { normalizeTonLong } from '@/lib/modality-utils'

export const instant = false

interface StudentModalityItem {
  id: string
  status: string
  self_reported_level: string | null
  modality: { id: string; name: string; slug: string } | null
  approved_graduation: { id: string; level_name: string; level_order: number; color_hex: string | null } | null
}

export default async function PerfilPage() {
  const user = await getRequestAuthUser()
  if (!user) redirect('/login')

  const [profile, studentModalities, allModalities] = await Promise.all([
    getRequestUserProfile(user.id),
    getRequestStudentModalities(user.id),
    getCachedModalities(),
  ])

  if (!profile) redirect('/login')

  const modalitiesList = (studentModalities || []) as unknown as StudentModalityItem[]
  const enrolledSlugs = new Set(modalitiesList.map(sm => sm.modality?.slug).filter(Boolean))
  const otherAvailableModalities = (allModalities || []).filter(
    (m) => !enrolledSlugs.has(m.slug)
  )

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

      {/* ── MODALIDADES VINCULADAS (COM SUPORTE A MÚLTIPLAS ARTES) ── */}
      <section className="card p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
          <div>
            <h2 className="nkfs-h-p text-main font-bold flex items-center gap-2">
              <span>🥋</span>
              <span>Minhas Modalidades Marciais</span>
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Você pode praticar mais de uma arte marcial com fichas e graduações independentes
            </p>
          </div>
          <Badge variant="gold">
            {modalitiesList.length} {modalitiesList.length === 1 ? 'Arte' : 'Artes'}
          </Badge>
        </div>

        <div className="flex flex-col gap-3">
          {modalitiesList.length > 0 ? (
            modalitiesList.map((sm) => {
              const icon =
                sm.modality?.slug === 'taichi'
                  ? '☯️'
                  : sm.modality?.slug === 'sanda'
                  ? '🥊'
                  : sm.modality?.slug === 'tanglang'
                  ? '🗡️'
                  : '🥋'

              const graduationName =
                sm.approved_graduation?.level_name ??
                sm.self_reported_level ??
                'Faixa Branca'

              const graduationColor =
                sm.approved_graduation?.color_hex ?? '#D4AF37'
              const beltTheme = getBeltTheme(graduationName, graduationColor)

              return (
                <div
                  key={sm.id}
                  className="card-elevated p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[var(--color-border)] hover:border-[var(--color-border-gold)] transition-all"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
                      {icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-extrabold text-main truncate">
                          {sm.modality?.name}
                        </h3>
                        <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {sm.status === 'active' ? 'Matrícula Ativa' : 'Em Análise'}
                        </span>
                      </div>

                      {/* Graduação da Modalidade com contraste universal */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted">Graduação Atual:</span>
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border backdrop-blur-xs shadow-xs"
                          style={{
                            borderColor: beltTheme.badgeBorder,
                            backgroundColor: beltTheme.badgeBg,
                            color: beltTheme.badgeText,
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-full shadow-xs shrink-0"
                            style={{
                              backgroundColor: beltTheme.dotColor,
                              border: beltTheme.dotBorder ? `1px solid ${beltTheme.dotBorder}` : undefined,
                            }}
                          />
                          <span>{beltTheme.label}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ações da Modalidade */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                    {sm.modality?.id && (
                      <Link
                        href={`/aluno/ficha?modality=${sm.modality.id}`}
                        className="btn btn-secondary btn-sm py-1.5 px-3 text-xs font-bold flex items-center gap-1"
                        title="Ver ficha técnica desta modalidade"
                      >
                        <span>📋</span>
                        <span>Ficha Técnica</span>
                      </Link>
                    )}
                    <Link
                      href="/aluno/aulas"
                      className="btn btn-secondary btn-sm py-1.5 px-3 text-xs font-bold flex items-center gap-1"
                      title="Ver grade de horários"
                    >
                      <span>📅</span>
                      <span>Horários</span>
                    </Link>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-xs text-muted p-3">Nenhuma modalidade vinculada.</p>
          )}
        </div>

        {/* ── EXPANSÃO MULTIDISCIPLINAR (OUTRAS MODALIDADES DA ESCOLA) ── */}
        {otherAvailableModalities.length > 0 && (
          <div className="mt-2 p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-dashed border-[var(--color-border)] flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-main flex items-center gap-1.5">
                  <span>✨</span>
                  <span>Treino Multidisciplinar no Núcleo Shaolin</span>
                </h3>
                <p className="text-[11px] text-muted leading-relaxed mt-0.5">
                  Praticantes matriculados podem integrar outras artes marciais da escola com planos especiais.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-muted font-bold">Disponíveis para você:</span>
              {otherAvailableModalities.map((m) => (
                <span
                  key={m.id}
                  className="text-xs px-2.5 py-1 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-main font-semibold flex items-center gap-1.5"
                >
                  <span>{m.slug === 'taichi' ? '☯️' : m.slug === 'sanda' ? '🥊' : '🥋'}</span>
                  <span>{normalizeTonLong(m.name)}</span>
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-[var(--color-border)]/60 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[11px] text-muted">
                Fale com a coordenação para incluir uma nova modalidade no seu cadastro:
              </span>
              <a
                href={`https://wa.me/551123862729?text=${encodeURIComponent(
                  `Olá, sou o aluno ${profile.full_name} e tenho interesse em treinar uma nova modalidade no Núcleo Shaolin!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold btn-sm py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
              >
                <span>💬</span>
                <span>Solicitar Nova Modalidade</span>
              </a>
            </div>
          </div>
        )}
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