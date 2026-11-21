import { describe, expect, it } from 'vitest'
import { verbs } from '../data/verbs'
import { createLetterMask, emptyProgress, gradeExam, isCorrectAnswer, learningProgress, normalize, recordLetterAttempt, scoreSpeed } from './game'

describe('answer validation', () => {
  it('ignores whitespace and capitalization', () => expect(isCorrectAnswer(verbs[0], 'førnutid', '  HAR BEDT ')).toBe(true))
  it('requires the full førnutid form', () => expect(isCorrectAnswer(verbs[0], 'førnutid', 'bedt')).toBe(false))
  it('accepts sensible translations', () => expect(isCorrectAnswer(verbs[5], 'translation', 'eiga að')).toBe(true))
  it('keeps Danish special characters significant', () => expect(isCorrectAnswer(verbs[1], 'datid', 'betod')).toBe(false))
  it('normalizes repeated spaces', () => expect(normalize(' HAR   BRAGT ')).toBe('har bragt'))
})

describe('scoring and exam', () => {
  it('adds a bounded streak bonus', () => { expect(scoreSpeed(true, 1)).toBe(100); expect(scoreSpeed(true, 20)).toBe(200); expect(scoreSpeed(false, 20)).toBe(0) })
  it('grades all forty fields', () => {
    const answers: Record<string, string> = {}
    verbs.forEach((v) => { answers[`${v.infinitiv}:nutid`] = v.nutid; answers[`${v.infinitiv}:datid`] = v.datid; answers[`${v.infinitiv}:førnutid`] = v.førnutid; answers[`${v.infinitiv}:translation`] = v.translation })
    const result = gradeExam(answers)
    expect(result).toHaveLength(40)
    expect(result.every((r) => r.correct)).toBe(true)
  })
})

describe('beginner learning games', () => {
  it('supports every verb in all beginner modes', () => {
    expect(verbs).toHaveLength(10)
    verbs.forEach((verb) => {
      expect(verb.explanation.length).toBeGreaterThan(25)
      expect(verb.example.danish).toBeTruthy()
      expect(createLetterMask(verb.førnutid, 'easy').some((part) => part.hidden)).toBe(true)
    })
  })
  it('keeps the auxiliary visible in easy and medium modes', () => {
    for (const difficulty of ['easy', 'medium'] as const) {
      const mask = createLetterMask('har drukket', difficulty)
      expect(mask.slice(0, 3).every((part) => !part.hidden)).toBe(true)
    }
  })
  it('never hides the first letter in easy mode', () => expect(createLetterMask('drikker', 'easy')[0].hidden).toBe(false))
  it('tracks learning separately from exam mastery', () => {
    const studied = { ...emptyProgress, learning: { ...emptyProgress.learning, studied: verbs.map((v) => v.infinitiv) } }
    expect(learningProgress(studied)).toBe(33)
    expect(studied.skills).toEqual({})
    const attempted = recordLetterAttempt(studied, 'drikke', 'easy', false)
    expect(attempted.learning.letters.drikke.easy?.wrong).toBe(1)
    expect(attempted.skills).toEqual({})
  })
})
