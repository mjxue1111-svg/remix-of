import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">注册 / 登录</h1>
        <p className="mt-2 text-sm text-muted-foreground">此页面正在开发中，敬请期待。</p>
      </div>
    </div>
  );
}
