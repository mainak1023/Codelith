"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function AuthError() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState("An error occurred during authentication")

  useEffect(() => {
    const error = searchParams.get("error")

    if (error) {
      switch (error) {
        case "Signin":
          setErrorMessage("Try signing in with a different account.")
          break
        case "OAuthSignin":
          setErrorMessage("Error in the OAuth signin process.")
          break
        case "OAuthCallback":
          setErrorMessage("Error in the OAuth callback process.")
          break
        case "OAuthCreateAccount":
          setErrorMessage("Could not create OAuth provider account.")
          break
        case "EmailCreateAccount":
          setErrorMessage("Could not create email provider account.")
          break
        case "Callback":
          setErrorMessage("Error in the OAuth callback handler.")
          break
        case "OAuthAccountNotLinked":
          setErrorMessage("Email already in use with different provider.")
          break
        case "EmailSignin":
          setErrorMessage("Check your email address.")
          break
        case "CredentialsSignin":
          setErrorMessage("Sign in failed. Check the details you provided are correct.")
          break
        case "SessionRequired":
          setErrorMessage("Please sign in to access this page.")
          break
        default:
          setErrorMessage(`Authentication error: ${error}`)
          break
      }
    }
  }, [searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold flex items-center text-destructive">
            <AlertCircle className="mr-2 h-6 w-6" />
            Authentication Error
          </CardTitle>
          <CardDescription>There was a problem signing you in</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{errorMessage}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/auth/signin")}>
            Try Again
          </Button>
          <Button onClick={() => router.push("/")}>Go to Home</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

