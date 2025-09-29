import { EyeIcon, EyeOffIcon } from "lucide-react";
import React, { forwardRef, useState } from "react";

import { cn } from "@/lib/utils";

interface PasswordProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Password = forwardRef<HTMLInputElement, PasswordProps>(
  ({ className, type, ...props }, ref) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={show ? "text" : type ?? "password"}
        ref={ref}
        className={cn(
          "block w-full rounded-md border-0 bg-white px-4 pr-10 py-1.5 text-black shadow-aceternity placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:bg-neutral-900 dark:text-white",
          className
        )}
      />
      <div className="absolute right-3 top-[30%]">
        {!show && (
          <EyeIcon
            onClick={() => setShow(true)}
            className="text-gray-400 cursor-pointer h-4"
          />
        )}
        {show && (
          <EyeOffIcon
            onClick={() => setShow(false)}
            className="text-gray-400 cursor-pointer h-4"
          />
        )}
      </div>
    </div>
  );
});

Password.displayName = "Password";

export default Password;
