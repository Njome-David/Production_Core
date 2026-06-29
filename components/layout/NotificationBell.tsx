"use client"

import React from "react"
import Link from "next/link"
import { Bell } from "@phosphor-icons/react"
import { useNotifications } from "@/lib/notifications-store"

export function NotificationBell() {
  const { unreadCount } = useNotifications()

  return (
    <Link
      href="/manager/notifications"
      className="relative p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 inline-flex"
    >
      <Bell className="w-5 h-5" weight={unreadCount > 0 ? "fill" : "regular"} />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center border-2 border-card">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  )
}
