import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useActiveIdentity } from "@/hooks/useActiveIdentity";
import { IDENTITY_LABEL, IDENTITY_ICON, type IdentityType } from "@/lib/identity";
import {
  PRESET_ACCOUNTS,
  findPresetByPhone,
  getEffectivePassword,
  overridePassword,
  setMockSession,
} from "@/lib/preset-accounts";
import { cn } from "@/lib/utils";

const IDENTITIES: IdentityType[] = ["client", "agent"];

type AuthTab = "login" | "register" | "forgot";

const searchSchema = z.object({
  tab: z.enum(["login", "register", "forgot"]).optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "登录 · 米线云" },
      { name: "description", content: "登录米线云充值协同服务平台" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { tab } = useSearch({ from: "/login" });
  const [activeTab, setActiveTab] = useState<AuthTab>(tab ?? "login");
  const [forgotPrefillPhone, setForgotPrefillPhone] = useState("");
  const [loginPrefillPhone, setLoginPrefillPhone] = useState("");

  useEffect(() => {
    import("@/lib/preset-accounts").then(({ getMockSession }) => {
      if (getMockSession()) {
        navigate({ to: "/" });
        return;
      }
    });
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-portal px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 h-[380px] w-[380px] rounded-full bg-gradient-brand-soft blur-3xl animate-drift-1"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-gradient-brand-soft blur-3xl animate-drift-2"
      />

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="mb-5 flex justify-center">
          <Logo size={40} />
        </div>

        <div className="rounded-3xl border border-border/60 bg-white/90 p-6 shadow-card-soft backdrop-blur-xl">
          <div className="mb-5 text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              欢迎进入米线云
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">充值协同服务平台</p>
          </div>

          {activeTab === "forgot" ? (
            <ForgotPasswordForm
              prefillPhone={forgotPrefillPhone}
              onDone={(phone) => {
                setLoginPrefillPhone(phone);
                setActiveTab("login");
              }}
              onBack={() => setActiveTab("login")}
            />
          ) : (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AuthTab)}>
              <TabsList className="grid h-9 w-full grid-cols-2 rounded-lg bg-muted p-1">
                <TabsTrigger
                  value="login"
                  className="rounded-md text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                >
                  登录
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-md text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                >
                  注册
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-5">
                <LoginForm
                  prefillPhone={loginPrefillPhone}
                  onForgot={(phone) => {
                    setForgotPrefillPhone(phone);
                    setActiveTab("forgot");
                  }}
                  onGoRegister={() => setActiveTab("register")}
                />
              </TabsContent>
              <TabsContent value="register" className="mt-5">
                <RegisterForm onDone={() => setActiveTab("login")} />
              </TabsContent>
            </Tabs>
          )}
        </div>

        <p className="mt-5 text-center text-[11px] text-muted-foreground/80">
          继续即表示您同意米线云服务条款与隐私政策
        </p>
      </div>
    </div>
  );
}

// ── Identity Picker ──────────────────────────────────────────────────────────

