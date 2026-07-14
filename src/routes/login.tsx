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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-portal px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-gradient-brand-soft blur-3xl animate-drift-1"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-0 h-[480px] w-[480px] rounded-full bg-gradient-brand-soft blur-3xl animate-drift-2"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size={36} />
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-7 shadow-card-soft backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              欢迎进入米线云
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">充值协同服务平台</p>
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">登录</TabsTrigger>
                <TabsTrigger value="register">注册</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-6">
                <LoginForm
                  prefillPhone={loginPrefillPhone}
                  onForgot={(phone) => {
                    setForgotPrefillPhone(phone);
                    setActiveTab("forgot");
                  }}
                  onGoRegister={() => setActiveTab("register")}
                />
              </TabsContent>
              <TabsContent value="register" className="mt-6">
                <RegisterForm onDone={() => setActiveTab("login")} />
              </TabsContent>
            </Tabs>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
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
      <Label className="mb-2 block text-xs text-muted-foreground">{label}</Label>
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
                "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-sm transition",
                active
                  ? "border-primary bg-primary/5 text-primary shadow-brand"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40",
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
      <div className="space-y-5">
        <IdentityPicker value={identity} onChange={setLocalIdentity} label="选择身份进入" />

        <div className="flex rounded-md border border-input p-0.5 text-sm">
          <button
            type="button"
            onClick={() => setLoginMode("password")}
            className={`flex-1 rounded py-1.5 transition ${loginMode === "password" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            密码登录
          </button>
          <button
            type="button"
            onClick={() => setLoginMode("otp")}
            className={`flex-1 rounded py-1.5 transition ${loginMode === "otp" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            验证码登录
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone">手机号</Label>
            <div className="flex items-center rounded-md border border-input bg-background focus-within:border-primary">
              <span className="pl-3 pr-2 text-sm text-muted-foreground">+86</span>
              <Input
                id="phone"
                type="tel"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>

          {loginMode === "password" ? (
            <div className="space-y-1.5">
              <Label htmlFor="phone-pw">密码</Label>
              <Input
                id="phone-pw"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>短信验证码</Label>
              <div className="flex gap-2">
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="请输入短信验证码"
                  maxLength={6}
                  disabled={!otpSent}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendOtp}
                  disabled={countdown > 0}
                  className="shrink-0"
                >
                  {countdown > 0 ? `${countdown}s` : otpSent ? "重新发送" : "获取验证码"}
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              测试账号: {PRESET_ACCOUNTS[identity].phone} / {PRESET_ACCOUNTS[identity].password}
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
            className="w-full bg-gradient-brand text-primary-foreground shadow-brand"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            登录
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
    <div className="space-y-5">
      <IdentityPicker value={identity} onChange={setIdentity} label="选择注册身份" />

      <div className="space-y-4">
        {/* Company / Agent name */}
        <div className="space-y-1.5">
          <Label>{identity === "client" ? "企业名称" : "代理商名称"}</Label>
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder={identity === "client" ? "请输入企业全称" : "请输入代理商名称"}
          />
        </div>

        {/* Contact name */}
        <div className="space-y-1.5">
          <Label>联系人姓名</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="您的姓名"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label>手机号</Label>
          <div className="flex items-center rounded-md border border-input bg-background focus-within:border-primary">
            <span className="pl-3 pr-2 text-sm text-muted-foreground">+86</span>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="border-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        {/* SMS OTP */}
        <div className="space-y-1.5">
          <Label>短信验证码</Label>
          <div className="flex gap-2">
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="请输入短信验证码"
              maxLength={6}
              disabled={!otpSent}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSendOtp}
              disabled={loading || !phone || countdown > 0}
              className="shrink-0"
            >
              {countdown > 0 ? `${countdown}s` : otpSent ? "重新发送" : "获取验证码"}
            </Button>
          </div>
        </div>

        {/* Set password */}
        <div className="space-y-1.5">
          <Label>设置密码</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请设置登录密码 (至少 4 位)"
          />
        </div>

        <Button
          className="w-full bg-gradient-brand text-primary-foreground shadow-brand"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          注册
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
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
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">找回密码</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          通过手机号 + 短信验证码重置您的登录密码
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>手机号</Label>
        <div className="flex items-center rounded-md border border-input bg-background focus-within:border-primary">
          <span className="pl-3 pr-2 text-sm text-muted-foreground">+86</span>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="请输入手机号"
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>短信验证码</Label>
        <div className="flex gap-2">
          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="请输入短信验证码"
            maxLength={6}
            disabled={!otpSent}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleSendOtp}
            disabled={loading || !phone || countdown > 0}
            className="shrink-0"
          >
            {countdown > 0 ? `${countdown}s` : otpSent ? "重新发送" : "获取验证码"}
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>新密码</Label>
        <Input
          type="password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          placeholder="请输入新密码"
        />
      </div>

      <div className="space-y-1.5">
        <Label>确认新密码</Label>
        <Input
          type="password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          placeholder="请再次输入新密码"
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          返回登录
        </Button>
        <Button
          className="flex-1 bg-gradient-brand text-primary-foreground shadow-brand"
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
