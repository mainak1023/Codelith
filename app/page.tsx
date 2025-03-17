import CodeEditor from "@/components/code-editor"
import { cookies } from "next/headers"

export default function Home() {
  // Server-side check for auth cookie
  const cookieStore = cookies()
  const authCookie = cookieStore.get("firebase-auth-token")

  // If no auth cookie is found, redirect to sign in
  // Note: This is a simple check, the actual Firebase auth is handled client-side
  if (!authCookie) {
    // We'll still render the editor but with a client-side auth check
    // This allows Firebase to handle the auth state properly
  }

  return (
    <main className="flex min-h-screen flex-col">
      <CodeEditor />
    </main>
  )
}

