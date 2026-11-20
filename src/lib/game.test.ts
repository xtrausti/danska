import { describe, expect, it } from 'vitest'
import { verbs } from '../data/verbs'
import { gradeExam, isCorrectAnswer, normalize, scoreSpeed } from './game'

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
