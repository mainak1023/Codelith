"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import Pusher from "pusher-js"

export function useCollaboration(projectId?: string) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [collaborators, setCollaborators] = useState([])
  const [sessionId, setSessionId] = useState("")
  const [authToken, setAuthToken] = useState("")
  const [channelName, setChannelName] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [pusherClient, setPusherClient] = useState(null)

  // Initialize collaboration session
  useEffect(() => {
    const initCollaboration = async () => {
      if (!session?.user || !projectId) return

      try {
        // Check if a session already exists for this project
        const response = await fetch(`/api/collaboration?projectId=${projectId}`)

        if (response.ok) {
          const data = await response.json()

          if (data.session) {
            // Join existing session
            await joinSession(data.session.id)
          } else {
            // Create new session
            await createSession()
          }
        } else {
          // Create new session if none exists
          await createSession()
        }
      } catch (error) {
        console.error("Error initializing collaboration:", error)
        toast({
          title: "Collaboration Error",
          description: "Failed to initialize collaboration session",
          variant: "destructive",
        })

        // Fall back to mock collaborators for demo purposes
        setCollaborators([
          { id: "user1", name: "John Doe", avatar: "/placeholder.svg?height=40&width=40" },
          { id: "user2", name: "Jane Smith", avatar: "/placeholder.svg?height=40&width=40" },
        ])
      }
    }

    initCollaboration()

    return () => {
      // Clean up Pusher connection
      if (pusherClient) {
        pusherClient.disconnect()
      }

      // Leave session when component unmounts
      if (sessionId && session?.user?.id) {
        leaveSession()
      }
    }
  }, [session, projectId])

  const createSession = async () => {
    if (!session?.user || !projectId) return

    try {
      const response = await fetch("/api/collaboration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          userId: session.user.id,
          userName: session.user.name,
          userAvatar: session.user.image,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create collaboration session")
      }

      const data = await response.json()
      setSessionId(data.sessionId)
      setAuthToken(data.authToken)
      setChannelName(data.channelName)

      // Initialize Pusher connection
      initPusher(data.sessionId, data.authToken, data.channelName)
    } catch (error) {
      console.error("Error creating collaboration session:", error)
      toast({
        title: "Collaboration Error",
        description: "Failed to create collaboration session",
        variant: "destructive",
      })
    }
  }

  const joinSession = async (sid) => {
    if (!session?.user) return

    try {
      const response = await fetch("/api/collaboration", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sid,
          userId: session.user.id,
          userName: session.user.name,
          userAvatar: session.user.image,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to join collaboration session")
      }

      const data = await response.json()
      setSessionId(data.sessionId)
      setAuthToken(data.authToken)
      setChannelName(data.channelName)
      setCollaborators(data.participants || [])

      // Initialize Pusher connection
      initPusher(data.sessionId, data.authToken, data.channelName)

      toast({
        title: "Joined Session",
        description: "You've joined a collaborative editing session",
      })
    } catch (error) {
      console.error("Error joining collaboration session:", error)
      toast({
        title: "Collaboration Error",
        description: "Failed to join collaboration session",
        variant: "destructive",
      })
    }
  }

  const leaveSession = async () => {
    if (!sessionId || !session?.user?.id) return

    try {
      await fetch(`/api/collaboration?sessionId=${sessionId}&userId=${session.user.id}`, {
        method: "DELETE",
      })

      // Clean up Pusher connection
      if (pusherClient) {
        pusherClient.disconnect()
      }

      setSessionId("")
      setAuthToken("")
      setChannelName("")
      setCollaborators([])
      setIsConnected(false)
      setPusherClient(null)
    } catch (error) {
      console.error("Error leaving collaboration session:", error)
    }
  }

  const initPusher = (sid, token, channel) => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      console.error("Pusher configuration missing")
      return
    }

    try {
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        authEndpoint: "/api/pusher/auth",
        auth: {
          params: {
            user_id: session.user.id,
            auth_token: token,
          },
        },
      })

      const channel = pusher.subscribe(`presence-collab-${sid}`)

      channel.bind("pusher:subscription_succeeded", (members) => {
        setIsConnected(true)

        // Update collaborators list
        const currentCollaborators = []
        members.each((member) => {
          currentCollaborators.push({
            id: member.id,
            name: member.info.name,
            avatar: member.info.avatar,
          })
        })

        setCollaborators(currentCollaborators)
      })

      channel.bind("pusher:member_added", (member) => {
        setCollaborators((prev) => [
          ...prev,
          {
            id: member.id,
            name: member.info.name,
            avatar: member.info.avatar,
          },
        ])

        toast({
          title: "User Joined",
          description: `${member.info.name} joined the session`,
        })
      })

      channel.bind("pusher:member_removed", (member) => {
        setCollaborators((prev) => prev.filter((c) => c.id !== member.id))

        toast({
          title: "User Left",
          description: `A collaborator left the session`,
        })
      })

      channel.bind("code-update", (data) => {
        // Handle code updates from other users
        if (data.userId !== session.user.id) {
          // This would be handled by the code editor component
          window.dispatchEvent(
            new CustomEvent("collaborative-update", {
              detail: data,
            }),
          )
        }
      })

      setPusherClient(pusher)
    } catch (error) {
      console.error("Error initializing Pusher:", error)
      toast({
        title: "Collaboration Error",
        description: "Failed to initialize real-time collaboration",
        variant: "destructive",
      })
    }
  }

  const shareCode = useCallback(() => {
    if (!sessionId) {
      toast({
        title: "Sharing Error",
        description: "No active collaboration session to share",
        variant: "destructive",
      })
      return null
    }

    // Generate a shareable link with the session ID
    const shareableLink = `${window.location.origin}?session=${sessionId}`

    // Copy to clipboard
    navigator.clipboard
      .writeText(shareableLink)
      .then(() => {
        toast({
          title: "Link Copied",
          description: "Collaboration link copied to clipboard",
        })
      })
      .catch((err) => {
        console.error("Failed to copy link:", err)
        toast({
          title: "Copy Failed",
          description: "Failed to copy link to clipboard",
          variant: "destructive",
        })
      })

    return shareableLink
  }, [sessionId, toast])

  const updateCollaborativeCode = useCallback(
    (fileId, content) => {
      if (!isConnected || !pusherClient || !sessionId || !session?.user?.id) {
        return
      }

      try {
        // Send code update to all collaborators via Pusher
        fetch(`/api/pusher/trigger`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel: channelName,
            event: "code-update",
            data: {
              fileId,
              content,
              userId: session.user.id,
              timestamp: Date.now(),
            },
          }),
        })
      } catch (error) {
        console.error("Error sending collaborative update:", error)
      }
    },
    [isConnected, pusherClient, sessionId, channelName, session],
  )

  return {
    collaborators,
    sessionId,
    isConnected,
    shareCode,
    updateCollaborativeCode,
    joinSession,
    leaveSession,
  }
}

