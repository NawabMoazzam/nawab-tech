import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";

export function ContactCTA() {
  return (
    <section id="contact" className="section-border">
      <div className="container-main">
        <div className="border-x border-border">
          <div className="grid lg:grid-cols-12">
            {/* Main CTA */}
            <div className="p-6 sm:p-10 lg:col-span-8 lg:p-20">
              <div className="eyebrow flex items-center gap-3 text-muted-foreground">
                Have a project in mind?
              </div>

              <h2 className="mt-8 max-w-5xl text-[clamp(3rem,7vw,7rem)] font-medium leading-[0.9] tracking-[-0.075em]">
                Tell us what
                <br />
                you&apos;re trying
                <br />
                to <span className="text-primary">build.</span>
              </h2>

              <p className="mt-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Whether you have a clear specification or just an idea that
                needs structure, start the conversation. We&apos;ll figure out
                the next step together.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href="mailto:hello@nawabtech.com"
                  className="group flex items-center justify-center gap-3 bg-primary px-6 py-4 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  <Mail size={17} />
                  Start a project
                  <ArrowUpRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </a>

                <a
                  href="#"
                  className="flex items-center justify-center gap-3 border border-border px-6 py-4 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <MessageCircle size={17} />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Side Information */}
            <div className="border-t border-border lg:col-span-4 lg:border-l lg:border-t-0">
              <div className="flex h-full flex-col justify-between">
                <div className="p-6 sm:p-10 lg:p-12">
                  <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Start a conversation
                  </span>
                </div>

                <div className="border-t border-border p-6 sm:p-10 lg:p-12">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Tell us about your business, what you&apos;re trying to
                    achieve, and where you&apos;re currently stuck.
                  </p>

                  <div className="mt-8 space-y-3 text-sm">
                    <a
                      href="mailto:hello@nawabtech.com"
                      className="block transition-colors hover:text-primary"
                    >
                      hello@nawabtech.com
                    </a>

                    <span className="block text-muted-foreground">
                      Remote · Worldwide
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
