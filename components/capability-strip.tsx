const capabilities = [
  {
    number: "01",
    label: "Websites",
  },
  {
    number: "02",
    label: "Web Applications",
  },
  {
    number: "03",
    label: "Dashboards",
  },
  {
    number: "04",
    label: "Digital Systems",
  },
];

export function CapabilityStrip() {
  return (
    <section className="border-b border-border">
      <div className="container-main">
        <div className="grid grid-cols-2 divide-x divide-border border-x lg:grid-cols-4">
          {capabilities.map((item) => (
            <div
              key={item.number}
              className="flex items-center justify-between gap-4 p-5 sm:p-6"
            >
              <span className="text-[10px] text-muted-foreground">
                {item.number}
              </span>

              <span className="text-xs font-medium uppercase tracking-[0.08em] sm:text-sm">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
