// Máscara de milhar, valor por extenso e tabela renda x financiamento máximo.

export function somenteDigitos(v: string): string {
  return v.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

export function formatarMilhar(v: string): string {
  const d = somenteDigitos(v);
  if (!d) return "";
  return Number(d).toLocaleString("pt-BR");
}

// Máscara com prefixo de moeda: "500000" -> "R$ 500.000"
export function formatarBRLInput(v: string): string {
  const d = formatarMilhar(v);
  return d ? `R$ ${d}` : "";
}


const UNIDADES = [
  "",
  "um",
  "dois",
  "três",
  "quatro",
  "cinco",
  "seis",
  "sete",
  "oito",
  "nove",
  "dez",
  "onze",
  "doze",
  "treze",
  "catorze",
  "quinze",
  "dezesseis",
  "dezessete",
  "dezoito",
  "dezenove",
];
const DEZENAS = [
  "",
  "",
  "vinte",
  "trinta",
  "quarenta",
  "cinquenta",
  "sessenta",
  "setenta",
  "oitenta",
  "noventa",
];
const CENTENAS = [
  "",
  "cento",
  "duzentos",
  "trezentos",
  "quatrocentos",
  "quinhentos",
  "seiscentos",
  "setecentos",
  "oitocentos",
  "novecentos",
];

function trioPorExtenso(n: number): string {
  if (n === 100) return "cem";
  const partes: string[] = [];
  const c = Math.floor(n / 100);
  const resto = n % 100;
  if (c) partes.push(CENTENAS[c]);
  if (resto) {
    if (resto < 20) partes.push(UNIDADES[resto]);
    else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;
      partes.push(u ? `${DEZENAS[d]} e ${UNIDADES[u]}` : DEZENAS[d]);
    }
  }
  return partes.join(" e ");
}

const ESCALAS: [string, string][] = [
  ["", ""],
  ["mil", "mil"],
  ["milhão", "milhões"],
  ["bilhão", "bilhões"],
];

export function numeroPorExtenso(valor: number): string {
  if (!Number.isFinite(valor) || valor <= 0) return "";
  let n = Math.floor(valor);
  const grupos: number[] = [];
  while (n > 0) {
    grupos.push(n % 1000);
    n = Math.floor(n / 1000);
  }
  if (grupos.length > ESCALAS.length) return "";

  const partes: string[] = [];
  for (let i = grupos.length - 1; i >= 0; i--) {
    const g = grupos[i];
    if (!g) continue;
    if (i === 0) partes.push(trioPorExtenso(g));
    else if (i === 1) partes.push(g === 1 ? "mil" : `${trioPorExtenso(g)} mil`);
    else partes.push(`${trioPorExtenso(g)} ${g === 1 ? ESCALAS[i][0] : ESCALAS[i][1]}`);
  }

  let texto = partes[0];
  for (let i = 1; i < partes.length; i++) {
    const anterior = grupos[grupos.length - i];
    const atual = grupos[grupos.length - i - 1];
    const usarE = atual < 100 || atual % 100 === 0;
    texto += usarE && anterior ? ` e ${partes[i]}` : `, ${partes[i]}`;
  }
  return texto;
}

export function valorPorExtenso(valor: number): string {
  const t = numeroPorExtenso(valor);
  if (!t) return "";
  return `${t} ${valor === 1 ? "real" : "reais"}`;
}

// Renda média necessária -> valor máximo financiável (referência interna, 420 meses).
const TABELA_RENDA: { renda: number; financiamento: number }[] = [
  { renda: 3516, financiamento: 100000 },
  { renda: 4377, financiamento: 125000 },
  { renda: 5237, financiamento: 150000 },
  { renda: 6097, financiamento: 175000 },
  { renda: 6957, financiamento: 200000 },
  { renda: 7817, financiamento: 225000 },
  { renda: 8677, financiamento: 250000 },
  { renda: 9537, financiamento: 275000 },
  { renda: 10396, financiamento: 300000 },
  { renda: 11256, financiamento: 325000 },
  { renda: 12520, financiamento: 350000 },
  { renda: 12976, financiamento: 375000 },
  { renda: 13836, financiamento: 400000 },
  { renda: 14696, financiamento: 425000 },
  { renda: 15556, financiamento: 450000 },
  { renda: 16416, financiamento: 475000 },
  { renda: 17276, financiamento: 500000 },
  { renda: 18136, financiamento: 525000 },
  { renda: 18996, financiamento: 550000 },
  { renda: 19856, financiamento: 575000 },
  { renda: 20716, financiamento: 600000 },
  { renda: 21576, financiamento: 625000 },
  { renda: 22436, financiamento: 650000 },
  { renda: 23296, financiamento: 675000 },
  { renda: 24156, financiamento: 700000 },
  { renda: 25016, financiamento: 725000 },
  { renda: 25876, financiamento: 750000 },
  { renda: 26736, financiamento: 775000 },
  { renda: 27596, financiamento: 800000 },
  { renda: 28456, financiamento: 825000 },
  { renda: 29316, financiamento: 850000 },
  { renda: 30176, financiamento: 875000 },
  { renda: 31036, financiamento: 900000 },
  { renda: 31896, financiamento: 925000 },
  { renda: 32756, financiamento: 950000 },
  { renda: 33616, financiamento: 975000 },
  { renda: 34476, financiamento: 1000000 },
];

export function financiamentoMaximo(renda: number): number | null {
  if (!Number.isFinite(renda) || renda <= 0) return null;
  let resultado: number | null = null;
  for (const faixa of TABELA_RENDA) {
    if (renda >= faixa.renda) resultado = faixa.financiamento;
    else break;
  }
  return resultado;
}

export const brlCompacto = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

// "750000" -> "R$ 750.000 (setecentos e cinquenta mil reais)"
export function brlComExtenso(valor: number): string {
  if (!Number.isFinite(valor) || valor <= 0) return "";
  const extenso = valorPorExtenso(valor);
  return extenso ? `${brlCompacto(valor)} (${extenso})` : brlCompacto(valor);
}
