import React, { useState } from "react"
import { PediatricianPortal } from "./pages/PediatricianPortal"
import { RegulatoryDashboard } from "./pages/RegulatoryDashboard"
import { AcademicEvaluation } from "./pages/AcademicEvaluation"
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
  GraduationCap,
} from "lucide-react"

export function App() {
  const [activeTab, setActiveTab] = useState<"pediatrician" | "regulatory" | "evaluation">("pediatrician")

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-foreground flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
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

          <div className="flex items-center gap-3">
            {/* Direct Link to Backend Swagger */}
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-teal-700 border border-input rounded-lg px-3 py-1.5 bg-background shadow-xs transition-colors"
            >
              <FileCode2 className="h-3.5 w-3.5 text-teal-600" />
              <span>Swagger API Docs</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>

            <div className="h-4 w-[1px] bg-border hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">FastAPI Ready</span>
            </div>
          </div>
        </div>

        {/* Prototype Tabs Navigation */}
        <div className="border-t bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
            <button
              onClick={() => setActiveTab("pediatrician")}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "pediatrician"
                  ? "border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <HeartPulse className="h-4 w-4" />
              Pediatrician Clinical Portal
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-teal-100 text-teal-800">
                Decision Support
              </Badge>
            </button>

            <button
              onClick={() => setActiveTab("regulatory")}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "regulatory"
                  ? "border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Food-Safety Regulatory Dashboard
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-blue-100 text-blue-800">
                De-identified
              </Badge>
            </button>

            <button
              onClick={() => setActiveTab("evaluation")}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "evaluation"
                  ? "border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Academic Evaluation & Viva
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-indigo-100 text-indigo-800">
                Chapter 5
              </Badge>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "pediatrician" && <PediatricianPortal />}
        {activeTab === "regulatory" && <RegulatoryDashboard />}
        {activeTab === "evaluation" && <AcademicEvaluation />}
      </main>

      {/* Footer with Academic Note */}
      <footer className="border-t py-6 bg-background text-muted-foreground text-xs text-center">
        <p>
          ITE 3962 – Final Year Project • University of Moratuwa (Faculty of Information Technology)
        </p>
        <p className="mt-1 text-[11px] opacity-75">
          Student: P.K.R. Abeysekara (E2529001) • Multi-Modal Explainable AI System for Personalized Pediatric Food Additive Risk
        </p>
      </footer>
    </div>
  )
}
export default App
