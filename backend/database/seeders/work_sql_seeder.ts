import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { writeFileSync } from 'fs'
import { DateTime } from 'luxon'
import Work from '#models/work'

export default class Work_sql_seeder extends BaseSeeder {
  public async run () {
    const allWorks = await Work.all()
    console.log(`📦 ${allWorks.length} works récupérés`)

    const columns = [
      'id',
      'title',
      'sourceUrl',
      'coverUrl',
      'totalChapters',
      'type',
      'lastScrapedAt',
      "genres",
      'description'
    ]

    const snakeColumns = columns.map(toSnakeCase)


    const sqlLines = allWorks.map((work) => {
      const values = columns.map((col) => {
        const val = work[col as keyof typeof work]
        if (val === null || val === undefined) return 'NULL'
        if (typeof val === 'number') return val
        if (val instanceof Date || DateTime.isDateTime(val)) {
          return `'${DateTime.fromJSDate(new Date(val)).toISO()}'`
        }
        return `'${String(val).replace(/'/g, "''")}'`
      })

      return `INSERT INTO works (${snakeColumns.join(', ')}) VALUES (${values.join(', ')});`
    })

    const output = sqlLines.join('\n')
    writeFileSync('works_export.sql', output)
    console.log('✅ Fichier SQL généré : works_export.sql')
  }
}

const toSnakeCase = (str: string) =>
  str.replace(/([A-Z])/g, '_$1').toLowerCase()
