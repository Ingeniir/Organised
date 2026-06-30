import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useAddProf, useProfs } from '@/src/features/profs/useProf'
import { useSettingsStore } from '@/src/stores/settingsStore'
import Ionicons from '@expo/vector-icons/Ionicons'
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { forwardRef, useState } from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { ProfRow } from '../ui/ProfRow'


// eslint-disable-next-line react/display-name
export const ProfsManagementModal = forwardRef<BottomSheet>((_, ref) => {
  const [input, setInput] = useState('')
  const { showICalL2 } = useSettingsStore()
  const { data: profs = []} = useProfs()
  const { mutate: addProf } = useAddProf()

  const bg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background')
  const handleColor = useThemeColor({ light: '#e5e5e5', dark: '#3a3a3c' }, 'text')
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')
  const textColor = useThemeColor({ light: '#000000', dark: '#ffffff' }, 'text')
  const inputBg = useThemeColor({ light: '#f2f2f7', dark: '#2c2c2e' }, 'background')

  const handleAdd = () => {
    if (input.trim()) {
      addProf(`${input.toUpperCase()}${showICalL2 ? 'L2' : 'L3'}`)
      setInput('')
    }
  } 

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={['50%', '80%']}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: bg }}
      handleIndicatorStyle={{ backgroundColor: handleColor }}
      keyboardBehavior="interactive"
      android_keyboardInputMode="adjustResize"
      enableHandlePanningGesture={true}
    >
      <BottomSheetFlatList
        data={profs}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View style={[styles.header, { backgroundColor: bg }]}>
            <View style={styles.titleRow}>
              <ThemedText type="defaultSemiBold" style={styles.title}>
                Gestion des Enseignants
              </ThemedText>
              
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                placeholder="Nom complet du prof (ex: DUPONT Jean)"
                placeholderTextColor={mutedColor}
                value={input}
                onChangeText={(value) => setInput(value.toUpperCase())}
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
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyComponent}>
            <Ionicons name="people-outline" size={40} color={mutedColor} style={{ marginBottom: 8 }} />
            <ThemedText style={{ color: mutedColor, fontSize: 14, textAlign: 'center' }}>
              Aucun enseignant configuré pour le moment. <ThemedText>{profs.length}</ThemedText>
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.profRow, { borderBottomColor: handleColor }]}>
            <ProfRow name={item.name} />
          </View>
        )}
      />
    </BottomSheet>
  )
})

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
  },
  closeBtn: {
    padding: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  profInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  profName: {
    fontSize: 15,
  },
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