"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CreditCard as CreditCardIcon } from "lucide-react"

export function CreditCard({ userCredit, userData, handleSubscriptionChange }) {
  const [customCreditAmount, setCustomCreditAmount] = useState("")
  const router = useRouter()

  // Handle credit purchase
  const handleCreditPurchase = async (amount) => {
    try {
      if (!amount || amount <= 0) {
        return
      }

      const response = await fetch("/api/stripe/checkout/credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ creditAmount: amount }),
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const data = await response.json()

      // Redirect to Stripe checkout
      if (data.url) {
        router.push(data.url)
      }
    } catch (error) {
      console.error("Error purchasing credits:", error)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
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
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your credit is used for phone calls ($0.01 per 3.6 seconds) and AI features like script generation and
            transcript summarization ($0.01 per use).
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Credit usage:</span>
            <ul className="list-disc list-inside ml-2 text-muted-foreground">
              <li>Phone calls: $0.01 per 3.6 seconds</li>
              <li>Script generation: $0.01 per use</li>
              <li>Call summarization: $0.01 per use</li>
            </ul>
          </div>

          {(userData?.tier === "business" || userData?.tier === "enterprise") && (
            <div className="pt-4">
              <h3 className="text-lg font-medium mb-3">Purchase Credits</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                  className="border hover:border-primary transition-all cursor-pointer"
                  onClick={() => handleCreditPurchase(5)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <p className="text-2xl font-bold">$5</p>
                    <p className="text-sm text-muted-foreground">5 credits</p>
                  </CardContent>
                </Card>
                <Card
                  className="border hover:border-primary transition-all cursor-pointer"
                  onClick={() => handleCreditPurchase(10)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <p className="text-2xl font-bold">$10</p>
                    <p className="text-sm text-muted-foreground">10 credits</p>
                  </CardContent>
                </Card>
                <Card
                  className="border hover:border-primary transition-all cursor-pointer"
                  onClick={() => handleCreditPurchase(25)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <p className="text-2xl font-bold">$25</p>
                    <p className="text-sm text-muted-foreground">25 credits</p>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Custom amount"
                    value={customCreditAmount}
                    onChange={(e) => setCustomCreditAmount(e.target.value)}
                    className="max-w-[200px]"
                  />
                  <Button
                    onClick={() => handleCreditPurchase(Number.parseFloat(customCreditAmount))}
                    disabled={!customCreditAmount || Number.parseFloat(customCreditAmount) <= 0}
                  >
                    Purchase
                  </Button>
                </div>
              </div>
            </div>
          )}

          {(!userData?.tier || userData?.tier === "free") && (
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p className="text-sm font-medium">
                Credit purchases are only available for Business and Enterprise plans.
                <Button variant="link" className="p-0 h-auto ml-1" onClick={() => handleSubscriptionChange("business")}>
                  Upgrade now
                </Button>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
