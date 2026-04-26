"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  type NewClientFormValues,
  newClientFormSchema,
} from "@/features/clients/new-client-schema";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the new client id after the API succeeds. */
  onSuccess?: (clientId: string) => void;
}

export default function NewClientModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm<NewClientFormValues>({
    resolver: zodResolver(newClientFormSchema),
    defaultValues: {
      name: "",
      whatsappPhoneNumberId: "",
      whatsappAccessToken: "",
      whatsappVerifyToken: "",
    },
  });

  const [success, setSuccess] = useState(false);
  const [showWaSecrets, setShowWaSecrets] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const onSubmit = async (values: NewClientFormValues) => {
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: values.name.trim(),
          whatsappPhoneNumberId: values.whatsappPhoneNumberId?.trim() || undefined,
          whatsappAccessToken: values.whatsappAccessToken?.trim() || undefined,
          whatsappVerifyToken: values.whatsappVerifyToken?.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFormError("root", {
          message: typeof json?.error === "string" ? json.error : res.statusText,
        });
        return;
      }

      const created = json.data as { id?: string };
      const newId = typeof created?.id === "string" ? created.id : "";
      setSuccess(true);
      reset();
      if (newId) onSuccess?.(newId);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
      setFormError("root", { message: "Something went wrong. Try again." });
    }
  };

  if (!isOpen) return null;

  const rootErr = errors.root?.message;

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

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label htmlFor="biz-name" className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Business name *
            </label>
            <Input id="biz-name" placeholder="Acme Pvt Ltd" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name ? (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                {errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">WhatsApp Cloud API (optional)</p>
            <button
              type="button"
              onClick={() => setShowWaSecrets((s) => !s)}
              className="text-xs font-medium text-zinc-600 underline decoration-zinc-400 underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {showWaSecrets ? "Hide values" : "Show values"}
            </button>
          </div>
          <Input
            placeholder="Phone number ID (Meta)"
            className="text-sm"
            autoComplete="off"
            {...register("whatsappPhoneNumberId")}
            type={showWaSecrets ? "text" : "password"}
          />
          <Input
            placeholder="Permanent access token"
            className="text-sm"
            autoComplete="off"
            {...register("whatsappAccessToken")}
            type={showWaSecrets ? "text" : "password"}
          />
          <Input
            placeholder="Webhook verify token"
            className="text-sm"
            autoComplete="off"
            {...register("whatsappVerifyToken")}
            type={showWaSecrets ? "text" : "password"}
          />
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
            Treat these like passwords. If anyone could have seen them, rotate the token in Meta Business Suite → WhatsApp → API
            setup.
          </p>

          {rootErr ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
              role="alert"
            >
              {rootErr}
            </p>
          ) : null}

          <div className="mt-8 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              Cancel
            </button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[96px]">
              {isSubmitting ? "Saving…" : success ? "Saved" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
