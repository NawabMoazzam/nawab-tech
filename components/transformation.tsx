import {
  ArrowRight,
  FileSpreadsheet,
  MessageSquare,
  RefreshCw,
  Search,
} from "lucide-react";

const problems = [
  {
    icon: FileSpreadsheet,
    label: "Important data scattered across spreadsheets",
  },
  {
    icon: MessageSquare,
    label: "Teams relying on WhatsApp for daily operations",
  },
  {
    icon: RefreshCw,
    label: "The same tasks repeated manually every day",
  },
  {
    icon: Search,
    label: "No clear view of what is actually happening",
  },
];

const outcomes = [
  "One place to manage your operations",
  "Clear data your team can actually use",
  "Automated workflows that reduce repetitive work",
  "A system that grows with your business",
];

export function Transformation() {
  return (
    <section className="section-border">
      <div className="container-main">
        <div className="grid lg:grid-cols-12">
          {/* Introduction */}
          <div className="border-x border-border p-6 sm:p-10 lg:col-span-4 lg:p-14">
            <div className="eyebrow text-muted-foreground">
              {" "}
              From problems to possibilities
            </div>

            <h2 className="section-title mt-8">
              Your business deserves
              <br />
              <span className="text-primary">better digital tools.</span>
            </h2>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
              An outdated website can make a business harder to trust. Scattered
              tools and manual processes can make everyday work harder than it
              needs to be. We build digital experiences and systems that make
              businesses clearer, faster, and easier to run.
            </p>
          </div>

          {/* Transformation */}
          <div className="lg:col-span-8">
            {/* Before */}
            <div className="border-b border-border p-6 sm:p-10 lg:p-14">
              <div className="mb-8 flex items-center justify-between">
                <div className="eyebrow text-muted-foreground">Before</div>

                <span className="text-xs text-muted-foreground">
                  Disconnected
                </span>
              </div>

              <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
                {problems.map((problem, index) => {
                  const Icon = problem.icon;

                  return (
                    <div
                      key={problem.label}
                      data-tilt
                      data-reveal="up"
                      style={{ transitionDelay: `${index * 80}ms` }}
                      className="group/tile flex min-h-32 flex-col justify-between bg-background p-5 transition-colors hover:bg-muted/60"
                    >
                      <Icon
                        size={20}
                        strokeWidth={1.5}
                        className="text-muted-foreground transition-colors group-hover/tile:text-primary"
                      />

                      <p className="max-w-xs text-sm leading-relaxed">
                        {problem.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transition */}
            <div className="flex items-center gap-4 border-b border-border px-6 py-5 sm:px-10 lg:px-14">
              <span className="eyebrow text-primary">Nawab Tech</span>

              <div className="h-px flex-1 bg-border" />

              <ArrowRight size={18} />
            </div>

            {/* After */}
            <div className="relative overflow-hidden bg-primary p-6 text-primary-foreground sm:p-10 lg:p-14">
              <span aria-hidden className="sheen-sweep" />

              <div className="mb-10 flex items-center justify-between">
                <div className="eyebrow">After</div>

                <span className="text-xs opacity-70">Connected</span>
              </div>

              <div className="grid gap-0 sm:grid-cols-2">
                {outcomes.map((outcome, index) => (
                  <div
                    key={outcome}
                    data-reveal="up"
                    style={{ transitionDelay: `${index * 80}ms` }}
                    className="flex gap-5 border-t border-primary-foreground/20 py-6 transition-colors hover:border-primary-foreground/45"
                  >
                    <span className="text-xs opacity-60">0{index + 1}</span>

                    <p className="max-w-xs text-sm leading-relaxed">
                      {outcome}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
