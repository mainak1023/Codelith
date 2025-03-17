"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Maximize2, Minimize2 } from "lucide-react"

interface TerminalProps {
  output: string
}

export function Terminal({ output }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono text-sm">
      <div className="flex items-center justify-between p-2 bg-gray-900">
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-xs text-gray-400">Terminal</span>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400">
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400">
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div ref={terminalRef} className="flex-1 p-2 overflow-auto whitespace-pre-wrap">
        {output || "> Ready for execution. Run your code to see output here."}
      </div>
    </div>
  )
}

