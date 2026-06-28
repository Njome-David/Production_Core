"use client"

import React, { useState } from "react"
import { Bell, Warning, CheckCircle, Wrench } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"

interface Notification {
  id: string
  title: string
  message: string
  type: "warning" | "success" | "info"
  read: boolean
  timestamp: string
}

// Mock notifications
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

export function NotificationBell({ isCollapsed }: { isCollapsed?: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "warning": return <Warning className="w-5 h-5 text-amber-500" />
      case "success": return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case "info": return <Wrench className="w-5 h-5 text-blue-500" />
      default: return <Bell className="w-5 h-5 text-muted-foreground" />
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
      >
        <Bell className="w-5 h-5" weight={unreadCount > 0 ? "fill" : "regular"} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-card" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`absolute z-50 mt-2 bg-card border border-border/50 rounded-2xl shadow-xl w-80 overflow-hidden ${isCollapsed ? 'left-full ml-4 top-0' : 'right-0 top-full'}`}
            >
              <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/30">
                <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => handleMarkAsRead(notification.id)}
                      className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-colors ${notification.read ? 'hover:bg-muted/50 opacity-70' : 'bg-primary/5 hover:bg-primary/10'}`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium leading-none truncate text-foreground">
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {notification.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
