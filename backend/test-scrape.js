import axios from 'axios'
import * as cheerio from 'cheerio'

const baseUrl = 'https://www.mangakakalot.gg/genre/all?type=topview&category=all&state=all&page='

async function scrapeMangaList(page) {
  const url = `${baseUrl}${page}`

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36'
      }
    })

    const $ = cheerio.load(data)
    const results = []

    $('.list-truyen-item-wrap').each((_, el) => {
      const title = $(el).find('h3 a').text().trim()
      const link = $(el).find('h3 a').attr('href')
      const cover = $(el).find('img').attr('src')

      if (title && link) {
        results.push({ title, link, cover })
      }
    })

    return results
  } catch (err) {
    console.error(`❌ Erreur scraping page ${page}`, err.message)
    return []
  }
}

async function scrapeAllPages() {
  const allResults = []

  for (let page = 1; page <= 5; page++) {
    console.log(`🔄 Scraping page ${page}`)
    const mangas = await scrapeMangaList(page)
    allResults.push(...mangas)
  }

  console.log(`✅ ${allResults.length} mangas récupérés`)
  console.log(allResults)
}

scrapeAllPages()
