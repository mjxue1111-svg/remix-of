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

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { Toaster } from "@/components/ui/sonner";
import { ActiveIdentityProvider } from "@/hooks/useActiveIdentity";

import appCss from "../styles.css?url";
import "@douyinfe/semi-ui/dist/css/semi.min.css";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">页面未找到</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          您访问的页面不存在或已被移动。
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            返回首页
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          页面加载失败
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          服务器出现了一点问题，请刷新重试或返回首页。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            重试
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            返回首页
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
      { title: "星图充值平台 - 客户端" },
      { name: "description", content: "星图充值平台客户端首页，企业级充值管理后台。" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "星图充值平台 - 客户端" },
      { property: "og:description", content: "星图充值平台客户端首页，企业级充值管理后台。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "星图充值平台 - 客户端" },
      { name: "twitter:description", content: "星图充值平台客户端首页，企业级充值管理后台。" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/62901c14-f378-4c10-a8bf-ddc70eaeba17/id-preview-3655cc0d--7c968358-03f1-459f-bac6-b2f4e8f309e2.lovable.app-1784048581460.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/62901c14-f378-4c10-a8bf-ddc70eaeba17/id-preview-3655cc0d--7c968358-03f1-459f-bac6-b2f4e8f309e2.lovable.app-1784048581460.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
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
      <ActiveIdentityProvider>
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <DashboardHeader />
              <main className="flex-1 overflow-y-auto bg-background">
                <Outlet />
              </main>
              <Toaster position="top-center" richColors />
            </div>
          </div>
        </SidebarProvider>
      </ActiveIdentityProvider>
    </QueryClientProvider>
  );
}
