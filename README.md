# Dansk Verb Battle

Leikjamiðuð æfingasíða fyrir 10 danskar óreglulegar sagnir. Viðmótið er á íslensku og allar beygingar koma úr einni yfirfarinni gagnaskrá í `src/data/verbs.ts`.

## Leikhamir

- Paraðu saman – dönsk nafnháttarmynd og íslensk þýðing
- Veldu rétta beygingu – nutid, datid og førnutid
- Skrifaðu rétt – virk upprifjun án svarmöguleika
- Hraðakeppni – 60 sekúndna stigakeppni
- Lokaprófið – öll 40 svörin úr vinnublaðinu
- Æfa mistökin mín – persónuleg æfing úr fyrri villum

Framvinda, XP, met, mistök, æfingalota og litastillingar vistast eingöngu í `localStorage` í tækinu.

## Keyra á tölvu

```bash
pnpm install
pnpm dev
```

## Prófanir og bygging

```bash
pnpm test
pnpm build
```

`dist/` mappan er tilbúin fyrir GitHub Pages. Vite er stillt með grunnslóðinni `/danska/`.

## GitHub Pages

Verkflæðið í `.github/workflows/deploy.yml` byggir síðuna og birtir hana sjálfkrafa við hverja breytingu á `main`.
