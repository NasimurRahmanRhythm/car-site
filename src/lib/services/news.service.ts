import { createClient } from "@/lib/supabase/server";
import type { NewsPost } from "@/types/news";

export async function getLatestNews(limit = 5): Promise<NewsPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getLatestNews failed:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getAllNews(): Promise<NewsPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("getAllNews failed:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getNewsBySlug failed:", error.message);
    return null;
  }

  return data;
}

export async function getAllNewsSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("news").select("slug, updated_at");

  if (error) {
    console.error("getAllNewsSlugs failed:", error.message);
    return [];
  }

  return data ?? [];
}
