import { tenses, verbs, type Tense, type Verb } from '../data/verbs'

export type SkillKey = Tense | 'translation'
export type SkillStats = { correct: number; wrong: number }
export type Progress = {
  xp: number
  stars: number
  streak: number
  lastPractice: string | null
  best: Record<string, number>
  completed: Record<string, boolean>
  skills: Record<string, Partial<Record<SkillKey, SkillStats>>>
  mistakes: { verb: string; skill: SkillKey }[]
  sound: boolean
  dark: boolean
}

export const emptyProgress: Progress = {
  xp: 0, stars: 0, streak: 0, lastPractice: null, best: {}, completed: {}, skills: {}, mistakes: [], sound: true, dark: false
}

export const normalize = (value: string) => value.trim().toLocaleLowerCase('da-DK').replace(/\s+/g, ' ')

export function isCorrectAnswer(verb: Verb, skill: SkillKey, answer: string) {
  const normalized = normalize(answer)
  if (skill === 'translation') return verb.translationAlternatives.some((item) => normalize(item) === normalized)
  return normalize(verb[skill]) === normalized
}

export function gradeExam(answers: Record<string, string>) {
  return verbs.flatMap((verb) => ([...tenses, 'translation'] as SkillKey[]).map((skill) => ({
    verb: verb.infinitiv,
    skill,
    answer: answers[`${verb.infinitiv}:${skill}`] || '',
    expected: skill === 'translation' ? verb.translation : verb[skill],
    correct: isCorrectAnswer(verb, skill, answers[`${verb.infinitiv}:${skill}`] || '')
  })))
}

export function scoreSpeed(correct: boolean, streak: number) {
  if (!correct) return 0
  return 100 + Math.min(100, Math.max(0, streak - 1) * 10)
}

export const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5)

export function masteryForVerb(progress: Progress, infinitiv: string) {
  const stats = progress.skills[infinitiv] || {}
  const values = ([...tenses, 'translation'] as SkillKey[]).map((skill) => {
    const s = stats[skill]
    if (!s || s.correct + s.wrong === 0) return 0
    const accuracy = s.correct / (s.correct + s.wrong)
    const confidence = Math.min(1, (s.correct + s.wrong) / 4)
    return accuracy * confidence
  })
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100)
}

export function overallMastery(progress: Progress) {
  return Math.round(verbs.reduce((sum, verb) => sum + masteryForVerb(progress, verb.infinitiv), 0) / verbs.length)
}

export function weightedQuestions(progress: Progress, count: number) {
  const pool = verbs.flatMap((verb) => tenses.map((skill) => ({ verb, skill, weight: 110 - masteryForVerb(progress, verb.infinitiv) })))
  const selected: { verb: Verb; skill: Tense }[] = []
  let last = ''
  while (selected.length < count) {
    const total = pool.reduce((s, item) => s + item.weight, 0)
    let roll = Math.random() * total
    const pick = pool.find((item) => (roll -= item.weight) <= 0) || pool[0]
    const key = `${pick.verb.infinitiv}:${pick.skill}`
    if (key !== last || pool.length === 1) { selected.push({ verb: pick.verb, skill: pick.skill }); last = key }
  }
  return selected
}

export function updatePracticeDate(progress: Progress, date = new Date()) {
  const today = date.toISOString().slice(0, 10)
  if (progress.lastPractice === today) return progress
  const yesterday = new Date(date); yesterday.setDate(yesterday.getDate() - 1)
  const streak = progress.lastPractice === yesterday.toISOString().slice(0, 10) ? progress.streak + 1 : 1
  return { ...progress, lastPractice: today, streak }
}

export function recordAttempt(progress: Progress, verb: string, skill: SkillKey, correct: boolean) {
  const next = structuredClone(progress)
  const existing = next.skills[verb]?.[skill] || { correct: 0, wrong: 0 }
  next.skills[verb] = { ...(next.skills[verb] || {}), [skill]: { correct: existing.correct + (correct ? 1 : 0), wrong: existing.wrong + (correct ? 0 : 1) } }
  const key = `${verb}:${skill}`
  next.mistakes = next.mistakes.filter((item) => `${item.verb}:${item.skill}` !== key)
  if (!correct) next.mistakes.push({ verb, skill })
  return updatePracticeDate(next)
}

export function levelForXp(xp: number) {
  const levels = [
    { name: 'Orðaveiðari', min: 0, icon: '🌱' },
    { name: 'Beygingabani', min: 1000, icon: '⚡' },
    { name: 'Sagnasmiður', min: 2500, icon: '🛡️' },
    { name: 'Danskur meistari', min: 5000, icon: '👑' },
    { name: 'Verb-goðsögn', min: 8000, icon: '🏆' }
  ]
  const current = [...levels].reverse().find((level) => xp >= level.min) || levels[0]
  const index = levels.indexOf(current)
  const next = levels[index + 1]
  return { ...current, number: index + 1, next, progress: next ? Math.round(((xp - current.min) / (next.min - current.min)) * 100) : 100 }
}

export function plausibleOptions(verb: Verb, tense: Tense) {
  return shuffle([verb[tense], ...shuffle(verbs.filter((v) => v.infinitiv !== verb.infinitiv).map((v) => v[tense])).slice(0, 3)])
}
