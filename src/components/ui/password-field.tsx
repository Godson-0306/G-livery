"use client";

import { useId, useState } from "react";
import { fieldClass } from "@/components/ui/field";

function EyeIcon({ hidden }: { hidden: boolean }) {
  if (hidden) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.8 2.8M9.9 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.4 17.4 0 0 1-3.2 3.8M6.1 6.1A17.3 17.3 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 4.1-.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function PasswordField({
  name = "password",
  label = "Password",
  hint,
  required = true,
  minLength,
  autoComplete = "current-password",
}: {
  name?: string;
  label?: string;
  hint?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="block text-sm font-medium text-foreground">
      <label htmlFor={id}>{label}</label>
      <div className="relative mt-1.5">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className={fieldClass("mt-0 pr-12")}
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((open) => !open)}
          className="absolute inset-y-0 right-1.5 inline-flex w-10 items-center justify-center rounded-full text-muted transition hover:text-forest"
        >
          <EyeIcon hidden={visible} />
        </button>
      </div>
      {hint ? <span className="mt-1 block text-xs font-normal text-muted">{hint}</span> : null}
    </div>
  );
}
