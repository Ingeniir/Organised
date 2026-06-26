export interface ICalEvent {
  uid: string
  title: string
  location?: string
  description?: string
  prof?: string
  start: string
  end: string
  source: 'L2' | 'L3'
}