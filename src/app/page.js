import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    number: "01",
    title: "Contract",
    description: "A clear services agreement covering scope, timeline, and payment terms before anything starts.",
  },
  {
    number: "02",
    title: "Onboarding",
    description: "A welcome document, invoice, and a short checklist of exactly what we need from you.",
  },
  {
    number: "03",
    title: "Delivery",
    description: "Work happens in the open — a shared timeline, deliverables for review, and a kickoff call to start.",
  },
  {
    number: "04",
    title: "Reporting",
    description: "Monthly reports on what shipped and how it performed, followed by a short feedback check-in.",
  },
];

export default function MarketingHomePage() {
  return (
    <div className="flex-1">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="font-heading text-lg tracking-tight">Agency OS</span>
        <Button render={<Link href="/portal" />} size="sm">
          Client login
        </Button>
      </header>

      <main>
        <section className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Client operations
          </p>
          <h1 className="mt-4 font-heading text-4xl leading-tight tracking-tight sm:text-5xl">
            A structured process from signed contract to delivered work.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Every client gets the same clear path: contract, onboarding, a shared
            portal to track progress, and reporting on what actually happened —
            no guessing what comes next.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Button render={<Link href="/portal" />}>
              Go to client portal
              <ArrowRight
                className="size-4 transition-transform group-hover/button:translate-x-0.5"
                aria-hidden="true"
              />
            </Button>
            <Button render={<Link href="/dashboard" />} variant="outline">
              Agency dashboard
            </Button>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.number} className="bg-background px-6 py-10">
                <span className="font-heading text-sm text-muted-foreground">
                  {step.number}
                </span>
                <h2 className="mt-3 text-base font-semibold">{step.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-6 py-10 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Agency OS.
      </footer>
    </div>
  );
}
