import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Audimate</h1>
        <p className="text-xl md:text-2xl max-w-2xl mb-8">
          AI-powered calling platform to automate your outreach and boost your sales
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/auth/signup">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="px-8">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      <footer className="border-t p-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Audimate. All rights reserved.</p>
      </footer>
    </div>
  )
}
