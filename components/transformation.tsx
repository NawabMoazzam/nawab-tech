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
            <div className="eyebrow text-muted-foreground">The opportunity</div>

            <h2 className="section-title mt-8">
              Your business
              <br />
              deserves a
              <br />
              <span className="text-primary">better system.</span>
            </h2>

            <p className="mt-10 max-w-sm leading-relaxed text-muted-foreground">
              Many businesses grow by adding more tools, more spreadsheets, and
              more manual processes. Eventually, those tools start working
              against the people using them.
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
                {problems.map((problem) => {
                  const Icon = problem.icon;

                  return (
                    <div
                      key={problem.label}
                      className="flex min-h-32 flex-col justify-between bg-background p-5"
                    >
                      <Icon
                        size={20}
                        strokeWidth={1.5}
                        className="text-muted-foreground"
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
            <div className="bg-primary p-6 text-primary-foreground sm:p-10 lg:p-14">
              <div className="mb-10 flex items-center justify-between">
                <div className="eyebrow">After</div>

                <span className="text-xs opacity-70">Connected</span>
              </div>

              <div className="grid gap-0 sm:grid-cols-2">
                {outcomes.map((outcome, index) => (
                  <div
                    key={outcome}
                    className="flex gap-5 border-t border-primary-foreground/20 py-6"
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
