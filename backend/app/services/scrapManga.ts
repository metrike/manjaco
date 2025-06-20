import puppeteer, { Browser, Page } from 'puppeteer'
import { scrapeChapterCount } from './scrapeChapterCount.js'

export interface MangaInfo {
  title: string
  sourceUrl: string
  coverUrl: string | null
  totalChapters: number
}

export async function scrapeAllManga (
  root = 'https://phenix-scans.com',
  limit = 10,
  parallelChunks = 5,
): Promise<MangaInfo[]> {
  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
    defaultViewport: { width: 1280, height: 1080 },
  })

  try {
    const page: Page = await browser.newPage()
    let currentUrl = `${root}/manga/`

    /** Vignettes collectées sans doublon */
    const thumbs: {
      title: string
      sourceUrl: string
      coverUrl: string | null
    }[] = []

    /* ---------- navigation + load-more jusqu’à atteindre « limit » ---------- */
    while (thumbs.length < limit) {
      await page.goto(currentUrl, { waitUntil: 'networkidle2', timeout: 0 })

      /* 1) Cliquer sur “Load more” tant qu’il existe et qu’il charge de nouvelles cartes */
      while (true) {
        const btn = await page.$(
          'div.manga-list__load-more > button, button.btn-load-more, button.series-load-more',
        )
        if (!btn) break

        const before = await page.$$eval('div.manga-list__card', els => els.length)
        await btn.click()

        try {
          await page.waitForFunction(
            prev => document.querySelectorAll('div.manga-list__card').length > prev,
            { timeout: 10_000, polling: 250 },
            before,
          )
        } catch {
          break // le bouton ne charge plus rien → on sort du while-true
        }
      }

      /* 2) Extraire toutes les cartes visibles sur la page courante */
      const pageManga = await page.$$eval(
        'div.manga-list__card a.manga-list__link',
        anchors =>
          anchors.map(a => {
            const card   = a.closest('.manga-list__card') as HTMLElement
            const titleE = card?.querySelector('.manga-list__card-title') ?? a
            const img    = card?.querySelector<HTMLImageElement>('img')
            return {
              title    : titleE?.textContent?.trim() ?? '',
              sourceUrl: (a as HTMLAnchorElement).href,
              coverUrl : img?.getAttribute('data-src') || img?.src || null,
            }
          }),
      )

      /* 3) Ajout sans doublon */
      pageManga.forEach(m => {
        if (
          m.sourceUrl &&
          !thumbs.find(t => t.sourceUrl === m.sourceUrl) &&
          thumbs.length < limit
        ) {
          thumbs.push(m)
        }
      })

      if (thumbs.length >= limit) break

      /* 4) Page suivante si lien “Next” présent */
      const next = await page.$('a[rel="next"], a.page-numbers.next')
      if (!next) break
      currentUrl = await page.evaluate(
        a => (a as HTMLAnchorElement).href,
        next,
      )
    }

    /* ---------- Comptage des chapitres en paquets parallèles ---------- */
    const final: MangaInfo[] = []
    for (let i = 0; i < thumbs.length; i += parallelChunks) {
      const slice = thumbs.slice(i, i + parallelChunks)

      const counts = await Promise.all(
        slice.map(({ sourceUrl }) =>
          scrapeChapterCount(sourceUrl).catch(() => 0),
        ),
      )

      slice.forEach((m, idx) =>
        final.push({ ...m, totalChapters: counts[idx] }),
      )
    }

    return final.slice(0, limit)
  } finally {
    await browser.close()
  }
}
