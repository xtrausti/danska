import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import confetti from 'canvas-confetti'
import { ArrowLeft, Brain, Check, Clock3, Crown, Flame, Gamepad2, Keyboard, Medal, Moon, RotateCcw, Sparkles, Star, Sun, Swords, Trophy, Volume2, VolumeX, X, Zap } from 'lucide-react'
import { tenseLabels, tenses, verbs, type Tense, type Verb } from './data/verbs'
import { emptyProgress, gradeExam, isCorrectAnswer, levelForXp, masteryForVerb, overallMastery, plausibleOptions, recordAttempt, scoreSpeed, shuffle, weightedQuestions, type Progress, type SkillKey } from './lib/game'

type Screen = 'home' | 'matching' | 'choice' | 'typing' | 'speed' | 'exam' | 'mistakes'
const STORAGE_KEY = 'dansk-verb-battle-v1'

const gameCards = [
  { id: 'matching' as Screen, title: 'Paraðu saman', kicker: 'Hitaðu upp', desc: 'Tengdu dönsku sagnirnar við íslensku þýðinguna.', icon: <Gamepad2 />, color: 'from-violet-500 to-indigo-600' },
  { id: 'choice' as Screen, title: 'Veldu rétta beygingu', kicker: 'Veldu rétt', desc: 'Finndu nutid, datid og førnutid úr fjórum svörum.', icon: <Brain />, color: 'from-cyan-500 to-blue-600' },
  { id: 'typing' as Screen, title: 'Skrifaðu rétt', kicker: 'Mikilvægasta æfingin', desc: 'Skrifaðu beyginguna alveg sjálf – eins og í prófinu.', icon: <Keyboard />, color: 'from-fuchsia-500 to-pink-600' },
  { id: 'speed' as Screen, title: 'Hraðakeppni', kicker: '60 sekúndur', desc: 'Safnaðu stigum og haltu svöruninni gangandi.', icon: <Zap />, color: 'from-orange-400 to-rose-600' },
  { id: 'exam' as Screen, title: 'Lokaprófið', kicker: 'Final boss', desc: '40 reitir. Engar vísbendingar. Ertu tilbúin?', icon: <Crown />, color: 'from-amber-400 to-orange-600' }
]

