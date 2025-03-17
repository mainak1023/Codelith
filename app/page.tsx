import CodeEditor from "@/components/code-editor"
import { getSession } from "@/lib/auth"

export default async function Home() {
  const session = await getSession()

  return (
    <main className="flex min-h-screen flex-col">
      <CodeEditor />
    </main>
  )
}

