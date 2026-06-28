import { ThemedInput, ThemedInputProps } from "@/components/themed-input"
import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { supabase } from "@/src/lib/supabase"
import Ionicons from '@expo/vector-icons/Ionicons'
import { Link } from "expo-router"
import { useState } from "react"
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginScreen() {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

    const validate = (): boolean => {
        const e: typeof errors = {}
        if (!email.trim()) e.email = 'Email requis'
        else if (!EMAIL_RE.test(email)) e.email = 'Email invalide'
        if (!password) e.password = 'Mot de passe requis'
        else if (password.length < 6) e.password = '6 caractères minimum'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleLogin = async () => {
        if (!validate()) return
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) Alert.alert('Erreur', error.message)
        setLoading(false)
    }

    const clearError = (field: 'email' | 'password') => {
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    const errorBorder = (field: 'email' | 'password') =>
        errors[field] ? { borderColor: '#ef4444' } : undefined

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.titleRow}>
                <ThemedText style={styles.title}>Connexion</ThemedText>
                <Ionicons name="person-circle-outline" size={24} color="white" />
            </ThemedView>

            <View>
                <ThemedInput
                    style={[styles.input, errorBorder('email')]}
                    placeholder="Email"
                    value={email}
                    onChangeText={(t) => { setEmail(t); clearError('email') }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                {errors.email && <ThemedText style={styles.errorText}>{errors.email}</ThemedText>}
            </View>
            <View>
                <ThemedInput
                    style={[styles.input, errorBorder('password')]}
                    placeholder="Mot de passe"
                    value={password}
                    onChangeText={(t) => { setPassword(t); clearError('password') }}
                    secureTextEntry
                />
                {errors.password && <ThemedText style={styles.errorText}>{errors.password}</ThemedText>}
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                <ThemedText style={styles.buttonText}>{loading ? 'Connexion...' : 'Se connecter'}</ThemedText>
            </TouchableOpacity>

            <Link href='/(auth)/register' style={styles.link}>
                Pas de compte ? S&#39;inscrire
            </Link>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8},
  title: { fontSize: 28, fontWeight: '600'},
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 14, fontSize: 16,
  },
  button: {
    backgroundColor: '#6366f1', borderRadius: 10,
    padding: 16, alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { textAlign: 'center', color: '#6366f1', marginTop: 8 },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 2, marginLeft: 4 },
})
