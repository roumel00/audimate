"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PhoneCall, Users, Tag, List, FileText } from "lucide-react";
import { TwilioSetupCard } from "@/components/twilio-setup-card";

// Small reusable Card component
function DashboardCard({ icon: Icon, title, description, href, buttonText }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={href}>
          <Button className="w-full">{buttonText}</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function ConsolePage() {
  const { data: session } = useSession();
  const [twilioStatus, setTwilioStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkTwilioCredentials = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/twilio/status");
      if (!response.ok) {
        throw new Error("Failed to check Twilio status");
      }
      const data = await response.json();
      setTwilioStatus(data);
    } catch (error) {
      console.error("Error checking Twilio credentials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      checkTwilioCredentials();
    }
  }, [session]);

  const handleTwilioSetupComplete = () => {
    checkTwilioCredentials();
  };

  const isTwilioSetupRequired = twilioStatus && (!twilioStatus.hasTwilioSID || !twilioStatus.hasTwilioAuthToken);

  const dashboardCards = [
    {
      icon: Users,
      title: "Contacts",
      description: "Manage your contact list",
      href: "/console/contacts",
      buttonText: "View Contacts",
    },
    {
      icon: Tag,
      title: "Tags",
      description: "Organize contacts with tags",
      href: "/console/tags",
      buttonText: "Manage Tags",
    },
    {
      icon: List,
      title: "Call Lists",
      description: "Create and manage call lists",
      href: "/console/call-lists",
      buttonText: "View Call Lists",
    },
    {
      icon: FileText,
      title: "Scripts",
      description: "Create and edit call scripts",
      href: "/console/scripts",
      buttonText: "Manage Scripts",
    },
    // {
    //   icon: PhoneCall,
    //   title: "Call History",
    //   description: "View past calls and analytics",
    //   href: "/console/calls",
    //   buttonText: "View History",
    // },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Welcome, {session?.user?.name}</h1>
      <p className="text-gray-500 mb-8">Manage your Audimate account</p>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
          {isTwilioSetupRequired && (
            <div className="mb-8">
              <TwilioSetupCard onSetupComplete={handleTwilioSetupComplete} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardCards.map((card) => (
              <DashboardCard
                key={card.title}
                icon={card.icon}
                title={card.title}
                description={card.description}
                href={card.href}
                buttonText={card.buttonText}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
