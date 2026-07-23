"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type FormErrors = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Please enter your name.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.subject.trim()) {
    errors.subject = "Please enter a subject.";
  } else if (values.subject.trim().length < 3) {
    errors.subject = "Subject must be at least 3 characters.";
  }

  if (!values.message.trim()) {
    errors.message = "Please enter a message.";
  } else if (values.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }

  return errors;
}

export function ContactForm() {
  const [values, setValues] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setStatus("loading");
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setStatus("success");
    setValues(initialState);
  }

  if (status === "success") {
    return (
      <Alert variant="success" className="rounded-apple-xl">
        <CheckCircle2 className="h-5 w-5" aria-hidden />
        <AlertTitle>Message sent</AlertTitle>
        <AlertDescription>
          Thanks for reaching out. Our team typically replies within one
          business day. You can also browse our{" "}
          <a
            href="/faq"
            className="font-semibold underline underline-offset-2 hover:opacity-80"
          >
            FAQ
          </a>{" "}
          while you wait.
        </AlertDescription>
        <div className="mt-4 pl-7">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setStatus("idle")}
          >
            Send another message
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
      aria-label="Contact form"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">
            Full name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            value={values.name}
            onChange={(e) => updateField("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            disabled={status === "loading"}
            className="rounded-apple-lg border-border bg-card"
          />
          {errors.name ? (
            <p id="contact-name-error" className="text-xs text-destructive" role="alert">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={values.email}
            onChange={(e) => updateField("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            disabled={status === "loading"}
            className="rounded-apple-lg border-border bg-card"
          />
          {errors.email ? (
            <p id="contact-email-error" className="text-xs text-destructive" role="alert">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-subject">
          Subject <span className="text-destructive">*</span>
        </Label>
        <Input
          id="contact-subject"
          name="subject"
          placeholder="How can we help?"
          value={values.subject}
          onChange={(e) => updateField("subject", e.target.value)}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? "contact-subject-error" : undefined}
          disabled={status === "loading"}
          className="rounded-apple-lg border-border bg-card"
        />
        {errors.subject ? (
          <p id="contact-subject-error" className="text-xs text-destructive" role="alert">
            {errors.subject}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">
          Message <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder="Tell us about your store, goals, or question…"
          value={values.message}
          onChange={(e) => updateField("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          disabled={status === "loading"}
        />
        {errors.message ? (
          <p id="contact-message-error" className="text-xs text-destructive" role="alert">
            {errors.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full rounded-pill font-semibold sm:w-auto"
        loading={status === "loading"}
        loadingText="Sending…"
      >
        Send message
        <Send className="h-4 w-4" aria-hidden />
      </Button>
    </form>
  );
}
