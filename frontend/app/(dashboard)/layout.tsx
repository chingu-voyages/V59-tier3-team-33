import type { PropsWithChildren } from "react";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <>
      <div className="mt-16 flex items-start">
        <div>Welcome Home</div>
      </div>
      {children}
    </>
  );
}
