"use client";

import { faqSchema } from "@/lib/schema-markup";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What kind of projects do you work on?",
    answer:
      "We work on business websites, custom web applications, dashboards, internal tools, and integrations. If you have a specific digital problem in mind, you can share the details and we can determine the best approach together.",
  },
  {
    question: "How much does a project cost?",
    answer:
      "Every project is different because the scope, complexity, and requirements vary. After understanding what you need, we can recommend an appropriate solution and provide a clear project estimate.",
  },
  {
    question: "How long does a project usually take?",
    answer:
      "The timeline depends on the size and complexity of the project. A focused website can take considerably less time than a custom web application or business platform. We define the scope and expected timeline before development begins.",
  },
  {
    question: "Can you improve or rebuild an existing website?",
    answer:
      "Yes. We can work with an existing website when improving it makes more sense than starting from scratch. This can include redesigning the interface, improving performance, fixing technical issues, or adding new functionality.",
  },
  {
    question: "Do you work with clients outside Pakistan?",
    answer:
      "Yes. Nawab Tech works with businesses remotely, so location does not have to be a barrier. Projects can be managed through online communication and collaboration.",
  },
  {
    question: "What happens after I contact you?",
    answer:
      "We'll first understand what you're trying to achieve, what problem you're facing, and what you've already tried. From there, we'll discuss the most practical next step and whether we're a good fit for the project.",
  },
];

export function FAQ() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema(faqs)).replace(/</g, "\\u003c"),
        }}
      />
      <section className="section-border">
        <div className="container-main">
          <div className="grid border-x border-border lg:grid-cols-12">
            {/* Heading */}
            <div className="p-6 sm:p-10 lg:col-span-4 lg:p-14">
              <div className="eyebrow text-muted-foreground">
                Frequently asked
              </div>

              <h2 className="section-title mt-8">
                Questions
                <br />
                worth
                <br />
                <span className="text-primary">asking.</span>
              </h2>

              <p className="mt-8 max-w-sm leading-relaxed text-muted-foreground">
                Not sure if we&apos;re the right fit? Here are some of the
                questions we hear most often.
              </p>
            </div>

            {/* Accordion */}
            <div className="border-t border-border lg:col-span-8 lg:border-l lg:border-t-0">
              <Accordion.Root type="single" collapsible>
                {faqs.map((faq, index) => (
                  <Accordion.Item
                    key={faq.question}
                    value={`item-${index}`}
                    className="border-b border-border"
                  >
                    <Accordion.Header>
                      <Accordion.Trigger className="group flex w-full items-center justify-between gap-8 p-6 text-left sm:p-10 lg:p-12">
                        <span className="flex gap-6 text-lg font-medium tracking-tight sm:text-xl">
                          <span className="text-xs text-muted-foreground">
                            0{index + 1}
                          </span>

                          {faq.question}
                        </span>

                        <span className="flex size-9 shrink-0 items-center justify-center border border-border transition-colors group-data-[state=open]:bg-foreground group-data-[state=open]:text-background">
                          <ChevronDown
                            size={16}
                            className="transition-transform duration-200 group-data-[state=open]:rotate-180"
                          />
                        </span>
                      </Accordion.Trigger>
                    </Accordion.Header>

                    <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                      <div className="px-6 pb-8 pl-[4.5rem] pr-10 sm:px-10 sm:pb-10 sm:pl-[5.5rem] lg:px-12 lg:pb-12 lg:pl-[6.5rem]">
                        <p className="max-w-2xl leading-relaxed text-muted-foreground">
                          {faq.answer}
                        </p>
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
