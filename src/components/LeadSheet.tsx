import { useMemo, useState } from "react";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Section, FieldLabel, Chip, ChipRow } from "@/components/lead-fields";
import {
  brlComExtenso,
  financiamentoMaximo,
  formatarBRLInput,
  somenteDigitos,
  valorPorExtenso,
} from "@/lib/finance";

import {
  BAIRROS,
  COMODIDADES,
  ETAPAS,
  INVEST_TIPOS,
  PRAZOS,
  TIPOLOGIAS,
  gerarResumo,
  type Etapa,
  type Lead,
} from "@/lib/leads";

type Patch = Partial<Lead>;

export function LeadSheet({
  lead,
  onChange,
  onDelete,
}: {
  lead: Lead;
  onChange: (patch: Patch) => void;
  onDelete: () => void;
}) {
  const [buscaBairro, setBuscaBairro] = useState("");

  const toggle = (key: keyof Lead, value: string) => {
    const arr = lead[key] as string[];
    onChange({
      [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    } as Patch);
  };

  const bairrosFiltrados = useMemo(() => {
    const q = buscaBairro.trim().toLowerCase();
    return BAIRROS.filter(
      (b) => !q || b.nome.toLowerCase().includes(q) || b.regiao.toLowerCase().includes(q),
    );
  }, [buscaBairro]);

  const copiarResumo = async () => {
    const texto = gerarResumo(lead);
    try {
      await navigator.clipboard.writeText(texto);
      toast.success("Resumo copiado para a área de transferência");
    } catch {
      toast.error("Não foi possível copiar automaticamente");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <FieldLabelInline>Etapa</FieldLabelInline>
          <Select value={lead.etapa} onValueChange={(v) => onChange({ etapa: v as Etapa })}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ETAPAS.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            Salvo automaticamente ·{" "}
            {new Date(lead.updatedAt).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={copiarResumo}>
            <Copy className="size-4" /> Copiar resumo
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="text-destructive hover:bg-destructive/10">
                <Trash2 className="size-4" /> Excluir lead
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir este lead?</AlertDialogTitle>
                <AlertDialogDescription>
                  {lead.nome.trim() || "Este lead"} será removido da fila. Esta ação não pode ser
                  desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-card/50">
        <Section title="Identificação">
          <div className="flex max-w-3xl flex-wrap items-end gap-4">
            <div className="min-w-[240px] flex-1">
              <FieldLabel>Nome do lead</FieldLabel>
              <Input
                value={lead.nome}
                onChange={(e) => onChange({ nome: e.target.value })}
                placeholder="Nome completo"
                maxLength={120}
                className="bg-card"
              />
            </div>
            <div className="min-w-[240px] flex-1">
              <FieldLabel>Link do HubSpot</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  value={lead.hubspotUrl}
                  onChange={(e) => onChange({ hubspotUrl: e.target.value })}
                  placeholder="https://app.hubspot.com/contacts/..."
                  className="bg-card"
                />
                <Button
                  asChild={Boolean(lead.hubspotUrl.trim())}
                  variant="outline"
                  size="icon"
                  disabled={!lead.hubspotUrl.trim()}
                  aria-label="Abrir no HubSpot"
                >
                  {lead.hubspotUrl.trim() ? (
                    <a href={lead.hubspotUrl.trim()} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" />
                    </a>
                  ) : (
                    <ExternalLink className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Section>


        <Section title="Objetivo">
          <ChipRow>
            {(["Moradia", "Investimento"] as const).map((o) => (
              <Chip
                key={o}
                label={o}
                selected={lead.objetivo === o}
                onClick={() => onChange({ objetivo: lead.objetivo === o ? "" : o })}
              />
            ))}
          </ChipRow>
          {lead.objetivo === "Investimento" && (
            <div>
              <FieldLabel>Tipo de investimento</FieldLabel>
              <ChipRow>
                {INVEST_TIPOS.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    selected={lead.investTipos.includes(t)}
                    onClick={() => toggle("investTipos", t)}
                  />
                ))}
              </ChipRow>
            </div>
          )}
        </Section>

        <Section title="Tipologia">
          <ChipRow>
            {TIPOLOGIAS.map((t) => (
              <Chip
                key={t}
                label={t}
                selected={lead.tipologias.includes(t)}
                onClick={() => toggle("tipologias", t)}
              />
            ))}
          </ChipRow>
          <div>
            <FieldLabel>Suíte é essencial?</FieldLabel>
            <ChipRow>
              {(["Sim", "Não", "Indiferente"] as const).map((s) => (
                <Chip
                  key={s}
                  label={s}
                  selected={lead.suite === s}
                  onClick={() => onChange({ suite: lead.suite === s ? "" : s })}
                />
              ))}
            </ChipRow>
          </div>
        </Section>

        <Section title="Estágio do imóvel">
          <ChipRow>
            {(["Pronto", "Na planta"] as const).map((e) => (
              <Chip
                key={e}
                label={e}
                selected={lead.estagio === e}
                onClick={() => onChange({ estagio: lead.estagio === e ? "" : e })}
              />
            ))}
          </ChipRow>
          {lead.estagio === "Na planta" && (
            <div>
              <FieldLabel>Prazo de entrega</FieldLabel>
              <ChipRow>
                {PRAZOS.map((p) => (
                  <Chip
                    key={p}
                    label={p}
                    selected={lead.prazoPlanta === p}
                    onClick={() => onChange({ prazoPlanta: lead.prazoPlanta === p ? "" : p })}
                  />
                ))}
              </ChipRow>
            </div>
          )}
        </Section>

        <Section title="Metragem e valor">
          <div className="max-w-xs">
            <FieldLabel>Metragem desejada (m²)</FieldLabel>
            <Input
              type="number"
              min={0}
              value={lead.metragem}
              onChange={(e) => onChange({ metragem: e.target.value })}
              className="bg-card"
            />
          </div>
          <div className="max-w-md">
            <FieldLabel>Valor máximo (R$)</FieldLabel>
            <Input
              inputMode="numeric"
              value={formatarBRLInput(lead.valorMax)}
              onChange={(e) => onChange({ valorMax: somenteDigitos(e.target.value) })}
              placeholder="R$ 0"
              className="bg-card"
            />
            {lead.valorMax && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {brlComExtenso(Number(lead.valorMax))}
              </p>
            )}
          </div>

          <div className="max-w-md">
            <FieldLabel>Valor de entrada (R$)</FieldLabel>
            <Input
              inputMode="numeric"
              value={formatarBRLInput(lead.valorEntrada)}
              onChange={(e) => onChange({ valorEntrada: somenteDigitos(e.target.value) })}
              placeholder="R$ 0"
              className="bg-card"
            />
            {lead.valorEntrada && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {brlComExtenso(Number(lead.valorEntrada))}
              </p>
            )}
          </div>

          <ChipRow>
            {(["Valor total", "Valor de entrada"] as const).map((v) => (
              <Chip
                key={v}
                label={v}
                selected={lead.valorTipo === v}
                onClick={() => onChange({ valorTipo: lead.valorTipo === v ? "" : v })}
              />
            ))}
          </ChipRow>
        </Section>

        <Section title="Pagamento">
          <ChipRow>
            {(
              ["Financiamento bancário", "Direto com construtora", "Sem preferência"] as const
            ).map((p) => (
              <Chip
                key={p}
                label={p}
                selected={lead.pagamento === p}
                onClick={() => onChange({ pagamento: lead.pagamento === p ? "" : p })}
              />
            ))}
          </ChipRow>
          {lead.pagamento === "Financiamento bancário" && (
            <div className="max-w-md">
              <FieldLabel>Renda bruta do cliente (R$)</FieldLabel>
              <Input
                inputMode="numeric"
                value={formatarBRLInput(lead.renda)}
                onChange={(e) => onChange({ renda: somenteDigitos(e.target.value) })}
                placeholder="R$ 0"
                className="bg-card"
              />
              {lead.renda && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {valorPorExtenso(Number(lead.renda))}
                </p>
              )}
              {lead.renda &&
                (financiamentoMaximo(Number(lead.renda)) ? (
                  <p className="mt-1.5 text-xs font-medium text-primary">
                    Financiamento máximo estimado:{" "}
                    {brlComExtenso(financiamentoMaximo(Number(lead.renda))!)}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Renda abaixo da menor faixa da tabela de referência.
                  </p>
                ))}

            </div>
          )}
        </Section>

        <Section title="Região de interesse">
          <Input
            value={buscaBairro}
            onChange={(e) => setBuscaBairro(e.target.value)}
            placeholder="Buscar bairro ou região"
            className="max-w-md bg-card"
          />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {bairrosFiltrados.map((b) => {
              const selected = lead.bairros.includes(b.nome);
              return (
                <button
                  key={b.nome}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggle("bairros", b.nome)}
                  className={
                    "flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors " +
                    (selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:border-primary/40 hover:bg-accent/40")
                  }
                >
                  <span>{b.nome}</span>
                  <span className={selected ? "text-xs opacity-70" : "text-xs text-muted-foreground"}>
                    {b.regiao}
                  </span>
                </button>
              );
            })}
          </div>
          <div>
            <FieldLabel>Outro bairro</FieldLabel>
            <Input
              value={lead.outroBairro}
              onChange={(e) => onChange({ outroBairro: e.target.value })}
              placeholder="Ex.: Santana, Tatuapé"
              maxLength={200}
              className="max-w-md bg-card"
            />
          </div>
        </Section>

        <Section title="Preferências e comodidades">
          <ChipRow>
            {COMODIDADES.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={lead.comodidades.includes(c)}
                onClick={() => toggle("comodidades", c)}
              />
            ))}
          </ChipRow>
          {lead.comodidades.includes("Garagem") && (
            <div>
              <FieldLabel>Quantidade de vagas</FieldLabel>
              <Input
                type="number"
                min={0}
                value={lead.vagas}
                onChange={(e) => onChange({ vagas: e.target.value })}
                className="w-32 bg-card"
              />
            </div>
          )}
          <div>
            <FieldLabel>Outra preferência</FieldLabel>
            <Input
              value={lead.outraPreferencia}
              onChange={(e) => onChange({ outraPreferencia: e.target.value })}
              placeholder="Ex.: sacada gourmet, vista livre"
              maxLength={200}
              className="max-w-md bg-card"
            />
          </div>
        </Section>

        <Section title="Atendimento">
          <div>
            <FieldLabel>Reside no Brasil?</FieldLabel>
            <ChipRow>
              {(["Sim", "Não"] as const).map((r) => (
                <Chip
                  key={r}
                  label={r}
                  selected={lead.resideBrasil === r}
                  onClick={() => onChange({ resideBrasil: lead.resideBrasil === r ? "" : r })}
                />
              ))}
            </ChipRow>
          </div>
          {lead.resideBrasil === "Não" && (
            <div>
              <FieldLabel>País / fuso horário</FieldLabel>
              <Input
                value={lead.paisFuso}
                onChange={(e) => onChange({ paisFuso: e.target.value })}
                placeholder="Ex.: Portugal (GMT+1)"
                maxLength={200}
                className="max-w-md bg-card"
              />
            </div>
          )}
          <div>
            <FieldLabel>Idioma do atendimento</FieldLabel>
            <ChipRow>
              {(["PT", "EN", "ES"] as const).map((i) => (
                <Chip
                  key={i}
                  label={i}
                  selected={lead.idioma === i}
                  onClick={() => onChange({ idioma: lead.idioma === i ? "" : i })}
                />
              ))}
            </ChipRow>
          </div>
        </Section>

        <Section title="Observações">
          <Textarea
            value={lead.observacoes}
            onChange={(e) => onChange({ observacoes: e.target.value })}
            placeholder="Contexto da ligação, urgência, quem decide, próximos passos…"
            maxLength={2000}
            rows={5}
            className="max-w-3xl bg-card"
          />
        </Section>
      </div>
    </div>
  );
}

function FieldLabelInline({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </span>
  );
}
