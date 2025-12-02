import { toast } from "sonner";

type Options = {
  description?: string;
};

export const notify = {
  success: (message: string, options?: Options) =>
    toast.success(message, { description: options?.description }),
  error: (message: string, options?: Options) =>
    toast.error(message, { description: options?.description }),
  info: (message: string, options?: Options) =>
    toast.info(message, { description: options?.description }),
  warning: (message: string, options?: Options) =>
    toast.warning(message, { description: options?.description }),
};
