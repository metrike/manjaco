import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Website from '#models/website'

export default class extends BaseSeeder {
  async run() {
    await Website.createMany([
      // {
      //   name: 'Phenix Scans',
      //   root: 'https://phenix-scans.com',
      //   listPath: '/manga/',
      //   selectors: {
      //     card     : 'div.manga-list__card',
      //     link     : 'a.manga-list__link',
      //     title    : '.manga-list__card-title',
      //     img      : 'img',
      //     loadMore : 'div.manga-list__load-more > button, button.btn-load-more, button.series-load-more',
      //     nextPage : 'a[rel="next"], a.page-numbers.next',
      //   },
      //   chapterSelectors: {
      //     chapter  : 'li.wp-manga-chapter, a.project__chapter',
      //     loadMore : 'button.project__chapter-load-more, button.btn-load-more',
      //   },
      //   limit: 0,
      //   parallelChunks: 5,
      //   coverInPage: false,
      // },
      // {
      //   name: 'Scan Manga',
      //   root: 'https://www.scan-manga.com',
      //   listPath: '/',
      //   selectors: {
      //     card   : 'article.top_body',
      //     link   : 'span.left > a.hover_text_manga',
      //     title  : 'span.left > a.hover_text_manga',
      //     img    : 'div.logo_manga img, div.image_manga.image_listing img',
      //     loadMore : '#seemorepub',
      //     nextPage : '',
      //     latestChapter : 'span.left',
      //   },
      //   chapterSelectors: {
      //     chapter  : '#listing a',
      //     loadMore : '',
      //   },
      //   limit: 0,
      //   parallelChunks: 5,
      //   coverInPage: true,
      // },
      {
      name: 'Mangakakalot',
      root: 'https://www.mangakakalot.gg',
      listPath: '/genre/all?type=topview&category=all&state=all&page=1',
      selectors: {
        card   : '.list-truyen-item-wrap',
        link   : 'h3 a',
        title  : 'h3 a',
        img    : 'img',
        latestChapter: 'a.list-story-item-wrap-chapter', // ✅ ajout correct ici
        loadMore: '',
        nextPage: '',
      },
      chapterSelectors: {
        chapter: '.row-content-chapter li a',
        loadMore: '',
      },
      limit: 0,
      parallelChunks: 5,
      coverInPage: true,
    }

    ])
  }
}
