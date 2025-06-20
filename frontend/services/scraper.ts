import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Récupère le nombre de chapitres d’un manga via un proxy CORS (utilisé côté frontend uniquement).
 * @param mangaUrl URL du manga (ex: https://phenix-scans.com/manga/tomb-raider-king/)
 * @returns Le nombre de chapitres trouvés
 */
export const getChapterCount = async (mangaUrl: string): Promise<number> => {
    try {
        const response = await axios.get('http://localhost:3333/chapters-count', {
            params: { url: mangaUrl }
        });

        return response.data.count;
    } catch (error) {
        console.error('❌ Erreur côté backend :', error);
        return 0;
    }
};
