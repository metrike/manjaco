import puppeteer, { Browser, Page } from 'puppeteer'

/* ───────────── Types de configuration ───────────── */

export interface ChapterPageSelectors {
  /** Sélecteur CSS qui cible chaque chapitre (obligatoire) */
  chapter: string
  /** Bouton « Load-more » (facultatif ; si absent, on ne clique rien) */
  loadMore?: string
}

export interface ChapterScraperConfig {
  /** URL complète de la série à analyser */
  url: string
  /** Sélecteurs propres au site */
  selectors: ChapterPageSelectors
  /** Timeout d’apparition du 1ᵉʳ chapitre (ms) – par défaut : 15 000 ms */
  firstChapterTimeout?: number
}

/* ───────────── Fonction principale ───────────── */

export async function scrapeChapterCount ({
                                            url,
                                            selectors,
                                            firstChapterTimeout = 15_000,
                                          }: ChapterScraperConfig): Promise<number> {

  const browser: Browser = await puppeteer.launch({
    headless       : true,
    args           : ['--no-sandbox'],
    defaultViewport: { width: 1280, height: 1080 },
  })

  try {
    const page: Page = await browser.newPage()

    /* 1. Navigation */
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 })

    /* 2. On attend qu’au moins un chapitre existe */
    await page.waitForSelector(selectors.chapter, {
      timeout: firstChapterTimeout,
    })

    /* 3. Optionnel : click “Load more” jusqu’à disparition */
    if (selectors.loadMore) {
      while (true) {
        const btn = await page.$(selectors.loadMore)
        if (!btn) break

        /* nombre de chapitres avant le clic */
        const before = await page.$$eval(selectors.chapter, els => els.length)

        await Promise.all([
          page.waitForResponse(() => true), // AJAX
          btn.click(),
        ])

        try {
          await page.waitForFunction(
            (sel, prev) =>
              document.querySelectorAll(sel).length > prev,
            { timeout: 10_000, polling: 250 },
            selectors.chapter,
            before,
          )
        } catch {
          break // plus rien ne se charge
        }
      }
    }

    /* 4. Compte final */
    const count: number = await page.$$eval(
      selectors.chapter,
      els => els.length,
    )
    console.log(`✅ ${url} → ${count} chapitres`)
    return count
  } finally {
    await browser.close()
  }
}
