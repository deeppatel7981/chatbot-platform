"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * # Chatbot Admin Login Page
 *
 * ✅ Built with: React + Next.js (App Router) + Tailwind CSS
 * ✅ Uses mock auth logic and redirects to `/dashboard` on login
 * ✅ Compatible with Vercel deployment and scalable layout
 */

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [router, setRouter] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const mod = await import("next/navigation");
      const r = mod.useRouter?.();
      setRouter(r);

      if (typeof window !== "undefined" && r) {
        const existingToken = localStorage.getItem("token");
        if (existingToken) {
          r.push("/dashboard");
        }
      }
    };
    init();
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!router) return;

    if (email === "admin@example.com" && password === "password") {
      localStorage.setItem("token", "mock-auth-token");
      router.push("/dashboard");
    } else {
      setError("Invalid email or password. Try admin@example.com / password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Login to Chatbot Admin</h1>
        <form className="space-y-4" onSubmit={handleLogin}>
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">Login</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Demo account: <code>admin@example.com / password</code>
        </p>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(LoginPage), { ssr: false });
