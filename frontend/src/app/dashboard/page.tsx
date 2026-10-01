import type { Metadata } from "next";
import { DashboardRouter } from "./DashboardRouter";

export const metadata: Metadata = {
  title: "Dashboard | EduMatch",
};

export default function DashboardPage() {
  return <DashboardRouter />;
}
