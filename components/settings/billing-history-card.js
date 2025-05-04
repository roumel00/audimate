import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function BillingHistoryCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>View your past transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Billing history will be available soon.</p>
      </CardContent>
    </Card>
  )
}
