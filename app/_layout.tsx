import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/src/features/auth/authStore";
import { supabase } from "@/src/lib/supabase";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const { session, setSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [initialized, setInitialized] = useState<boolean>(false)

  const colorScheme = useColorScheme()

  // Ecoute de supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setInitialized(true)
    })

    const { data: { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Réagit aux changements de session pour la redirection
  useEffect(() => {
    if (!initialized) return

    const inAuth = segments[0] == '(auth)'

    if (!session && !inAuth) {
      router.replace('/(auth)/login')
    } else if (session && inAuth) {
      router.replace('/(tabs)')
    }
  }, [session, segments, initialized])

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Slot />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}