function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => {
    try { return { ...emptyProgress, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '') } } catch { return emptyProgress }
  })
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); document.documentElement.classList.toggle('dark', progress.dark) }, [progress])
  return [progress, setProgress] as const
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [progress, setProgress] = useProgress()
  const mastery = overallMastery(progress)
  const level = levelForXp(progress.xp)

  function completeGame(id: string, score: number, xp: number) {
    setProgress((p) => ({ ...p, xp: p.xp + xp, stars: p.stars + (p.completed[id] ? 0 : 1), completed: { ...p.completed, [id]: true }, best: { ...p.best, [id]: Math.max(p.best[id] || 0, score) } }))
  }

  function tone(ok = true) {
    if (!progress.sound) return
    const context = new AudioContext(); const osc = context.createOscillator(); const gain = context.createGain()
    osc.frequency.value = ok ? 620 : 180; gain.gain.setValueAtTime(.05, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .12)
    osc.connect(gain); gain.connect(context.destination); osc.start(); osc.stop(context.currentTime + .13)
  }

  const common = { progress, setProgress, goHome: () => setScreen('home'), completeGame, tone }
  if (screen === 'matching') return <Shell {...common}><MatchingGame {...common} /></Shell>
  if (screen === 'choice') return <Shell {...common}><ChoiceGame {...common} /></Shell>
  if (screen === 'typing' || screen === 'mistakes') return <Shell {...common}><TypingGame {...common} mistakesOnly={screen === 'mistakes'} /></Shell>
  if (screen === 'speed') return <Shell {...common}><SpeedGame {...common} /></Shell>
  if (screen === 'exam') return <Shell {...common}><ExamGame {...common} /></Shell>

  return <Shell progress={progress} setProgress={setProgress} goHome={() => setScreen('home')} completeGame={completeGame} tone={tone} home>
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:pt-12">
      <section className="hero-card overflow-hidden rounded-[2rem] p-6 text-white shadow-game sm:p-9">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_.7fr] lg:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[.2em] text-violet-200"><Swords size={18} /> Dansk Verb Battle</div>
            <h1 className="max-w-3xl text-4xl font-black leading-[.95] sm:text-6xl">Kanntu allar<br/><span className="text-amber-300">10 sagnirnar?</span></h1>
            <p className="mt-5 max-w-xl text-lg font-semibold text-violet-100">Stuttar og skemmtilegar æfingar sem færa þig frá því að þekkja sagnirnar yfir í að skrifa þær alveg sjálf.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button className="btn bg-white text-violet-800 hover:bg-violet-50" onClick={() => setScreen(progress.mistakes.length ? 'mistakes' : 'typing')}><Sparkles size={20}/> Halda áfram að æfa</button>
              <button className="btn border border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={() => setScreen('mistakes')}><RotateCcw size={19}/> Æfa mistökin mín <span className="pill-light">{progress.mistakes.length}</span></button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat icon={<Zap/>} label="XP" value={progress.xp.toLocaleString('is-IS')} />
            <Stat icon={<Star/>} label="Stjörnur" value={progress.stars} />
            <Stat icon={<Flame/>} label="Dagar í röð" value={progress.streak} />
            <Stat icon={<Trophy/>} label="Heildartök" value={`${mastery}%`} />
            <div className="col-span-2 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center justify-between font-extrabold"><span>{level.icon} Stig {level.number}: {level.name}</span><span>{level.next ? `${progress.xp}/${level.next.min} XP` : 'Hámark!'}</span></div>
              <ProgressBar value={level.progress} light />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-4"><div><p className="eyebrow">Veldu áskorun</p><h2 className="text-3xl font-black">Fimm leiðir til að sigra sagnirnar</h2></div><span className="hidden text-sm font-bold text-slate-500 sm:block">Allir leikir eru opnir</span></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gameCards.map((game, index) => <button key={game.id} onClick={() => setScreen(game.id)} className={`game-card group text-left ${index === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
            <div className={`game-icon bg-gradient-to-br ${game.color}`}>{game.icon}</div>
            <div className="mt-5 flex items-center justify-between"><span className="eyebrow">{game.kicker}</span>{progress.completed[game.id] && <span className="complete-badge"><Check size={14}/> Lokið</span>}</div>
            <h3 className="mt-2 text-xl font-black">{game.title}</h3><p className="mt-2 min-h-12 text-sm font-semibold text-slate-500 dark:text-slate-400">{game.desc}</p>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800"><span className="font-extrabold text-violet-600 dark:text-violet-300">Spila</span><span className="text-xs font-bold text-slate-400">Besta: {progress.best[game.id] || 0}</span></div>
          </button>)}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
        <div className="panel"><div className="flex items-center justify-between"><div><p className="eyebrow">Yfirlit</p><h2 className="text-2xl font-black">Tök á hverri sögn</h2></div><span className="text-2xl font-black text-violet-600">{mastery}%</span></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">{verbs.map((verb) => { const m = masteryForVerb(progress, verb.infinitiv); return <div key={verb.infinitiv}><div className="mb-1 flex justify-between text-sm font-extrabold"><span>{verb.infinitiv}</span><span>{m}%</span></div><ProgressBar value={m}/></div> })}</div>
        </div>
        <div className="panel trophy-panel"><p className="eyebrow">Verðlaunaskápur</p><h2 className="text-2xl font-black">Bikararnir þínir</h2><div className="mt-5 grid grid-cols-3 gap-3">{[
          ['🌟', progress.stars >= 1, 'Fyrsta stjarna'], ['🔥', progress.streak >= 3, '3 daga röð'], ['⚡', progress.xp >= 1000, '1.000 XP'], ['🎯', mastery >= 50, '50% tök'], ['👑', (progress.best.exam || 0) >= 90, '90% próf'], ['🏆', progress.best.exam === 100, 'Fullkomið']
        ].map(([icon, won, label]) => <div title={String(label)} key={String(label)} className={`trophy ${won ? '' : 'locked'}`}><span>{icon}</span></div>)}</div></div>
      </section>
    </main>
  </Shell>
}

