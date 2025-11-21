import { Stack } from 'expo-router';
import React from 'react';

export default function ComplaintLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Tipo de Denúncia',
          headerShown: false,
        }}
      />
      
      <Stack.Screen
        name="form"
        options={{
          title: 'Formulário de Denúncia',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      
      <Stack.Screen
        name="tracking"
        options={{
          title: 'Acompanhar Denúncia',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
