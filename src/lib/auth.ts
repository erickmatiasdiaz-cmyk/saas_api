import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase-client";

export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(callback: (session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  await claimCompanyMembership();
  return data.session;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        company_id: "00000000-0000-4000-8000-000000000001",
        role: "admin"
      }
    }
  });
  if (error) throw error;
  if (data.session) await claimCompanyMembership();
  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

async function claimCompanyMembership() {
  const { error } = await supabase.rpc("claim_demo_company_membership");
  if (error) throw error;
}
