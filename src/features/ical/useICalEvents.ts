import { ICalEvent } from '@/src/types/ical'
import { useQuery } from '@tanstack/react-query'
import { parseICal } from './parser'

async function fetchICal(source: 'L2' | 'L3', firstDate: string, lastDate: string): Promise<ICalEvent[]> {
  const resourceId = source === 'L2' ? '15943' : '15946'
  const url = `https://emploidutemps.univ-reunion.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=${resourceId}&projectId=5&calType=ical&firstDate=${firstDate}&lastDate=${lastDate}&displayConfigId=8`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Erreur fetch iCal ${source}`)
  const text = await res.text()
  return parseICal(text, source)
}

export function useICalEvents(source: 'L2' | 'L3', firstDate: string, lastDate: string, enabled = true) {
  return useQuery({
    // On ajoute les dates dans la queryKey pour que le cache se mette à jour proprement
    queryKey: ['ical', source, firstDate, lastDate],
    queryFn: () => fetchICal(source, firstDate, lastDate),
    staleTime: 1000 * 60 * 30, // 30 min
    retry: 2,
    enabled,
    // Optionnel : garde les anciennes données affichées pendant le chargement des nouvelles
    placeholderData: (previousData) => previousData, 
  })
}