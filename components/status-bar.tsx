"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Share2, Users } from "lucide-react"

interface StatusBarProps {
  language: string
  collaborators: any[]
  shareCode: () => void
  cursorPosition: { lineNumber: number; column: number }
}

export function StatusBar({ language, collaborators, shareCode, cursorPosition }: StatusBarProps) {
  return (
    <div className="flex items-center justify-between p-2 text-xs border-t border-gray-200 dark:border-gray-700 bg-muted/20">
      <div className="flex items-center space-x-2">
        <Badge variant="outline">{language}</Badge>
        <span className="text-muted-foreground">
          Line: {cursorPosition.lineNumber}, Column: {cursorPosition.column}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        {collaborators.length > 0 && (
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            <div className="flex -space-x-2">
              {collaborators.map((collaborator, index) => (
                <Avatar key={index} className="h-5 w-5 border border-background">
                  <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                  <AvatarFallback className="text-[10px]">
                    {collaborator.name?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        )}

        <Button variant="ghost" size="sm" className="h-6 px-2" onClick={shareCode}>
          <Share2 className="h-3 w-3 mr-1" />
          Share
        </Button>
      </div>
    </div>
  )
}

