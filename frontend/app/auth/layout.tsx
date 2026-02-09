import { Logo } from '@/components';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full bg-background-secondary justify-center px-4 py-16 bg-[url('/auth_background.png')] bg-cover">
      <div className="px-8 py-16 w-full max-w-lg m-auto flex flex-col gap-y-8 bg-background/70 rounded-xl">
        <div className="flex justify-center">
          <Logo large />
        </div>
        {children}
      </div>
    </div>
  );
}
