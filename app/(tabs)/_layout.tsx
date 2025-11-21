import { Tabs } from 'expo-router';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1E88E5',
        tabBarInactiveTintColor: '#7A8C7D',
        headerShown: false,
        
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: insets.bottom > 0 ? 0 : 4, // Ajusta margem baseado no safe area
        },
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <Feather 
              name="home" 
              size={24} 
              color={color} 
              style={{
                transform: [{ scale: focused ? 1.1 : 1 }]
              }}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="buscar"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color, focused }) => (
            <Feather 
              name="search" 
              size={24} 
              color={color}
              style={{
                transform: [{ scale: focused ? 1.1 : 1 }]
              }}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="registrar"
        options={{
          title: 'Registrar',
           tabBarIcon: ({ color, focused }) => (
            <Feather 
              name="plus-circle" 
              size={24} 
              color={color}
              style={{
                transform: [{ scale: focused ? 1.1 : 1 }]
              }}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="casos"
        options={{
          title: 'Casos',
          tabBarIcon: ({ color, focused }) => (
            <Feather 
              name="list" 
              size={24} 
              color={color}
              style={{
                transform: [{ scale: focused ? 1.1 : 1 }]
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}