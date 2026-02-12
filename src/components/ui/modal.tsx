"use client"

import * as React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { XIcon, GripVertical, Pin } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  initialPosition?: { x: number; y: number }
  onPositionChange?: (position: { x: number; y: number }) => void
  initialPinned?: boolean
  onPinnedChange?: (pinned: boolean) => void
}

export function Modal({ open, onClose, children, className, initialPosition, onPositionChange, initialPinned, onPinnedChange }: ModalProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const handlePinToggle = useCallback(() => {
    const newPinned = !isPinned
    setIsPinned(newPinned)
    onPinnedChange?.(newPinned)
  }, [isPinned, onPinnedChange])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isPinned) return
    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    }
  }, [position, isPinned])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragRef.current) return
    
    const deltaX = e.clientX - dragRef.current.startX
    const deltaY = e.clientY - dragRef.current.startY
    
    const newPosition = {
      x: dragRef.current.initialX + deltaX,
      y: dragRef.current.initialY + deltaY,
    }
    setPosition(newPosition)
    onPositionChange?.(newPosition)
  }, [isDragging, onPositionChange])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    dragRef.current = null
  }, [])

  // Global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Клик вне модального окна - ОТКЛЮЧЕНО, закрытие только по X
  // Раньше было автозакрытие, но оно мешало работе с вложенными модалками
  // Теперь закрытие только через кнопку X или нажатие скрепки для pin режима

  // Set initial position when modal opens or initialPosition changes
  useEffect(() => {
    if (open) {
      if (initialPosition) {
        setPosition(initialPosition)
      } else {
        setPosition({ x: 0, y: 0 })
      }
      if (initialPinned !== undefined) {
        setIsPinned(initialPinned)
      } else {
        setIsPinned(false)
      }
    }
  }, [open, initialPosition, initialPinned])

  if (!open) return null

  return (
    <div
      ref={modalRef}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        zIndex: 50,
      }}
      className={cn(
        "w-full max-w-lg rounded-2xl p-6 shadow-2xl",
        "glass-theme",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        isDragging && "cursor-grabbing select-none",
        className
      )}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === ModalHeader) {
          return React.cloneElement(child as React.ReactElement<ModalHeaderProps>, {
            onDragStart: handleMouseDown,
            isDragging,
            isPinned,
            onTogglePin: handlePinToggle,
          })
        }
        return child
      })}
    </div>
  )
}

interface ModalHeaderProps {
  children: React.ReactNode
  onClose: () => void
  className?: string
  onDragStart?: (e: React.MouseEvent) => void
  isDragging?: boolean
  isPinned?: boolean
  onTogglePin?: () => void
  actions?: React.ReactNode
}

export function ModalHeader({ children, onClose, className, onDragStart, isDragging, isPinned, onTogglePin, actions }: ModalHeaderProps) {
  return (
    <div
      onMouseDown={onDragStart}
      className={cn(
        "flex items-center justify-between",
        "-mx-6 -mt-6 px-6 py-4 mb-4 border-b border-white/10 rounded-t-2xl bg-white/5",
        isPinned ? "cursor-grab" : "cursor-default",
        isDragging && "cursor-grabbing",
        className
      )}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <GripVertical className={cn("w-4 h-4 shrink-0", isPinned ? "text-indigo-400" : "text-slate-500")} />
        {children}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Custom actions (Edit, Delete, etc.) */}
        {actions}
        {/* Pin button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTogglePin?.()
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className={cn(
            "p-1.5 rounded-lg border transition-all duration-200",
            isPinned 
              ? "bg-indigo-500/30 border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/40" 
              : "bg-slate-500/20 border-slate-500/30 text-slate-400 hover:bg-slate-500/30 hover:text-slate-300"
          )}
          title={isPinned ? "Открепить" : "Закрепить (можно перетаскивать)"}
        >
          <Pin className={cn("w-4 h-4", isPinned && "fill-current")} />
        </button>
        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/40 border border-orange-500/30 hover:border-orange-500/50 transition-all duration-200 text-orange-400 hover:text-orange-300 hover:scale-110 hover:shadow-lg hover:shadow-orange-500/20"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export function ModalTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-lg font-semibold leading-none text-white", className)}>
      {children}
    </h2>
  )
}