type CommonProps = { progress: Progress; setProgress: React.Dispatch<React.SetStateAction<Progress>>; goHome: () => void; completeGame: (id: string, score: number, xp: number) => void; tone: (ok?: boolean) => void }

function Shell({ children, progress, setProgress, goHome, home = false }: CommonProps & { children: ReactNode; home?: boolean }) {
  return <div className="min-h-screen"><header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
    <button onClick={goHome} className="flex min-h-11 items-center gap-2 font-black"><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-600 text-white"><Swords size={20}/></span><span className="hidden sm:inline">DANSK VERB BATTLE</span>{!home && <span className="sm:hidden">Heim</span>}</button>
    <div className="flex items-center gap-2"><span className="hidden rounded-full bg-amber-100 px-3 py-2 text-sm font-black text-amber-700 sm:inline-flex">⚡ {progress.xp} XP</span><button className="icon-btn" aria-label={progress.sound ? 'Slökkva á hljóði' : 'Kveikja á hljóði'} onClick={() => setProgress((p) => ({ ...p, sound: !p.sound }))}>{progress.sound ? <Volume2/> : <VolumeX/>}</button><button className="icon-btn" aria-label="Skipta um litaham" onClick={() => setProgress((p) => ({ ...p, dark: !p.dark }))}>{progress.dark ? <Sun/> : <Moon/>}</button></div>
  </div></header>{children}</div>
}

function GameFrame({ title, eyebrow, goHome, children, aside }: { title: string; eyebrow: string; goHome: () => void; children: ReactNode; aside?: ReactNode }) {
  return <main className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-6 sm:py-10"><button onClick={goHome} className="mb-6 inline-flex min-h-11 items-center gap-2 font-extrabold text-slate-500 hover:text-violet-600"><ArrowLeft size={19}/> Til baka</button><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">{eyebrow}</p><h1 className="text-3xl font-black sm:text-4xl">{title}</h1></div>{aside}</div>{children}</main>
}

function MatchingGame({ progress, setProgress, goHome, completeGame, tone }: CommonProps) {
  const [round, setRound] = useState(0); const [matched, setMatched] = useState<string[]>([]); const [danish, setDanish] = useState<string | null>(null); const [icelandic, setIcelandic] = useState<string | null>(null); const [wrong, setWrong] = useState(''); const [attempts, setAttempts] = useState(0); const [start] = useState(Date.now()); const [done, setDone] = useState(false)
  const current = useMemo(() => verbs.slice(round * 5, round * 5 + 5), [round]); const translations = useMemo(() => shuffle(current.map((v) => v.translation)), [current])
  useEffect(() => { if (!danish || !icelandic) return; const verb = current.find((v) => v.infinitiv === danish)!; const correct = verb.translation === icelandic; setAttempts((v) => v + 1); setProgress((p) => recordAttempt(p, verb.infinitiv, 'translation', correct)); tone(correct); if (correct) { setMatched((m) => [...m, danish]); setDanish(null); setIcelandic(null) } else { setWrong(`${danish}:${icelandic}`); setTimeout(() => { setWrong(''); setDanish(null); setIcelandic(null) }, 450) } }, [danish, icelandic]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (matched.length !== 5) return; if (round === 0) setTimeout(() => { setRound(1); setMatched([]) }, 650); else { setDone(true); const score = 1000; completeGame('matching', score, score); confetti({ particleCount: 90, spread: 75 }) } }, [matched, round]) // eslint-disable-line react-hooks/exhaustive-deps
  if (done) return <GameFrame title="Paraðu saman" eyebrow="Leik lokið" goHome={goHome}><Results title="Allar 10 sagnir paraðar!" score="1.000 XP" stats={[['Tími', `${Math.round((Date.now() - start) / 1000)} sek.`], ['Nákvæmni', `${Math.round(1000 / Math.max(10, attempts))}%`]]} onAgain={() => location.reload()} goHome={goHome}/></GameFrame>
  return <GameFrame title="Paraðu saman" eyebrow={`Umferð ${round + 1} af 2`} goHome={goHome} aside={<span className="score-chip">{matched.length + round * 5}/10 pöruð</span>}><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-3"><p className="column-label">Danska</p>{current.map((v) => <button disabled={matched.includes(v.infinitiv)} key={v.infinitiv} onClick={() => setDanish(v.infinitiv)} className={`match-card ${danish === v.infinitiv ? 'selected' : ''} ${matched.includes(v.infinitiv) ? 'matched' : ''} ${wrong.startsWith(v.infinitiv) ? 'animate-shake wrong' : ''}`}>{matched.includes(v.infinitiv) ? <Check/> : null}{v.infinitiv}</button>)}</div><div className="space-y-3"><p className="column-label">Íslenska</p>{translations.map((word) => { const isMatched = current.some((v) => matched.includes(v.infinitiv) && v.translation === word); return <button disabled={isMatched} key={word} onClick={() => setIcelandic(word)} className={`match-card ${icelandic === word ? 'selected' : ''} ${isMatched ? 'matched' : ''} ${wrong.endsWith(word) ? 'animate-shake wrong' : ''}`}>{isMatched ? <Check/> : null}{word}</button> })}</div></div></GameFrame>
}

