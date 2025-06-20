import {useAuth} from "../../provider/AuthProvider";
import {is} from "@babel/types";
import {useEffect} from "react";
import {getChapterCount } from "../../services/scraper";
const Home = () => {
    const { isAuthenticated } = useAuth();

    useEffect(
        () => {

//     console.log(`📘 Nombre de chapitres trouvés : ${chapterCount}`);
        },
        [] // Empty dependency array means this effect runs once on mount
    )


    useEffect(() => {
        const search = async () => {
            const url = 'https://phenix-scans.com/manga/tomb-raider-king/';
            const chapterCount = await getChapterCount(url);
            console.log(`📘 Nombre de chapitres trouvés : ${chapterCount}`);
        };

        search();
    }, []);


    return (
        <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Home Page</h1>
        <p className="text-lg">This is the main content area.</p>
        </div>
    );
}

export default Home