// Motor de cálculo do Simulador Renda × Financiamento (client-side, sem API).

export const BANCOS: { nome: string; taxa: string; nota?: string }[] = [
  { nome: "Itaú", taxa: "11,09% a.a." },
  { nome: "Bradesco", taxa: "10,49% a.a." },
  { nome: "Santander", taxa: "10,99% a.a." },
  {
    nome: "Caixa",
    taxa: "11,49% a.a. + TR",
    nota: "Taxa de balcão SBPE 2026 · com relacionamento (salário na conta + débito automático + 1 produto): a partir de 11,19% a.a.",
  },
];

type Coef = [number, number];
type Perfil = { renda: Coef[]; p1: Coef[]; pu: Coef[] };

export const PERFIS: Perfil[] = [
  {
    // ≈25 anos
    renda: [
      [71.4, 0.03244571],
      [83.4296, 0.0363867],
      [75.7879, 0.03436364],
      [71.4286, 0.03338047],
    ],
    p1: [
      [24.99, 0.011356],
      [25.0289, 0.01091601],
      [25.01, 0.01134],
      [25.0, 0.01168316],
    ],
    pu: [
      [25.0278, 0.00240162],
      [25.0, 0.0024008],
      [24.9711, 0.00240199],
      [24.9996, 0.00240147],
    ],
  },
  {
    // ≈35 anos
    renda: [
      [71.3714, 0.03265029],
      [83.3667, 0.036512],
      [75.7576, 0.03448485],
      [71.4286, 0.03352255],
    ],
    p1: [
      [24.98, 0.0114276],
      [25.01, 0.0109536],
      [25.0, 0.01138],
      [25.0, 0.01173289],
    ],
    pu: [
      [25.0278, 0.00240162],
      [25.0, 0.0024008],
      [24.9711, 0.00240199],
      [24.9996, 0.00240147],
    ],
  },
  {
    // ≈45 anos
    renda: [
      [71.3429, 0.03335543],
      [83.3, 0.03743867],
      [75.7273, 0.03505939],
      [71.4286, 0.03420293],
    ],
    p1: [
      [24.97, 0.0116744],
      [24.99, 0.0112316],
      [24.99, 0.0115696],
      [25.0, 0.01197103],
    ],
    pu: [
      [25.0278, 0.00240162],
      [25.0, 0.0024008],
      [24.9711, 0.00240199],
      [24.9996, 0.00240147],
    ],
  },
];

export const LTV = 0.8;
export const F_MIN = 100000;
export const F_MAX = 1000000;
export const IDADES = ["≈25", "≈35", "≈45"];

export const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
export const fmt2 = (v: number) =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function digitos(v: string): number {
  const d = v.replace(/\D/g, "");
  return d ? parseInt(d, 10) : 0;
}

export function mascaraMilhar(v: string): string {
  const d = v.replace(/\D/g, "");
  return d ? parseInt(d, 10).toLocaleString("pt-BR") : "";
}

export type Resultado = {
  nome: string;
  taxa: string;
  nota?: string;
  F: number;
  imovel: number;
  entradaUsada: number;
  p1: number;
  pu: number;
  foraTabela: "acima" | "abaixo" | null;
  limitadoPorEntrada: boolean;
};

export function simular(renda: number, entradaInput: number, perfil: number): Resultado[] {
  const P = PERFIS[perfil];
  return BANCOS.map((b, i) => {
    const [a, bb] = P.renda[i];
    let F = (renda - a) / bb;
    if (F < 0) F = 0;
    let imovel: number;
    let entradaUsada: number;
    let limitadoPorEntrada = false;

    if (entradaInput > 0) {
      const fLtv = entradaInput * (LTV / (1 - LTV));
      if (fLtv < F) {
        F = fLtv;
        limitadoPorEntrada = true;
      }
      imovel = F + entradaInput;
      entradaUsada = entradaInput;
    } else {
      imovel = F / LTV;
      entradaUsada = imovel * (1 - LTV);
    }

    const p1 = P.p1[i][0] + P.p1[i][1] * F;
    const pu = P.pu[i][0] + P.pu[i][1] * F;
    const foraTabela = F > F_MAX ? "acima" : F < F_MIN ? "abaixo" : null;

    return { ...b, F, imovel, entradaUsada, p1, pu, foraTabela, limitadoPorEntrada };
  });
}

export function avisoDe(r: Resultado): string | null {
  if (r.limitadoPorEntrada)
    return "⚠ Limitado pela entrada informada (LTV 80%) — a renda permitiria financiar mais.";
  if (r.foraTabela === "acima")
    return "⚠ Valor acima da faixa da planilha (financiamento > R$ 1 mi) — estimativa por extrapolação.";
  if (r.foraTabela === "abaixo")
    return "⚠ Financiamento abaixo de R$ 100 mil (mínimo da tabela) — confirmar viabilidade com o banco.";
  return null;
}

export function textoWhatsApp(renda: number, perfil: number, resultados: Resultado[]): string {
  const idade = IDADES[perfil];
  const blocos = resultados
    .map(
      (r) =>
        `*${r.nome}* (${r.taxa})\n• Imóvel de até: ${fmt(r.imovel)}\n• Financiamento: ${fmt(
          r.F,
        )}\n• Entrada: ${fmt(r.entradaUsada)}\n• 1ª parcela: ${fmt2(r.p1)} | Última: ${fmt2(r.pu)}`,
    )
    .join("\n\n");

  return `*Simulação de crédito imobiliário*\nRenda familiar: ${fmt(
    renda,
  )} · Perfil ${idade} anos\n\n${blocos}\n\n_Sistema SAC, 420 meses, entrada mín. 20%. Simulação estimativa — sujeita à análise de crédito._`;
}