function ChoiceGame({ progress, setProgress, goHome, completeGame, tone }: CommonProps) {
  const [questions] = useState(() => shuffle(verbs.flatMap((verb) => tenses.map((skill) => ({ verb, skill })))).slice(0, 10)); const [index, setIndex] = useState(0); const [score, setScore] = useState(0); const [feedback, setFeedback] = useState<{ answer: string; correct: boolean } | null>(null)
  const q = questions[index]; const options = useMemo(() => q ? plausibleOptions(q.verb, q.skill) : [], [q])
  function answer(value: string) { if (feedback) return; const correct = value === q.verb[q.skill]; setFeedback({ answer: value, correct }); if (correct) setScore((s) => s + 100); setProgress((p) => recordAttempt(p, q.verb.infinitiv, q.skill, correct)); tone(correct) }
  function next() { if (index === questions.length - 1) { completeGame('choice', score + (feedback?.correct ? 0 : 0), score); if (score >= 800) confetti({ particleCount: 70, spread: 60 }); setIndex(questions.length) } else { setIndex((i) => i + 1); setFeedback(null) } }
  if (index >= questions.length) return <GameFrame title="Veldu rétta beygingu" eyebrow="Leik lokið" goHome={goHome}><Results title="Vel gert!" score={`${score} XP`} stats={[['Rétt svör', `${score / 100}/10`], ['Nákvæmni', `${score / 10}%`]]} onAgain={() => location.reload()} goHome={goHome}/></GameFrame>
  return <GameFrame title="Veldu rétta beygingu" eyebrow={`Spurning ${index + 1} af 10`} goHome={goHome} aside={<span className="score-chip">{score} stig</span>}><ProgressBar value={(index / 10) * 100}/><div className="question-card mt-6 text-center"><p className="text-sm font-black uppercase tracking-widest text-slate-400">Hvernig er <span className="text-violet-600">{tenseLabels[q.skill]}</span> af</p><div className="my-7 text-5xl font-black text-violet-700 dark:text-violet-300">{q.verb.infinitiv}</div><div className="grid gap-3 sm:grid-cols-2">{options.map((option) => { const state = feedback ? option === q.verb[q.skill] ? 'correct' : option === feedback.answer ? 'wrong' : 'muted' : ''; return <button key={option} onClick={() => answer(option)} className={`answer-btn ${state}`}>{state === 'correct' && <Check/>}{state === 'wrong' && <X/>}{option}</button> })}</div>{feedback && <div className={`feedback ${feedback.correct ? 'good' : 'bad'}`}><strong>{feedback.correct ? 'Rétt hjá þér!' : `Rétt svar er „${q.verb[q.skill]}“`}</strong><button className="btn-primary" onClick={next}>Næsta spurning</button></div>}</div></GameFrame>
}

