"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeletePostButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    await fetch(`/api/posts/${slug}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className={`text-[10px] tracking-widest uppercase transition-colors ${
        confirming ? "text-destructive" : "text-muted hover:text-destructive"
      }`}
    >
      {confirming ? "CONFIRM?" : "Delete"}
    </button>
  );
}
