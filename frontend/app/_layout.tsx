import { View } from "react-native";
import {Navigator, Slot} from "expo-router";
import "../global.css";
import {AuthProvider} from "../provider/AuthProvider";


export default function RootLayout() {

    return (
        <AuthProvider>

        <View style={{ flex: 1 }}>
            <Slot/>
        </View>
        </AuthProvider>
    );
}