function TypingGame({ progress, setProgress, goHome, completeGame, tone, mistakesOnly = false }: CommonProps & { mistakesOnly?: boolean }) {
  const [questions] = useState(() => mistakesOnly && progress.mistakes.length ? shuffle(progress.mistakes).slice(0, 12).map((m) => ({ verb: verbs.find((v) => v.infinitiv === m.verb)!, skill: (m.skill === 'translation' ? 'nutid' : m.skill) as Tense })) : weightedQuestions(progress, 10)); const [index, setIndex] = useState(0); const [value, setValue] = useState(''); const [hint, setHint] = useState(false); const [retry, setRetry] = useState(false); const [message, setMessage] = useState(''); const [score, setScore] = useState(0)
  const q = questions[index]
  function submit(e: FormEvent) { e.preventDefault(); if (!value.trim()) return; const correct = isCorrectAnswer(q.verb, q.skill, value); setProgress((p) => recordAttempt(p, q.verb.infinitiv, q.skill, correct)); tone(correct); if (correct) { const points = hint || retry ? 75 : 150; setScore((s) => s + points); setMessage(`Rétt! +${points} stig`); setTimeout(() => { if (index === questions.length - 1) { completeGame(mistakesOnly ? 'mistakes' : 'typing', score + points, score + points); setIndex(questions.length) } else { setIndex((i) => i + 1); setValue(''); setHint(false); setRetry(false); setMessage('') } }, 650) } else { setRetry(true); setMessage('Ekki alveg – reyndu aftur. Þetta fer í mistakaæfinguna.') } }
  if (!q) return <GameFrame title={mistakesOnly ? 'Æfa mistökin mín' : 'Skrifaðu rétt'} eyebrow="Æfingu lokið" goHome={goHome}><Results title={mistakesOnly ? 'Mistökin eru orðin að styrkleika!' : 'Frábær minnisæfing!'} score={`${score} XP`} stats={[['Spurningar', `${questions.length}`], ['Án valkosta', '100%']]} onAgain={() => location.reload()} goHome={goHome}/></GameFrame>
  const answer = q.verb[q.skill]; const clue = q.skill === 'førnutid' ? `${answer.split(' ')[0]} ${answer.split(' ')[1][0]}… (${answer.length} stafir með bili)` : `${answer[0]}${'•'.repeat(Math.max(1, answer.length - 2))}${answer.at(-1)} (${answer.length} stafir)`
  return <GameFrame title={mistakesOnly ? 'Æfa mistökin mín' : 'Skrifaðu rétt'} eyebrow={`Minni · ${index + 1} af ${questions.length}`} goHome={goHome} aside={<span className="score-chip">{score} stig</span>}><ProgressBar value={(index / questions.length) * 100}/><div className="question-card mt-6"><div className="text-center"><p className="text-sm font-black uppercase tracking-widest text-slate-400">Skrifaðu {tenseLabels[q.skill]}</p><h2 className="mt-3 text-5xl font-black text-violet-700 dark:text-violet-300">{q.verb.infinitiv}</h2><p className="mt-2 font-bold text-slate-400">{q.verb.translation}</p></div><form className="mx-auto mt-8 max-w-lg" onSubmit={submit}><label className="sr-only" htmlFor="typing-answer">Svarið þitt</label><input id="typing-answer" autoFocus autoComplete="off" className={`typing-input ${message.startsWith('Ekki') ? 'border-rose-400' : ''}`} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Skrifaðu beyginguna…"/><div className="mt-3 flex flex-wrap justify-between gap-3"><button type="button" className="btn-secondary" onClick={() => setHint(true)} disabled={hint}><Sparkles size={18}/> Vísbending</button><button className="btn-primary">Svara <span className="hidden sm:inline">· Enter</span></button></div></form>{hint && <div className="hint-box">Vísbending: <strong>{clue}</strong> · Hámark 75 stig</div>}{message && <div className={`feedback ${message.startsWith('Rétt') ? 'good' : 'bad'}`}><strong>{message}</strong></div>}</div></GameFrame>
}

