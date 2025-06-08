import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function Index() {
    return (
        <View className="flex-1 bg-white justify-center items-center">
            <Text className="text-lg text-red-700">
                Open up App.tsx to start working on your app!
            </Text>
            <StatusBar style="auto" />
        </View>
    );
}
