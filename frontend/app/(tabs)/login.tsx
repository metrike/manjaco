import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import {loginUser} from "../../services/AuthService";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        await loginUser({ username, password });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-4">
                <View className="flex-1 justify-center items-center py-10">
                    <View className="w-full max-w-md bg-white rounded-lg p-6 shadow-md">
                        <Text className="text-2xl font-bold text-center mb-6">Login</Text>

                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
                            <TextInput
                                className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                                placeholder="Enter your username"
                                autoCapitalize="none"
                                value={username}
                                onChangeText={setUsername}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
                            <TextInput
                                className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                                placeholder="Enter your password"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <TouchableOpacity onPress={handleLogin} className="w-full bg-blue-600 py-3 rounded mt-2">
                            <Text className="text-white font-bold text-center">Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Login;