type SpeedQuestion = { verb: Verb; skill: Tense | 'translation'; prompt: string; options: string[]; answer: string }
function makeSpeedQuestion(): SpeedQuestion { const verb = verbs[Math.floor(Math.random() * verbs.length)]; const translation = Math.random() < .35; if (translation) return { verb, skill: 'translation', prompt: `Hvað þýðir „${verb.infinitiv}“?`, options: shuffle([verb.translation, ...shuffle(verbs.filter((v) => v !== verb).map((v) => v.translation)).slice(0, 3)]), answer: verb.translation }; const skill = tenses[Math.floor(Math.random() * 3)]; return { verb, skill, prompt: `${tenseLabels[skill]} af „${verb.infinitiv}“?`, options: plausibleOptions(verb, skill), answer: verb[skill] } }
function SpeedGame({ progress, setProgress, goHome, completeGame, tone }: CommonProps) {
  const [started, setStarted] = useState(false); const [time, setTime] = useState(60); const [question, setQuestion] = useState(makeSpeedQuestion); const [score, setScore] = useState(0); const [streak, setStreak] = useState(0); const [longest, setLongest] = useState(0); const [total, setTotal] = useState(0); const [correctCount, setCorrectCount] = useState(0); const doneRef = useRef(false)
  useEffect(() => { if (!started || time <= 0) return; const id = setInterval(() => setTime((t) => t - 1), 1000); return () => clearInterval(id) }, [started, time])
  useEffect(() => { if (time !== 0 || doneRef.current) return; doneRef.current = true; completeGame('speed', score, score); if (score > (progress.best.speed || 0)) confetti({ particleCount: 100, spread: 80 }) }, [time]) // eslint-disable-line react-hooks/exhaustive-deps
  function answer(value: string) { const correct = value === question.answer; const nextStreak = correct ? streak + 1 : 0; const points = scoreSpeed(correct, nextStreak); setScore((s) => s + points); setStreak(nextStreak); setLongest((s) => Math.max(s, nextStreak)); setTotal((v) => v + 1); if (correct) setCorrectCount((v) => v + 1); setProgress((p) => recordAttempt(p, question.verb.infinitiv, question.skill, correct)); tone(correct); setQuestion(makeSpeedQuestion()) }
  if (!started) return <GameFrame title="Hraðakeppni" eyebrow="60 sekúndur" goHome={goHome}><div className="question-card text-center"><div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-rose-600 text-5xl text-white shadow-game"><Zap/></div><h2 className="mt-7 text-3xl font-black">Tilbúin í hraðann?</h2><p className="mx-auto mt-3 max-w-md font-semibold text-slate-500">Rétt svar gefur 100 stig og samfelld rétt svör gefa bónus. Klukkan byrjar um leið og þú ýtir.</p><button className="btn-primary mt-7" onClick={() => setStarted(true)}>Byrja 60 sekúndur</button></div></GameFrame>
  if (time === 0) return <GameFrame title="Hraðakeppni" eyebrow="Tíminn er búinn" goHome={goHome}><Results title={score > (progress.best.speed || 0) ? 'Nýtt persónulegt met!' : 'Flott hraðakeppni!'} score={`${score} stig`} stats={[['Nákvæmni', `${total ? Math.round(correctCount / total * 100) : 0}%`], ['Lengsta röð', `${longest}`], ['Svör', `${total}`]]} onAgain={() => location.reload()} goHome={goHome}/></GameFrame>
  return <GameFrame title="Hraðakeppni" eyebrow="Svaraðu hratt" goHome={goHome} aside={<div className="flex gap-2"><span className="score-chip">🔥 {streak}</span><span className={`timer ${time <= 10 ? 'danger' : ''}`}><Clock3/>{time}</span></div>}><div className="question-card text-center"><p className="text-lg font-black text-slate-500">{question.prompt}</p><div className="my-5 text-3xl font-black text-orange-500">{score.toLocaleString('is-IS')} stig</div><div className="grid gap-3 sm:grid-cols-2">{question.options.map((option) => <button className="answer-btn" key={option} onClick={() => answer(option)}>{option}</button>)}</div></div></GameFrame>
}

