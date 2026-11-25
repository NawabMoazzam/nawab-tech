"use client";

import { useMemo, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { createEnquiry } from "@/app/actions/contact";
import { websiteCostRates } from "@/lib/website-cost-rates";

const money = (amount: number) => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", maximumFractionDigits: 0,
}).format(Math.round(amount / 100) * 100);

type ProjectType = keyof typeof websiteCostRates.projectTypes;
type Timeline = keyof typeof websiteCostRates.timelineMultipliers;

export function WebsiteCostCalculator() {
  const [projectType, setProjectType] = useState<ProjectType>("businessWebsite");
  const [features, setFeatures] = useState<string[]>([]);
  const [integrations, setIntegrations] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<Timeline>("flexible");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const estimate = useMemo(() => {
    const base = websiteCostRates.projectTypes[projectType];
    const featureCost = websiteCostRates.features.filter((item) => features.includes(item.id));
    const integrationCost = websiteCostRates.integrations.filter((item) => integrations.includes(item.id));
    const multiplier = websiteCostRates.timelineMultipliers[timeline].multiplier;
    return {
      min: (base.min + featureCost.reduce((sum, item) => sum + item.min, 0) + integrationCost.reduce((sum, item) => sum + item.min, 0)) * multiplier,
      max: (base.max + featureCost.reduce((sum, item) => sum + item.max, 0) + integrationCost.reduce((sum, item) => sum + item.max, 0)) * multiplier,
    };
  }, [projectType, features, integrations, timeline]);

  function toggle(list: string[], setter: (value: string[]) => void, value: string) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  async function requestEstimate() {
    setSubmitting(true);
    setError("");
    const service = projectType === "businessWebsite" || projectType === "ecommerce"
      ? "business-websites"
      : projectType === "automation" ? "automation-integrations" : "custom-web-applications";
    const details = [
      `Website cost calculator enquiry. Project type: ${websiteCostRates.projectTypes[projectType].label}.`,
      `Selected features: ${features.map((id) => websiteCostRates.features.find((item) => item.id === id)?.label).filter(Boolean).join(", ") || "None selected"}.`,
      `Integrations: ${integrations.map((id) => websiteCostRates.integrations.find((item) => item.id === id)?.label).filter(Boolean).join(", ") || "None selected"}.`,
      `Preferred timeline: ${websiteCostRates.timelineMultipliers[timeline].label}.`,
      `Calculator range: ${money(estimate.min)}–${money(estimate.max)} USD. This is an estimate and not a quote.`,
    ].join(" ");
    const result = await createEnquiry({
      name,
      email,
      company,
      service,
      budget: `${money(estimate.min)}–${money(estimate.max)} USD (estimate)`,
      timeline: websiteCostRates.timelineMultipliers[timeline].label,
      project: details,
    });
    setSubmitting(false);
    if (!result.success) {
      setError(result.errors.root?.[0] || "Please check the details and try again.");
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="space-y-8 lg:col-span-7">
        <fieldset>
          <legend className="text-sm font-semibold">1. What are you building?</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(Object.entries(websiteCostRates.projectTypes) as [ProjectType, (typeof websiteCostRates.projectTypes)[ProjectType]][]).map(([key, item]) => (
              <label key={key} className={`flex cursor-pointer items-center gap-3 border p-4 text-sm ${projectType === key ? "border-foreground bg-muted" : "border-border"}`}>
                <input type="radio" name="project-type" checked={projectType === key} onChange={() => setProjectType(key)} />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold">2. Key features</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {websiteCostRates.features.map((item) => (
              <label key={item.id} className="flex items-center gap-3 border border-border p-3 text-sm">
                <input type="checkbox" checked={features.includes(item.id)} onChange={() => toggle(features, setFeatures, item.id)} />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold">3. Integrations</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {websiteCostRates.integrations.map((item) => (
              <label key={item.id} className="flex items-center gap-3 border border-border p-3 text-sm">
                <input type="checkbox" checked={integrations.includes(item.id)} onChange={() => toggle(integrations, setIntegrations, item.id)} />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="timeline" className="text-sm font-semibold">4. Preferred timeline</label>
          <select id="timeline" className="mt-3 w-full rounded-md border border-input bg-background px-3 py-3 text-sm" value={timeline} onChange={(event) => setTimeline(event.target.value as Timeline)}>
            {(Object.entries(websiteCostRates.timelineMultipliers) as [Timeline, (typeof websiteCostRates.timelineMultipliers)[Timeline]][]).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
          </select>
        </div>
      </div>

      <aside className="h-fit border border-border bg-muted/30 p-6 sm:p-8 lg:sticky lg:top-28 lg:col-span-5">
        <p className="eyebrow text-muted-foreground">Planning estimate · USD</p>
        <p className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{money(estimate.min)} – {money(estimate.max)}</p>
        <p className="mt-4 text-sm font-medium">This is an estimate, not a quote.</p>
        <div className="mt-5 space-y-2 text-sm leading-relaxed text-muted-foreground">
          {websiteCostRates.assumptions.map((assumption) => <p key={assumption}>• {assumption}</p>)}
        </div>
        {submitted ? (
          <div className="mt-7 flex items-center gap-2 border border-primary/30 bg-primary/5 p-4 text-sm"><Check size={18} /> Your enquiry is saved. We&apos;ll follow up by email.</div>
        ) : (
          <div className="mt-7 space-y-3 border-t border-border pt-6">
            <p className="text-sm font-semibold">Want a project-specific estimate?</p>
            <input className="w-full rounded-md border border-input bg-background px-3 py-3 text-sm" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" aria-label="Your name" />
            <input className="w-full rounded-md border border-input bg-background px-3 py-3 text-sm" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Work email" aria-label="Work email" />
            <input className="w-full rounded-md border border-input bg-background px-3 py-3 text-sm" value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Company (optional)" aria-label="Company (optional)" />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button type="button" disabled={submitting || !name.trim() || !email.trim()} onClick={() => void requestEstimate()} className="flex w-full items-center justify-center gap-2 bg-foreground px-5 py-3 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? <><LoaderCircle size={16} className="animate-spin" /> Sending…</> : "Request my estimate"}
            </button>
            <p className="text-xs leading-relaxed text-muted-foreground">Your selections and contact details are sent through our existing project-enquiry flow.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
