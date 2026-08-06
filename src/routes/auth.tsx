import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { cloudAuth } from "@/integrations/cloud-auth/index";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Central de Qualificação de Leads" },
      {
        name: "description",
        content:
          "Acesse sua conta para qualificar leads imobiliários e manter todas as fichas salvas na nuvem.",
      },
      { property: "og:title", content: "Entrar — Central de Qualificação de Leads" },
      {
        property: "og:description",
        content: "Login da central de pré-vendas imobiliárias: suas fichas de leads sincronizadas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/" });
  }, [loading, session, navigate]);

  const submeter = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Conta criada. Verifique seu e-mail para confirmar o acesso.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível concluir");
    } finally {
      setEnviando(false);
    }
  };

  const entrarComGoogle = async () => {
    const result = await cloudAuth.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar com o Google");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Central de Qualificação de Leads
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          MySide · entre para acessar suas fichas
        </p>

        <form onSubmit={submeter} className="mt-6 space-y-3">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
          />
          <Input
            type="password"
            required
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            autoComplete={modo === "entrar" ? "current-password" : "new-password"}
          />
          <Button type="submit" className="w-full" disabled={enviando}>
            {modo === "entrar" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <Button variant="outline" className="mt-3 w-full" onClick={entrarComGoogle}>
          Continuar com Google
        </Button>

        <button
          type="button"
          onClick={() => setModo(modo === "entrar" ? "criar" : "entrar")}
          className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          {modo === "entrar" ? "Não tem conta? Criar agora" : "Já tem conta? Entrar"}
        </button>
      </div>
    </div>
  );
}
