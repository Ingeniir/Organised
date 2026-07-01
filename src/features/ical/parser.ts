import { ICalEvent } from '@/src/types/ical'
import { Prof } from '@/src/types/prof'

function parseICalDate(value: string): string {
  // Format: 20260711T081500Z
  const year = value.slice(0, 4)
  const month = value.slice(4, 6)
  const day = value.slice(6, 8)
  const hour = value.slice(9, 11)
  const min = value.slice(11, 13)
  return `${year}-${month}-${day}T${hour}:${min}:00Z`
}

function unfoldLines(raw: string): string {
  // iCal fold : ligne qui continue commence par espace ou tab
  return raw.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '')
}

function extractField(block: string, field: string): string {
  const regex = new RegExp(`^${field}[;:](.+)$`, 'm')
  const match = block.match(regex)
  return match ? match[1].trim() : ''
}

export function parseICal(raw: string, source: 'L2' | 'L3'): ICalEvent[] {
  if (!raw.includes('BEGIN:VCALENDAR')) {
    return []
  }
  const unfolded = unfoldLines(raw)
  const blocks = unfolded.split('BEGIN:VEVENT').slice(1)

  return blocks
    .map((block, index) => {
      const uid = extractField(block, 'UID')
      const title = extractField(block, 'SUMMARY')
      const location = extractField(block, 'LOCATION').trim()
      const dtstart = extractField(block, 'DTSTART')
      const dtend = extractField(block, 'DTEND')
      const description = extractField(block, 'DESCRIPTION')
        .replace(/\\n/g, ' ')
        .trim()

      if (!uid || !dtstart || !dtend) return null

      return {
        uid,
        title,
        type: extractType(description, title) ?? 'CM',
        location: location,
        description: description || undefined,
        start: parseICalDate(dtstart),
        end: parseICalDate(dtend),
        source,
      } as ICalEvent
    })
    .filter(Boolean) as ICalEvent[]
}

export function extractProf(description: string | undefined | null, profsList: Prof[]): string | null {
  if (!description || !profsList || profsList.length === 0) return null

  const upperDesc = description.toUpperCase()
  const profsTrouves: string[] = []

  // On parcourt la liste des profs enregistrés dans le store
  for (const prof of profsList.map(p => p.name)) {
    // On compare tout en majuscules pour éviter les pièges de casse
    if (upperDesc.includes(prof.toUpperCase().slice(0, -2))) {
      profsTrouves.push(prof.slice(0, -2))
    }
  }


  // Si on a trouvé des profs correspondants dans la description, on les fusionne avec une virgule
  if (profsTrouves.length > 0) {
    return profsTrouves.join(', ')
  }

  return null
}


function extractType(description: string, title: string): 'CM' | 'TD' | 'CTE' | 'CC' {
  const cleanTitle = title.toLowerCase().replace(/\u00a0/g, ' ');
  const cleanDescription = description ? description.toLowerCase().replace(/\u00a0/g, ' ') : '';

  if (/\bcte\d*\b/.test(cleanTitle) || /rattrapage/i.test(cleanTitle)) {
    return 'CTE';
  }

  if (/\bContrôle continue\d*\b/.test(cleanTitle)) {
    return 'CC'
  }

  if (cleanDescription) {
    if (/\b(td|tp)\d*\b/.test(cleanDescription)) {
      return 'TD';
    }

    if (/\bcm\b/.test(cleanDescription)) {
      return 'CM';
    }
  }

  return 'CM';
}