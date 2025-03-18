"use client"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface SettingsProps {
  onClose: () => void
}

export function Settings({ onClose }: SettingsProps) {
  const { theme, setTheme } = useTheme()
  const [fontSize, setFontSize] = useLocalStorage("editor-font-size", 14)
  const [wordWrap, setWordWrap] = useLocalStorage("editor-word-wrap", true)
  const [minimap, setMinimap] = useLocalStorage("editor-minimap", true)
  const [tabSize, setTabSize] = useLocalStorage("editor-tab-size", 2)
  const [autoSave, setAutoSave] = useLocalStorage("editor-auto-save", true)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
      <div className="bg-card border rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Tabs defaultValue="editor" className="p-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="keybindings">Keybindings</TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="font-size">Font Size: {fontSize}px</Label>
                <Slider
                  id="font-size"
                  min={10}
                  max={24}
                  step={1}
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                  className="w-[60%]"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="tab-size">Tab Size: {tabSize}</Label>
                <Slider
                  id="tab-size"
                  min={2}
                  max={8}
                  step={2}
                  value={[tabSize]}
                  onValueChange={(value) => setTabSize(value[0])}
                  className="w-[60%]"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="word-wrap">Word Wrap</Label>
                <Switch id="word-wrap" checked={wordWrap} onCheckedChange={setWordWrap} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="minimap">Minimap</Label>
                <Switch id="minimap" checked={minimap} onCheckedChange={setMinimap} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-save">Auto Save</Label>
                <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Theme</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                  >
                    Light
                  </Button>
                  <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")}>
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                  >
                    System
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="keybindings" className="space-y-4">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Save</div>
                <div className="text-muted-foreground">Ctrl+S</div>
                <div className="font-medium">Find</div>
                <div className="text-muted-foreground">Ctrl+F</div>
                <div className="font-medium">Replace</div>
                <div className="text-muted-foreground">Ctrl+H</div>
                <div className="font-medium">Format Document</div>
                <div className="text-muted-foreground">Shift+Alt+F</div>
                <div className="font-medium">Comment Line</div>
                <div className="text-muted-foreground">Ctrl+/</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end p-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}

