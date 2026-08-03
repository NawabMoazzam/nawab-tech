"use client";

import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { zodResolver } from "@hookform/resolvers/zod";
import { enquirySchema } from "@/schemas/enquiry";
import type { EnquiryInput } from "@/schemas/enquiry";
import { createEnquiry } from "@/app/actions/contact";

const Services: { label: string; value: EnquiryInput["service"] }[] = [
  {
    label: "Business Website",
    value: "business-websites",
  },
  {
    label: "Custom Web Application",
    value: "custom-web-applications",
  },
  {
    label: "Dashboard Development",
    value: "dashboard-development",
  },
  {
    label: "Automation & Integrations",
    value: "automation-integrations",
  },
  {
    label: "Not sure yet",
    value: "not-sure",
  },
];
// ["under-500", "500-2000", "2000-5000", "5000-plus"]
const budgetOptions = [
  {
    label: "Under $500",
    value: "under-500",
  },
  {
    label: "$500 – $2,000",
    value: "500-2000",
  },
  {
    label: "$2,000 – $5,000",
    value: "2000-5000",
  },
  {
    label: "$5,000+",
    value: "5000-plus",
  },
];

const timelineOptions = [
  "I'm flexible",
  "Within 1 month",
  "1–3 months",
  "3–6 months",
  "I need to discuss this",
];

export function ProjectForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      company: "",
      budget: "",
      timeline: "",
    },
  });

  const service = watch("service");
  const budget = watch("budget");
  const timeline = watch("timeline");

  async function onSubmit(data: EnquiryInput) {
    const result = await createEnquiry(data);

    console.log("result: ", result);

    if (!result.success) {
      setServerError(
        result.errors.root?.[0] ?? "Unable to submit your enquiry.",
      );
      return;
    }

    setSubmitted(true);

    reset();
  }

  if (submitted) {
    return (
      <div className="flex min-h-150 flex-col justify-center p-6 sm:p-10 lg:p-14">
        <div className="flex size-12 items-center justify-center bg-primary text-primary-foreground">
          <Check size={22} />
        </div>

        <h2 className="mt-8 text-4xl font-medium tracking-tighter sm:text-5xl">
          Thanks for reaching out.
        </h2>

        <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground">
          We&apos;ve received your project enquiry. We&apos;ll review the
          details and get back to you with the next steps.
        </p>

        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-8 flex w-fit items-center gap-2 text-sm font-medium"
        >
          Send another enquiry
          <ArrowUpRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="divide-y divide-border">
      {/* Name + Email */}
      <div className="grid sm:grid-cols-2">
        <div className="p-6 sm:p-10 lg:p-12">
          <label
            htmlFor="name"
            className="text-xs uppercase tracking-widest text-muted-foreground"
          >
            Your name *
          </label>

          <input
            id="name"
            type="text"
            placeholder="John Smith"
            {...register("name", {
              required: "Please enter your name.",
            })}
            className="form-input"
          />

          {errors.name && (
            <p className="mt-2 text-xs text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="border-t border-border p-6 sm:border-l sm:border-t-0 sm:p-10 lg:p-12">
          <label
            htmlFor="email"
            className="text-xs uppercase tracking-widest text-muted-foreground"
          >
            Email address *
          </label>

          <input
            id="email"
            type="email"
            placeholder="john@company.com"
            {...register("email", {
              required: "Please enter your email.",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Please enter a valid email address.",
              },
            })}
            className="form-input"
          />

          {errors.email && (
            <p className="mt-2 text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      {/* Company */}
      <div className="p-6 sm:p-10 lg:p-12">
        <label
          htmlFor="company"
          className="text-xs uppercase tracking-widest text-muted-foreground"
        >
          Company or business
        </label>

        <input
          id="company"
          type="text"
          placeholder="Your company name"
          {...register("company")}
          className="form-input"
        />
      </div>

      {/* Project Type */}
      <div className="p-6 sm:p-10 lg:p-12">
        <label
          htmlFor="Service"
          className="text-xs uppercase tracking-widest text-muted-foreground"
        >
          What do you need? *
        </label>

        <input
          type="hidden"
          id="service"
          {...register("service", {
            required: "Please select a service.",
          })}
        />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button type="button" className="form-input text-left">
                <span className={service ? "" : "text-muted-foreground"}>
                  {service || "Select a project type"}
                </span>
              </button>
            }
          />

          <DropdownMenuContent>
            {Services.map((item) => (
              <DropdownMenuItem
                key={item.value}
                onClick={() => setValue("service", item.value)}
              >
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {errors.service && (
          <p className="mt-2 text-xs text-destructive">
            {errors.service.message}
          </p>
        )}
      </div>

      {/* Budget + Timeline */}
      <div className="grid sm:grid-cols-2">
        <div className="p-6 sm:p-10 lg:p-12">
          <label
            htmlFor="budget"
            className="text-xs uppercase tracking-widest text-muted-foreground"
          >
            Approximate budget
          </label>

          <input type="hidden" id="budget" {...register("budget")} />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button type="button" className="form-input text-left">
                  <span className={budget ? "" : "text-muted-foreground"}>
                    {budget || "Select a range"}
                  </span>
                </button>
              }
            />

            <DropdownMenuContent>
              {budgetOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setValue("budget", option.value)}
                  className={budget === option.value ? "font-semibold" : ""}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="border-t border-border p-6 sm:border-l sm:border-t-0 sm:p-10 lg:p-12">
          <label
            htmlFor="timeline"
            className="text-xs uppercase tracking-widest text-muted-foreground"
          >
            Desired timeline
          </label>

          <input type="hidden" id="timeline" {...register("timeline")} />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button type="button" className="form-input text-left">
                  <span className={timeline ? "" : "text-muted-foreground"}>
                    {timeline || "Select a timeline"}
                  </span>
                </button>
              }
            />

            <DropdownMenuContent>
              {timelineOptions.map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => setValue("timeline", option)}
                  className={timeline === option ? "font-semibold" : ""}
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Project Details */}
      <div className="p-6 sm:p-10 lg:p-12">
        <label
          htmlFor="project"
          className="text-xs uppercase tracking-widest text-muted-foreground"
        >
          Tell us about the project *
        </label>

        <textarea
          id="project"
          rows={7}
          placeholder="What are you trying to build? What problem are you trying to solve? Tell us anything that would help us understand the project."
          {...register("project", {
            required: "Please tell us a little about your project.",
            minLength: {
              value: 20,
              message: "Please provide a little more detail.",
            },
          })}
          className="form-input resize-none"
        />

        {errors.project && (
          <p className="mt-2 text-xs text-destructive">
            {errors.project.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-10 lg:p-12">
        <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
          By submitting this form, you agree to be contacted about your enquiry.
          We don&apos;t sell or share your information.
        </p>
        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="group flex shrink-0 items-center gap-3 bg-primary px-7 py-4 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting ? "Sending..." : "Send enquiry"}

          {!isSubmitting && (
            <ArrowUpRight
              size={17}
              className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          )}
        </button>
      </div>
    </form>
  );
}
