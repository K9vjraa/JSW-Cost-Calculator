import * as React from "react";
import { cn } from "../utils";

/* ----------------------------------------------------
   STANDARD TEXT/NUMERIC INPUT
   ---------------------------------------------------- */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", leftIcon, rightIcon, error, label, disabled, id, ...props }, ref) => {
    const inputId = id || React.useId();
    return (
      <div className="flex flex-col gap-1 w-full text-left">
        {label && (
          <label htmlFor={inputId} className="text-[11px] font-bold uppercase tracking-wider text-[#56657a]">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <span className="absolute left-3 flex items-center justify-center text-[#56657a] pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            disabled={disabled}
            className={cn(
              "h-9.5 w-full rounded-lg border border-[#d6dfeb] bg-white text-xs font-bold text-[#10233d] transition-all focus:border-[#0057b8] focus:ring-1 focus:ring-[#0057b8] focus:outline-none placeholder:text-slate-400 placeholder:font-normal disabled:bg-slate-50 disabled:opacity-60",
              leftIcon ? "pl-9.5" : "pl-3",
              rightIcon ? "pr-9.5" : "pr-3",
              error ? "border-[#d63031] focus:border-[#d63031] focus:ring-[#d63031]" : "",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 flex items-center justify-center text-[#56657a] pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <span className="text-[10px] font-bold text-[#d63031] mt-0.5">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";

/* ----------------------------------------------------
   SELECT DROPDOWN INPUT
   ---------------------------------------------------- */
export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: string;
  label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, error, label, id, disabled, ...props }, ref) => {
    const selectId = id || React.useId();
    return (
      <div className="flex flex-col gap-1 w-full text-left">
        {label && (
          <label htmlFor={selectId} className="text-[11px] font-bold uppercase tracking-wider text-[#56657a]">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "h-9.5 w-full rounded-lg border border-[#d6dfeb] bg-white px-3 text-xs font-bold text-[#10233d] transition-all focus:border-[#0057b8] focus:ring-1 focus:ring-[#0057b8] focus:outline-none disabled:bg-slate-50 disabled:opacity-60 appearance-none pr-8 cursor-pointer",
              error ? "border-[#d63031] focus:border-[#d63031] focus:ring-[#d63031]" : "",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} {opt.sublabel ? `(${opt.sublabel})` : ""}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-0 bottom-0 flex items-center justify-center pointer-events-none text-[#56657a]">
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <span className="text-[10px] font-bold text-[#d63031] mt-0.5">{error}</span>}
      </div>
    );
  }
);

Select.displayName = "Select";

/* ----------------------------------------------------
   STANDARD TEXTAREA INPUT
   ---------------------------------------------------- */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, id, disabled, ...props }, ref) => {
    const textareaId = id || React.useId();
    return (
      <div className="flex flex-col gap-1 w-full text-left">
        {label && (
          <label htmlFor={textareaId} className="text-[11px] font-bold uppercase tracking-wider text-[#56657a]">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          className={cn(
            "min-h-[80px] w-full rounded-lg border border-[#d6dfeb] bg-white p-3 text-xs font-bold text-[#10233d] transition-all focus:border-[#0057b8] focus:ring-1 focus:ring-[#0057b8] focus:outline-none placeholder:text-slate-400 placeholder:font-normal disabled:bg-slate-50 disabled:opacity-60 resize-y",
            error ? "border-[#d63031] focus:border-[#d63031] focus:ring-[#d63031]" : "",
            className
          )}
          {...props}
        />
        {error && <span className="text-[10px] font-bold text-[#d63031] mt-0.5">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

/* ----------------------------------------------------
   ACCESSIBLE CHECKBOX
   ---------------------------------------------------- */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, disabled, ...props }, ref) => {
    const checkboxId = id || React.useId();
    return (
      <div className="flex flex-col text-left">
        <label htmlFor={checkboxId} className={cn("inline-flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-[#10233d]", disabled ? "opacity-50 cursor-not-allowed" : "")}>
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className={cn(
              "appearance-none size-4.5 rounded border border-[#d6dfeb] bg-white checked:bg-[#0057b8] checked:border-[#0057b8] focus:outline-none focus:ring-1 focus:ring-[#0057b8] transition-all cursor-pointer disabled:cursor-not-allowed relative flex items-center justify-center after:content-['✓'] after:text-white after:font-black after:text-[10px] after:opacity-0 checked:after:opacity-100",
              error ? "border-[#d63031]" : "",
              className
            )}
            {...props}
          />
          <span>{label}</span>
        </label>
        {error && <span className="text-[10px] font-bold text-[#d63031] mt-1">{error}</span>}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

/* ----------------------------------------------------
   PREMIUM TOGGLE SWITCH
   ---------------------------------------------------- */
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, disabled, checked, onChange, ...props }, ref) => {
    const switchId = id || React.useId();
    return (
      <label htmlFor={switchId} className={cn("inline-flex items-center justify-between gap-4 cursor-pointer select-none text-xs font-bold text-[#10233d]", disabled ? "opacity-50 cursor-not-allowed" : "")}>
        <span>{label}</span>
        <div className="relative">
          <input
            id={switchId}
            ref={ref}
            type="checkbox"
            disabled={disabled}
            checked={checked}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-[#0057b8]/50 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0057b8]" />
        </div>
      </label>
    );
  }
);
Switch.displayName = "Switch";

/* ----------------------------------------------------
   RADIO GROUP & RADIO ITEM
   ---------------------------------------------------- */
export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function RadioGroup({
  name,
  options,
  selectedValue,
  onChange,
  label,
  error,
  disabled,
  className
}: RadioGroupProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 text-left w-full", className)}>
      {label && (
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#56657a]">
          {label}
        </span>
      )}
      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const optId = `${name}-${opt.value}`;
          return (
            <label
              key={opt.value}
              htmlFor={optId}
              className={cn(
                "flex items-start gap-2.5 p-2.5 rounded-lg border border-[#d6dfeb] bg-white cursor-pointer select-none transition-all hover:bg-slate-50",
                selectedValue === opt.value ? "border-[#0057b8] bg-[#edf5ff]/40" : "",
                disabled ? "opacity-50 cursor-not-allowed hover:bg-white" : ""
              )}
            >
              <input
                type="radio"
                id={optId}
                name={name}
                value={opt.value}
                checked={selectedValue === opt.value}
                disabled={disabled}
                onChange={() => !disabled && onChange(opt.value)}
                className="appearance-none size-4 rounded-full border border-[#d6dfeb] bg-white checked:border-[#0057b8] checked:border-4 focus:outline-none focus:ring-1 focus:ring-[#0057b8] cursor-pointer disabled:cursor-not-allowed transition-all mt-0.5"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#10233d]">{opt.label}</span>
                {opt.description && (
                  <span className="text-[10px] text-[#56657a] font-medium leading-relaxed">
                    {opt.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
      {error && <span className="text-[10px] font-bold text-[#d63031] mt-0.5">{error}</span>}
    </div>
  );
}

/* ----------------------------------------------------
   STANDALONE ACCESSIBLE LABEL
   ---------------------------------------------------- */
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-[11px] font-bold uppercase tracking-wider text-[#56657a] inline-flex items-center gap-0.5", className)}
      {...props}
    >
      {children}
      {required && <span className="text-[#d63031] font-black">*</span>}
    </label>
  );
}

