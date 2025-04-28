"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Home, Users, Tag, List, FileText, PhoneCall, Settings, LogOut, User } from 'lucide-react'

export function ConsoleSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  const isActive = (path) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/console",
      exact: true,
    },
    {
      title: "Contacts",
      icon: Users,
      href: "/console/contacts",
    },
    {
      title: "Tags",
      icon: Tag,
      href: "/console/tags",
    },
    {
      title: "Call Lists",
      icon: List,
      href: "/console/call-lists",
    },
    {
      title: "Scripts",
      icon: FileText,
      href: "/console/scripts",
    },
    // {
    //   title: "Call History",
    //   icon: PhoneCall,
    //   href: "/console/calls",
    // },
    {
      title: "Settings",
      icon: Settings,
      href: "/console/settings",
    },
  ]

  return (
    <>
      <Sidebar>
        <SidebarHeader className="flex items-center justify-between p-4">
          <Link href="/console" className="flex items-center gap-2">
            <span className="text-3xl font-bold pt-4">Audimate</span>
          </Link>
          <SidebarTrigger className="md:hidden" />
        </SidebarHeader>
        
        <SidebarContent className="p-4">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={item.exact ? pathname === item.href : isActive(item.href)}
                  tooltip={item.title}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User size={18} />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{session?.user?.name}</span>
                <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
              </div>
            </div>
            
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className="cursor-pointer hover:text-red-500 transition-all duration-200" 
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}
