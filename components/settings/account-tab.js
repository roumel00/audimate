import { SubscriptionCard } from "./subscription-card"
import { CreditCard } from "./credit-card"
import { BillingHistoryCard } from "./billing-history-card"

export function AccountTab({ userData, userCredit, onSubscriptionChange }) {
  return (
    <div className="space-y-6">
      <SubscriptionCard userData={userData} onSubscriptionChange={onSubscriptionChange} />
      <CreditCard userCredit={userCredit} userData={userData} />
      <BillingHistoryCard />
    </div>
  )
}
