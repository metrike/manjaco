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
      'source_url',
      'cover_url',
      'total_chapters',
      'type',
      'last_scraped_at',
    ]

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

      return `INSERT INTO works (${columns.join(', ')}) VALUES (${values.join(', ')});`
    })

    const output = sqlLines.join('\n')
    writeFileSync('works_export.sql', output)
    console.log('✅ Fichier SQL généré : works_export.sql')
  }
}
