"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="text-[10px] tracking-widest text-muted hover:text-brand transition-colors uppercase"
    >
      Sign_Out
    </button>
  );
}
