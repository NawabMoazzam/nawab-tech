const capabilities = [
  "Next.js",
  "React",
  "TypeScript",
  "FastAPI",
  "Node.js",
  "MongoDB",
  "Tailwind CSS",
  "API Integration",
];

export function CapabilityStrip() {
  return (
    <section className="border-b border-border">
      <div className="container-main">
        <div className="flex flex-wrap items-center divide-x divide-border">
          {capabilities.map((item) => (
            <div
              key={item}
              className="px-5 py-5 text-xs font-medium uppercase tracking-[0.08em] text-muted first:pl-0"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
