import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Website from '#models/website'
import Work from '#models/work'
import { DateTime } from 'luxon'
import axios from 'axios'
import * as cheerio from 'cheerio'

interface ScrapedManga {
  title: string
  link: string
  cover: string | null
  totalChapters: number
  description: string | null
  genres: string[] | string
}

export default class WorkSeeder extends BaseSeeder {
  private async scrapeMangaList(page: number, retries = 3): Promise<ScrapedManga[]> {
    const url = `https://www.mangakakalot.gg/genre/all?type=topview&category=all&state=all&page=${page}`
    console.log(`🌐 Scraping URL : ${url}`)

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { data } = await axios.get(url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://www.google.com',
          },
        })

        const $ = cheerio.load(data)
        const results: ScrapedManga[] = []
        const mangas = $('.list-truyen-item-wrap')

        for (let i = 0; i < mangas.length; i++) {
          const el = mangas[i]
          const title = $(el).find('h3 a').text().trim()
          const link = $(el).find('h3 a').attr('href')
          const cover = $(el).find('img').attr('src') || null
          const chapterText = $(el).find('a.list-story-item-wrap-chapter').text().trim()
          const match = chapterText.match(/Chapter\s+(\d+(?:\.\d+)?)/i)
          const totalChapters = match ? Math.floor(parseFloat(match[1])) : 0

          let description: string | null = null
          let genres: string[] = []

          if (link) {
            try {
              const detail = await axios.get(link, {
                timeout: 10000,
                headers: {
                  'User-Agent': 'Mozilla/5.0',
                },
              })
              const $$ = cheerio.load(detail.data)
              description = $$('#contentBox').text().trim().replace(/\s+/g, ' ').slice(0, 500)
              genres = $$('.genre-list a').map((_, el) => $$(el).text().trim()).get()
              console.log(`📚 Genres de ${title} : ${genres.join(', ')}`)
            } catch {
              console.warn(`⚠️ Impossible de récupérer la description ou les genres de ${title}`)
            }
          }

          if (title && link) {
            results.push({ title, link, cover, totalChapters, description, genres })
          }
        }

        console.log(`✅ Page ${page} : ${results.length} œuvres extraites`)
        return results

      } catch (err: any) {
        const status = err?.response?.status || 'N/A'
        console.warn(`⚠️ Erreur page ${page}, tentative ${attempt}/${retries} - Status ${status}`)

        if (status === 429 && attempt < retries) {
          const wait = 10000 * attempt
          console.log(`⏳ Trop de requêtes, pause ${wait / 1000}s avant retry...`)
          await new Promise(res => setTimeout(res, wait))
        } else {
          console.error(`❌ Abandon du scraping de la page ${page} après ${attempt} tentative(s)`)
          return []
        }
      }
    }

    return []
  }

  public async run() {
    const start = DateTime.now()
    console.log(`📅 Début du script - ${start.toISO()}`)
    console.log('🚀 Démarrage du seeder WorkSeeder')

    const site = await Website.findByOrFail('name', 'Mangakakalot')
    let page = 1
    let totalScraped = 0

    while (true) {
      console.log(`🔄 Scraping page ${page}`)
      const mangas = await this.scrapeMangaList(page)
      if (mangas.length === 0) break

      totalScraped += mangas.length
      const limitedConcurrency = 10
      const chunks = []
      for (let i = 0; i < mangas.length; i += limitedConcurrency) {
        chunks.push(mangas.slice(i, i + limitedConcurrency))
      }

      for (const chunk of chunks) {
        await Promise.allSettled(
          chunk.map(async (manga) => {
            try {
              const existingWork = await Work.findBy('sourceUrl', manga.link)

              let genres: string[] = []
              try {
                if (Array.isArray(manga.genres)) {
                  genres = manga.genres.map((g) => String(g).trim())
                } else if (typeof manga.genres === 'string') {
                  genres = JSON.parse(manga.genres)
                  if (!Array.isArray(genres)) throw new Error('Invalid genre structure')
                  genres = genres.map((g) => String(g).trim())
                }
              } catch {
                console.warn(`⚠️ Genres invalides pour "${manga.title}", ignorés.`)
                genres = []
              }

              if (existingWork) {
                existingWork.merge({
                  totalChapters: manga.totalChapters,
                  lastScrapedAt: DateTime.now(),
                  description: manga.description,
                  genres,
                })
                await existingWork.save()
                console.log(`🔄 Mise à jour : ${manga.title}`)
              } else {
                await Work.create({
                  title: manga.title,
                  sourceUrl: manga.link,
                  coverUrl: manga.cover || '',
                  totalChapters: manga.totalChapters,
                  type: 'MANGA',
                  lastScrapedAt: DateTime.now(),
                  description: manga.description,
                  genres,
                })
                console.log(`➕ Ajouté : ${manga.title}`)
              }

            } catch (err: any) {
              console.error(`❌ Erreur traitement ${manga.title} : ${err.message}`)
            }
          })
        )
      }

      await new Promise(res => setTimeout(res, Math.floor(Math.random() * 1500) + 1000))
      page++
    }

    const end = DateTime.now()
    console.log(`✅ Scraping terminé : ${totalScraped} œuvres traitées.`)
    console.log(`🏁 Fin du script - ${end.toISO()}`)
  }
}
