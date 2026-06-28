"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface UseChronometerReturn {
  isRunning: boolean
  elapsedSeconds: number
  remainingSeconds: number
  progressPercent: number
  startTimer: () => void
  pauseTimer: () => void
  stopTimer: () => void
  formattedTime: string
}

export function useResilientChronometer(
  orderId: string | null,
  totalSeconds: number = 0,
  onComplete?: () => void
): UseChronometerReturn {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds)
  const progressPercent = totalSeconds > 0 ? Math.min(100, (elapsedSeconds / totalSeconds) * 100) : 0

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

    // If already over total, auto-complete
    if (totalSeconds > 0 && currentElapsed >= totalSeconds) {
      setElapsedSeconds(totalSeconds)
      setIsRunning(false)
      if (onCompleteRef.current) {
        setTimeout(onCompleteRef.current, 100)
      }
      return
    }

    setElapsedSeconds(currentElapsed)

    // Setup interval if running
    if (savedStart) {
      const baseElapsedAtIntervalStart = currentElapsed
      const intervalStartTime = Date.now()
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const diff = Math.floor((now - intervalStartTime) / 1000)
        const newElapsed = baseElapsedAtIntervalStart + diff

        if (totalSeconds > 0 && newElapsed >= totalSeconds) {
          setElapsedSeconds(totalSeconds)
          setIsRunning(false)
          if (intervalRef.current) clearInterval(intervalRef.current)
          localStorage.removeItem(storageKeyStart)
          localStorage.setItem(storageKeyAccumulated, totalSeconds.toString())
          if (onCompleteRef.current) {
            onCompleteRef.current()
          }
        } else {
          setElapsedSeconds(newElapsed)
        }
      }, 1000)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [orderId, totalSeconds])

  const startTimer = useCallback(() => {
    if (!orderId || isRunning) return

    const storageKeyStart = `${orderId}_start_timestamp`
    localStorage.setItem(storageKeyStart, Date.now().toString())
    
    setIsRunning(true)
    
    const baseElapsed = elapsedSeconds
    const startTime = Date.now()

    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const diff = Math.floor((now - startTime) / 1000)
      const newElapsed = baseElapsed + diff

      if (totalSeconds > 0 && newElapsed >= totalSeconds) {
        setElapsedSeconds(totalSeconds)
        setIsRunning(false)
        if (intervalRef.current) clearInterval(intervalRef.current)
        const storageKeyStartInner = `${orderId}_start_timestamp`
        const storageKeyAccumulated = `${orderId}_accumulated_seconds`
        localStorage.removeItem(storageKeyStartInner)
        localStorage.setItem(storageKeyAccumulated, totalSeconds.toString())
        if (onCompleteRef.current) {
          onCompleteRef.current()
        }
      } else {
        setElapsedSeconds(newElapsed)
      }
    }, 1000)
  }, [orderId, isRunning, elapsedSeconds, totalSeconds])

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

  // Formatting MM:SS as countdown
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, '0')
    const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0')
    const secs = (totalSecs % 60).toString().padStart(2, '0')
    if (hrs !== "00") return `${hrs} : ${mins} : ${secs}`
    return `${mins} : ${secs}`
  }

  return {
    isRunning,
    elapsedSeconds,
    remainingSeconds,
    progressPercent,
    startTimer,
    pauseTimer,
    stopTimer,
    formattedTime: formatTime(remainingSeconds)
  }
}
