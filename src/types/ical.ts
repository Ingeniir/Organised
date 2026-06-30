export interface ICalEvent {
  uid: string
  title: string
  type?: 'CM' | 'TD' | 'CTE' | 'CC'
  location?: string
  description?: string
  prof?: string
  status?: "present" | "absent"
  start: string
  end: string
  source: 'L2' | 'L3'
}