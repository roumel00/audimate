"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SubscriptionCard({ userData, onSubscriptionChange }) {
  const [loadingButton, setLoadingButton] = useState(null)
  const router = useRouter()
  const { toast } = useToast()

  // Handle subscription change
  const handleSubscriptionChange = async (tier) => {
    try {
      setLoadingButton(tier)

      if (tier === "free" && userData?.tier !== "free") {
        // Handle downgrade to free tier
        const response = await fetch("/api/stripe/cancel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to cancel subscription")
        }

        toast({
          title: "Subscription Cancelled",
          description: "Your subscription has been set to cancel at the end of the billing period.",
        })

        onSubscriptionChange(true)
        return
      }

      // For upgrades or plan changes
      const response = await fetch("/api/stripe/checkout/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tier }),
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const data = await response.json()

      // If subscription was updated without checkout
      if (data.success) {
        toast({
          title: "Subscription Updated",
          description: `Your subscription has been changed to the ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan.`,
        })
        onSubscriptionChange(true)
        return
      }

      // Redirect to Stripe checkout
      if (data.url) {
        router.push(data.url)
      }
    } catch (error) {
      console.error("Error changing subscription:", error)
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingButton(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </div>
        {userData && (
          <Badge
            variant={
              !userData?.tier || userData?.tier === "free"
                ? "outline"
                : userData?.tier === "business"
                  ? "secondary"
                  : "default"
            }
            className="text-base px-3 py-1 capitalize"
          >
            {userData?.tier || "Free"} Plan
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Tier */}
            <button
              onClick={() => userData?.tier !== "business" && handleSubscriptionChange("business")}
              disabled={userData?.tier === "business" || loadingButton !== null}
              className={`w-full text-left transition-all duration-200 hover:scale-102 hover:shadow-lg ${
                loadingButton === "business"
                  ? "cursor-wait"
                  : userData?.tier === "business"
                    ? "cursor-default"
                    : "cursor-pointer"
              }`}
            >
              <Card className={`border h-full ${userData?.tier === "business" ? "border-primary" : "border-border"}`}>
                <CardHeader>
                  <CardTitle>Business</CardTitle>
                  <CardDescription>For small businesses</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">$249</p>
                  <p className="text-sm text-muted-foreground mt-1">per month</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <svg
                        className="mr-2 h-4 w-4 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Unlimited contacts
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="mr-2 h-4 w-4 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Advanced call features
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="mr-2 h-4 w-4 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Credit purchases
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  {userData?.tier === "business" ? (
                    <Badge variant="outline" className="w-full flex justify-center py-2">
                      Current Plan
                    </Badge>
                  ) : loadingButton === "business" ? (
                    <div className="w-full flex justify-center py-2">
                      <span className="flex items-center justify-center">
                        <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                        Processing...
                      </span>
                    </div>
                  ) : userData?.tier === "enterprise" ? (
                    <Badge variant="outline" className="w-full flex justify-center py-2">
                      Downgrade to Business
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="w-full flex justify-center py-2">
                      Upgrade to Business
                    </Badge>
                  )}
                </CardFooter>
              </Card>
            </button>

            {/* Enterprise Tier */}
            <button
              onClick={() => userData?.tier !== "enterprise" && handleSubscriptionChange("enterprise")}
              disabled={userData?.tier === "enterprise" || loadingButton !== null}
              className={`w-full text-left transition-all duration-200 hover:scale-102 hover:shadow-lg ${
                loadingButton === "enterprise"
                  ? "cursor-wait"
                  : userData?.tier === "enterprise"
                    ? "cursor-default"
                    : "cursor-pointer"
              }`}
            >
              <Card className={`border h-full ${userData?.tier === "enterprise" ? "border-primary" : "border-border"}`}>
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>For large organizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">$499</p>
                  <p className="text-sm text-muted-foreground mt-1">per month</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <svg
                        className="mr-2 h-4 w-4 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Unlimited everything
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="mr-2 h-4 w-4 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Priority support
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="mr-2 h-4 w-4 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Bulk credit discounts
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  {userData?.tier === "enterprise" ? (
                    <Badge variant="outline" className="w-full flex justify-center py-2">
                      Current Plan
                    </Badge>
                  ) : loadingButton === "enterprise" ? (
                    <div className="w-full flex justify-center py-2">
                      <span className="flex items-center justify-center">
                        <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                        Processing...
                      </span>
                    </div>
                  ) : userData?.tier === "business" ? (
                    <Badge variant="outline" className="w-full flex justify-center py-2">
                      Upgrade to Enterprise
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="w-full flex justify-center py-2">
                      Upgrade to Enterprise
                    </Badge>
                  )}
                </CardFooter>
              </Card>
            </button>
          </div>

          {/* Cancel Subscription Button */}
          {(userData?.tier === "business" || userData?.tier === "enterprise") && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                className="text-destructive border-destructive hover:bg-destructive/10"
                onClick={() => handleSubscriptionChange("free")}
                disabled={loadingButton !== null}
              >
                {loadingButton === "free" ? (
                  <span className="flex items-center justify-center">
                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-destructive border-t-transparent"></span>
                    Processing...
                  </span>
                ) : (
                  "Cancel Subscription"
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
