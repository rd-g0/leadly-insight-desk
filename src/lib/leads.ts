import { brlComExtenso, financiamentoMaximo } from "@/lib/finance";

export type Etapa =
  | "Novo"
  | "Qualificando"
  | "Aguardando retorno"
  | "Call marcada"
  | "Perdido"
  | "Convertido";

export const ETAPAS: Etapa[] = [
  "Novo",
  "Qualificando",
  "Aguardando retorno",
  "Call marcada",
  "Perdido",
  "Convertido",
];

export const TIPOLOGIAS = ["Studio", "1 quarto", "2 quartos", "3 quartos", "4+ quartos"];
export const INVEST_TIPOS = [
  "Locação tradicional",
  "Airbnb / temporada",
  "Revenda / valorização",
];
export const PRAZOS = ["Até 1 ano", "Até 2 anos", "Até 3 anos", "Sem preferência"];
export const COMODIDADES = [
  "Piscina",
  "Varanda",
  "Garagem",
  "Academia",
  "Salão de festas",
  "Portaria 24h",
  "Espaço pet",
  "Coworking",
  "Playground",
];

export const BAIRROS: { nome: string; regiao: string }[] = [
  { nome: "Jardim Paulista", regiao: "Central" },
  { nome: "Bela Vista", regiao: "Central" },
  { nome: "Consolação", regiao: "Central" },
  { nome: "Liberdade", regiao: "Central" },
  { nome: "Vila Mariana", regiao: "Zona Sul" },
  { nome: "Moema", regiao: "Zona Sul" },
  { nome: "Saúde", regiao: "Zona Sul" },
  { nome: "Campo Belo", regiao: "Zona Sul" },
  { nome: "Pinheiros", regiao: "Zona Oeste" },
  { nome: "Itaim Bibi", regiao: "Zona Oeste" },
  { nome: "Alto de Pinheiros", regiao: "Zona Oeste" },
  { nome: "Vila Leopoldina", regiao: "Zona Oeste" },
  { nome: "Perdizes", regiao: "Zona Oeste" },
  { nome: "Lapa", regiao: "Zona Oeste" },
  { nome: "Butantã", regiao: "Zona Oeste" },
  { nome: "Morumbi", regiao: "Zona Oeste" },
];

export interface Lead {
  id: string;
  nome: string;
  hubspotUrl: string;
  etapa: Etapa;
  objetivo: "" | "Moradia" | "Investimento";
  investTipos: string[];
  tipologias: string[];
  suite: "" | "Sim" | "Não" | "Indiferente";
  estagio: "" | "Pronto" | "Na planta";
  prazoPlanta: string;
  metragem: string;

  valorMax: string;
  valorEntrada: string;

  valorTipo: "" | "Valor total" | "Valor de entrada";
  pagamento: "" | "Financiamento bancário" | "Direto com construtora" | "Sem preferência";
  renda: string;
  bairros: string[];
  outroBairro: string;
  comodidades: string[];
  vagas: string;
  outraPreferencia: string;
  resideBrasil: "" | "Sim" | "Não";
  paisFuso: string;
  idioma: "" | "PT" | "EN" | "ES";
  observacoes: string;
  updatedAt: number;
}

export function novoLead(): Lead {
  return {
    id: crypto.randomUUID(),
    nome: "",
    hubspotUrl: "",
    etapa: "Novo",
    objetivo: "",
    investTipos: [],
    tipologias: [],
    suite: "",
    estagio: "",
    prazoPlanta: "",
    metragem: "",

    valorMax: "",
    valorEntrada: "",

    valorTipo: "",
    pagamento: "",
    renda: "",
    bairros: [],
    outroBairro: "",
    comodidades: [],
    vagas: "",
    outraPreferencia: "",
    resideBrasil: "",
    paisFuso: "",
    idioma: "",
    observacoes: "",
    updatedAt: Date.now(),
  };
}

const KEY = "myside-leads-v1";

export function loadLeads(): Lead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as Lead[]).map((l) => ({
      ...novoLead(),
      ...l,
      hubspotUrl: l.hubspotUrl ?? "",
      metragem: l.metragem ?? "",
      valorEntrada: l.valorEntrada ?? "",
    }));

  } catch {
    return [];
  }
}

export function saveLeads(leads: Lead[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(leads));
  } catch {
    /* ignore */
  }
}

const brl = (v: string) => {
  const n = Number(v);
  if (!v || Number.isNaN(n)) return v;
  return brlComExtenso(n) || v;
};

export function gerarResumo(l: Lead): string {
  const linhas: string[] = [];
  const add = (label: string, valor?: string) => {
    if (valor && valor.trim()) linhas.push(`${label}: ${valor.trim()}`);
  };

  linhas.push(`RESUMO DE QUALIFICAÇÃO — ${l.nome.trim() || "Lead sem nome"}`);
  linhas.push("");
  add("Etapa", l.etapa);

  if (l.objetivo === "Investimento") {
    add(
      "Objetivo",
      l.investTipos.length ? `Investimento (${l.investTipos.join(", ")})` : "Investimento",
    );
  } else {
    add("Objetivo", l.objetivo);
  }

  add("Tipologia", l.tipologias.join(", "));
  add("Suíte", l.suite);

  if (l.estagio === "Na planta") {
    add("Estágio", l.prazoPlanta ? `Na planta (entrega ${l.prazoPlanta})` : "Na planta");
  } else {
    add("Estágio", l.estagio);
  }

  if (l.metragem) {
    add("Metragem desejada", `${l.metragem} m²`);
  }

  if (l.valorMax) {
    const faixa = `até ${brl(l.valorMax)}`;
    add("Valor", l.valorTipo ? `${faixa} — ${l.valorTipo}` : faixa);
  }

  if (l.valorEntrada) {
    add("Valor de entrada", brl(l.valorEntrada));
  }

  add("Pagamento", l.pagamento);
  if (l.pagamento === "Financiamento bancário" && l.renda) {
    add("Renda bruta do cliente", brl(l.renda));
    const teto = financiamentoMaximo(Number(l.renda));
    if (teto) add("Financiamento máximo estimado", brlComExtenso(teto));
  }

  const regioes = new Map<string, string[]>();
  l.bairros.forEach((b) => {
    const r = BAIRROS.find((x) => x.nome === b)?.regiao ?? "Outros";
    regioes.set(r, [...(regioes.get(r) ?? []), b]);
  });
  const regioesTxt = [...regioes.entries()].map(([r, bs]) => `${r} — ${bs.join(", ")}`);
  if (l.outroBairro.trim()) regioesTxt.push(`Outro — ${l.outroBairro.trim()}`);
  if (regioesTxt.length) {
    linhas.push("Regiões de interesse:");
    regioesTxt.forEach((t) => linhas.push(`  • ${t}`));
  }

  const coms = l.comodidades.map((c) =>
    c === "Garagem" && l.vagas ? `Garagem (${l.vagas} vaga${Number(l.vagas) > 1 ? "s" : ""})` : c,
  );
  if (l.outraPreferencia.trim()) coms.push(l.outraPreferencia.trim());
  add("Preferências", coms.join(", "));

  add("Reside no Brasil", l.resideBrasil);
  if (l.resideBrasil === "Não") add("País / fuso horário", l.paisFuso);
  add("Idioma do atendimento", l.idioma);

  if (l.observacoes.trim()) {
    linhas.push("");
    linhas.push(`Observações: ${l.observacoes.trim()}`);
  }

  return linhas.join("\n");
}
