import dayjs from '@/src/lib/day'
import { ICalEvent } from '@/src/types/ical'
import { Task } from '@/src/types/tasks'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false

  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true

  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function scheduleICalNotifications(events: ICalEvent[]) {
  // Annule toutes les notifs iCal existantes avant de replanifier
  await cancelICalNotifications()

  const now = dayjs()
  const granted = await requestNotificationPermission()
  if (!granted) return

  const REMINDERS = [
    { minutes: 60, label: '1h' },
    { minutes: 30, label: '30 min' },
    { minutes: 15, label: '15 min' },
  ]

  for (const event of events) {
    const start = dayjs(event.start)

    // Ignore les events passés
    if (start.isBefore(now)) continue

    for (const reminder of REMINDERS) {
      const triggerDate = start.subtract(reminder.minutes, 'minute')

      // Ignore si le trigger est déjà passé
      if (triggerDate.isBefore(now)) continue

      const body = [
        event.location && `📍 ${event.location}`,
        event.prof && `👤 ${event.prof}`,
      ].filter(Boolean).join('  ·  ')

      await Notifications.scheduleNotificationAsync({
        identifier: `ical-${event.uid}-${reminder.minutes}`,
        content: {
          title: `Dans ${reminder.label} — ${event.title}`,
          body: body || 'Cours à venir',
          sound: true,
          data: { uid: event.uid, source: event.source },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate.toDate(),
        },
      })
    }
  }
}

export async function cancelICalNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  const icalNotifs = scheduled.filter(n => n.identifier.startsWith('ical-'))
  await Promise.all(icalNotifs.map(n => Notifications.cancelScheduledNotificationAsync(n.identifier)))
}

export async function scheduleTaskNotifications(tasks: Task[]) {
  // Annule toutes les notifs de tâches existantes avant de replanifier
  await cancelTaskNotifications()

  const now = dayjs()
  const granted = await requestNotificationPermission()
  if (!granted) return

  const REMINDERS = [
    { minutes: 60, label: '1h' },
    { minutes: 30, label: '30 min' },
    { minutes: 15, label: '15 min' },
  ]

  for (const task of tasks) {
    // Ignore les tâches terminées ou sans date d'échéance
    if (task.is_completed || !task.due_date) continue

    // Assuming due_date is in YYYY-MM-DD format
    const dueDate = dayjs(task.due_date)
    // Set a default time of 9:00 AM for the due date
    const dueDateTime = dueDate.set('hour', 9).set('minute', 0).set('second', 0)

    // Ignore les tâches dont la date d'échéance est passée
    if (dueDateTime.isBefore(now)) continue

    for (const reminder of REMINDERS) {
      const triggerDate = dueDateTime.subtract(reminder.minutes, 'minute')

      // Ignore si le trigger est déjà passé
      if (triggerDate.isBefore(now)) continue

      const body = [
        task.duration_minutes && `⏱️ ${task.duration_minutes}min`,
      ].filter(Boolean).join('  ·  ')

      await Notifications.scheduleNotificationAsync({
        identifier: `task-${task.id}-${reminder.minutes}`,
        content: {
          title: `Dans ${reminder.label} — ${task.title}`,
          body: body || 'Tâche à venir',
          sound: true,
          data: { id: task.id, source: 'task' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate.toDate(),
        },
      })
    }
  }
}

export async function cancelTaskNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  const taskNotifs = scheduled.filter(n => n.identifier.startsWith('task-'))
  await Promise.all(taskNotifs.map(n => Notifications.cancelScheduledNotificationAsync(n.identifier)))
}