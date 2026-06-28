import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useSettingsStore } from '@/src/stores/settingsStore'
import Ionicons from '@expo/vector-icons/Ionicons'
import BottomSheet, { BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet'
import { forwardRef, useState } from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'

// eslint-disable-next-line react/display-name
export const ProfsManagementModal = forwardRef<BottomSheet>((_, ref) => {
  const [input, setInput] = useState('')
  const { profs, addProf, removeProf } = useSettingsStore()

  const bg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background')
  const handleColor = useThemeColor({ light: '#e5e5e5', dark: '#3a3a3c' }, 'text')
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')
  const textColor = useThemeColor({ light: '#000000', dark: '#ffffff' }, 'text')
  const inputBg = useThemeColor({ light: '#f2f2f7', dark: '#2c2c2e' }, 'background')

  const handleAdd = () => {
    if (input.trim()) {
      addProf(input.toUpperCase())
      setInput('')
    }
  }

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={['50%', '80%']}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: bg }}
      handleIndicatorStyle={{ backgroundColor: handleColor }}
    >
      <BottomSheetView style={styles.container}>
        <ThemedText type="defaultSemiBold" style={styles.title}>
          Gestion des Enseignants
        </ThemedText>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
            placeholder="Nom complet du prof (ex: DUPONT Jean)"
            placeholderTextColor={mutedColor}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: '#10b981' }]} 
            onPress={handleAdd}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <BottomSheetFlatList
          data={profs}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyComponent}>
              <Ionicons name="people-outline" size={40} color={mutedColor} style={{ marginBottom: 8 }} />
              <ThemedText style={{ color: mutedColor, fontSize: 14, textAlign: 'center' }}>
                Aucun enseignant configuré pour le moment.
              </ThemedText>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.profRow, { borderBottomColor: handleColor }]}>
              <View style={styles.profInfo}>
                <Ionicons name="person-outline" size={16} color={mutedColor} />
                <ThemedText style={styles.profName}>{item}</ThemedText>
              </View>
              <TouchableOpacity 
                onPress={() => removeProf(item)} 
                style={styles.deleteBtn}
                activeOpacity={0.6}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      </BottomSheetView>
    </BottomSheet>
  )
})

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16 },
  title: { fontSize: 18 },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: { paddingBottom: 20 },
  profRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  profInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  profName: { fontSize: 15 },
  deleteBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#ef444410',
  },
  emptyComponent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
})