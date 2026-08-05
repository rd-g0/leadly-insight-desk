import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Lead } from "@/lib/leads";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LeadQueue({
  leads,
  selectedId,
  onSelect,
  onNew,
}: {
  leads: Lead[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return leads
      .filter((l) => !q || l.nome.toLowerCase().includes(q))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [leads, busca]);

  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-secondary/40">
      <div className="space-y-3 border-b border-border px-4 py-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Fila de leads</h2>
          <span className="text-xs text-muted-foreground">{filtrados.length}</span>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome"
            className="bg-card pl-9"
          />
        </div>
        <Button onClick={onNew} className="w-full">
          <Plus className="size-4" /> Novo lead
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtrados.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            Nenhum lead na fila.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {filtrados.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => onSelect(l.id)}
                  className={cn(
                    "w-full rounded-md border px-3 py-2.5 text-left transition-colors",
                    selectedId === l.id
                      ? "border-primary bg-card shadow-sm"
                      : "border-transparent bg-card/60 hover:border-border hover:bg-card",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {l.nome.trim() || "Lead sem nome"}
                    </span>
                    {l.objetivo ? (
                      <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                        {l.objetivo}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{l.etapa}</span>
                    <span className="shrink-0">{formatDate(l.updatedAt)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
