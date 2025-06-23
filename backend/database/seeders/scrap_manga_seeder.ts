import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Website from '#models/website'
import Work from '#models/work'
import { DateTime } from 'luxon'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default class WorkSeeder extends BaseSeeder {
  public static developmentOnly = true

  private wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async scrapeMangaListWithRetry(page: number, retries = 2): Promise<{ title: string, link: string, cover: string | null }[]> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const result = await this.scrapeMangaList(page)
      if (result.length > 0) return result

      console.warn(`🔁 Retry ${attempt} pour la page ${page} après 5s...`)
      await this.wait(5000)
    }

    return []
  }

  private async scrapeMangaList(page: number): Promise<{ title: string, link: string, cover: string | null }[]> {
    const url = `https://www.mangakakalot.gg/genre/all?type=topview&category=all&state=all&page=${page}`
    try {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36'
        }
      })

      const $ = cheerio.load(data)
      const results: { title: string, link: string, cover: string | null }[] = []

      $('.list-truyen-item-wrap').each((_, el) => {
        const title = $(el).find('h3 a').text().trim()
        const link = $(el).find('h3 a').attr('href')
        const cover = $(el).find('img').attr('src') || null

        if (title && link) {
          results.push({ title, link, cover })
        }
      })

      return results
    } catch (err) {
      console.error(`❌ Erreur scraping page ${page}:`, err.message)
      return []
    }
  }

  private async getChapterCount(url: string): Promise<number> {
    try {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36'
        }
      })

      const $ = cheerio.load(data)
      const chapters = $('#chapter .row')
      return chapters.length
    } catch (err) {
      console.error(`❌ Erreur scraping chapitres de ${url}:`, err.message)
      return 0
    }
  }

  public async run() {
    const site = await Website.findByOrFail('name', 'Mangakakalot')
    console.log(`🔍 Scraping depuis ${site.name}...`)

    const allResults: { title: string, link: string, cover: string | null }[] = []

    for (let page = 1; page <= 1; page++) {
      console.log(`🔄 Scraping page ${page}`)
      const mangas = await this.scrapeMangaListWithRetry(page)
      allResults.push(...mangas)

      const delay = Math.floor(Math.random() * 2000) + 1000
      console.log(`⏳ Pause de ${delay}ms pour éviter le blocage`)
      await this.wait(delay)
    }

    console.log(`✅ ${allResults.length} œuvres récupérées depuis ${site.name}`)

    const worksData = []
    for (const manga of allResults) {
      const totalChapters = await this.getChapterCount(manga.link)
      console.log(`📚 ${manga.title} → ${totalChapters} chapitres`)

      worksData.push({
        title: manga.title,
        sourceUrl: manga.link,
        coverUrl: manga.cover || '',
        totalChapters, // camelCase ici
        type: 'MANGA',
        lastScrapedAt: DateTime.now(),
      })

      const delay = Math.floor(Math.random() * 1500) + 1000
      await this.wait(delay)
    }

    await Work.createMany(worksData)
    console.log(`📥 Données insérées dans la table "works" avec chapitres inclus`)
  }
}
