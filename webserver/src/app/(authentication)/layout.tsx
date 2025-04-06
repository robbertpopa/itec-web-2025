"use client";

import useRedirectIfAuthenticated from "lib/hooks/useRedirectIfAuthenticated";

export default function AuthenticationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useRedirectIfAuthenticated();
  return (
      <div className="size-full flex justify-center items-center box-border">
        <main>
          {children}
        </main>
      </div>
      
  )
}
