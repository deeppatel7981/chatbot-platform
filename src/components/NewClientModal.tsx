"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function NewClientModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [form, setForm] = useState({
    name: "",
    whatsappPhoneNumberId: "",
    whatsappAccessToken: "",
    whatsappVerifyToken: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) setFormError(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!form.name.trim()) {
      setFormError("Business name is required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name.trim(),
          whatsappPhoneNumberId: form.whatsappPhoneNumberId || undefined,
          whatsappAccessToken: form.whatsappAccessToken || undefined,
          whatsappVerifyToken: form.whatsappVerifyToken || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFormError(typeof json?.error === "string" ? json.error : res.statusText);
        return;
      }

      setSuccess(true);
      setForm({
        name: "",
        whatsappPhoneNumberId: "",
        whatsappAccessToken: "",
        whatsappVerifyToken: "",
      });
      setTimeout(() => {
        setSuccess(false);
        onClose();
        onSuccess?.();
      }, 700);
    } catch (err) {
      console.error(err);
      setFormError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="modal-enter relative z-10 w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
      >
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Add business</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Create a client and widget namespace.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="biz-name" className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Business name *
            </label>
            <Input
              id="biz-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Acme Pvt Ltd"
            />
          </div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">WhatsApp Cloud API (optional)</p>
          <Input
            name="whatsappPhoneNumberId"
            value={form.whatsappPhoneNumberId}
            onChange={handleChange}
            placeholder="Phone number ID (Meta)"
            className="text-sm"
          />
          <Input
            name="whatsappAccessToken"
            value={form.whatsappAccessToken}
            onChange={handleChange}
            placeholder="Permanent access token"
            className="text-sm"
            type="password"
          />
          <Input
            name="whatsappVerifyToken"
            value={form.whatsappVerifyToken}
            onChange={handleChange}
            placeholder="Webhook verify token"
            className="text-sm"
          />
        </div>

        {formError ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="mt-8 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            Cancel
          </button>
          <Button type="button" onClick={handleSubmit} disabled={loading} className="min-w-[96px]">
            {loading ? "Saving…" : success ? "Saved" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
