import React, { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Building2,
  HeartPulse,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  Clock,
  ShieldCheck,
} from "lucide-react"

export interface AuthUserSession {
  username: string
  portalName: string
  role: "pediatrician" | "regulatory"
}

interface PortalAuthScreenProps {
  onLoginSuccess: (session: AuthUserSession) => void
}

export const PortalAuthScreen: React.FC<PortalAuthScreenProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<"pediatrician" | "regulatory">("pediatrician")
  const [username, setUsername] = useState<string>("pediatrician@nutrisafe.lk")
  const [password, setPassword] = useState<string>("pediatric123")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<string>("")
  const [currentDate, setCurrentDate] = useState<string>("")

  // Live Clock & Date
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
      )
      setCurrentDate(
        now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Switch pre-filled credentials when toggling portal
  const handleSelectRole = (role: "pediatrician" | "regulatory") => {
    setSelectedRole(role)
    if (role === "pediatrician") {
      setUsername("pediatrician@nutrisafe.lk")
      setPassword("pediatric123")
    } else {
      setUsername("officer@foodsafety.gov.lk")
      setPassword("foodsafety123")
    }
  }

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      if (selectedRole === "pediatrician") {
        onLoginSuccess({
          username: username.trim() || "pediatrician@nutrisafe.lk",
          portalName: "Pediatrician Portal",
          role: "pediatrician",
        })
      } else {
        onLoginSuccess({
          username: username.trim() || "officer@foodsafety.gov.lk",
          portalName: "Food Safety Authority",
          role: "regulatory",
        })
      }
    }, 450)
  }

  return (
    <div
      className="relative min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none bg-slate-950 text-white overflow-hidden"
      style={{
        backgroundImage: "url('/nutrisafe_login_bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Cinematic Dark Ambient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/80 backdrop-blur-[1px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(13,148,136,0.18)_0%,transparent_70%)] pointer-events-none" />

      {/* TOP STATUS BAR: Subtle Live Clock & Security Status */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 text-[11px] text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>NutriSafe Decision Support System</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 text-xs font-medium text-slate-200">
            <Clock className="h-3.5 w-3.5 text-teal-400" />
            <span>{currentTime}</span>
            <span className="opacity-40">•</span>
            <span>{currentDate}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 text-[11px] text-emerald-400 font-semibold">
            <Lock className="h-3 w-3 text-emerald-400" />
            <span>Secure Access</span>
          </div>
        </div>
      </header>

      {/* CENTERPIECE: UNIFIED SINGLE GLASS CARD WITH USERNAME & PASSWORD */}
      <main className="relative z-10 my-auto py-4 flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-[440px] bg-slate-900/80 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/90 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
          
          {/* BRAND ICON & NAME INSIDE THE CENTER BOX */}
          <div className="flex flex-col items-center mb-5">
            <img
              src="/nutrisafe_logo.png"
              alt="NutriSafe AI Logo"
              className="w-16 h-16 rounded-2xl object-cover shadow-xl shadow-teal-500/30 ring-2 ring-teal-400/40 mb-2.5 transition-transform hover:scale-105"
            />
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
                NutriSafe <span className="text-teal-400">AI</span>
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium mt-0.5">
              Pediatric Additive Safety & Clinical Decision Support
            </p>
          </div>

          {/* IN-CARD PORTAL SWITCHER: [Pediatrician] | [Food Safety Authority] */}
          <div className="w-full bg-black/50 p-1 rounded-2xl border border-white/15 flex items-center mb-5 shadow-inner">
            <button
              type="button"
              onClick={() => handleSelectRole("pediatrician")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                selectedRole === "pediatrician"
                  ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/30 ring-1 ring-white/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <HeartPulse className="h-4 w-4" />
              <span>Pediatrician</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRole("regulatory")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                selectedRole === "regulatory"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-white/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Food Safety Authority</span>
            </button>
          </div>

          {/* LOGIN FORM: 2 FIELDS (USERNAME & PASSWORD) */}
          <form onSubmit={handleLoginSubmit} className="w-full space-y-3.5 text-left">
            {/* Field 1: Username / Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 pl-1 flex items-center gap-1.5">
                <User className="h-3 w-3 text-teal-400" />
                <span>Username / Email</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username or email"
                className="w-full bg-slate-950/70 border border-white/20 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 backdrop-blur-md shadow-inner transition-all"
                required
              />
            </div>

            {/* Field 2: Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 pl-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-teal-400" />
                  <span>Password</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  <span>{showPassword ? "Hide" : "Show"}</span>
                </button>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-slate-950/70 border border-white/20 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 backdrop-blur-md shadow-inner transition-all"
                  required
                />
              </div>
            </div>

            {/* Submit / Sign-In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl font-bold text-sm text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mt-2 ${
                selectedRole === "pediatrician"
                  ? "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-teal-500/25"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/25"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>
                    Sign In to {selectedRole === "pediatrician" ? "Pediatrician Portal" : "Food Safety Authority"}
                  </span>
                </>
              )}
            </Button>
          </form>
        </div>
      </main>

      {/* BOTTOM FOOTER: Simple & Clean Institutional Rights */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-300">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>Role-Based Access Control (RBAC)</span>
          <span className="opacity-40">•</span>
          <span>HIPAA & GDPR Data Confidentiality</span>
        </div>

        <div className="text-center sm:text-right text-slate-400">
          <span>© 2026 NutriSafe AI Systems. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
