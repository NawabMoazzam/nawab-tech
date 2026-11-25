import * as dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const topics = [
  ["How much does an MVP cost for a startup?", "Commercial investigation", "Separate a validation MVP from a production-ready product and show what scope changes the estimate.", "A worked estimate with explicitly stated scope, team assumptions, and excluded costs."],
  ["Shopify vs a custom ecommerce website for a small business", "Commercial investigation", "Compare operational fit, ownership, recurring platform costs, and when each path becomes limiting.", "A side-by-side decision checklist for catalog size, workflows, and integrations."],
  ["AI automation ideas for a small business", "Informational / commercial", "Rank use cases by repeatability, error cost, and human review instead of listing generic AI trends.", "A sample lead-intake workflow with assumptions and human approval points."],
  ["How to add Stripe subscriptions in Next.js", "Transactional / implementation", "Map the subscription lifecycle including webhooks, failed payments, access control, and testing.", "A practical event checklist from checkout through cancellation and retries."],
  ["Freelancer vs agency for a small business software project", "Commercial investigation", "Compare accountability, continuity, scope control, and what to verify before signing.", "A vendor evaluation checklist with example deliverables and handover questions."],
  ["Build vs buy a CRM for a small business", "Commercial investigation", "Use workflow fit and total operating effort to identify when customization is justified.", "A decision matrix using an assumed team and workflow; label all assumptions."],
  ["Small business website audit checklist", "Informational / commercial", "A prioritized audit ordered by lost leads and operational risk, not design polish alone.", "A checklist covering conversion, accessibility, mobile, analytics, and performance."],
  ["How much does a custom web app cost?", "Commercial investigation", "Break scope into workflows, roles, integrations, data, and support rather than quote a universal price.", "A sample range calculation with explicit assumptions and exclusions."],
  ["When should a startup build an internal tool?", "Commercial investigation", "Set a practical threshold using repeated manual work, error rates, and process stability.", "A hypothetical break-even worksheet with clearly marked assumptions."],
  ["Zapier vs custom automation for a growing business", "Commercial investigation", "Compare reliability, observability, edge cases, and maintenance as workflow complexity rises.", "A workflow decision checklist and an example escalation path."],
  ["How to connect Stripe webhooks to a business app", "Informational / implementation", "Focus on signature verification, idempotency, retries, and reconciliation.", "A webhook handling checklist using a clearly identified example event sequence."],
  ["What should a small business include in a website brief?", "Informational / commercial", "Turn business outcomes into a brief vendors can estimate without guesswork.", "A reusable brief outline with acceptance criteria examples."],
  ["How long does it take to build a small business website?", "Commercial investigation", "Explain dependencies and review cycles behind a realistic timeline instead of a one-size-fits-all promise.", "A sample phased schedule with assumptions and client-side dependencies."],
  ["How to choose a software development agency", "Commercial investigation", "Evaluate discovery, delivery transparency, security, ownership, and support with practical evidence.", "Interview questions tied to concrete artifacts a buyer can request."],
  ["Custom CRM cost for a small business", "Commercial investigation", "Explain the cost drivers in data migration, permissions, reporting, and integrations.", "An illustrative scope-based estimate, clearly marked as hypothetical."],
  ["Should a startup use a no-code tool or custom software?", "Commercial investigation", "Assess change frequency, data ownership, integration depth, and consequences of failure.", "A decision tree for a sample early-stage operating workflow."],
  ["How to automate invoice processing for a small business", "Informational / commercial", "Design a review-first process that preserves approvals and exception handling.", "A sample invoice workflow with assumptions, exception paths, and human checks."],
  ["Website redesign vs incremental improvements: what should a small business choose?", "Commercial investigation", "Tie the decision to measurable blockers, content debt, and risk of disrupting lead generation.", "A prioritization worksheet distinguishing urgent defects from cosmetic changes."],
  ["What does it cost to integrate software with Stripe, HubSpot, or Xero?", "Commercial investigation", "Show how authentication, data mapping, sync direction, and failure handling affect integration scope.", "A worked integration scope example with assumptions and exclusions."],
  ["How to plan a customer portal for a small business", "Commercial investigation", "Start from the customer task and permissions rather than feature lists.", "A starter feature and access-control checklist for a stated example business."],
  ["How to estimate software project costs before hiring a developer", "Informational / commercial", "Give buyers a repeatable way to prepare scope and compare estimates fairly.", "A simple estimate worksheet with sample assumptions, not market pricing claims."],
  ["When is a dashboard worth building for a small business?", "Commercial investigation", "Distinguish useful decision support from a dashboard that merely duplicates reports.", "A KPI selection checklist and an illustrative reporting workflow."],
  ["How to protect customer data in a small business web app", "Informational / commercial", "Prioritize access control, backups, secrets, and data minimization in plain language.", "A baseline security review checklist and explicit scope caveat."],
  ["What should a startup include in its first web app MVP?", "Commercial investigation", "Choose a narrow complete user journey and defer features that do not test the core assumption.", "A hypothetical MVP scope with assumptions and a defer list."],
  ["How much does it cost to maintain a custom web application?", "Commercial investigation", "Explain ongoing maintenance as operational work, not a fixed universal percentage.", "A sample monthly maintenance plan with stated team and uptime assumptions."],
  ["How to migrate from spreadsheets to a custom business app", "Informational / commercial", "Reduce migration risk with data cleanup, parallel running, and staged adoption.", "A migration checklist covering owners, validation, and rollback."],
  ["What is the best way to add AI to an existing business workflow?", "Commercial investigation", "Find a narrow, reviewable task and define what happens when the model is uncertain.", "A sample human-in-the-loop workflow with success criteria assumptions."],
  ["How to scope a booking system for a small business", "Commercial investigation", "Surface scheduling rules, cancellations, payments, and staff availability before implementation.", "A discovery checklist and one example rule set."],
  ["Custom website or website builder for a growing business?", "Commercial investigation", "Compare flexibility and ownership against maintenance and operational responsibility.", "A decision checklist based on actual workflow constraints, not unsupported price claims."],
  ["How to prepare for a software development discovery call", "Informational / commercial", "Help buyers bring decisions, constraints, and stakeholders that make discovery useful.", "A concise pre-call checklist and example problem statement."],
] as const;

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required to seed topics.");
  await mongoose.connect(process.env.MONGODB_URI);
  const collection = mongoose.connection.getClient().db().collection("topicideas");
  let inserted = 0;
  for (const [query, intent, originalAngle, proofElement] of topics) {
    const result = await collection.updateOne(
      { query },
      { $setOnInsert: { query, intent, originalAngle, proofElement, status: "approved", createdAt: new Date() } },
      { upsert: true },
    );
    if (result.upsertedCount) inserted += 1;
  }
  console.log(`[seed-topics] ${inserted} new ideas added; ${topics.length - inserted} already existed.`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("[seed-topics] Failed:", error);
  await mongoose.disconnect().catch(() => undefined);
  process.exitCode = 1;
});
