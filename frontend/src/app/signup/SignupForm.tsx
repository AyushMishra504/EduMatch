"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SignupForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"mentor" | "organization">("mentor");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ email, password, name, role });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign up. Please try again.");
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
        <label className="text-small font-medium text-white/70 uppercase tracking-wider">
          I am a...
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-white/90">
            <input 
              type="radio" 
              name="role" 
              value="mentor" 
              checked={role === "mentor"} 
              onChange={() => setRole("mentor")} 
              className="accent-accent"
            />
            <span className="text-small">Educator / Mentor</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-white/90">
            <input 
              type="radio" 
              name="role" 
              value="organization" 
              checked={role === "organization"} 
              onChange={() => setRole("organization")} 
              className="accent-accent"
            />
            <span className="text-small">Institution</span>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-small font-medium text-white/70 uppercase tracking-wider">
          {role === "mentor" ? "Full Name" : "Institution Name"}
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg px-4 py-3 border border-white/10 bg-black/30 text-white placeholder-white/30 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          placeholder={role === "mentor" ? "Jane Doe" : "Tech University"}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-small font-medium text-white/70 uppercase tracking-wider">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg px-4 py-3 border border-white/10 bg-black/30 text-white placeholder-white/30 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          placeholder="jane@example.com"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-small font-medium text-white/70 uppercase tracking-wider">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg px-4 py-3 border border-white/10 bg-black/30 text-white placeholder-white/30 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex w-full items-center justify-center gap-3 rounded-full bg-accent px-4 py-3 text-small font-semibold text-on-accent shadow-glow-sm transition-all hover:bg-accent-deep active:scale-[0.98] disabled:opacity-70"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
      <div className="mt-4 text-center text-small text-white/50">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:text-accent-light hover:underline font-medium">
          Log in
        </Link>
      </div>
    </form>
  );
}
