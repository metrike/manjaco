import { View } from "react-native";
import {Navigator, Slot} from "expo-router";
import "../global.css";


export default function RootLayout() {

    return (
        <View style={{ flex: 1 }}>
            <Slot/>
        </View>
    );
}

