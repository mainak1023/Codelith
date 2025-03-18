"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TerminalProps {
  output: string[]
  onCommand: (command: string) => void
}

export function Terminal({ output, onCommand }: TerminalProps) {
  const [command, setCommand] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [output])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (command.trim()) {
      onCommand(command)
      setCommandHistory([...commandHistory, command])
      setHistoryIndex(-1)
      setCommand("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCommand(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCommand(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCommand("")
      }
    }
  }

  const handleClear = () => {
    onCommand("clear")
  }

  return (
    <div className="flex flex-col h-full bg-black text-green-500 font-mono text-sm">
      <div className="flex items-center justify-between p-2 border-b border-gray-800">
        <h2 className="text-sm font-semibold">Terminal</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-400 hover:text-white"
          onClick={handleClear}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-grow p-2" ref={scrollAreaRef}>
        <div className="space-y-1">
          {output.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap break-all">
              {line}
            </div>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-2 border-t border-gray-800">
        <div className="flex items-center">
          <span className="mr-2">$</span>
          <Input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-  => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className=\"flex-grow bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white"
            placeholder="Type a command..."
            autoComplete="off"
          />
        </div>
      </form>
    </div>
  )
}

