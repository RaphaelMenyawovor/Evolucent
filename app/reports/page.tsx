import Link from "next/link";

export default function ReportsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-gold">
        Transparency
      </p>
      <h1 className="mb-4 font-display text-3xl font-extrabold tracking-tight text-evolucent-black">
        Monthly public reports
      </h1>
      <p className="mb-8 text-muted-foreground leading-relaxed">
        Full financial reports will be published here each month — total in,
        total out, and every project line. This page is a placeholder until
        reports are linked from your ledger.
      </p>
      <Link
        href="/impact"
        className="text-sm font-semibold text-civic-green underline-offset-4 hover:underline"
      >
        ← Back to verified impact
      </Link>
    </div>
  );
}
