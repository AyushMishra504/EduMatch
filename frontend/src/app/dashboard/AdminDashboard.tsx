"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { fetchApi } from "@/lib/api";
import { ShieldCheck, Users, Building2, AlertCircle } from "lucide-react";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "users", label: "Users & Approvals" },
  { key: "settings", label: "Settings" },
];

export function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // In a real implementation we would fetch from /admin/stats
    setStats({
      totalUsers: 142,
      pendingVerifications: 3,
      activeOrgs: 28,
      matchesMade: 856
    });
  }, []);

  return (
    <DashboardShell title="Platform Administration" tabs={TABS} active={tab} onTab={setTab}>
      {tab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Users", value: stats?.totalUsers || "-", icon: Users },
              { label: "Pending Approvals", value: stats?.pendingVerifications || "-", icon: AlertCircle, alert: true },
              { label: "Active Institutions", value: stats?.activeOrgs || "-", icon: Building2 },
              { label: "Matches Made", value: stats?.matchesMade || "-", icon: ShieldCheck },
            ].map(stat => (
              <div key={stat.label} className="border border-rule bg-paper p-5 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <span className="text-tiny uppercase tracking-wider font-semibold text-ink-muted">{stat.label}</span>
                  <stat.icon className={`w-5 h-5 ${stat.alert ? 'text-amber-600' : 'text-accent'}`} />
                </div>
                <span className="font-serif text-3xl font-medium text-ink">{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="border border-rule bg-paper p-8 text-center min-h-[40vh] flex flex-col items-center justify-center">
             <ShieldCheck className="w-12 h-12 text-accent/50 mb-4" />
             <h3 className="font-serif text-h4">System is running smoothly</h3>
             <p className="text-ink-muted mt-2">The platform is currently operating normally. View the Users tab to manage pending access requests and profile verifications.</p>
          </div>
        </div>
      )}

      {tab !== "overview" && (
        <div className="border border-rule bg-paper p-12 text-center">
          <p className="text-ink-muted">This module is under construction.</p>
        </div>
      )}
    </DashboardShell>
  );
}
