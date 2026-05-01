import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import * as React from "react";
import { AlertCircle } from "lucide-react";

type FieldShellProps = {
  label: string;
  htmlFor?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
};

function FieldShell({ label, htmlFor, helper, error, required, children }: FieldShellProps) {
  return (
    <div className="grid gap-2">
      {/* Label */}
      <label htmlFor={htmlFor} className="flex items-center gap-1.5">
        <span className="text-[13px] font-medium text-text-primary">
          {label}
        </span>
        {required && (
          <span className="text-[12px] text-red-400">*</span>
        )}
      </label>

      {/* Input */}
      {children}

      {/* Helper / Error */}
      {error ? (
        <div className="flex items-center gap-1.5 text-[12px] text-red-400">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      ) : helper ? (
        <span className="text-[12px] text-text-tertiary">{helper}</span>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  helper,
  error,
  required,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; helper?: string; error?: string; required?: boolean }) {
  const inputId = id || React.useId();
  return (
    <FieldShell label={label} helper={helper} error={error} required={required} htmlFor={inputId}>
      <input
        {...props}
        id={inputId}
        className={`
          h-12 w-full rounded-xl border px-4 text-[15px] text-text-primary
          placeholder:text-text-tertiary
          transition-all duration-150
          focus:outline-none
          ${error
            ? "border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
            : "border-blue-600 bg-blue-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
          }
        `}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  helper,
  error,
  required,
  id,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; helper?: string; error?: string; required?: boolean }) {
  const inputId = id || React.useId();
  return (
    <FieldShell label={label} helper={helper} error={error} required={required} htmlFor={inputId}>
      <textarea
        {...props}
        id={inputId}
        className={`
          min-h-[100px] w-full resize-none rounded-xl border px-4 py-3 text-[15px] text-text-primary
          placeholder:text-text-tertiary
          transition-all duration-150
          focus:outline-none
          ${error
            ? "border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
            : "border-blue-600 bg-blue-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
          }
        `}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  helper,
  error,
  required,
  children,
  id,
  ...props
}: InputHTMLAttributes<HTMLSelectElement> & { label: string; helper?: string; error?: string; required?: boolean; children: React.ReactNode }) {
  const autoId = React.useId();
  const selectId = id || autoId;
  return (
    <FieldShell label={label} helper={helper} error={error} required={required} htmlFor={selectId}>
      <select
        {...props}
        id={selectId}
        className={`
          h-12 w-full rounded-xl border px-4 text-[15px] text-text-primary
          transition-all duration-150
          focus:outline-none
          ${error
            ? "border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
            : "border-blue-600 bg-blue-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
          }
        `}
      >
        {children}
      </select>
    </FieldShell>
  );
}
