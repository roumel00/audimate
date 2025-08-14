"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Phone, Shield, User } from "lucide-react"
import { TwilioCredentialsCard } from "@/components/twilio-credentials-card"
import { TwilioPhoneNumbersCard } from "@/components/twilio-phone-numbers-card"
import { AccountTab } from "@/components/settings/account-tab"
import { SecurityCard } from "@/components/settings/security-card"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userCredit, setUserCredit] = useState(null)
  const [twilioStatus, setTwilioStatus] = useState(null)
  const [subscriptionChanged, setSubscriptionChanged] = useState(false)

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
      setUserCredit(userData.user.credit)
      setUserData(userData.user)
    } catch (error) {
      console.error("Error fetching user credit:", error)
    }
  }

  // Handle subscription change
  const handleSubscriptionChange = (changed) => {
    setSubscriptionChanged(changed)
    // Refresh user data
    fetchUserCredit()
  }

  // Handle subscription change without forcing remount
  useEffect(() => {
    if (subscriptionChanged) {
      fetchUserCredit()
      setSubscriptionChanged(false)
    }
  }, [subscriptionChanged])

  // Initialize data when session is available
  useEffect(() => {
    if (session?.user?.id) {
      checkTwilioCredentials()
      fetchUserCredit()
    }
  }, [session?.user?.id])

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
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="account" className="flex items-center gap-2 cursor-pointer">
              <User className="h-4 w-4" />
              <span>Account</span>
            </TabsTrigger>
            <TabsTrigger value="twilio" className="flex items-center gap-2 cursor-pointer">
              <Phone className="h-4 w-4" />
              <span>Twilio Integration</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 cursor-pointer">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <AccountTab userData={userData} userCredit={userCredit} onSubscriptionChange={handleSubscriptionChange} />
          </TabsContent>

          <TabsContent value="twilio" className="space-y-6">
            <TwilioCredentialsCard twilioStatus={twilioStatus} onCredentialsUpdated={handleCredentialsUpdated} />
            {twilioStatus && twilioStatus.hasTwilioSID && twilioStatus.hasTwilioAuthToken && <TwilioPhoneNumbersCard />}
          </TabsContent>

          <TabsContent value="security">
            <SecurityCard />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
