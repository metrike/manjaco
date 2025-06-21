// app/services/scrapeAllWorks.ts
import puppeteer, { Browser, Page } from 'puppeteer'
import { scrapeChapterCount } from './scrapeChapterCount.js'
import { ScraperConfig, ListPageSelectors } from '#types/scraper'

interface WorkInfo {
  title         : string;
  sourceUrl     : string;
  coverUrl      : string | null;
  totalChapters : number;
  latestText?   : string;   // ← nouvelle propriété facultative
}


export async function scrapeAllWorks ({
                                        root,
                                        listPath,
                                        selectors,
                                        chapterSelectors,
                                        /** limite facultative : 0 ⇒ illimité       */
                                        limit          = 0,
                                        parallelChunks = 5,
                                      }: ScraperConfig): Promise<WorkInfo[]> {

  /* ────────────────────────── CONFIG / LOG ────────────────────────── */
  const hardLimit = limit && limit > 0 ? limit : Number.POSITIVE_INFINITY
  console.log(`🚀 scrapeAllWorks  – limit = ${hardLimit}`)

  const { card, link, title: titleSel, img: imgSel,
    loadMore, nextPage } : ListPageSelectors = selectors

  /* ────────────────────── LANCEMENT CHROMIUM ──────────────────────── */
  const browser: Browser = await puppeteer.launch({
    headless : 'new',
    args : [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled', // moins détectable
    ],
    defaultViewport: { width: 1280, height: 1080 },
  })
  console.log('🧭 Chromium prêt')

  try {
    const page: Page = await browser.newPage()

    /* ↳ vrai user-agent desktop – évite le blank/404 en headless */
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    )

    /* URL absolue de la page liste */
    const base = root.replace(/\/$/, '')
    let currentUrl = `${base}${listPath.startsWith('/') ? '' : '/'}${listPath}`

    const thumbs: { title: string; sourceUrl: string; coverUrl: string|null }[] = []

    /* ────────────────── BOUCLE LISTE + PAGINATION ─────────────────── */
    while (thumbs.length < hardLimit) {
      console.log(`➡️  Visite liste : ${currentUrl}`)
      await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: 0 })

      /* Patiente AU MAX 15 s que la 1ʳᵉ carte arrive, sinon on stoppe */
      try {
        await page.waitForSelector(card, { timeout: 15_000 })
      } catch {
        console.warn('⚠️  Aucun résultat – abandon de la page')
        break
      }

      /* 1️⃣  Load-more (Scan-Manga n’en a pas, mais on garde le code générique) */
      if (loadMore) {
        let clicks = 0
        while (true) {
          const btn = await page.$(loadMore)
          if (!btn) break

          const before = await page.$$eval(card, els => els.length)
          await btn.click(); clicks++

          try {
            await page.waitForFunction(
              (sel:string, prev:number) =>
                document.querySelectorAll(sel).length > prev,
              { timeout: 10_000, polling: 250 },
              card, before,
            )
          } catch { break }
        }
        if (clicks) console.log(`   ↳ ${clicks} click(s) “load-more”`)
      }

      /* 2️⃣  Extraction des vignettes */
      const pageWorks = await page.$$eval(
        `${card} ${link}`,
        /* on reçoit anchors (NodeList) + sélecteurs côté page */
        (anchors, { card, titleSel, imgSel, latestSel }) =>
          anchors.map(a => {
            const cardEl   = (a as HTMLElement).closest(card)!;
            const titleEl  = titleSel ? cardEl.querySelector(titleSel) : a;
            const imgEl    = imgSel  ? cardEl.querySelector<HTMLImageElement>(imgSel) : null;
            const latestEl = latestSel ? cardEl.querySelector(latestSel) : null;

            return {
              title      : titleEl?.textContent?.trim() ?? '',
              sourceUrl  : (a as HTMLAnchorElement).href,
              coverUrl   : imgEl?.getAttribute('data-src') || imgEl?.src || null,
              /* ←—— texte “Chapitre xxx” pour comptage rapide */
              latestText : latestEl?.textContent ?? '',
            };
          }),
        { card, titleSel, imgSel, latestSel: selectors.latestChapter },
      );

      console.log(`   ↳ ${pageWorks.length} série(s) trouvée(s)`)

      /* 3️⃣  Ajout sans doublon */
      for (const w of pageWorks) {
        if (w.sourceUrl && !thumbs.find(t => t.sourceUrl === w.sourceUrl)
          && thumbs.length < hardLimit) thumbs.push(w)
      }
      console.log(`📊 Total : ${thumbs.length}/${hardLimit}`)

      /* 4️⃣  Page suivante */
      if (thumbs.length >= hardLimit || !nextPage) break
      const next = await page.$(nextPage)
      if (!next) break
      currentUrl = await page.evaluate(a => (a as HTMLAnchorElement).href, next)
    }

    console.log(`✅ Listage terminé – ${thumbs.length} série(s)`)

    /* ───────────── Comptage des chapitres ───────────── */
    const final: WorkInfo[] = []
    /*  thumbs doit maintenant contenir :
     {
       title       : string,
       sourceUrl   : string,
       coverUrl    : string|null,
       latestText? : string        // ex. « Chapitre 123 »
     }
 */

    for (let i = 0; i < thumbs.length; i += parallelChunks) {
      const batch = thumbs.slice(i, i + parallelChunks)
      console.log(`🔄 Batch chapitres ${i + 1}-${i + batch.length}`)

      /* ↳ Pour chaque série du batch :
           1) on tente le comptage « rapide » (latestText)
           2) sinon on scrape la page chapitres           */
      const counts = await Promise.all(
        batch.map(async (w) => {
          /* —— Tentative rapide ——————————————————————— */
          const quickMatch = w.latestText?.match(/\bchap(?:itre)?\s*(\d+)/i)
          if (quickMatch) {
            const quickCount = Number(quickMatch[1])
            console.log(`   • ${w.title} (quick) → ${quickCount}`)
            return quickCount
          }

          /* —— Fallback scraping ———————————————————— */
          try {
            const full = await scrapeChapterCount({
              url: w.sourceUrl,
              selectors: chapterSelectors,
            })
            return full
          } catch {
            return 0
          }
        }),
      )

      /* —— On pousse les résultats ————————————————————— */
      batch.forEach((w, idx) => {
        final.push({ ...w, totalChapters: counts[idx] })
        console.log(`   • ${w.title} → ${counts[idx]}`)
      })
    }


    console.log('🏁 Scraping complet ✅')
    return final

  } finally {
    await browser.close(); console.log('👋 Chromium fermé')
  }
}
