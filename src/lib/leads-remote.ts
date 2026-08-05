import { supabase } from "@/integrations/supabase/client";
import { novoLead, type Etapa, type Lead } from "@/lib/leads";

type Row = {
  id: string;
  nome: string;
  etapa: string;
  hubspot_url: string;
  dados: Record<string, unknown> | null;
  updated_at: string;
};

function rowToLead(row: Row): Lead {
  return {
    ...novoLead(),
    ...(row.dados as Partial<Lead>),
    id: row.id,
    nome: row.nome,
    etapa: row.etapa as Etapa,
    hubspotUrl: row.hubspot_url,
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

function leadToRow(lead: Lead, userId: string) {
  const { id, nome, etapa, hubspotUrl, updatedAt: _updatedAt, ...dados } = lead;
  return {
    id,
    user_id: userId,
    nome,
    etapa,
    hubspot_url: hubspotUrl,
    dados: dados as unknown as Record<string, unknown>,
  };
}

export async function fetchLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("id, nome, etapa, hubspot_url, dados, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as Row[]).map(rowToLead);
}

export async function saveLead(lead: Lead, userId: string): Promise<void> {
  const { error } = await supabase.from("leads").upsert(leadToRow(lead, userId));
  if (error) throw error;
}

export async function removeLead(id: string): Promise<void> {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
}
