import { useDeleteProf } from '@/src/features/profs/useProf'
import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { ActivityIndicator, Alert, TouchableOpacity, View } from 'react-native'
import { ThemedText } from '../themed-text'

type Props = {
  name: string
}

export function ProfRow({ name }: Props) {
  const { mutate: deleteProf, isPending } = useDeleteProf()


  const onDeleteProf = () => {
        Alert.alert(
            'Supprimer',
            `Supprimer ${name.slice(0, -2)} ?`,
            [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Supprimer', style: 'destructive', onPress: () => deleteProf({ name }) },
            ]
        )
    }

  if (isPending) return <ActivityIndicator />

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12, flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Ionicons name="person-outline" size={16} color={name.includes('L2') ? '#10b981' : '#b0b910'} />
            <ThemedText style={{ fontSize: 15 }}>{name.slice(0, -2)} - {name.slice(-2)}</ThemedText>
        </View>

      <TouchableOpacity onPress={onDeleteProf} disabled={isPending}>
        <Ionicons name="trash-outline" size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  )
}