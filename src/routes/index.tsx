import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LeadQueue } from "@/components/LeadQueue";
import { LeadSheet } from "@/components/LeadSheet";
import { ThemeToggle } from "@/components/ThemeToggle";

import { loadLeads, novoLead, saveLeads, type Lead } from "@/lib/leads";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Central de Qualificação de Leads — MySide" },
      {
        name: "description",
        content:
          "Ficha de qualificação de leads imobiliários em formato helpdesk: fila de leads, campos completos e resumo pronto para o CRM.",
      },
      { property: "og:title", content: "Central de Qualificação de Leads — MySide" },
      {
        property: "og:description",
        content:
          "Qualifique leads durante a ligação e gere um resumo pronto para colar no CRM ou repassar ao Personal Shopper.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadLeads();
    setLeads(stored);
    setSelectedId(stored.sort((a, b) => b.updatedAt - a.updatedAt)[0]?.id ?? null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveLeads(leads);
  }, [leads, hydrated]);

  const selected = leads.find((l) => l.id === selectedId) ?? null;

  const criar = () => {
    const lead = novoLead();
    setLeads((prev) => [lead, ...prev]);
    setSelectedId(lead.id);
  };

  const atualizar = (patch: Partial<Lead>) => {
    if (!selectedId) return;
    setLeads((prev) =>
      prev.map((l) => (l.id === selectedId ? { ...l, ...patch, updatedAt: Date.now() } : l)),
    );
  };

  const excluir = () => {
    if (!selectedId) return;
    setLeads((prev) => {
      const rest = prev.filter((l) => l.id !== selectedId);
      setSelectedId(rest.sort((a, b) => b.updatedAt - a.updatedAt)[0]?.id ?? null);
      return rest;
    });
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            Central de Qualificação de Leads
          </h1>
          <p className="text-xs text-muted-foreground">MySide · Pré-vendas imobiliárias</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/simulador"
            className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            Simulador
          </Link>
          <span className="text-xs text-muted-foreground">
            {leads.length} lead{leads.length === 1 ? "" : "s"} na base
          </span>
          <ThemeToggle />
        </div>


      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[320px_1fr]">
        <LeadQueue
          leads={leads}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onNew={criar}
        />
        <main className="min-h-0 overflow-hidden">
          {selected ? (
            <LeadSheet
              key={selected.id}
              lead={selected}
              onChange={atualizar}
              onDelete={excluir}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <h2 className="text-lg font-semibold text-foreground">Nenhum lead selecionado</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Crie um novo lead na fila à esquerda para começar a qualificação.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
