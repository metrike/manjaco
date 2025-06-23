import axios from 'axios'
import * as cheerio from 'cheerio'

const url = 'https://www.mangakakalot.gg/genre/all?type=topview&category=all&state=all&page=1'

async function scrapeMangaList() {
  try {
    const { data } = await axios.get(url)
    const $ = cheerio.load(data)

    const results = []

    $('.list-truyen-item-wrap').each((_, el) => {
      const title = $(el).find('h3 a').text().trim()
      const link = $(el).find('h3 a').attr('href')
      const cover = $(el).find('img').attr('src')
      results.push({ title, link, cover })
    })

    console.log(results)
  } catch (err) {
    console.error('❌ Erreur de scraping', err)
  }
}

scrapeMangaList()
