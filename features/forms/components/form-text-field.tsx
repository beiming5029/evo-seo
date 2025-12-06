import * as React from "react";
import { Control, FieldValues, Path } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type BaseProps = {
  label: string;
  description?: string;
  className?: string;
};

type FormTextFieldProps<TFieldValues extends FieldValues> = BaseProps &
  React.InputHTMLAttributes<HTMLInputElement> & {
    control: Control<TFieldValues>;
    name: Path<TFieldValues>;
    component?: React.ElementType<React.InputHTMLAttributes<HTMLInputElement>>;
  };

const inputClasses =
  "block w-full rounded-xl border border-white/60 bg-white/60 px-4 py-3 text-foreground shadow-[0_1px_0_rgba(255,255,255,0.35)] shadow-slate-900/5 backdrop-blur-md placeholder:text-muted-foreground transition duration-200 focus:-translate-y-[1px] focus:border-blue-500/50 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-slate-800/70 dark:bg-slate-950/50 dark:shadow-black/20 dark:focus:border-blue-400/50 dark:focus:ring-blue-400/30";

export function FormTextField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  className,
  component: Component = "input",
  description,
  ...props
}: FormTextFieldProps<TFieldValues>) {
  const InputComponent = Component as React.ComponentType<
    React.InputHTMLAttributes<HTMLInputElement>
  >;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-foreground" htmlFor={name}>
            {label}
          </FormLabel>
          <FormControl>
            <div className="mt-2">
              <InputComponent
                id={name}
                placeholder={placeholder}
                className={className ? className : inputClasses}
                {...field}
                {...props}
              />
            </div>
          </FormControl>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

const textareaClasses =
  "block w-full resize-none rounded-xl border border-white/60 bg-white/60 px-4 py-3 text-foreground shadow-[0_1px_0_rgba(255,255,255,0.35)] shadow-slate-900/5 backdrop-blur-md placeholder:text-muted-foreground transition duration-200 focus:-translate-y-[1px] focus:border-blue-500/50 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-slate-800/70 dark:bg-slate-950/50 dark:shadow-black/20 dark:focus:border-blue-400/50 dark:focus:ring-blue-400/30";

type FormTextareaFieldProps<TFieldValues extends FieldValues> = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    control: Control<TFieldValues>;
    name: Path<TFieldValues>;
  };

export function FormTextareaField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  className,
  description,
  rows = 5,
  ...props
}: FormTextareaFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-foreground" htmlFor={name}>
            {label}
          </FormLabel>
          <FormControl>
            <div className="mt-2">
              <textarea
                id={name}
                placeholder={placeholder}
                rows={rows}
                className={className ? className : textareaClasses}
                {...field}
                {...props}
              />
            </div>
          </FormControl>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
