import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Building2, User, ShieldCheck, Bell, UserCircle, BookOpen,
  Maximize, Minimize, Globe, Type, Lock, LogOut,
  ChevronDown, Check, CheckCheck, PartyPopper, TrendingUp, AlertTriangle, Gift,
} from "lucide-react";

type NotificationType = "success" | "finance" | "warning" | "reward";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const notificationTypeStyle: Record<NotificationType, { icon: React.ReactNode; iconBg: string }> = {
  success: { icon: <PartyPopper className="h-4 w-4" />, iconBg: "bg-emerald-500" },
  finance: { icon: <TrendingUp className="h-4 w-4" />, iconBg: "bg-blue-500" },
  warning: { icon: <AlertTriangle className="h-4 w-4" />, iconBg: "bg-amber-500" },
  reward: { icon: <Gift className="h-4 w-4" />, iconBg: "bg-primary" },
};

const initialNotifications: NotificationItem[] = [
  {
    id: "n1",
    type: "success",
    title: "账户审核通过",
    description: "您新增的星图账户「云岚直播推广」已审核通过，现已可正常发起充值。",
    time: "10 分钟前",
    read: false,
  },
  {
    id: "n2",
    type: "finance",
    title: "本月充值已超 100 万",
    description: "本月累计充值金额已超过 100 万元，下次充值可享受额外折扣，详情请咨询您的对接人。",
    time: "2 小时前",
    read: false,
  },
  {
    id: "n3",
    type: "warning",
    title: "特批订单请按时付款",
    description: "您的特批充值申请已处理完成，请按承诺时间完成付款并上传凭证，以免影响后续合作。",
    time: "昨天 14:20",
    read: false,
  },
  {
    id: "n4",
    type: "reward",
    title: "充值即将达标，可领返点",
    description: "本月充值金额即将满 100 万元，达标后可获得返点激励，请关注账户余额变动。",
    time: "07-10 09:05",
    read: true,
  },
];

export function DashboardHeader() {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<"small" | "default" | "large">("default");
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const [lockOpen, setLockOpen] = useState(false);
  const [lockPwd, setLockPwd] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("star-map.mockSession");
    navigate({ to: "/" });
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">上海云岚科技有限公司</span>
          </div>
          <div className="hidden h-4 w-px bg-border sm:block" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>联系人：李明</span>
          </div>
          <div className="hidden h-4 w-px bg-border sm:block" />
          <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
            <ShieldCheck className="h-3 w-3" />
            账户状态正常
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96 p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">消息通知</h3>
                {unreadCount > 0 ? (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <CheckCheck className="h-3 w-3" />
                    全部标记为已读
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">已全部读完</span>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                    <Bell className="h-8 w-8 opacity-40" />
                    <p className="text-xs">暂无消息</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const style = notificationTypeStyle[n.type];
                    return (
                      <button
                        key={n.id}
                        onClick={() => markOneRead(n.id)}
                        className={`flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent ${
                          n.read ? "" : "bg-sapphire-subtle/60"
                        }`}
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${style.iconBg}`}>
                          {style.icon}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-foreground">{n.title}</span>
                            {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                          </div>
                          <p className="text-xs leading-relaxed text-muted-foreground">{n.description}</p>
                          <p className="text-[11px] text-muted-foreground/70">{n.time}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-accent cursor-pointer">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">李</AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground hidden sm:inline">李明</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => navigate({ to: "/account-info" })}>
                <UserCircle className="mr-2 h-4 w-4" />我的账号信息
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert("用户手册功能建设中")}>
                <BookOpen className="mr-2 h-4 w-4" />用户手册
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleFullscreen}>
                {isFullscreen ? <Minimize className="mr-2 h-4 w-4" /> : <Maximize className="mr-2 h-4 w-4" />}
                {isFullscreen ? "退出全屏" : "全屏显示"}
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Globe className="mr-2 h-4 w-4" />语言切换
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-36">
                  <DropdownMenuItem onClick={() => setLang("zh")}>
                    简体中文 {lang === "zh" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLang("en")}>
                    English {lang === "en" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Type className="mr-2 h-4 w-4" />字体调整
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-28">
                  <DropdownMenuItem onClick={() => setFontSize("small")}>
                    小 {fontSize === "small" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFontSize("default")}>
                    默认 {fontSize === "default" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFontSize("large")}>
                    大 {fontSize === "large" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={() => setLockOpen(true)}>
                <Lock className="mr-2 h-4 w-4" />锁定屏幕
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLogoutOpen(true)} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />退出系统
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Lock Screen Modal */}
      {lockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">李</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold text-foreground">李明</h2>
            <p className="text-sm text-muted-foreground">屏幕已锁定，请输入密码解锁</p>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="password"
                placeholder="请输入登录密码"
                value={lockPwd}
                onChange={(e) => setLockPwd(e.target.value)}
                className="w-56"
                onKeyDown={(e) => { if (e.key === "Enter") { setLockOpen(false); setLockPwd(""); } }}
              />
              <Button onClick={() => { setLockOpen(false); setLockPwd(""); }}>解锁</Button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      {logoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setLogoutOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-foreground">确认退出系统？</h3>
            <p className="mt-2 text-sm text-muted-foreground">退出后需要重新登录才能继续使用。</p>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setLogoutOpen(false)}>取消</Button>
              <Button className="flex-1" onClick={handleLogout}>确认退出</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
