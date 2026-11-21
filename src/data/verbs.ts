export type Tense = 'nutid' | 'datid' | 'førnutid'

export type Verb = {
  infinitiv: string
  nutid: string
  datid: string
  førnutid: string
  translation: string
  translationAlternatives: string[]
  explanation: string
  example: { danish: string; icelandic: string }
}

export const verbs: Verb[] = [
  { infinitiv: 'bede', nutid: 'beder', datid: 'bad', førnutid: 'har bedt', translation: 'biðja', translationAlternatives: ['biðja'], explanation: 'Óregluleg sögn. Nútíð er beder, þátíð bad og núliðin tíð har bedt. Þessa beygingu þarf að muna sérstaklega.', example: { danish: 'Jeg beder om hjælp.', icelandic: 'Ég bið um hjálp.' } },
  { infinitiv: 'betyde', nutid: 'betyder', datid: 'betød', førnutid: 'har betydet', translation: 'þýða / merkja', translationAlternatives: ['þýða', 'merkja', 'þýða / merkja', 'þýða/merkja'], explanation: 'Nútíð er betyder. Í þátíð breytist orðið í betød. Núliðin tíð er har betydet.', example: { danish: 'Hvad betyder ordet?', icelandic: 'Hvað þýðir orðið?' } },
  { infinitiv: 'blive', nutid: 'bliver', datid: 'blev', førnutid: 'er blevet', translation: 'verða', translationAlternatives: ['verða'], explanation: 'Óregluleg sögn: blive – bliver – blev – er blevet. Taktu eftir breytingunni i → e í þátíð. Í merkingunni verða er notað er blevet.', example: { danish: 'Hun bliver glad.', icelandic: 'Hún verður glöð.' } },
  { infinitiv: 'bringe', nutid: 'bringer', datid: 'bragte', førnutid: 'har bragt', translation: 'koma með / færa', translationAlternatives: ['koma með', 'færa', 'koma með / færa', 'koma með/færa'], explanation: 'Óregluleg sögn. Þátíð er bragte og núliðin tíð har bragt. Mundu bragte og bragt saman.', example: { danish: 'Han bringer mad til festen.', icelandic: 'Hann kemur með mat í veisluna.' } },
  { infinitiv: 'bryde', nutid: 'bryder', datid: 'brød', førnutid: 'har brudt', translation: 'brjóta', translationAlternatives: ['brjóta'], explanation: 'Óregluleg sögn með sérhljóðabreytingu y → ø → u: bryde – brød – brudt. Sögnin byde fylgir svipuðu mynstri.', example: { danish: 'Du må ikke bryde reglerne.', icelandic: 'Þú mátt ekki brjóta reglurnar.' } },
  { infinitiv: 'burde', nutid: 'bør', datid: 'burde', førnutid: 'har burdet', translation: 'ætti / eiga að', translationAlternatives: ['ætti', 'eiga að', 'ætti / eiga að', 'ætti/eiga að'], explanation: 'Sérstök sögn. Nútíðin er bør, þátíðin burde og núliðin tíð har burdet. Núliðin tíð er sjaldgæf í venjulegu máli.', example: { danish: 'Du bør øve dig.', icelandic: 'Þú ættir að æfa þig.' } },
  { infinitiv: 'byde', nutid: 'byder', datid: 'bød', førnutid: 'har budt', translation: 'bjóða', translationAlternatives: ['bjóða'], explanation: 'Óregluleg sögn: byde – bød – budt. Mundu sérhljóðabreytinguna y → ø → u, eins og í bryde.', example: { danish: 'Jeg vil byde dig velkommen.', icelandic: 'Ég vil bjóða þig velkomna.' } },
  { infinitiv: 'drikke', nutid: 'drikker', datid: 'drak', førnutid: 'har drukket', translation: 'drekka', translationAlternatives: ['drekka'], explanation: 'Óregluleg sögn: drikke – drak – drukket. Sérhljóðin breytast i → a → u.', example: { danish: 'Hun drikker vand.', icelandic: 'Hún drekkur vatn.' } },
  { infinitiv: 'dø', nutid: 'dør', datid: 'døde', førnutid: 'er død', translation: 'deyja', translationAlternatives: ['deyja'], explanation: 'Nútíð er dør og þátíð døde. Í merkingunni að vera dáinn er notað er død. Ekki rugla saman døde og død.', example: { danish: 'Planten dør uden vand.', icelandic: 'Plantan deyr án vatns.' } },
  { infinitiv: 'falde', nutid: 'falder', datid: 'faldt', førnutid: 'er faldet', translation: 'detta / falla', translationAlternatives: ['detta', 'falla', 'detta / falla', 'detta/falla'], explanation: 'Nútíð er falder og þátíð faldt. Í merkingunni detta er notað er faldet. Taktu sérstaklega eftir d-inu í faldt.', example: { danish: 'Bladene falder om efteråret.', icelandic: 'Laufin falla á haustin.' } }
]

export const tenseLabels: Record<Tense, string> = { nutid: 'Nutid', datid: 'Datid', førnutid: 'Førnutid' }
export const tenses: Tense[] = ['nutid', 'datid', 'førnutid']
