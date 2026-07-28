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

type ProjectFormData = {
  name: string;
  email: string;
  company: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
};

const projectTypes = [
  "Business Website",
  "Custom Web Application",
  "Dashboard",
  "API Integration",
  "Something Else",
];

const budgetOptions = [
  "Not sure yet",
  "Under £1,000",
  "£1,000 – £3,000",
  "£3,000 – £7,000",
  "£7,000+",
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ProjectFormData>();

  const projectType = watch("projectType");
  const budget = watch("budget");
  const timeline = watch("timeline");

  async function onSubmit(data: ProjectFormData) {
    console.log("Project enquiry:", data);

    // TODO:
    // Replace this with a POST request to your backend.

    await new Promise((resolve) => setTimeout(resolve, 700));

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
          htmlFor="projectType"
          className="text-xs uppercase tracking-widest text-muted-foreground"
        >
          What do you need? *
        </label>

        <input
          type="hidden"
          id="projectType"
          {...register("projectType", {
            required: "Please select a project type.",
          })}
        />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button type="button" className="form-input text-left">
                <span className={projectType ? "" : "text-muted-foreground"}>
                  {projectType || "Select a project type"}
                </span>
              </button>
            }
          />

          <DropdownMenuContent>
            {projectTypes.map((type) => (
              <DropdownMenuItem
                key={type}
                onClick={() => setValue("projectType", type)}
                className={projectType === type ? "font-semibold" : ""}
              >
                {type}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {errors.projectType && (
          <p className="mt-2 text-xs text-destructive">
            {errors.projectType.message}
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
                  key={option}
                  onClick={() => setValue("budget", option)}
                  className={budget === option ? "font-semibold" : ""}
                >
                  {option}
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

      {/* Message */}
      <div className="p-6 sm:p-10 lg:p-12">
        <label
          htmlFor="message"
          className="text-xs uppercase tracking-widest text-muted-foreground"
        >
          Tell us about the project *
        </label>

        <textarea
          id="message"
          rows={7}
          placeholder="What are you trying to build? What problem are you trying to solve? Tell us anything that would help us understand the project."
          {...register("message", {
            required: "Please tell us a little about your project.",
            minLength: {
              value: 20,
              message: "Please provide a little more detail.",
            },
          })}
          className="form-input resize-none"
        />

        {errors.message && (
          <p className="mt-2 text-xs text-destructive">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-10 lg:p-12">
        <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
          By submitting this form, you agree to be contacted about your enquiry.
          We don&apos;t sell or share your information.
        </p>

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
