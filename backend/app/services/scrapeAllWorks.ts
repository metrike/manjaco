// app/services/scrapeAllWorks.ts
import { scrapeChapterCount } from './scrapeChapterCount.js'
import { ScraperConfig, ListPageSelectors } from '#types/scraper'
import { mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

// @ts-ignore
import puppeteerExtraImport from 'puppeteer-extra'
const puppeteerExtra = puppeteerExtraImport.default || puppeteerExtraImport

// @ts-ignore
import AnonymizeUAPlugin from 'puppeteer-extra-plugin-anonymize-ua'
const AnonymizeUA = AnonymizeUAPlugin.default || AnonymizeUAPlugin

puppeteerExtra.use(StealthPlugin())
puppeteerExtra.use(AnonymizeUA())

import type { Page } from 'puppeteer'

interface WorkInfo {
  title: string
  sourceUrl: string
  coverUrl: string | null
  totalChapters: number
  latestText?: string
}

export async function scrapeAllWorks({
                                       root,
                                       listPath,
                                       selectors,
                                       chapterSelectors,
                                       limit = 0,
                                       parallelChunks = 5,
                                     }: ScraperConfig): Promise<WorkInfo[]> {
  const hardLimit = limit && limit > 0 ? limit : Number.POSITIVE_INFINITY
  console.log(`🚀 scrapeAllWorks – limit = ${hardLimit}`)

  const { card, link, title: titleSel, img: imgSel, loadMore, nextPage }: ListPageSelectors = selectors

  const browser = await puppeteerExtra.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1280,800'
    ],
  })

  console.log('🧽 Chromium prêt')

  try {
    const page: Page = await browser.newPage()

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36')
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'fr-FR,fr;q=0.9',
      'Referer': 'https://www.google.com/',
    })

    await page.evaluateOnNewDocument(() => {
      // @ts-ignore
      Object.defineProperty(navigator, 'webdriver', { get: () => false })
      // @ts-ignore
      window.navigator.chrome = { runtime: {} }
      // @ts-ignore
      Object.defineProperty(navigator, 'languages', { get: () => ['fr-FR', 'fr'] })
      // @ts-ignore
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] })
    })

    const base = root.replace(/\/$/, '')
    let currentUrl = `${base}${listPath.startsWith('/') ? '' : '/'}${listPath}`

    const thumbs: WorkInfo[] = []

    while (thumbs.length < hardLimit) {
      console.log(`➔  Visite liste : ${currentUrl}`)
      await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })

      if (!existsSync('./tmp')) mkdirSync('./tmp')
      await page.screenshot({ path: '/tmp/page.png', fullPage: true })
      console.log('🗼 Screenshot saved to /tmp/page.png')

      try {
        await page.waitForSelector(card, { timeout: 15000 })
      } catch {
        console.warn('⚠️  Aucun résultat – abandon de la page')
        break
      }

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
              (sel: string, prev: number) => document.querySelectorAll(sel).length > prev,
              { timeout: 10000 },
              card,
              before
            )
          } catch {
            break
          }
        }
        if (clicks) console.log(`   ↳ ${clicks} click(s) “load-more”`)
      }

      const pageWorks = await page.$$eval(
        `${card} ${link}`,
        (anchors, { card, titleSel, imgSel, latestSel }) =>
          anchors.map((a) => {
            const cardEl = (a as any).closest(card)!
            const titleEl = titleSel ? cardEl.querySelector(titleSel) : a
            const imgEl = imgSel ? cardEl.querySelector(imgSel) : null
            const latestEl = latestSel ? cardEl.querySelector(latestSel) : null

            return {
              title: titleEl?.textContent?.trim() ?? '',
              sourceUrl: (a as any).href,
              coverUrl: imgEl?.getAttribute('data-src') || imgEl?.src || null,
              latestText: latestEl?.textContent ?? '',
            }
          }),
        { card, titleSel, imgSel, latestSel: selectors.latestChapter }
      )

      console.log(`   ↳ ${pageWorks.length} série(s) trouvée(s)`)

      for (const w of pageWorks) {
        if (
          w.sourceUrl &&
          !thumbs.find(t => t.sourceUrl === w.sourceUrl) &&
          thumbs.length < hardLimit
        ) {
          thumbs.push(w as WorkInfo)
        }
      }
      console.log(`📊 Total : ${thumbs.length}/${hardLimit}`)

      if (thumbs.length >= hardLimit || !nextPage) break

      const next = await page.$(nextPage)
      if (!next) break
      currentUrl = await page.evaluate(a => (a as any).href, next)
    }

    console.log(`✅ Listage terminé – ${thumbs.length} série(s)`)

    const final: WorkInfo[] = []

    for (let i = 0; i < thumbs.length; i += parallelChunks) {
      const batch = thumbs.slice(i, i + parallelChunks)
      console.log(`🔄 Batch chapitres ${i + 1}-${i + batch.length}`)

      const counts = await Promise.all(
        batch.map(async (w) => {
          const quickMatch = w.latestText?.match(/\bchap(?:itre)?\s*(\d+)/i)
          if (quickMatch) {
            const quickCount = Number(quickMatch[1])
            console.log(`   • ${w.title} (quick) → ${quickCount}`)
            return quickCount
          }

          try {
            return await scrapeChapterCount({
              url: w.sourceUrl,
              selectors: chapterSelectors,
            })
          } catch {
            return 0
          }
        })
      )

      batch.forEach((w, idx) => {
        final.push({ ...w, totalChapters: counts[idx] })
        console.log(`   • ${w.title} → ${counts[idx]}`)
      })
    }

    console.log('🏁 Scraping complet ✅')
    return final
  } finally {
    await browser.close()
    console.log('💋 Chromium fermé')
  }
}
