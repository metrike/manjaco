import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Website from '#models/website'
import Work from '#models/work'
import { scrapeAllWorks } from '#services/scrapeAllWorks'
import { ScraperConfig } from '#types/scraper'
import { DateTime } from 'luxon'

export default class WorkSeeder extends BaseSeeder {
  public static developmentOnly = true

  public async run () {
    const websites = await Website.all()

    for (const site of websites) {
      const scraperConfig: ScraperConfig = {
        root            : site.root,
        listPath        : site.listPath,
        selectors       : site.selectors as any,
        chapterSelectors: site.chapterSelectors as any,
        limit           : site.limit,
        parallelChunks  : site.parallelChunks,
        coverInPage     : site.coverInPage ?? false,
      }

      console.log(`🔍 Scraping depuis ${site.name}...`)
      const works = await scrapeAllWorks(scraperConfig)

      await Work.createMany(
        works.map((w) => ({
          title         : w.title,
          sourceUrl     : w.sourceUrl,
          coverUrl      : w.coverUrl ?? '', // Correction ici
          totalChapters : w.totalChapters,
          type          : 'MANGA', // à adapter si besoin
          lastScrapedAt : DateTime.now(), // Correction ici
        }))
      )

      console.log(`✅ ${works.length} œuvres importées depuis ${site.name}`)
    }
  }
}
