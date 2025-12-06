import { AuthLayout } from "@/layouts/auth-layout";
export default function AuthXLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthLayout>
        {children}
      </AuthLayout>
    </>
  );
}