function ExamGame({ progress, setProgress, goHome, completeGame, tone }: CommonProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({}); const [results, setResults] = useState<ReturnType<typeof gradeExam> | null>(null); const [retryOnly, setRetryOnly] = useState(false)
  const visible = retryOnly && results ? new Set(results.filter((r) => !r.correct).map((r) => `${r.verb}:${r.skill}`)) : null
  function submit() { const graded = gradeExam(answers); setResults(graded); const correct = graded.filter((r) => r.correct).length; const percentage = Math.round(correct / 40 * 100); graded.forEach((r) => setProgress((p) => recordAttempt(p, r.verb, r.skill, r.correct))); completeGame('exam', percentage, correct * 25); tone(percentage >= 70); if (percentage === 100) confetti({ particleCount: 200, spread: 110, origin: { y: .5 } }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  function retryMistakes() { const next = { ...answers }; results?.filter((r) => !r.correct).forEach((r) => { next[`${r.verb}:${r.skill}`] = '' }); setAnswers(next); setRetryOnly(true); setResults(null) }
  const correctCount = results?.filter((r) => r.correct).length || 0; const percentage = Math.round(correctCount / 40 * 100)
  return <GameFrame title="Lokaprófið" eyebrow="Final boss · 40 svör" goHome={goHome} aside={<span className="score-chip">Met: {progress.best.exam || 0}%</span>}>
    {results && <div className={`exam-summary ${percentage === 100 ? 'gold' : ''}`}><div className="text-5xl">{percentage === 100 ? '🏆' : percentage >= 70 ? '🎉' : '💪'}</div><div><p className="eyebrow">Niðurstaða</p><h2 className="text-3xl font-black">{percentage}% rétt · {correctCount}/40</h2><p className="font-semibold text-slate-500">{percentage === 100 ? 'Fullkomið próf! Gullbikarinn er þinn.' : 'Mistök eru merkt og rétta svarið birtist fyrir neðan.'}</p></div></div>}
    <div className="exam-table mt-6"><div className="exam-head"><span>Infinitiv</span><span>Nutid</span><span>Datid</span><span>Førnutid</span><span>Íslenska</span></div>{verbs.map((verb) => <div className="exam-row" key={verb.infinitiv}><div className="exam-verb">{verb.infinitiv}<small>{verb.translation}</small></div>{([...tenses, 'translation'] as SkillKey[]).map((skill) => { const key = `${verb.infinitiv}:${skill}`; if (visible && !visible.has(key)) return <div key={key} className="exam-kept"><Check/> Rétt</div>; const result = results?.find((r) => r.verb === verb.infinitiv && r.skill === skill); return <label key={key} className="exam-field"><span>{skill === 'translation' ? 'Íslenska' : tenseLabels[skill]}</span><input disabled={!!results} value={answers[key] || ''} onChange={(e) => setAnswers((a) => ({ ...a, [key]: e.target.value }))} className={result ? result.correct ? 'is-correct' : 'is-wrong' : ''}/>{result && !result.correct && <small>Rétt: {result.expected}</small>}</label> })}</div>)}</div>
    {!results ? <div className="mt-6 flex justify-end"><button className="btn-primary" onClick={submit}><Medal/> Skila prófi</button></div> : <div className="mt-6 flex flex-wrap justify-center gap-3">{percentage < 100 && <button className="btn-primary" onClick={retryMistakes}><RotateCcw/> Reyna aðeins aftur við mistökin</button>}<button className="btn-secondary" onClick={() => { setAnswers({}); setResults(null); setRetryOnly(false) }}>Byrja allt prófið aftur</button></div>}
  </GameFrame>
}

function Results({ title, score, stats, onAgain, goHome }: { title: string; score: string; stats: [string, string][]; onAgain: () => void; goHome: () => void }) { return <div className="question-card text-center animate-pop"><div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-amber-100 text-5xl">🏆</div><h2 className="mt-6 text-3xl font-black">{title}</h2><div className="mt-2 text-2xl font-black text-violet-600">{score}</div><div className="mx-auto mt-7 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-3">{stats.map(([label, value]) => <div className="result-stat" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div><div className="mt-8 flex flex-wrap justify-center gap-3"><button className="btn-primary" onClick={onAgain}><RotateCcw/> Spila aftur</button><button className="btn-secondary" onClick={goHome}>Fara heim</button></div></div> }
function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) { return <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><div className="mb-2 text-amber-300">{icon}</div><strong className="block text-2xl font-black">{value}</strong><span className="text-xs font-bold uppercase tracking-wider text-violet-200">{label}</span></div> }
function ProgressBar({ value, light = false }: { value: number; light?: boolean }) { return <div className={`progress-track ${light ? 'bg-white/20' : ''}`}><span style={{ width: `${Math.max(2, Math.min(100, value))}%` }}/></div> }

export default App
