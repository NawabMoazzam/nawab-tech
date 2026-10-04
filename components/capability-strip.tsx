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
          {capabilities.map((item, index) => (
            <div
              key={item.number}
              data-reveal="up"
              style={{ transitionDelay: `${index * 90}ms` }}
              className="group relative flex items-center justify-between gap-4 overflow-hidden p-5 transition-colors hover:bg-muted/40 sm:p-6"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-primary to-transparent transition-transform duration-500 group-hover:scale-x-100"
              />

              <span className="text-[10px] text-muted-foreground transition-colors group-hover:text-primary">
                {item.number}
              </span>

              <span className="text-xs font-medium uppercase tracking-[0.08em] transition-transform duration-500 group-hover:translate-x-0.5 sm:text-sm">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
