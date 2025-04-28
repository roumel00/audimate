"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Phone, Shield, AlertCircle } from "lucide-react"
import { UpdateTwilioCredentialsDialog } from "@/components/dialogs/update-twilio-credentials-dialog"

export function TwilioCredentialsCard({ twilioStatus, onCredentialsUpdated }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const hasCredentials = twilioStatus && twilioStatus.hasTwilioSID && twilioStatus.hasTwilioAuthToken

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          <CardTitle>Twilio Credentials</CardTitle>
        </div>
        <CardDescription>Manage your Twilio account credentials for making calls</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hasCredentials ? (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 p-3 rounded-md text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span>Twilio credentials are securely configured</span>
              </div>

              <div className="flex items-center gap-2 bg-secondary p-3 rounded-md">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  For security reasons, your credentials are securely hashed and cannot be displayed
                </span>
              </div>

              <UpdateTwilioCredentialsDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                onCredentialsUpdated={onCredentialsUpdated}
                isUpdate={true}
              />
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-5 w-5" />
                <span>Twilio credentials are not configured</span>
              </div>

              <UpdateTwilioCredentialsDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                onCredentialsUpdated={onCredentialsUpdated}
                isUpdate={false}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
