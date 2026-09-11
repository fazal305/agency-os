const FIELDS = [
  { key: "scope_summary", label: "Scope of work" },
  { key: "services", label: "Services & deliverables" },
  { key: "timeline", label: "Timeline" },
  { key: "payment_terms", label: "Payment terms" },
];

export function ContractDocument({ contract, clientName }) {
  return (
    <div className="space-y-6 rounded-lg border border-border p-6">
      <div>
        <p className="text-sm text-muted-foreground">Services Agreement</p>
        <h2 className="font-heading text-xl tracking-tight">{contract.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Prepared for {clientName}</p>
      </div>

      <dl className="space-y-4">
        {FIELDS.map(({ key, label }) =>
          contract[key] ? (
            <div key={key}>
              <dt className="text-sm font-medium text-foreground">{label}</dt>
              <dd className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                {contract[key]}
              </dd>
            </div>
          ) : null
        )}
      </dl>

      <p className="border-t border-border pt-4 text-xs text-muted-foreground">
        This document is a record of agreement between the parties and is not
        a substitute for legal review. For engagements requiring formal legal
        enforceability, consult qualified counsel and a dedicated e-signature
        provider.
      </p>

      {contract.status === "signed" ? (
        <div className="rounded-md bg-success px-4 py-3 text-sm text-success-foreground">
          Signed by {contract.signed_by_name} on{" "}
          {new Date(contract.signed_at).toLocaleDateString()}
        </div>
      ) : null}
    </div>
  );
}
