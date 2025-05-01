import { SidebarProvider } from "@/components/ui/sidebar"
import { ConsoleSidebar } from "@/components/console-sidebar"
import SessionProviderWrapper from "@/components/session-provider-wrapper"

export default function ConsoleLayout({ children }) {
  return (
    <SessionProviderWrapper>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <ConsoleSidebar />
          <div className="flex-1">{children}</div>
        </div>
      </SidebarProvider>
    </SessionProviderWrapper>
  )
}
