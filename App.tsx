import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/context/AuthContext';
import { GameProvider } from './src/context/GameContext';
import AuthScreen from './src/screens/auth/AuthScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import SignInScreen from './src/screens/auth/SignInScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import LobbyScreen from './src/screens/lobby/LobbyScreen';
import GameScreen from './src/screens/game/GameScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Auth"
            screenOptions={{
              headerShown: false,
              gestureEnabled: false,
            }}
          >
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Lobby" component={LobbyScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </GameProvider>
    </AuthProvider>
  );
}
