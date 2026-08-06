# Guia para agentes e contribuidores

Stack: React + TanStack Start/Router, Vite, Tailwind CSS e Supabase.

- Código da aplicação em `src/`; as rotas ficam em `src/routes/`.
- O build estático publicado no GitHub Pages usa `pages/` com `vite.pages.config.ts` e roda no workflow `.github/workflows/pages.yml`.
- Cada push na branch `main` dispara o deploy, então mantenha a branch sempre em estado funcional.
- Evite reescrever histórico já publicado (force push, rebase, amend ou squash de commits já enviados).
- Variáveis de ambiente do Supabase: `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
