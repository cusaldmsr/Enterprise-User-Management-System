import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Label } from "./label";
import {
  MessageCircleQuestion,
  X,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HeadphonesIcon,
} from "lucide-react";

type SubmitStatus = "idle" | "loading" | "success" | "error";

export function HelpdeskWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

    // Guard: warn clearly if env vars are not configured yet
    if (
      !serviceId ||
      serviceId === "your_service_id_here" ||
      !templateId ||
      templateId === "your_template_id_here" ||
      !publicKey ||
      publicKey === "your_public_key_here"
    ) {
      setStatus("error");
      setErrorMsg(
        "EmailJS is not configured yet. Please set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in frontend/.env"
      );
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      await emailjs.sendForm(serviceId, templateId, formRef.current, {
        publicKey,
      });
      setStatus("success");
      formRef.current.reset();
      // Auto-close after 3 seconds on success
      setTimeout(() => {
        setIsOpen(false);
        setStatus("idle");
      }, 3000);
    } catch (err) {
      console.error("EmailJS error:", err);
      setStatus("error");
      setErrorMsg(
        "Failed to send your message. Please try again or contact support directly."
      );
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset state after close animation
    setTimeout(() => {
      setStatus("idle");
      setErrorMsg("");
    }, 300);
  };

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* ── Floating Action Button ───────────────────────────────────────── */}
      <button
        id="helpdesk-widget-trigger"
        aria-label="Open helpdesk support widget"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-4 py-3",
          "bg-gradient-to-br from-indigo-600 to-violet-600 text-white",
          "shadow-lg shadow-indigo-500/40",
          "transition-all duration-300 ease-out",
          "hover:shadow-xl hover:shadow-indigo-500/50 hover:-translate-y-1",
          "active:translate-y-0 active:shadow-md",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2",
          isOpen && "rotate-0 scale-95"
        )}
      >
        {isOpen ? (
          <X className="h-5 w-5 transition-transform duration-200" />
        ) : (
          <>
            <HeadphonesIcon className="h-5 w-5" />
            <span className="text-sm font-semibold">Help &amp; Support</span>
          </>
        )}
      </button>

      {/* ── Widget Panel ─────────────────────────────────────────────────── */}
      <div
        id="helpdesk-widget-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Helpdesk support form"
        className={cn(
          "fixed bottom-20 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)]",
          "origin-bottom-right transition-all duration-300 ease-out",
          isOpen
            ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
            : "scale-95 opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <div className="rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/30 overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-5 py-4 overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />
            <div className="absolute -bottom-6 -left-4 h-16 w-16 rounded-full bg-violet-400/20 blur-xl" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                <MessageCircleQuestion className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white leading-tight">
                  Helpdesk Support
                </h2>
                <p className="text-xs text-indigo-200">
                  We typically respond within 24 hours
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            {/* ── Success state ── */}
            {status === "success" ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
                  <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Message Sent!
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your issue has been submitted. Our team will reach out
                    shortly.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground/70">
                  This panel will close automatically…
                </p>
              </div>
            ) : (
              /* ── Form state ── */
              <form
                ref={formRef}
                id="helpdesk-support-form"
                onSubmit={handleSubmit}
                className="space-y-4"
                noValidate
              >
                {/* Error banner */}
                {status === "error" && (
                  <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="helpdesk-name"
                    className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="helpdesk-name"
                    name="from_name"
                    type="text"
                    placeholder="Your full name"
                    required
                    disabled={status === "loading"}
                    className="h-9 text-sm"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="helpdesk-email"
                    className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="helpdesk-email"
                    name="from_email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    disabled={status === "loading"}
                    className="h-9 text-sm"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="helpdesk-message"
                    className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="helpdesk-message"
                    name="message"
                    placeholder="Describe your issue in detail…"
                    required
                    disabled={status === "loading"}
                    rows={4}
                    className="resize-none text-sm"
                  />
                </div>

                {/* Submit */}
                <Button
                  id="helpdesk-submit-btn"
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>

                <p className="text-center text-[11px] text-muted-foreground/70">
                  Powered by EmailJS · Your data stays private
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
