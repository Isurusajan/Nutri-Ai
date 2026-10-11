import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { ShieldCheck, AlertOctagon, TrendingUp, Filter, Lock, Layers } from "lucide-react"

// Demonstration Aggregated Data (De-identified)
const flaggedAdditivesData = [
  { name: "Sodium Benzoate (E211)", flags: 184, category: "Preservative" },
  { name: "Sunset Yellow (E110)", flags: 142, category: "Colorant" },
  { name: "Tartrazine (E102)", flags: 128, category: "Colorant" },
  { name: "Monosodium Glutamate (E621)", flags: 96, category: "Flavor Enhancer" },
  { name: "Sodium Nitrite (E250)", flags: 64, category: "Preservative" },
  { name: "Allura Red (E129)", flags: 52, category: "Colorant" },
]

const riskDistributionData = [
  { name: "Low Concern", value: 580, color: "#10b981" },
  { name: "Moderate Concern", value: 310, color: "#f59e0b" },
  { name: "High Concern", value: 160, color: "#f43f5e" },
]

const categoryBreakdown = [
  { category: "Carbonated Beverages & Juices", totalScans: 412, highRiskRate: "28.4%", topAdditive: "E211 + E110" },
  { category: "Confectionery & Candies", totalScans: 326, highRiskRate: "34.1%", topAdditive: "E102 + E129" },
  { category: "Extruded Snacks & Chips", totalScans: 198, highRiskRate: "18.2%", topAdditive: "E621" },
  { category: "Flavored Dairy & Yogurts", totalScans: 114, highRiskRate: "4.3%", topAdditive: "E160b" },
]

export const RegulatoryDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Regulatory Privacy Notice */}
      <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200">
        <Lock className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <p className="text-xs sm:text-sm font-medium">
          <strong>Food-Safety Authority Demonstration Prototype:</strong> All data displayed is aggregated and strictly de-identified across demonstration scans. No personally identifiable child or parent records are exposed (Complies with SRS Section 4.8 / REQ-8.2).
        </p>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Demonstration Scans</p>
              <h3 className="text-2xl font-bold">1,050</h3>
              <span className="text-[11px] text-emerald-600 font-medium">Across 8 retail categories</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
              <AlertOctagon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">High Concern Flag Rate</p>
              <h3 className="text-2xl font-bold">15.2%</h3>
              <span className="text-[11px] text-rose-600 font-medium">160 products flagged</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Top Interacting Pair</p>
              <h3 className="text-xl font-bold">E211 + E110</h3>
              <span className="text-[11px] text-amber-700 font-medium">McCann benchmark mix</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Low Concern Compliance</p>
              <h3 className="text-2xl font-bold">55.2%</h3>
              <span className="text-[11px] text-emerald-600 font-medium">Safe additive profiles</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Frequently Flagged Additives */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Frequently Flagged Pediatric Food Additives
            </CardTitle>
            <CardDescription>
              Ranked count of additive occurrences triggering moderate or high concern flags
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flaggedAdditivesData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="flags" fill="#0d9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Overall Concern Distribution */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Market Risk Breakdown
            </CardTitle>
            <CardDescription>
              Proportion across all 1,050 demonstration scan records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown Table */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Retail Packaged Food Category Analysis
          </CardTitle>
          <CardDescription>
            High-concern risk incidence grouped by supermarket food departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Food Category</TableHead>
                <TableHead>Sample Scans</TableHead>
                <TableHead>High Risk Incident Rate</TableHead>
                <TableHead>Dominant Additives Flagged</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryBreakdown.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-foreground">{item.category}</TableCell>
                  <TableCell className="text-muted-foreground">{item.totalScans}</TableCell>
                  <TableCell>
                    <Badge variant="highConcern" className="font-semibold">
                      {item.highRiskRate}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{item.topAdditive}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
export default RegulatoryDashboard
