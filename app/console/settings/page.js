"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TwilioCredentialsCard } from "@/components/twilio-credentials-card"
import { TwilioPhoneNumbersCard } from "@/components/twilio-phone-numbers-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Phone, Shield, User, CreditCard } from "lucide-react"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [twilioStatus, setTwilioStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userCredit, setUserCredit] = useState(null)

  // Check if user has Twilio credentials
  const checkTwilioCredentials = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/twilio/status")

      if (!response.ok) {
        throw new Error("Failed to check Twilio status")
      }

      const data = await response.json()
      setTwilioStatus(data)
    } catch (error) {
      console.error("Error checking Twilio credentials:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch user credit information
  const fetchUserCredit = async () => {
    try {
      const response = await fetch("/api/auth/user")

      if (!response.ok) {
        throw new Error("Failed to fetch user data")
      }

      const userData = await response.json()
      console.log(userData)
      setUserCredit(userData.user.credit)
    } catch (error) {
      console.error("Error fetching user credit:", error)
    }
  }

  useEffect(() => {
    if (session) {
      checkTwilioCredentials()
      fetchUserCredit()
    }
  }, [session])

  const handleCredentialsUpdated = () => {
    // Refresh Twilio status after credentials are updated
    checkTwilioCredentials()
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <Tabs defaultValue="twilio" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="twilio" className="flex items-center gap-2 cursor-pointer">
              <Phone className="h-4 w-4" />
              <span>Twilio Integration</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2 cursor-pointer">
              <User className="h-4 w-4" />
              <span>Account</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 cursor-pointer">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="twilio" className="space-y-6">
            <TwilioCredentialsCard twilioStatus={twilioStatus} onCredentialsUpdated={handleCredentialsUpdated} />

            {twilioStatus && twilioStatus.hasTwilioSID && twilioStatus.hasTwilioAuthToken && <TwilioPhoneNumbersCard />}
          </TabsContent>

          <TabsContent value="account">
            <div className="space-y-6">
              {/* Credit Information Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Account Credit
                    </CardTitle>
                    <CardDescription>Your available credit for calls and AI features</CardDescription>
                  </div>
                  {userCredit !== null && (
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      ${userCredit?.toFixed(2)}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Your credit is used for phone calls ($0.01 per 3.6 seconds) and AI features like script generation
                      and transcript summarization ($0.01 per use).
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Credit usage:</span>
                      <ul className="list-disc list-inside ml-2 text-muted-foreground">
                        <li>Phone calls: $0.01 per 3.6 seconds</li>
                        <li>Script generation: $0.01 per use</li>
                        <li>Call summarization: $0.01 per use</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Settings Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account details</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Account settings will be available soon.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your security preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Security settings will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
