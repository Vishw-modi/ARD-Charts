type LegendProps = {
  items: { label: string; color: string }[];
};

export function Legend({ items }: LegendProps) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center space-x-2">
          <div
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-[13px] text-muted">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
