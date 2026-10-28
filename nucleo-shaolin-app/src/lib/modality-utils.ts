/**
 * Normaliza qualquer variação incorreta de "TanLang", "Tan Lang", "Tang Lang" ou "TangLang"
 * para a grafia correta adotada pela escola: "Ton Long".
 */
export function normalizeTonLong(text: string | null | undefined): string {
  if (!text) return ''
  return text.replace(/\btan\s*g?\s*lang\b/gi, 'Ton Long')
}
