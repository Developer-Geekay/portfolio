import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-mono">
      <div className="max-w-md text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-brand mb-4">ERR_404</div>
        <h1 className="text-7xl font-display font-bold text-foreground">404_</h1>
        <h2 className="mt-4 text-base uppercase tracking-widest text-foreground">Route not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
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
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-mono">
      <div className="max-w-md text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-brand mb-4">SYSTEM_FAULT</div>
        <h1 className="text-xl uppercase tracking-widest text-foreground">
          Process terminated unexpectedly
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Try restarting the request or returning to root.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
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

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Gokula Kannan — Technical Architect" },
      {
        name: "description",
        content:
          "Gokula Kannan — Technical Architect & 5× OutSystems Certified. 8+ years architecting enterprise platforms for banking, fintech, and insurance.",
      },
      { name: "author", content: "Gokula Kannan" },
      { property: "og:title", content: "Gokula Kannan — Technical Architect" },
      {
        property: "og:description",
        content:
          "Enterprise OutSystems architect based in Riyadh. Banking, fintech, mobile, and full-stack delivery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Outfit:wght@500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
