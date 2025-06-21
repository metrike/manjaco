import { StatusBar } from 'expo-status-bar';
import {Text, TouchableOpacity, View} from 'react-native';
import {Link} from "expo-router";

export default function Index() {
    return (
        <View className="flex-1 bg-white justify-center items-center">
            <Text className="text-lg text-red-700">
                Open up App.tsx to start working on your app!
            </Text>
            <StatusBar style="auto" />
            <Link href="/login" className="text-blue-500 mt-4">
                <TouchableOpacity className="bg-blue-500 p-4 rounded">
                    <Text className="text-white font-bold">Go to login</Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
}
