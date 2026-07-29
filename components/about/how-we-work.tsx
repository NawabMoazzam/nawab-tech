const principles = [
  {
    number: "01",
    title: "Understand",
    description:
      "Before thinking about technology, we first understand the business, the people using the system, and the problem that needs solving.",
  },
  {
    number: "02",
    title: "Think",
    description:
      "We turn the problem into a clear digital solution, focusing on what actually matters instead of adding unnecessary complexity.",
  },
  {
    number: "03",
    title: "Build",
    description:
      "The solution is designed and developed with attention to performance, usability, maintainability, and the details that make a product feel right.",
  },
  {
    number: "04",
    title: "Improve",
    description:
      "A digital product is rarely finished after launch. We look at what can be improved as the business, its users, and its needs evolve.",
  },
];

export function HowWeWork() {
  return (
    <section className="section-border">
      <div className="container-main">
        <div className="border-x border-border">
          <div className="grid p-6 sm:p-10 lg:grid-cols-12 lg:p-14">
            <div className="lg:col-span-4">
              <div className="eyebrow text-muted-foreground">How we work</div>

              <h2 className="section-title mt-8">
                Start with
                <br />
                the problem.
              </h2>
            </div>

            <div className="mt-12 lg:col-span-7 lg:col-start-6 lg:mt-0">
              <p className="max-w-2xl text-xl leading-relaxed tracking-[-0.02em] sm:text-2xl">
                Good software starts with understanding what needs to change.
                The technology comes after.
              </p>

              <div className="mt-16 border-t border-border">
                {principles.map((principle) => (
                  <div
                    key={principle.number}
                    className="grid gap-5 border-b border-border py-8 last:border-b-0 sm:grid-cols-12 sm:py-10"
                  >
                    <span className="text-xs text-muted-foreground sm:col-span-2">
                      {principle.number}
                    </span>

                    <div className="sm:col-span-10">
                      <h3 className="text-2xl font-medium tracking-[-0.04em]">
                        {principle.title}
                      </h3>

                      <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
                        {principle.description}
                      </p>
                    </div>
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
