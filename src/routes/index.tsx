import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Upload,
  Building2,
  ChevronRight,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

export const Route = createFileRoute("/")({
  component: Index,
});

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ReactNode }> = {
  pending_audit: {
    label: "待审核",
    variant: "secondary",
    icon: <Clock className="h-3 w-3" />,
  },
  pending_payment: {
    label: "待打款",
    variant: "outline",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  pending_confirm: {
    label: "待确认到账",
    variant: "secondary",
    icon: <Upload className="h-3 w-3" />,
  },
  transferring: {
    label: "平台转账中",
    variant: "default",
    icon: <RefreshCw className="h-3 w-3" />,
  },
  completed: {
    label: "充值完成",
    variant: "outline",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
};

const tasks = [
  {
    id: "RC-2026-07001",
    account: "星图主账户",
    amount: "¥50,000.00",
    status: "transferring",
    time: "2026-07-10 14:32",
  },
  {
    id: "RC-2026-07002",
    account: "星图投放账户 A",
    amount: "¥120,000.00",
    status: "pending_confirm",
    time: "2026-07-10 11:15",
  },
  {
    id: "RC-2026-07003",
    account: "星图运营账户",
    amount: "¥30,000.00",
    status: "completed",
    time: "2026-07-09 16:48",
  },
];

const accounts = [
  {
    name: "星图主账户",
    accountId: "ST-10086101",
    balance: "¥286,500.00",
    status: "正常",
  },
  {
    name: "星图投放账户 A",
    accountId: "ST-10086102",
    balance: "¥142,300.00",
    status: "正常",
  },
  {
    name: "星图运营账户",
    accountId: "ST-10086103",
    balance: "¥58,200.00",
    status: "正常",
  },
];

const stats = [
  {
    title: "当前可用余额",
    value: "¥487,000.00",
    icon: Wallet,
    trend: "较上周 +12.5%",
    trendUp: true,
    accent: "bg-primary",
  },
  {
    title: "本月充值金额",
    value: "¥200,000.00",
    icon: TrendingUp,
    trend: "目标完成 80%",
    trendUp: true,
    accent: "bg-emerald-500",
  },
  {
    title: "本月消耗金额",
    value: "¥156,800.00",
    icon: TrendingDown,
    trend: "较上月 +8.2%",
    trendUp: false,
    accent: "bg-amber-500",
  },
  {
    title: "待处理充值任务",
    value: "2",
    icon: Clock,
    trend: "需要您的操作",
    trendUp: false,
    accent: "bg-rose-500",
  },
];

function WelcomeSection() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-sapphire p-6 text-primary-foreground shadow-lg sm:p-8">
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary-foreground/80">
            <Building2 className="h-4 w-4" />
            <span className="text-sm font-medium">上海星图科技有限公司</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            欢迎回来，李明
          </h1>
          <p className="max-w-xl text-sm text-primary-foreground/90">
            这是您的企业充值工作台，可快速查看账户余额、充值进度与账户概览。
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:items-end">
          <Badge className="w-fit border-white/20 bg-white/15 text-white hover:bg-white/20">
            账户状态正常
          </Badge>
          <Button asChild size="lg" className="bg-white text-primary shadow-md hover:bg-white/90">
            <Link to="/recharge">
              <Wallet className="mr-2 h-4 w-4" />
              发起充值
            </Link>
          </Button>
        </div>
      </div>
      {/* Decorative circles */}
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
      <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-white/5" />
    </div>
  );
}

function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md">
          <div className={`h-1 w-full ${stat.accent}`} />
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.accent} text-white`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs">
              <span className={stat.trendUp ? "text-emerald-600" : "text-muted-foreground"}>
                {stat.trend}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RechargeTasks() {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">充值任务进度</CardTitle>
          <CardDescription>最近 3 条充值任务</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="gap-1 text-primary" asChild>
          <Link to="/recharge">
            查看全部
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>充值单号</TableHead>
              <TableHead>星图账户</TableHead>
              <TableHead>充值金额</TableHead>
              <TableHead>当前状态</TableHead>
              <TableHead className="text-right">提交时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const status = statusMap[task.status];
              return (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.id}</TableCell>
                  <TableCell>{task.account}</TableCell>
                  <TableCell className="font-medium">{task.amount}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className="gap-1">
                      {status.icon}
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{task.time}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AccountOverview() {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">账户概览</CardTitle>
        <CardDescription>已绑定星图账户列表</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>账户名称</TableHead>
              <TableHead>星图账户 ID</TableHead>
              <TableHead>账户余额</TableHead>
              <TableHead>账户状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.accountId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarFallback className="bg-sapphire-muted text-xs font-medium text-primary">
                        {account.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{account.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">{account.accountId}</TableCell>
                <TableCell className="font-medium">{account.balance}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                    <CheckCircle2 className="h-3 w-3" />
                    {account.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function OperationTips() {
  const steps = [
    "提交申请",
    "审核通过",
    "打款上传回单",
    "财务确认",
    "平台转账",
    "充值完成",
  ];

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-semibold">操作提示</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">充值流程</p>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sapphire-muted text-xs font-medium text-primary">
                  {index + 1}
                </div>
                <span className="text-sm text-muted-foreground">{step}</span>
                {index < steps.length - 1 && (
                  <ArrowRight className="ml-auto h-4 w-4 text-border" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">到账时间提醒</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-700">
                下午 5 点后提交的充值申请，财务确认及平台转账可能顺延至下一个工作日处理，请提前安排充值时间。
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Index() {
  return (
    <div className="space-y-6 p-6">
      <WelcomeSection />
      <StatsCards />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <RechargeTasks />
          <AccountOverview />
        </div>
        <div>
          <OperationTips />
        </div>
      </div>
    </div>
  );
}
