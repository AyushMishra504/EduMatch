"use client";

import { useAuth } from "@/context/AuthContext";
import { MentorDashboard } from "./MentorDashboard";
import { OrgDashboard } from "./OrgDashboard";
import { useRouter } from "next/navigation";
import { AdminDashboard } from "./AdminDashboard";
import { useEffect } from "react";

export function DashboardRouter() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="text-ink-muted text-small animate-pulse">Loading workspace...</p>
      </div>
    );
  }

  if (user.role === "mentor") {
    return <MentorDashboard />;
  }

  if (user.role === "organization") {
    return <OrgDashboard />;
  }

  if (user.role === "admin") {
    return <AdminDashboard />;
  }

  return (
    <div className="p-8">
      <h1 className="text-h3 font-serif">Unknown Role</h1>
      <p>Your account does not have a valid role assigned.</p>
    </div>
  );
}
