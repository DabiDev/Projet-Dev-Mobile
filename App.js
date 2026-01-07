import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { auth } from './src/services/firebaseConfig';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NutritionScreen from './src/screens/NutritionScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import WorkoutHistoryScreen from './src/screens/WorkoutHistoryScreen';

const Tab = createBottomTabNavigator();
const WorkoutStackNav = createNativeStackNavigator();

function WorkoutStack() {
  return (
    <WorkoutStackNav.Navigator>
      <WorkoutStackNav.Screen name="WorkoutList" component={WorkoutScreen} options={{ headerShown: false }} />
      <WorkoutStackNav.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
    </WorkoutStackNav.Navigator>
  );
}

function MainStack() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} />
      <Tab.Screen name="Workouts" component={WorkoutStack} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {user ? <MainStack /> : <AuthStack />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
