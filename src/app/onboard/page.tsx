"use client";

import { useState } from "react";

export default function OnboardPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    businessName: "",
    contactEmail: "",
    website: "",
    industry: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          businessName: form.businessName,
          industry: form.industry,
          website: form.website,
          contactEmail: form.contactEmail,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Failed");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl text-black">
        {submitted ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">You are set up</h2>
            <p className="text-gray-600">
              Open the dashboard to connect WhatsApp, upload knowledge, and install the website widget.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-6 text-center">Onboard your business</h1>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-1 font-medium">Business name</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded px-4 py-2"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Contact email</label>
                <input
                  type="email"
                  required
                  className="w-full border rounded px-4 py-2"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Website (optional)</label>
                <input
                  type="url"
                  className="w-full border rounded px-4 py-2"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Industry / vertical</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded px-4 py-2"
                  placeholder="e.g. Real estate, Clinic"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-60"
              >
                {loading ? "Saving…" : "Continue"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
