"use client"

import { useEffect, useRef, useState } from "react"
import type { File } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { RefreshCw, Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PreviewProps {
  files: File[]
}

export function Preview({ files }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    updatePreview()
  }, [files])

  const updatePreview = () => {
    if (!iframeRef.current) return

    setIsLoading(true)

    const htmlFile = files.find((file) => file.name.endsWith(".html"))
    const cssFiles = files.filter((file) => file.name.endsWith(".css"))
    const jsFiles = files.filter((file) => file.name.endsWith(".js"))

    if (!htmlFile) {
      setIsLoading(false)
      return
    }

    let htmlContent = htmlFile.content

    // Inject CSS
    const styleTag = cssFiles.map((file) => `<style>${file.content}</style>`).join("")
    htmlContent = htmlContent.replace("</head>", `${styleTag}</head>`)

    // Inject JS
    const scriptTag = jsFiles.map((file) => `<script>${file.content}</script>`).join("")
    htmlContent = htmlContent.replace("</body>", `${scriptTag}</body>`)

    // Update iframe content
    const iframe = iframeRef.current
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document

    if (iframeDoc) {
      iframeDoc.open()
      iframeDoc.write(htmlContent)
      iframeDoc.close()
    }

    setIsLoading(false)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={cn("flex flex-col h-full", isFullscreen && "fixed inset-0 z-50 bg-background")}>
      <div className="flex items-center justify-between p-2 border-b">
        <h2 className="text-sm font-semibold">Preview</h2>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={updatePreview}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="relative flex-grow">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          title="Preview"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  )
}

