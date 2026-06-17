import { Outlet, Link, createRootRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-mono">
      <div className="max-w-md text-center">
        <div className="mb-4 text-xs uppercase tracking-[0.3em] text-brand">ERR_404</div>
        <h1 className="text-7xl font-display font-bold text-foreground">404_</h1>
        <h2 className="mt-4 text-base uppercase tracking-widest text-foreground">
          Route not found
        </h2>
        <p className="mt-2 text-sm text-muted">
          The path you requested is not on the system map.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center border border-brand/40 bg-brand/10 px-4 py-2 text-xs uppercase tracking-widest text-brand transition-colors hover:bg-brand hover:text-brand-foreground"
          >
            $ cd ~/
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
    reportLovableError(error, { boundary: "root_error_boundary" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-mono">
      <div className="max-w-md text-center">
        <div className="mb-4 text-xs uppercase tracking-[0.3em] text-brand">SYSTEM_FAULT</div>
        <h1 className="text-xl uppercase tracking-widest text-foreground">
          Process terminated unexpectedly
        </h1>
        <p className="mt-2 text-sm text-muted">
          Try restarting the request or returning to root.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center border border-brand/40 bg-brand/10 px-4 py-2 text-xs uppercase tracking-widest text-brand transition-colors hover:bg-brand hover:text-brand-foreground"
          >
            $ retry
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center border border-border px-4 py-2 text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-surface"
          >
            $ cd ~/
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
