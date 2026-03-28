import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

export default async function ProjectReportPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-civic-green">
        Independent audit
      </p>
      <h1 className="mb-4 font-display text-3xl font-extrabold tracking-tight text-evolucent-black">
        Full audit report
      </h1>
      <p className="mb-6 text-muted-foreground leading-relaxed">
        Detailed verification documents for project{" "}
        <span className="font-mono text-sm text-foreground">{id}</span> will
        live here (PDFs, photos, disbursement ledger). This route is wired for
        navigation from the Impact page.
      </p>
      <div className="flex flex-wrap gap-4 text-sm font-semibold">
        <Link
          href="/impact"
          className="text-civic-green underline-offset-4 hover:underline"
        >
          ← Verified impact
        </Link>
        <Link
          href={`/project/${id}`}
          className="text-muted-foreground underline-offset-4 hover:underline"
        >
          Project overview
        </Link>
      </div>
    </div>
  );
}
