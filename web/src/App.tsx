import React, { useState, useEffect } from "react"
import { PediatricianPortal } from "./pages/PediatricianPortal"
import { RegulatoryDashboard } from "./pages/RegulatoryDashboard"
import { PortalAuthScreen, AuthUserSession } from "./pages/PortalAuthScreen"
import { Button } from "./components/ui/button"
import { Badge } from "./components/ui/badge"
import {
  Activity,
  Building2,
  FileCode2,
  HeartPulse,
  LayoutDashboard,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  LogOut,
  User,
  RotateCcw,
  CheckCircle2,
} from "lucide-react"

const STORAGE_KEY = "nutrisafe_web_user_session_v1"

export function App() {
  const [userSession, setUserSession] = useState<AuthUserSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [activeTab, setActiveTab] = useState<"pediatrician" | "regulatory" | "evaluation">("pediatrician")

  useEffect(() => {
    if (userSession) {
      setActiveTab(userSession.role)
    }
  }, [userSession?.role])

  const handleLoginSuccess = (session: AuthUserSession) => {
    setUserSession(session)
    setActiveTab(session.role)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch {}
  }

  const handleLogout = () => {
    setUserSession(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  // If not authenticated, present the Role-Based Login Screen
  if (!userSession) {
    return <PortalAuthScreen onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-foreground flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <img
              src="/nutrisafe_logo.png"
              alt="NutriSafe AI Logo"
              className="h-10 w-10 rounded-xl object-cover shadow-md shadow-teal-500/20 ring-1 ring-teal-500/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-foreground">NutriSafe AI</h1>
                <Badge variant="outline" className="text-[10px] text-teal-700 dark:text-teal-400 border-teal-300">
                  v1.0 Suite
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Pediatric Food Additive Risk & Chemical Interaction Assessment
              </p>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Direct Link to Backend Swagger */}
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-teal-700 border border-input rounded-lg px-2.5 py-1.5 bg-background shadow-xs transition-colors"
            >
              <FileCode2 className="h-3.5 w-3.5 text-teal-600" />
              <span>Swagger API Docs</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>

            {/* Logged-In User Badge */}
            <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl py-1.5 px-3 border border-slate-200 dark:border-slate-700 text-left">
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                  userSession.role === "pediatrician"
                    ? "bg-teal-600"
                    : "bg-blue-600"
                }`}
              >
                {userSession.role === "pediatrician" ? (
                  <HeartPulse className="h-4 w-4" />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {userSession.portalName}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight truncate max-w-[200px]">
                  {userSession.username}
                </div>
              </div>
            </div>

            {/* Logout / Switch Role Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-9 px-3 rounded-xl border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 dark:border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Sign out of current portal session"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Portal Switching Tabs Navigation */}
        <div className="border-t bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
              {/* Tab 1: Pediatrician Clinical Portal */}
              <button
                onClick={() => setActiveTab("pediatrician")}
                className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "pediatrician"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <HeartPulse className="h-4 w-4" />
                <span>Pediatrician Clinical Portal</span>
                <Badge
                  variant="secondary"
                  className={`text-[9px] h-4 px-1 font-bold ${
                    activeTab === "pediatrician"
                      ? "bg-teal-700/60 text-white border-0"
                      : "bg-teal-100 text-teal-800"
                  }`}
                >
                  Clinical
                </Badge>
              </button>

              {/* Tab 2: Food Safety Authority */}
              <button
                onClick={() => setActiveTab("regulatory")}
                className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "regulatory"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Food Safety Authority</span>
                <Badge
                  variant="secondary"
                  className={`text-[9px] h-4 px-1 font-bold ${
                    activeTab === "regulatory"
                      ? "bg-blue-700/60 text-white border-0"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  Authority
                </Badge>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-[11px] text-muted-foreground pr-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Role: <strong className="text-foreground capitalize">{userSession.role}</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "pediatrician" && <PediatricianPortal />}
        {activeTab === "regulatory" && <RegulatoryDashboard />}
      </main>

      {/* Footer with Enterprise Legal & Compliance Note */}
      <footer className="border-t py-6 bg-background text-muted-foreground text-xs text-center">
        <p>
          © 2026 NutriSafe AI Systems Ltd. All rights reserved.
        </p>
        <p className="mt-1 text-[11px] opacity-75">
          Clinical Decision Support for Pediatricians • Food-Safety Surveillance for National Authorities
        </p>
      </footer>
    </div>
  )
}

export default App
