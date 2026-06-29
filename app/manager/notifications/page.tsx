"use client"

import React from "react"
import { motion } from "framer-motion"
import { Bell, Warning, CheckCircle, Wrench, ArrowLeft } from "@phosphor-icons/react"
import { useNotifications } from "@/lib/notifications-store"
import Link from "next/link"

const typeIcons: Record<string, React.ReactNode> = {
  warning: <Warning className="w-5 h-5 text-amber-500" />,
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  info: <Wrench className="w-5 h-5 text-blue-500" />,
}

const typeBg: Record<string, string> = {
  warning: "bg-amber-500/10 border-amber-500/20",
  success: "bg-emerald-500/10 border-emerald-500/20",
  info: "bg-blue-500/10 border-blue-500/20",
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/manager/dashboard"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
                Notifications
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "No unread notifications"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((notification, index) => (
              <motion.button
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.25 }}
                onClick={() => markAsRead(notification.id)}
                className={`flex items-start gap-4 p-5 rounded-2xl border text-left w-full transition-all hover:shadow-sm ${
                  notification.read
                    ? "bg-card border-border/30 opacity-60 hover:opacity-80"
                    : `${typeBg[notification.type] || "bg-primary/5 border-primary/20"}`
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {typeIcons[notification.type] || (
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className={`text-sm font-semibold leading-tight ${
                      notification.read ? "text-muted-foreground" : "text-foreground"
                    }`}>
                      {notification.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                      {notification.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                )}
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
