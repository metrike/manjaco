import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Work from '#models/work'
import { DateTime } from 'luxon'
import puppeteer from 'puppeteer'
import path from 'path'
import fs from 'fs'

export default class DuckduckgoCoverSeeder extends BaseSeeder {
  public async run() {
    const works = await Work.query()
      .whereRaw("cover_url NOT ILIKE 'https://external-content.duckduckgo.com%'")
    const total = works.length
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--window-size=1280,800',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      ],
    })


    const page = await browser.newPage()

    for (let i = 0; i < total; i++) {
      const work = works[i]
      const cleanedTitle = work.title.replace(/[^a-zA-Z0-9\s]/g, '')
      const query = `${cleanedTitle} cover manga`
      console.log(`\n📊 ${i + 1} / ${total} ➤ ${work.id} ${work.title}`)
      console.log(`🔍 Recherche DuckDuckGo pour : ${query}`)

      try {
        const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`
        await page.goto(searchUrl, { waitUntil: 'networkidle2' })

        await page.waitForSelector('img', { timeout: 15000 })

        const imageUrl = await page.evaluate(() => {
          const images = Array.from(document.querySelectorAll('img'))
          const target = images.find(img => img.src.includes('external-content'))
          if (!target) return null
          return target.src.startsWith('//') ? 'https:' + target.src : target.src
        })

        if (imageUrl) {
          console.log(`✅ Image trouvée : ${imageUrl}`)
          work.coverUrl = imageUrl
          work.lastScrapedAt = DateTime.now()
          await work.save()
          console.log(`✅ Image mise à jour pour : ${work.title}`)
        } else {
          console.warn(`❌ Aucune image "external-content" trouvée pour : ${work.title}`)
        }

      } catch (error: any) {
        console.error(`❌ Erreur DuckDuckGo pour ${work.title} : ${error.message}`)

        const screenshotDir = path.resolve('tmp/screenshots')
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true })
        }

        const filePath = path.join(screenshotDir, `error_${work.id}.png`)
        await page.screenshot({ path: filePath, fullPage: true })
        console.log(`📸 Screenshot sauvegardé : ${filePath}`)
      }

      await new Promise((res) => setTimeout(res, 1500))
    }

    await browser.close()
  }
}

