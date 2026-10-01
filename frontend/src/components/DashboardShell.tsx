"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Wordmark } from "@/components/Logo";
import { fetchApi } from "@/lib/api";

interface Tab {
  key: string;
  label: string;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
}

function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    try {
      const data = await fetchApi("/notifications");
      setItems(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000); // 15 seconds
    return () => clearInterval(t);
  }, []);

  const unread = items.filter((i) => !i.read).length;
  const markAll = async () => {
    try {
      await fetchApi("/notifications/read-all", { method: "POST" });
      load();
    } catch {}
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-paper-deep transition-colors text-ink-muted"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-paper text-[10px] font-semibold flex items-center justify-center rounded-full">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-paper border border-rule shadow-card z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-rule bg-paper-deep">
              <span className="font-semibold text-small text-ink">Notifications</span>
              <button onClick={markAll} className="text-tiny font-medium text-accent hover:underline">
                Mark all read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 && (
                <p className="px-4 py-6 text-center text-small text-ink-muted">No notifications</p>
              )}
              {items.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-rule ${
                    n.read ? "opacity-60 bg-paper" : "bg-accent-tint"
                  }`}
                >
                  <p className="text-small font-medium text-ink">{n.title}</p>
                  {n.body && <p className="text-tiny text-ink-muted mt-1">{n.body}</p>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function DashboardShell({
  title,
  tabs,
  active,
  onTab,
  children,
}: {
  title?: string;
  tabs?: Tab[];
  active?: string;
  onTab?: (key: string) => void;
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b border-rule">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="EduMatch home">
              <Wordmark size={24} />
            </Link>
            {title && (
              <span className="hidden sm:inline text-small font-medium text-ink-muted border-l border-rule pl-4 ml-1">
                {title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationBell />
            <span className="hidden sm:inline text-small font-medium text-ink px-2">
              {user?.name || "User"}
            </span>
            <button
              onClick={() => logout()}
              className="p-2 rounded-full hover:bg-paper-deep transition-colors text-ink-muted"
              title="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {tabs && onTab && (
          <div className="flex flex-wrap gap-2 mb-8 border-b border-rule">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => onTab(t.key)}
                className={`px-4 py-3 text-small font-medium -mb-px border-b-2 transition-colors ${
                  active === t.key
                    ? "border-accent text-accent"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
        <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
          {children}
        </div>
      </main>
    </div>
  );
}
