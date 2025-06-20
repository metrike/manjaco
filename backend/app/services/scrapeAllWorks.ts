// app/services/scrape_all_works.ts
import puppeteer, { Browser, Page } from 'puppeteer'
import { scrapeChapterCount } from './scrapeChapterCount.js'
import { ScraperConfig, ListPageSelectors } from '#types/scraper'

export interface WorkInfo {
  title: string
  sourceUrl: string
  coverUrl: string | null
  totalChapters: number
}

export async function scrapeAllWorks ({
                                        root,
                                        listPath,
                                        selectors,
                                        chapterSelectors,
                                        /**  ⬇️  Limite facultative : Infinity ⇒ tout prendre                */
                                        limit = 0,
                                        parallelChunks = 5,
                                      }: ScraperConfig): Promise<WorkInfo[]> {

  /* ––––––––––––––––– Étape 0 : log config ––––––––––––––––– */
  const hardLimit = limit && limit > 0 ? limit : Number.POSITIVE_INFINITY
  console.log(`🚀 Lancement scrapeAllWorks (limit = ${hardLimit})`)

  /* -------------------- Sélecteurs de la page liste -------------------- */
  const {
    card,
    link,
    title: titleSel,
    img: imgSel,
    loadMore,
    nextPage,
  }: ListPageSelectors = selectors

  /* -------------------- Lancement du navigateur -------------------- */
  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
    defaultViewport: { width: 1280, height: 1080 },
  })
  console.log('🧭 Chromium lancé')

  try {
    const page: Page = await browser.newPage()
    const base = root.replace(/\/$/, '')
    let currentUrl = `${base}${listPath.startsWith('/') ? '' : '/'}${listPath}`

    const thumbs: { title: string; sourceUrl: string; coverUrl: string | null }[] = []

    /* -------------------- Boucle liste + pagination -------------------- */
    while (thumbs.length < hardLimit) {
      console.log(`➡️  Visite page liste : ${currentUrl}`)
      await page.goto(currentUrl, { waitUntil: 'networkidle2', timeout: 0 })

      /* 1️⃣ Load-more (si présent) */
      if (loadMore) {
        let clicks = 0
        while (true) {
          const btn = await page.$(loadMore)
          if (!btn) break

          const before = await page.$$eval(card, els => els.length)
          await btn.click()
          clicks++

          try {
            await page.waitForFunction(
              (sel: string, prev: number) =>
                document.querySelectorAll(sel).length > prev,
              { timeout: 10_000, polling: 250 },
              card,
              before,
            )
          } catch {
            /* plus rien à charger */
            break
          }
        }
        if (clicks) console.log(`   ↳ ${clicks} clic(s) “Load more”`)
      }

      /* 2️⃣ Extraction des vignettes visibles */
      const pageManga = await page.$$eval(
        `${card} ${link}`,
        (anchors, { card, titleSel, imgSel }) =>
          anchors.map(a => {
            const cardEl  = (a as HTMLElement).closest(card) as HTMLElement | null
            const titleEl = titleSel ? cardEl?.querySelector(titleSel) : a
            const imgEl   = imgSel ? cardEl?.querySelector<HTMLImageElement>(imgSel) : null
            return {
              title: titleEl?.textContent?.trim() ?? '',
              sourceUrl: (a as HTMLAnchorElement).href,
              coverUrl: imgEl?.getAttribute('data-src') || imgEl?.src || null,
            }
          }),
        { card, titleSel, imgSel },
      )
      console.log(`   ↳ ${pageManga.length} série(s) détectée(s) sur la page`)

      /* 3️⃣ Ajout sans doublon */
      for (const m of pageManga) {
        if (
          m.sourceUrl &&
          !thumbs.find(t => t.sourceUrl === m.sourceUrl) &&
          thumbs.length < hardLimit
        ) {
          thumbs.push(m)
        }
      }
      console.log(`📊 Total cumul : ${thumbs.length}/${hardLimit}`)

      /* 4️⃣ Pagination "Suivant" */
      if (thumbs.length >= hardLimit || !nextPage) break
      const next = await page.$(nextPage)
      if (!next) break
      currentUrl = await page.evaluate(a => (a as HTMLAnchorElement).href, next)
    }

    console.log(`✅ Listage terminé : ${thumbs.length} série(s)`)

    /* -------------------- Comptage des chapitres -------------------- */
    const final: WorkInfo[] = []
    for (let i = 0; i < thumbs.length; i += parallelChunks) {
      const slice = thumbs.slice(i, i + parallelChunks)
      console.log(`🔄 Lot chapitres ${i + 1}-${i + slice.length}`)

      const counts = await Promise.all(
        slice.map(({ sourceUrl }) =>
          scrapeChapterCount({
            url: sourceUrl,
            selectors: chapterSelectors,
          }).catch(() => 0),
        ),
      )

      slice.forEach((m, idx) => {
        final.push({ ...m, totalChapters: counts[idx] })
        console.log(`   • ${m.title} → ${counts[idx]} chapitres`)
      })
    }

    console.log('🏁 Scraping complet ✅')
    return final
  } finally {
    await browser.close()
    console.log('👋 Chromium fermé')
  }
}
