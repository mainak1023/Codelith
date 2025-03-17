"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { languages } from "@/lib/languages"
import {
  Play,
  Download,
  Upload,
  Eye,
  EyeOff,
  TerminalIcon,
  Folder,
  Sparkles,
  Loader2,
  Code,
  Zap,
  HelpCircle,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

interface ToolbarProps {
  language: string
  setLanguage: (language: string) => void
  runCode: () => void
  isRunning: boolean
  togglePreview: () => void
  showPreview: boolean
  toggleTerminal: () => void
  showTerminal: boolean
  toggleFileExplorer: () => void
  showFileExplorer: boolean
  fontSize: number
  onFontSizeChange: (size: number) => void
  onAIAssist: (action: string) => void
  onExport: () => void
  onImport: () => void
}

export function Toolbar({
  language,
  setLanguage,
  runCode,
  isRunning,
  togglePreview,
  showPreview,
  toggleTerminal,
  showTerminal,
  toggleFileExplorer,
  showFileExplorer,
  fontSize,
  onFontSizeChange,
  onAIAssist,
  onExport,
  onImport,
}: ToolbarProps) {
  const { signOut } = useAuth()
  const router = useRouter()
  const [showFontSizeSlider, setShowFontSizeSlider] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/auth/signin")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  return (
    <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-background">
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleFileExplorer}
                className={showFileExplorer ? "bg-secondary" : ""}
              >
                <Folder className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle File Explorer (Ctrl+E)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.id} value={lang.id}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => setShowFontSizeSlider(!showFontSizeSlider)}>
                <span className="text-xs font-bold">Aa</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adjust Font Size</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {showFontSizeSlider && (
          <div className="w-32 px-2 py-1 bg-background border border-input rounded-md">
            <Slider
              value={[fontSize]}
              min={10}
              max={24}
              step={1}
              onValueChange={(value) => onFontSizeChange(value[0])}
            />
          </div>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={togglePreview}>
                {showPreview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Preview (Ctrl+B)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTerminal}
                className={showTerminal ? "bg-secondary" : ""}
              >
                <TerminalIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Terminal (Ctrl+`)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => onAIAssist("fix")}>
                <Code className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fix Code with AI</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>AI Assistant</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onAIAssist("fix")}>
              <Code className="h-4 w-4 mr-2" />
              Fix Code
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAIAssist("optimize")}>
              <Zap className="h-4 w-4 mr-2" />
              Optimize Code
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAIAssist("explain")}>
              <HelpCircle className="h-4 w-4 mr-2" />
              Explain Code
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export Project</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onImport}>
                <Upload className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Import Files</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sign Out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" onClick={runCode} disabled={isRunning} className="ml-2">
                {isRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                Run
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Run Code (Ctrl+R)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <ThemeToggle />
      </div>
    </div>
  )
}

