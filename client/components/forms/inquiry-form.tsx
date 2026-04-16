"use client";

import type { FormEvent } from "react";
import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type InquiryFieldConfig = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "textarea";
  required?: boolean;
  autoComplete?: string;
  rows?: number;
};

type InquiryFormProps = {
  action: string;
  formName: string;
  source?: string;
  title?: string;
  description?: string;
  helperText?: string;
  submitLabel?: string;
  successMessage?: string;
  className?: string;
  fields?: InquiryFieldConfig[];
};

type FormStatus =
  | { type: "idle"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const defaultFields: InquiryFieldConfig[] = [
  {
    name: "name",
    label: "Name",
    placeholder: "Your full name",
    type: "text",
    required: true,
    autoComplete: "name",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "you@example.com",
    type: "email",
    required: true,
    autoComplete: "email",
  },
  {
    name: "description",
    label: "Description",
    placeholder: "Tell us what you need.",
    type: "textarea",
    required: true,
    rows: 6,
  },
];

async function readResponseMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message;
  } catch {
    return undefined;
  }
}

function InquiryForm({
  action,
  formName,
  source = "website",
  title,
  description,
  helperText,
  submitLabel = "Send Message",
  successMessage = "Your message has been sent successfully.",
  className,
  fields = defaultFields,
}: InquiryFormProps) {
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<FormStatus>({
    type: "idle",
    message: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.reportValidity()) {
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    const formData = new FormData(form);
    const payload: Record<string, string> = {};

    formData.forEach((value, key) => {
      payload[key] = typeof value === "string" ? value : value.name;
    });

    try {
      const response = await fetch(action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          formName,
          source,
        }),
      });

      const message = await readResponseMessage(response);

      if (!response.ok) {
        throw new Error(message || "We couldn't send your message right now.");
      }

      formRef.current?.reset();
      setStatus({
        type: "success",
        message: message || successMessage,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "We couldn't send your message right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("space-y-8", className)}>
      {title || description ? (
        <div className="max-w-2xl space-y-3">
          {title ? (
            <h2 className="font-display text-3xl font-black uppercase leading-tight text-gray-900">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="text-base leading-8 text-gray-600">{description}</p>
          ) : null}
        </div>
      ) : null}

      <form
        ref={formRef}
        className="space-y-5"
        noValidate
        onSubmit={handleSubmit}
      >
        {fields.map((field) => {
          const inputId = `${formId}-${field.name}`;
          const isTextarea = field.type === "textarea";

          return (
            <div key={field.name} className="space-y-2">
              <label
                className="block text-sm font-semibold uppercase tracking-[0.12em] text-gray-900"
                htmlFor={inputId}
              >
                {field.label}
                {field.required ? (
                  <span className="ml-1 text-red-600">*</span>
                ) : null}
              </label>

              {isTextarea ? (
                <Textarea
                  id={inputId}
                  className="rounded-sm border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus-visible:border-primary focus-visible:ring-primary/20"
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={field.rows || 6}
                />
              ) : (
                <Input
                  autoComplete={field.autoComplete}
                  id={inputId}
                  className="h-12 rounded-sm border-gray-300 bg-white px-4 text-gray-900 placeholder:text-gray-400 focus-visible:border-primary focus-visible:ring-primary/20"
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  type={field.type || "text"}
                />
              )}
            </div>
          );
        })}

        {helperText ? (
          <p className="text-sm leading-6 text-gray-500">{helperText}</p>
        ) : null}

        <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
          <Button
            className="h-11 rounded-sm px-6 font-bold uppercase tracking-[0.14em]"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Sending..." : submitLabel}
          </Button>

          <div aria-live="polite" className="min-h-6 text-sm">
            {status.type === "success" ? (
              <p className="font-medium text-green-700">{status.message}</p>
            ) : null}
            {status.type === "error" ? (
              <p className="font-medium text-red-600">{status.message}</p>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
}

export { InquiryForm };
