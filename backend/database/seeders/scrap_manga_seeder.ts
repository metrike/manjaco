import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Work from '#models/work'

export default class WorkSeeder extends BaseSeeder {
  public static developmentOnly = true   // sécurité contre l’exec en production

  public async run () {
    // const mangas = await scrapeAllManga()
    //
    // await Work.updateOrCreateMany('sourceUrl', mangas.map((m) => ({
    //   title         : m.title,
    //   type          : 'MANGA',            // ou Enum/const selon votre modèle
    //   sourceUrl     : m.sourceUrl,
    //   coverUrl      : m.coverUrl,
    //   totalChapters : m.totalChapters,
    //   lastScrapedAt : new Date(),
    // })))
  }
}
