// types/scraper.ts
import {ChapterPageSelectors} from "#services/scrapeChapterCount";

export interface ListPageSelectors {
  /** carte contenant titre + lien + cover */
  card: string
  /** lien vers la fiche série (doit se trouver dans `card`) */
  link: string
  /** élément qui porte le titre (facultatif : si absent, on prend le text du lien) */
  title?: string
  /** balise img (facultatif : si absent, coverUrl = null) */
  img?: string
  /** bouton "Load more" (facultatif) */
  loadMore?: string
  /** lien vers la page suivante (facultatif) */
  nextPage?: string

  latestChapter?: string

}

export interface ScraperConfig {
  /** Ex : https://phenix-scans.com */
  root: string
  /** Complément d’URL à visiter pour la liste, ex : /manga/ */
  listPath: string
  /** Sélecteurs pour extraire les données sur la liste */
  selectors: ListPageSelectors
  /** Nombre maximum de séries à récupérer */
  chapterSelectors: ChapterPageSelectors     // ← ajouté

  limit?: number
  /** Taille des paquets parallèles pour le comptage des chapitres */
  parallelChunks?: number
  coverInPage?: boolean // ← ajouté, pour les sites qui n’ont pas de cover dans la liste
}
