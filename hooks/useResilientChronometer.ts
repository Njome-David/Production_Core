"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface ChronometerState {
  isRunning: boolean
  elapsedSeconds: number
}

interface UseChronometerReturn extends ChronometerState {
  startTimer: () => void
  pauseTimer: () => void
  stopTimer: () => void
  formattedTime: string
}

export function useResilientChronometer(orderId: string | null): UseChronometerReturn {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load from local storage on mount or orderId change
  useEffect(() => {
    if (!orderId) {
      setIsRunning(false)
      setElapsedSeconds(0)
      return
    }

    const storageKeyStart = `${orderId}_start_timestamp`
    const storageKeyAccumulated = `${orderId}_accumulated_seconds`

    const savedStart = localStorage.getItem(storageKeyStart)
    const savedAccumulated = localStorage.getItem(storageKeyAccumulated)
    
    let currentElapsed = savedAccumulated ? parseInt(savedAccumulated, 10) : 0

    if (savedStart) {
      const startTime = parseInt(savedStart, 10)
      const now = Date.now()
      const diffSeconds = Math.floor((now - startTime) / 1000)
      currentElapsed += diffSeconds
      setIsRunning(true)
    } else {
      setIsRunning(false)
    }

    setElapsedSeconds(currentElapsed)

    // Setup interval if running
    if (savedStart) {
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const startTime = parseInt(savedStart, 10)
        const diffSeconds = Math.floor((now - startTime) / 1000)
        setElapsedSeconds(currentElapsed + diffSeconds)
      }, 1000)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [orderId])

  const startTimer = useCallback(() => {
    if (!orderId || isRunning) return

    const storageKeyStart = `${orderId}_start_timestamp`
    localStorage.setItem(storageKeyStart, Date.now().toString())
    
    setIsRunning(true)
    
    const baseElapsed = elapsedSeconds
    const startTime = Date.now()

    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const diffSeconds = Math.floor((now - startTime) / 1000)
      setElapsedSeconds(baseElapsed + diffSeconds)
    }, 1000)
  }, [orderId, isRunning, elapsedSeconds])

  const pauseTimer = useCallback(() => {
    if (!orderId || !isRunning) return

    if (intervalRef.current) clearInterval(intervalRef.current)
    
    const storageKeyStart = `${orderId}_start_timestamp`
    const storageKeyAccumulated = `${orderId}_accumulated_seconds`
    
    localStorage.removeItem(storageKeyStart)
    localStorage.setItem(storageKeyAccumulated, elapsedSeconds.toString())
    
    setIsRunning(false)
  }, [orderId, isRunning, elapsedSeconds])

  const stopTimer = useCallback(() => {
    if (!orderId) return
    
    if (intervalRef.current) clearInterval(intervalRef.current)
    
    const storageKeyStart = `${orderId}_start_timestamp`
    const storageKeyAccumulated = `${orderId}_accumulated_seconds`
    
    localStorage.removeItem(storageKeyStart)
    localStorage.removeItem(storageKeyAccumulated)
    
    setIsRunning(false)
    setElapsedSeconds(0)
  }, [orderId])

  // Formatting HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0')
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0')
    const secs = (totalSeconds % 60).toString().padStart(2, '0')
    return `${hrs} : ${mins} : ${secs}`
  }

  return {
    isRunning,
    elapsedSeconds,
    startTimer,
    pauseTimer,
    stopTimer,
    formattedTime: formatTime(elapsedSeconds)
  }
}
