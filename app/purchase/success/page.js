"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [transactionDetails, setTransactionDetails] = useState(null)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")

    if (sessionId) {
      // You could fetch the session details from Stripe here
      // For now, we'll just simulate a successful transaction
      setTransactionDetails({
        success: true,
        timestamp: new Date().toLocaleString(),
      })
    }

    setIsLoading(false)
  }, [searchParams])

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>Your transaction has been completed successfully</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Thank you for your purchase. Your account has been updated with your new subscription or credits.
          </p>
          {transactionDetails && (
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Transaction completed on: {transactionDetails.timestamp}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push("/console/settings")}>Return to Settings</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
