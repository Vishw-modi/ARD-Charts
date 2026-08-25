import { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <div className="flex flex-col rounded-[12px] border border-border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-[18px] font-semibold text-text">{title}</h2>
        {subtitle && <p className="mt-1 text-[14px] text-muted">{subtitle}</p>}
      </div>
      <div className="flex-1 w-full min-h-[400px]">
        {children}
      </div>
    </div>
  );
}
