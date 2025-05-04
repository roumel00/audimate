import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SecurityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>Manage your security preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Security settings will be available soon.</p>
      </CardContent>
    </Card>
  )
}
