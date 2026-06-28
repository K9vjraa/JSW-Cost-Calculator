import { Drawer, Badge, Button, EmptyState } from "@jsw-mcms/ui";
import { useNotificationStore } from "@/store/notificationStore";
import { BellRing, CheckCircle, Check, Eye } from "lucide-react";
import { toast } from "sonner";

export interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const notices = useNotificationStore((state) => state.notices);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  const handleMarkAsRead = (id: string, title: string) => {
    markAsRead(id);
    toast.success(`Alert "${title}" marked as read.`);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success("All operation alerts marked as read.");
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "HIGH":
        return "danger";
      case "MEDIUM":
        return "warning";
      default:
        return "default";
    }
  };

  const drawerFooter = (
    <div className="flex items-center justify-between gap-3 w-full">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#56657a]">
        Total: <strong className="text-[#10233d]">{notices.length} alerts</strong>
      </span>
      {unreadCount > 0 && (
        <Button
          onClick={handleMarkAllAsRead}
          size="sm"
          leftIcon={<Check className="size-3.5" />}
          className="h-8 text-[10px] font-extrabold uppercase tracking-wider bg-[#0057b8] hover:bg-[#0b63c8]"
        >
          Mark All As Read
        </Button>
      )}
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Notification Center"
      subtitle="Operational costing updates and system logs"
      side="right"
      footer={drawerFooter}
    >
      <div className="flex flex-col gap-4">
        {/* Header summary panel */}
        <div className="flex items-center justify-between p-3 rounded-sm border border-slate-100 bg-[#edf5ff]/40">
          <div className="flex items-center gap-2">
            <BellRing className="size-4 text-[#0057b8]" />
            <span className="text-xs font-black text-[#10233d] tracking-tight">Active Surcharges & Audits</span>
          </div>
          {unreadCount > 0 ? (
            <Badge variant="danger">{unreadCount} Unread</Badge>
          ) : (
            <Badge variant="success">All caught up</Badge>
          )}
        </div>

        {/* Notices items list */}
        {notices.length === 0 ? (
          <EmptyState
            title="Notification Center Empty"
            description="Operational costing logs and system audit alerts appear here dynamically."
            iconType="inbox"
            className="py-12"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {notices.map((n) => {
              const isUnread = !n.readAt;
              return (
                <div
                  key={n.id}
                  onClick={() => isUnread && handleMarkAsRead(n.id, n.title)}
                  className={`flex flex-col gap-2 p-3.5 rounded-sm border text-left transition-all ${
                    isUnread
                      ? "border-[#bfd6f5] bg-[#edf5ff]/20 cursor-pointer hover:bg-[#edf5ff]/35 shadow-2xs"
                      : "border-slate-100 bg-white hover:bg-slate-50/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`text-xs tracking-tight ${isUnread ? "font-black text-[#032f67]" : "font-bold text-[#56657a]"}`}>
                      {n.title}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0 select-none">
                      {isUnread && (
                        <div className="size-1.5 rounded-full bg-[#d63031] animate-ping" />
                      )}
                      <Badge variant={getPriorityColor(n.priority)}>
                        {n.priority ?? "LOW"}
                      </Badge>
                    </div>
                  </div>

                  <p className={`text-[10px] leading-relaxed m-0 ${isUnread ? "font-semibold text-slate-800" : "text-slate-400 font-medium"}`}>
                    {n.message}
                  </p>

                  <div className="flex items-center justify-between border-t border-slate-100/60 pt-2 mt-0.5 text-[9px] font-bold text-slate-400 select-none">
                    <span className="uppercase tracking-widest text-[8px] bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">
                      {n.category}
                    </span>
                    <span className="flex items-center gap-1">
                      {isUnread ? (
                        <span className="text-[#0057b8] flex items-center gap-0.5">
                          <Eye className="size-3" /> Click to read
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-0.5">
                          <CheckCircle className="size-3 text-success-fg" /> Read
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Drawer>
  );
}
export default NotificationPanel;
