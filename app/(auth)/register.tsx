import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { supabase } from "@/src/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";

export default function RegisterScreen() {
    const [name, setName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const handleRegister = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } })
        if (error) Alert.alert('Erreur', error.message)
        else Alert.alert('Vérifié ton email', 'Un lien de confirmation t\'a été envoyé.')
        setLoading(false)
    }

    return (
    <ThemedView style={styles.container}>
        <ThemedView style={styles.titleRow}>
            <ThemedText style={styles.title}>Créer un compte</ThemedText>
            <Ionicons name="person-add-outline" size={20} color="white" />
        </ThemedView>

      <ThemedInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <ThemedInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <ThemedInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <ThemedText style={styles.buttonText}>{loading ? 'Inscription…' : 'S\'inscrire'}</ThemedText>
      </TouchableOpacity>

      <Link href="/(auth)/login" style={styles.link}>
        Déjà un compte ? Se connecter
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
})