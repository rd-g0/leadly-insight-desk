import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { LeadQueue } from "@/components/LeadQueue";
import { LeadSheet } from "@/components/LeadSheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchLeads, removeLead, saveLead } from "@/lib/leads-remote";

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
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const persistir = useCallback(
    (lead: Lead, userId: string) => {
      clearTimeout(timers.current[lead.id]);
      timers.current[lead.id] = setTimeout(() => {
        saveLead(lead, userId).catch(() => toast.error("Falha ao salvar na nuvem"));
      }, 600);
    },
    [],
  );

  useEffect(() => {
    if (!user) return;
    let ativo = true;
    (async () => {
      try {
        let remotos = await fetchLeads();

        // Migração única das fichas que ficaram salvas só neste navegador.
        const locais = loadLeads();
        if (remotos.length === 0 && locais.length > 0) {
          await Promise.all(locais.map((l) => saveLead(l, user.id)));
          saveLeads([]);
          remotos = await fetchLeads();
          toast.success(`${locais.length} lead(s) migrados para a nuvem`);
        }

        if (!ativo) return;
        setLeads(remotos);
        setSelectedId(remotos[0]?.id ?? null);
      } catch {
        if (ativo) toast.error("Não foi possível carregar seus leads");
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [user]);

  const selected = leads.find((l) => l.id === selectedId) ?? null;

  const criar = () => {
    if (!user) return;
    const lead = novoLead();
    setLeads((prev) => [lead, ...prev]);
    setSelectedId(lead.id);
    saveLead(lead, user.id).catch(() => toast.error("Falha ao criar lead"));
  };

  const atualizar = (patch: Partial<Lead>) => {
    if (!selectedId || !user) return;
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== selectedId) return l;
        const next = { ...l, ...patch, updatedAt: Date.now() };
        persistir(next, user.id);
        return next;
      }),
    );
  };

  const excluir = () => {
    if (!selectedId) return;
    const id = selectedId;
    setLeads((prev) => {
      const rest = prev.filter((l) => l.id !== id);
      setSelectedId(rest.sort((a, b) => b.updatedAt - a.updatedAt)[0]?.id ?? null);
      return rest;
    });
    removeLead(id).catch(() => toast.error("Falha ao excluir na nuvem"));
  };

  const sair = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  if (loading || !user || carregando) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </div>
    );
  }

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
          <span className="hidden text-xs text-muted-foreground sm:inline">{user.email}</span>
          <Button variant="ghost" size="sm" onClick={sair} className="text-xs">
            Sair
          </Button>
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
