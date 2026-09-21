"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="text-xs font-semibold tracking-wider text-muted-foreground dark:text-zinc-400 hover:text-destructive hover:bg-destructive/10 px-2.5 py-1.5 rounded transition-all uppercase cursor-pointer"
    >
      Sign_Out
    </button>
  );
}
