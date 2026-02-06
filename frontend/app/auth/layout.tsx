import { Logo } from '@/components';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background-secondary flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo large />
        </div>

        <div className="bg-background rounded-2xl p-8 shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
