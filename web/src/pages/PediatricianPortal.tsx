import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  HeartPulse,
  Info,
  ShieldAlert,
  User,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

// Demonstration data for linked child
const mockChildProfile = {
  id: "CHD-9021",
  name: "Senudi Perera",
  age: "4 years, 2 months",
  dob: "2022-08-15",
  allergies: ["Tartrazine (E102)", "Peanuts"],
  sensitivities: ["Artificial Colorants"],
  conditions: ["Mild Childhood Asthma", "ADHD/Hyperactivity Concern"],
}

const mockExposureHistory = [
  { day: "Mon", exposureScore: 24, safeThreshold: 50 },
  { day: "Tue", exposureScore: 35, safeThreshold: 50 },
  { day: "Wed", exposureScore: 78, safeThreshold: 50 }, // spike from juice + sweets
  { day: "Thu", exposureScore: 52, safeThreshold: 50 },
  { day: "Fri", exposureScore: 30, safeThreshold: 50 },
  { day: "Sat", exposureScore: 68, safeThreshold: 50 },
  { day: "Sun", exposureScore: 42, safeThreshold: 50 },
]

const mockScanRecords = [
  {
    id: "SCN-101",
    product: "Fizzy Orange Nectar (250ml)",
    date: "2026-10-10 16:45",
    riskCategory: "High Concern",
    riskScore: 84,
    additives: ["Sodium Benzoate (E211)", "Sunset Yellow (E110)", "Citric Acid (E330)"],
    flagReason: "Additive interaction associated with hyperactivity in pediatric studies (McCann et al.).",
  },
  {
    id: "SCN-102",
    product: "Savory Cheese Flavored Rings",
    date: "2026-10-09 11:20",
    riskCategory: "Moderate Concern",
    riskScore: 62,
    additives: ["Monosodium Glutamate (E621)", "Tartrazine (E102)"],
    flagReason: "Matched child allergy: Tartrazine (E102); Glutamate sensitivity note.",
  },
  {
    id: "SCN-103",
    product: "Organic Whole Milk Strawberry Yogurt",
    date: "2026-10-08 08:30",
    riskCategory: "Low Concern",
    riskScore: 18,
    additives: ["Pectin (E440)", "Beetroot Red (E162)"],
    flagReason: "Natural colorant & dietary stabilizer; no adverse pediatric interactions.",
  },
]

export const PediatricianPortal: React.FC = () => {
  const [selectedScan, setSelectedScan] = useState(mockScanRecords[0])

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50/80 p-4 text-teal-900 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-200">
        <Info className="h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" />
        <p className="text-xs sm:text-sm font-medium">
          <strong>Clinical Decision-Support Prototype:</strong> This portal displays longitudinal dietary exposure trends and SHAP-based evidence factors derived from parent-logged scans. It does not perform autonomous diagnosis or replace clinical judgment.
        </p>
      </div>

      {/* Patient Header Card */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300">
                <User className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight">{mockChildProfile.name}</h2>
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    ID: {mockChildProfile.id}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Age: <span className="font-medium text-foreground">{mockChildProfile.age}</span> • DOB: {mockChildProfile.dob}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-200">
                Allergy: E102 (Tartrazine)
              </Badge>
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                Sensitivity: Artificial Dyes
              </Badge>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                Condition: Mild Asthma
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metric Highlights & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Longitudinal Exposure Chart */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-teal-600" />
                  7-Day Estimated Dietary Exposure Index
                </CardTitle>
                <CardDescription>
                  Derived from recorded products vs. conservative threshold (50)
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                Updated Today
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockExposureHistory} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="exposureGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="exposureScore"
                    name="Child Exposure Score"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#exposureGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Selected Product Inspection Details */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              Decision-Support Inspection
            </CardTitle>
            <CardDescription className="truncate">
              {selectedScan.product}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-3 bg-muted/40 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Assessed Risk Score:</span>
                <span className="font-bold text-sm text-rose-600">
                  {selectedScan.riskScore} / 100
                </span>
              </div>
              <Progress
                value={selectedScan.riskScore}
                className="h-2"
                indicatorColor={
                  selectedScan.riskScore > 70
                    ? "bg-rose-500"
                    : selectedScan.riskScore > 40
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }
              />
              <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                Status: {selectedScan.riskCategory}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Detected Additives:</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedScan.additives.map((add, idx) => (
                  <Badge key={idx} variant="outline" className="text-[11px] font-normal">
                    {add}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 p-3 border border-amber-200 dark:border-amber-900/50">
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Contributing Factor (SHAP):
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                {selectedScan.flagReason}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scan History Table */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-600" />
              Patient Scan History
            </CardTitle>
            <span className="text-xs text-muted-foreground">Showing last 3 logged items</span>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Date / Timestamp</TableHead>
                <TableHead>Risk Classification</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockScanRecords.map((scan) => (
                <TableRow
                  key={scan.id}
                  className={selectedScan.id === scan.id ? "bg-muted/60" : "cursor-pointer"}
                  onClick={() => setSelectedScan(scan)}
                >
                  <TableCell className="font-medium text-foreground">
                    {scan.product}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{scan.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        scan.riskCategory === "High Concern"
                          ? "highConcern"
                          : scan.riskCategory === "Moderate Concern"
                          ? "moderateConcern"
                          : "lowConcern"
                      }
                    >
                      {scan.riskCategory}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-xs">{scan.riskScore}/100</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-teal-700 dark:text-teal-300"
                      onClick={() => setSelectedScan(scan)}
                    >
                      Inspect <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
export default PediatricianPortal
