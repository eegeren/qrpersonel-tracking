import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  note: string;
  icon: LucideIcon;
};

export function StatCard({ title, value, note, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink/55">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-mint/10 text-mint">
          <Icon size={20} aria-hidden />
        </span>
      </div>
      <p className="mt-4 text-sm text-ink/60">{note}</p>
    </div>
  );
}
