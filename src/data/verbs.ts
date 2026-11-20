export type Tense = 'nutid' | 'datid' | 'førnutid'

export type Verb = {
  infinitiv: string
  nutid: string
  datid: string
  førnutid: string
  translation: string
  translationAlternatives: string[]
}

export const verbs: Verb[] = [
  { infinitiv: 'bede', nutid: 'beder', datid: 'bad', førnutid: 'har bedt', translation: 'biðja', translationAlternatives: ['biðja'] },
  { infinitiv: 'betyde', nutid: 'betyder', datid: 'betød', førnutid: 'har betydet', translation: 'þýða', translationAlternatives: ['þýða', 'merkja'] },
  { infinitiv: 'blive', nutid: 'bliver', datid: 'blev', førnutid: 'er blevet', translation: 'verða', translationAlternatives: ['verða'] },
  { infinitiv: 'bringe', nutid: 'bringer', datid: 'bragte', førnutid: 'har bragt', translation: 'koma með', translationAlternatives: ['koma með', 'færa'] },
  { infinitiv: 'bryde', nutid: 'bryder', datid: 'brød', førnutid: 'har brudt', translation: 'brjóta', translationAlternatives: ['brjóta'] },
  { infinitiv: 'burde', nutid: 'bør', datid: 'burde', førnutid: 'har burdet', translation: 'ætti / eiga að', translationAlternatives: ['ætti', 'eiga að', 'ætti / eiga að', 'ætti/eiga að'] },
  { infinitiv: 'byde', nutid: 'byder', datid: 'bød', førnutid: 'har budt', translation: 'bjóða', translationAlternatives: ['bjóða'] },
  { infinitiv: 'drikke', nutid: 'drikker', datid: 'drak', førnutid: 'har drukket', translation: 'drekka', translationAlternatives: ['drekka'] },
  { infinitiv: 'dø', nutid: 'dør', datid: 'døde', førnutid: 'er død', translation: 'deyja', translationAlternatives: ['deyja'] },
  { infinitiv: 'falde', nutid: 'falder', datid: 'faldt', førnutid: 'er faldet', translation: 'detta / falla', translationAlternatives: ['detta', 'falla', 'detta / falla', 'detta/falla'] }
]

export const tenseLabels: Record<Tense, string> = { nutid: 'Nutid', datid: 'Datid', førnutid: 'Førnutid' }
export const tenses: Tense[] = ['nutid', 'datid', 'førnutid']
