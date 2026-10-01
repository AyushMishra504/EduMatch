"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-7">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-small font-medium text-ink uppercase tracking-wider"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-3 border border-rule bg-paper focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          placeholder="admin@demo.com"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-small font-medium text-ink uppercase tracking-wider"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-3 border border-rule bg-paper focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex w-full items-center justify-center gap-3 bg-ink px-4 py-3 text-small font-medium text-paper transition-all hover:bg-ink-muted active:scale-[0.98] disabled:opacity-70"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
