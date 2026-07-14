import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, User, ShieldCheck, Bell } from "lucide-react";

export function DashboardHeader() {
  return (
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
        <button className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>
        <Avatar className="h-9 w-9 border border-border">
          <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
            李明
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
