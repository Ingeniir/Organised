import { ICalEvent } from '@/src/types/ical'

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
  const unfolded = unfoldLines(raw)
  const blocks = unfolded.split('BEGIN:VEVENT').slice(1)

  return blocks
    .map(block => {
      const uid = extractField(block, 'UID')
      const title = extractField(block, 'SUMMARY')
      const location = extractField(block, 'LOCATION')
      const dtstart = extractField(block, 'DTSTART')
      const dtend = extractField(block, 'DTEND')
      const description = extractField(block, 'DESCRIPTION')
        .replace(/\\n/g, ' ')
        .trim()

      if (!uid || !dtstart || !dtend) return null

      return {
        uid,
        title,
        location: extractLocation(block),
        prof: extractProf(description),
        description: description || undefined,
        start: parseICalDate(dtstart),
        end: parseICalDate(dtend),
        source,
      } as ICalEvent
    })
    .filter(Boolean) as ICalEvent[]
}

function extractProf(description: string): string | undefined {
  if (!description) return undefined
  // Nettoie les \n et prend les lignes
  const lines = description
    .replace(/\\n/g, '\n')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)

  // Le prof est la dernière ligne avant "(Exporté le:"
  const filtered = lines.filter(l => !l.startsWith('(Exporté le:'))
  const last = filtered[filtered.length - 1]

  // Le prof est en majuscules — vérifie que c'est pas un groupe (L2 MIASHS, etc.)
  if (last && last === last.toUpperCase() && !last.startsWith('L') && !last.startsWith('M')) {
    return last
  }

  // Fallback : cherche une ligne tout en majuscules avec un prénom/nom
  return filtered.find(l =>
    l === l.toUpperCase() &&
    l.length > 5 &&
    !l.match(/^(L[1-3]|M[12]|CM|TD|TP|UFR|CPES)/)
  )
}

function extractLocation(block: string): string | undefined {
  const location = extractField(block, 'LOCATION').trim()
  return location || undefined
}