function IdentityPicker({
  value,
  onChange,
  label,
}: {
  value: IdentityType;
  onChange: (i: IdentityType) => void;
  label: string;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs text-muted-foreground">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        {IDENTITIES.map((i) => {
          const Icon = IDENTITY_ICON[i];
          const active = value === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-sm transition",
                active
                  ? "border-primary/70 bg-primary/5 text-primary"
                  : "border-border bg-white text-muted-foreground hover:border-primary/40 hover:bg-muted/50",
              )}
            >
              <Icon className="h-4 w-4" />
              {IDENTITY_LABEL[i]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Login Form ───────────────────────────────────────────────────────────────

type LoginError =
  | { kind: "unregistered" }
  | { kind: "wrong-password" }
  | null;

function LoginForm({
  prefillPhone,
  onForgot,
  onGoRegister,
}: {
  prefillPhone: string;
  onForgot: (phone: string) => void;
  onGoRegister: () => void;
}) {
  const navigate = useNavigate();
  const { setIdentity } = useActiveIdentity();
  const [identity, setLocalIdentity] = useState<IdentityType>("client");
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [phone, setPhone] = useState(prefillPhone);
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LoginError>(null);

  useEffect(() => {
    if (prefillPhone) setPhone(prefillPhone);
  }, [prefillPhone]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const afterLogin = (acc: { phone: string; identity: IdentityType; fullName: string }) => {
    setMockSession(acc);
    setIdentity(acc.identity, null, IDENTITY_LABEL[acc.identity]);
    navigate({ to: "/" });
  };

  const handleSendOtp = () => {
    if (!phone) return toast.error("请输入手机号");
    setOtpSent(true);
    setCountdown(60);
    toast.success("验证码已发送 (演示环境: 任意 6 位均可)");
  };

  const handleLogin = () => {
    if (!phone) return toast.error("请输入手机号");
    if (loginMode === "password" && !password) return toast.error("请输入密码");
    if (loginMode === "otp" && (!otp || otp.length < 4)) return toast.error("请输入短信验证码");
    setLoading(true);

    // 纯前端 mock 校验
    setTimeout(() => {
      setLoading(false);
      const preset = findPresetByPhone(phone);
      if (!preset) {
        setError({ kind: "unregistered" });
        return;
      }
      if (loginMode === "password") {
        const expected = getEffectivePassword(phone);
        if (password !== expected) {
          setError({ kind: "wrong-password" });
          return;
        }
      }
      afterLogin({
        phone: preset.phone,
        identity: preset.identity,
        fullName: preset.fullName,
      });
    }, 300);
  };

  return (
    <>
      <div className="space-y-4">
        <IdentityPicker value={identity} onChange={setLocalIdentity} label="选择身份进入" />

        <div className="flex h-9 rounded-lg border border-input bg-background p-0.5 text-sm">
          <button
            type="button"
            onClick={() => setLoginMode("password")}
            className={cn(
              "flex-1 rounded-md py-1 text-xs font-medium transition",
              loginMode === "password"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            密码登录
          </button>
          <button
            type="button"
            onClick={() => setLoginMode("otp")}
            className={cn(
              "flex-1 rounded-md py-1 text-xs font-medium transition",
              loginMode === "otp"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            验证码登录
          </button>
        </div>

        <div className="space-y-3.5">
          <div className="space-y-1">
            <Label htmlFor="phone" className="text-xs">
              手机号
            </Label>
            <div className="flex h-10 items-center rounded-lg border border-input bg-background px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
              <span className="pr-2 text-sm text-muted-foreground">+86</span>
              <Input
                id="phone"
                type="tel"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-full border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
              />
            </div>
          </div>

          {loginMode === "password" ? (
            <div className="space-y-1">
              <Label htmlFor="phone-pw" className="text-xs">
                密码
              </Label>
              <Input
                id="phone-pw"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-lg text-sm"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <Label className="text-xs">短信验证码</Label>
              <div className="flex gap-2">
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="请输入短信验证码"
                  maxLength={6}
                  disabled={!otpSent}
                  className="h-10 rounded-lg text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendOtp}
                  disabled={countdown > 0}
                  className="h-10 shrink-0 rounded-lg px-3 text-xs font-medium"
                >
                  {countdown > 0 ? `${countdown}s` : otpSent ? "重新发送" : "获取验证码"}
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              测试: {PRESET_ACCOUNTS[identity].phone} / {PRESET_ACCOUNTS[identity].password}
            </span>
            {loginMode === "password" && (
              <button
                type="button"
                onClick={() => onForgot(phone)}
                className="font-medium text-primary hover:underline"
              >
                忘记密码?
              </button>
            )}
          </div>

          <Button
            className="h-10 w-full rounded-xl bg-gradient-brand text-sm font-medium text-primary-foreground shadow-brand hover:brightness-105"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            登录
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onGoRegister}
            className="h-10 w-full rounded-xl border-primary/30 text-sm font-medium text-primary hover:bg-primary/5 hover:text-primary"
          >
            没有账号？ 点击免费试用
          </Button>
        </div>
      </div>

      <AlertDialog open={error?.kind === "unregistered"} onOpenChange={(o) => !o && setError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>该手机号暂未注册</AlertDialogTitle>
            <AlertDialogDescription>
              手机号 {phone} 暂未注册，请先完成注册后再登录。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setError(null);
                onGoRegister();
              }}
            >
              去注册
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={error?.kind === "wrong-password"}
        onOpenChange={(o) => !o && setError(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>密码输入错误</AlertDialogTitle>
            <AlertDialogDescription>
              您输入的密码与该账号不一致，是否需要找回密码?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>再试一次</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setError(null);
                onForgot(phone);
              }}
            >
              找回密码
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Register Form ────────────────────────────────────────────────────────────

function RegisterForm({ onDone }: { onDone: () => void }) {
  const [identity, setIdentity] = useState<IdentityType>("client");
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSendOtp = () => {
    if (!phone) return toast.error("请输入手机号");
    setOtpSent(true);
    setCountdown(60);
    toast.success("验证码已发送 (演示环境: 任意 6 位均可)");
  };

  const handleRegister = () => {
    if (!companyName) {
      return toast.error(identity === "client" ? "请输入企业名称" : "请输入代理商名称");
    }
    if (!fullName) return toast.error("请填写联系人姓名");
    if (!phone) return toast.error("请输入手机号");
    if (!otp || otp.length < 4) return toast.error("请输入短信验证码");
    if (!password || password.length < 4) return toast.error("请设置密码 (至少 4 位)");

    setLoading(true);
    // 演示环境: 不真实写入后端,直接成功
    setTimeout(() => {
      setLoading(false);
      toast.success("注册成功,请使用已有测试账号登录体验");
      onDone();
    }, 400);
  };

  return (
    <div className="space-y-4">
      <IdentityPicker value={identity} onChange={setIdentity} label="选择注册身份" />

      <div className="space-y-3.5">
        {/* Company / Agent name */}
        <div className="space-y-1">
          <Label className="text-xs">{identity === "client" ? "企业名称" : "代理商名称"}</Label>
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder={identity === "client" ? "请输入企业全称" : "请输入代理商名称"}
            className="h-10 rounded-lg text-sm"
          />
        </div>

        {/* Contact name */}
        <div className="space-y-1">
          <Label className="text-xs">联系人姓名</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="您的姓名"
            className="h-10 rounded-lg text-sm"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <Label className="text-xs">手机号</Label>
          <div className="flex h-10 items-center rounded-lg border border-input bg-background px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
            <span className="pr-2 text-sm text-muted-foreground">+86</span>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="h-full border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        {/* SMS OTP */}
        <div className="space-y-1">
          <Label className="text-xs">短信验证码</Label>
          <div className="flex gap-2">
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="请输入短信验证码"
              maxLength={6}
              disabled={!otpSent}
              className="h-10 rounded-lg text-sm"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSendOtp}
              disabled={loading || !phone || countdown > 0}
              className="h-10 shrink-0 rounded-lg px-3 text-xs font-medium"
            >
              {countdown > 0 ? `${countdown}s` : otpSent ? "重新发送" : "获取验证码"}
            </Button>
          </div>
        </div>

        {/* Set password */}
        <div className="space-y-1">
          <Label className="text-xs">设置密码</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请设置登录密码 (至少 4 位)"
            className="h-10 rounded-lg text-sm"
          />
        </div>

        <Button
          className="h-10 w-full rounded-xl bg-gradient-brand text-sm font-medium text-primary-foreground shadow-brand hover:brightness-105"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          注册
        </Button>
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        已有账号?{" "}
        <button
          type="button"
          onClick={onDone}
          className="font-medium text-primary hover:underline"
        >
          去登录
        </button>
      </p>
    </div>
  );
}

// ── Forgot Password Form ─────────────────────────────────────────────────────

function ForgotPasswordForm({
  prefillPhone,
  onDone,
  onBack,
}: {
  prefillPhone: string;
  onDone: (phone: string) => void;
  onBack: () => void;
}) {
  const [phone, setPhone] = useState(prefillPhone);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSendOtp = () => {
    if (!phone) return toast.error("请输入手机号");
    if (!findPresetByPhone(phone)) {
      return toast.error("该手机号暂未注册");
    }
    setOtpSent(true);
    setCountdown(60);
    toast.success("验证码已发送 (演示环境: 任意 6 位均可)");
  };

  const handleSubmit = () => {
    if (!phone) return toast.error("请输入手机号");
    if (!findPresetByPhone(phone)) return toast.error("该手机号暂未注册");
    if (!otp || otp.length < 4) return toast.error("请输入短信验证码");
    if (!newPw || newPw.length < 4) return toast.error("新密码至少 4 位");
    if (newPw !== confirmPw) return toast.error("两次输入的密码不一致");

    setLoading(true);
    setTimeout(() => {
      overridePassword(phone, newPw);
      setLoading(false);
      toast.success("密码已重置,请使用新密码登录");
      onDone(phone);
    }, 300);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">找回密码</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          通过手机号 + 短信验证码重置您的登录密码
        </p>
      </div>

      <div className="space-y-3.5">
        <div className="space-y-1">
          <Label className="text-xs">手机号</Label>
          <div className="flex h-10 items-center rounded-lg border border-input bg-background px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
            <span className="pr-2 text-sm text-muted-foreground">+86</span>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="h-full border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">短信验证码</Label>
          <div className="flex gap-2">
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="请输入短信验证码"
              maxLength={6}
              disabled={!otpSent}
              className="h-10 rounded-lg text-sm"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSendOtp}
              disabled={loading || !phone || countdown > 0}
              className="h-10 shrink-0 rounded-lg px-3 text-xs font-medium"
            >
              {countdown > 0 ? `${countdown}s` : otpSent ? "重新发送" : "获取验证码"}
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">新密码</Label>
          <Input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="请输入新密码"
            className="h-10 rounded-lg text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">确认新密码</Label>
          <Input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="请再次输入新密码"
            className="h-10 rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onBack} className="h-10 flex-1 rounded-xl text-sm">
          返回登录
        </Button>
        <Button
          className="h-10 flex-1 rounded-xl bg-gradient-brand text-sm font-medium text-primary-foreground shadow-brand hover:brightness-105"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          重置密码
        </Button>
      </div>
    </div>
  );
}
