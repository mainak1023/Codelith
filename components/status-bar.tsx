"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "firebase/auth"

interface StatusBarProps {
  language: string
  cursorPosition: { lineNumber: number; column: number }
  user: User | null
}

export function StatusBar({ language, cursorPosition, user }: StatusBarProps) {
  return (
    <div className="flex items-center justify-between p-2 text-xs border-t border-gray-200 dark:border-gray-700 bg-muted/20">
      <div className="flex items-center space-x-2">
        <Badge variant="outline">{language}</Badge>
        <span className="text-muted-foreground">
          Line: {cursorPosition.lineNumber}, Column: {cursorPosition.column}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        {user && (
          <div className="flex items-center">
            <Avatar className="h-5 w-5 mr-2">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
              <AvatarFallback className="text-[10px]">
                {user.displayName
                  ? user.displayName.substring(0, 2).toUpperCase()
                  : user.email?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {user.displayName || user.email?.split("@")[0] || "User"}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

