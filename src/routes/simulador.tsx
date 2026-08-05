import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  IDADES,
  avisoDe,
  digitos,
  fmt,
  fmt2,
  mascaraMilhar,
  simular,
  textoWhatsApp,
} from "@/lib/simulador";

export const Route = createFileRoute("/simulador")({
  head: () => ({
    meta: [
      { title: "Simulador Renda × Financiamento — MySide" },
      {
        name: "description",
        content:
          "Digite a renda bruta familiar e veja na hora até quanto o cliente financia em Itaú, Bradesco, Santander e Caixa.",
      },
      { property: "og:title", content: "Simulador Renda × Financiamento — MySide" },
      {
        property: "og:description",
        content:
          "Simulação instantânea de crédito imobiliário por banco: imóvel máximo, financiamento, entrada e parcelas SAC.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Simulador,
});

function Simulador() {
  const [renda, setRenda] = useState("");
  const [entrada, setEntrada] = useState("");
  const [perfil, setPerfil] = useState(0);
  const [copiado, setCopiado] = useState(false);
  const rendaRef = useRef<HTMLInputElement>(null);

  const rendaNum = digitos(renda);
  const entradaNum = digitos(entrada);
  const ativo = rendaNum >= 1000;

  const resultados = useMemo(
    () => (ativo ? simular(rendaNum, entradaNum, perfil) : []),
    [ativo, rendaNum, entradaNum, perfil],
  );
  const best = resultados.reduce(
    (m, r) => (m === null || r.imovel > m.imovel ? r : m),
    null as (typeof resultados)[number] | null,
  );

  const copiar = async () => {
    const texto = textoWhatsApp(rendaNum, perfil, resultados);
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };

  const limpar = () => {
    setRenda("");
    setEntrada("");
    rendaRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-sim-paper px-4 pb-12 font-body text-sim-ink">
      <div className="mx-auto w-full max-w-[680px]">
        <header className="border-b border-sim-line pb-5 pt-7">
          <div className="mb-1.5 font-numeric text-[11px] font-semibold uppercase tracking-[0.12em] text-sim-green">
            MySide · Ferramenta interna SDR
          </div>
          <h1 className="font-display text-[clamp(22px,5vw,28px)] font-bold leading-[1.15]">
            Simulador Renda × Financiamento
          </h1>
          <p className="mt-1.5 text-[13.5px] text-sim-ink-soft">
            Digite a renda bruta familiar e veja na hora até quanto o cliente financia em cada
            banco.
          </p>
        </header>

        <section className="pb-2 pt-6">
          <label
            htmlFor="renda"
            className="mb-2 block text-[13px] font-semibold text-sim-ink-soft"
          >
            Renda bruta familiar mensal
          </label>
          <div className="flex items-baseline gap-2.5 rounded-[14px] border-2 border-sim-ink bg-sim-card px-[18px] py-3.5 transition-[border-color,box-shadow] focus-within:border-sim-green focus-within:shadow-[0_0_0_4px_var(--color-sim-green-soft)]">
            <span className="font-display text-[22px] font-semibold text-sim-ink-soft">R$</span>
            <input
              id="renda"
              ref={rendaRef}
              inputMode="numeric"
              autoComplete="off"
              placeholder="0,00"
              value={renda}
              onChange={(e) => setRenda(mascaraMilhar(e.target.value))}
              className="w-full border-none bg-transparent font-display text-[clamp(28px,7vw,38px)] font-bold tabular-nums text-sim-ink outline-none placeholder:font-semibold placeholder:text-[#C2CCC6]"
            />
          </div>

          <div className="mt-[18px] flex flex-wrap gap-[18px]">
            <div className="min-w-[220px] flex-1">
              <span className="mb-[7px] block text-[12.5px] font-semibold text-sim-ink-soft">
                Faixa de idade do comprador
              </span>
              <div className="flex overflow-hidden rounded-[10px] border-[1.5px] border-sim-line bg-sim-card">
                {["≈ 25 anos", "≈ 35 anos", "≈ 45 anos"].map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setPerfil(i)}
                    aria-pressed={perfil === i}
                    className={cn(
                      "flex-1 border-none px-1 py-2.5 text-[13px] font-semibold transition-colors",
                      i > 0 && "border-l-[1.5px] border-sim-line",
                      perfil === i ? "bg-sim-ink text-white" : "text-sim-ink-soft",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-w-[220px] flex-1">
              <label
                htmlFor="entrada"
                className="mb-[7px] block text-[12.5px] font-semibold text-sim-ink-soft"
              >
                Entrada disponível <span className="font-normal">(opcional)</span>
              </label>
              <div className="flex items-center gap-2 rounded-[10px] border-[1.5px] border-sim-line bg-sim-card px-3.5 py-2.5 focus-within:border-sim-green">
                <span className="text-sm font-semibold text-sim-ink-soft">R$</span>
                <input
                  id="entrada"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="vazio = entrada mínima de 20%"
                  value={entrada}
                  onChange={(e) => setEntrada(mascaraMilhar(e.target.value))}
                  className="w-full border-none bg-transparent font-numeric text-[15px] font-semibold text-sim-ink outline-none placeholder:font-body placeholder:text-[13px] placeholder:font-medium placeholder:text-[#C2CCC6]"
                />
              </div>
            </div>
          </div>
        </section>

        {ativo && resultados.length > 0 ? (
          <section
            aria-live="polite"
            className="mt-[26px] rounded-[14px] border-[1.5px] border-sim-green-line bg-sim-green-soft px-5 py-[18px]"
          >
            <p className="text-[15px] leading-[1.55]">
              Com renda de <Val>{fmt(rendaNum)}</Val> (perfil {IDADES[perfil]} anos):
            </p>
            <ul className="mt-2.5 grid gap-1.5 text-[14px] leading-[1.55]">
              {resultados
                .filter((r) => r.F > 0)
                .map((r) => (
                  <li key={r.nome} className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold">{r.nome}:</span>
                    imóvel até <Val>{fmt(r.imovel)}</Val> — financiar{" "}
                    <Val>{fmt(r.F)}</Val> · 1ª parc. <Val>{fmt2(r.p1)}</Val>
                  </li>
                ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={copiar}
                className="rounded-[9px] bg-sim-green px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-sim-green-dark"
              >
                {copiado ? "Copiado ✓" : "Copiar resumo p/ WhatsApp"}
              </button>
              <button
                type="button"
                onClick={limpar}
                className="rounded-[9px] border-[1.5px] border-sim-green bg-transparent px-4 py-2.5 text-[13px] font-semibold text-sim-green transition-colors hover:bg-sim-green-soft"
              >
                Limpar
              </button>
            </div>
          </section>
        ) : null}

        {ativo ? (
          <div className="mt-[22px] grid gap-3.5">
            {resultados.map((r) => {
              const isBest = best !== null && r === best && r.F > 0;
              const aviso = avisoDe(r);
              return (
                <article
                  key={r.nome}
                  className={cn(
                    "relative rounded-[14px] border-[1.5px] bg-sim-card px-5 py-[18px] motion-safe:animate-[sim-up_.22s_ease_both]",
                    isBest
                      ? "border-sim-amber bg-gradient-to-t from-sim-amber-soft to-sim-card to-[55%]"
                      : "border-sim-line",
                  )}
                >
                  {isBest ? (
                    <span className="absolute -top-[11px] right-4 rounded-full bg-sim-amber px-2.5 py-1 font-numeric text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white">
                      Maior valor de imóvel
                    </span>
                  ) : null}
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <span className="font-display text-[17px] font-bold">{r.nome}</span>
                    <span className="font-numeric text-right text-[12px] text-sim-ink-soft">
                      {r.taxa} · SAC · 420 meses
                    </span>
                  </div>
                  {r.nota ? (
                    <p className="-mt-1.5 mb-2.5 text-[11.5px] text-sim-ink-soft">{r.nota}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-x-7 gap-y-1.5 border-b border-dashed border-sim-line pb-3">
                    <Kpi label="Valor do imóvel até" value={fmt(r.imovel)} destaque />
                    <Kpi label="Financiamento" value={fmt(r.F)} />
                  </div>
                  <div className="mt-[11px] flex flex-wrap gap-x-7 gap-y-1">
                    <Kpi label="Entrada" value={fmt(r.entradaUsada)} sub />
                    <Kpi label="1ª parcela" value={fmt2(r.p1)} sub />
                    <Kpi label="Última parcela" value={fmt2(r.pu)} sub />
                  </div>
                  {aviso ? (
                    <p className="mt-2.5 text-[12px] font-medium text-sim-amber">{aviso}</p>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-[34px] rounded-[14px] border-[1.5px] border-dashed border-sim-line bg-sim-card px-6 py-[34px] text-center text-sm leading-[1.6] text-sim-ink-soft">
            Nenhuma simulação ainda.
            <br />
            Digite a renda acima — ex.:{" "}
            <span className="font-numeric font-semibold text-sim-ink">8.000</span> — e os quatro
            bancos aparecem aqui.
          </div>
        )}

        <footer className="mt-[34px] border-t border-sim-line pt-4 text-[11.5px] leading-[1.65] text-sim-ink-soft">
          <strong className="text-sim-ink">Base de cálculo:</strong> planilha Renda × Valor
          Financiado — Itaú 11,09% · Bradesco 10,49% · Santander 10,99% a.a. · Sistema SAC · Prazo
          420 meses · LTV 80% (entrada mínima de 20%). Perfis de idade seguem as abas da planilha
          (seguro habitacional varia com a idade).
          <br />
          <strong className="text-sim-ink">Caixa:</strong> taxa de balcão SBPE 2026 (11,49% a.a. +
          TR · sem relacionamento; a partir de 11,19% com relacionamento), calculada com a mesma
          metodologia da planilha. Teto SFH 2026: R$ 2,25 mi.
          <br />
          Simulação estimativa para pré-qualificação — valores finais sujeitos à análise de crédito
          de cada banco.
        </footer>
      </div>
    </div>
  );
}

function Val({ children }: { children: React.ReactNode }) {
  return (
    <strong className="whitespace-nowrap font-numeric font-semibold text-sim-green">
      {children}
    </strong>
  );
}

function Kpi({
  label,
  value,
  destaque,
  sub,
}: {
  label: string;
  value: string;
  destaque?: boolean;
  sub?: boolean;
}) {
  return (
    <div className="min-w-[150px]">
      <div className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-sim-ink-soft">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 font-numeric font-semibold tabular-nums",
          destaque ? "text-[22px] text-sim-green" : "text-[19px]",
          sub && "text-[14.5px] font-medium text-sim-ink",
        )}
      >
        {value}
      </div>
    </div>
  );
}
