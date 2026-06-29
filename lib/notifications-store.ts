"use client"

import { useState, useCallback, useEffect } from "react"

export interface Notification {
  id: string
  title: string
  message: string
  type: "warning" | "success" | "info"
  read: boolean
  timestamp: string
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "Material Shortage",
    message: "Corn inventory is running low for Line 1.",
    type: "warning",
    read: false,
    timestamp: "10 mins ago"
  },
  {
    id: "n2",
    title: "Order Completed",
    message: "MO-1025 has been successfully finished.",
    type: "success",
    read: false,
    timestamp: "1 hour ago"
  },
  {
    id: "n3",
    title: "Machine Maintenance",
    message: "Mixer 2 is due for weekly maintenance.",
    type: "info",
    read: true,
    timestamp: "1 day ago"
  }
]

let globalNotifications = [...INITIAL_NOTIFICATIONS]
let globalListeners: Array<() => void> = []

function notifyListeners() {
  for (const listener of globalListeners) {
    listener()
  }
}

export function useNotifications() {
  const [, setTick] = useState(0)

  const notifications = globalNotifications

  const markAsRead = useCallback((id: string) => {
    globalNotifications = globalNotifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    )
    notifyListeners()
    setTick(t => t + 1)
  }, [])

  const markAllAsRead = useCallback(() => {
    globalNotifications = globalNotifications.map(n => ({ ...n, read: true }))
    notifyListeners()
    setTick(t => t + 1)
  }, [])

  useEffect(() => {
    const listener = () => setTick(t => t + 1)
    globalListeners.push(listener)
    return () => {
      globalListeners = globalListeners.filter(l => l !== listener)
    }
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}
