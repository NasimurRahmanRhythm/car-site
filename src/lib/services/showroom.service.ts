import { createClient } from "@/lib/supabase/server";
import { readImageDimensions } from "@/lib/image-dimensions";
import { validatePanorama } from "@/lib/panorama";
import type { TourScene, TourHotspot, TourSceneWithHotspots } from "@/types/showroom";

const SHOWROOM_360_BUCKET = "showroom-360";

/**
 * Every scene with its hotspots attached, in tour order.
 *
 * Hotspots come back on their parent scene rather than as a flat list because
 * that is how the viewer consumes them — it only ever needs the markers for
 * the room the visitor is standing in.
 */
export async function getTour(): Promise<TourSceneWithHotspots[]> {
  const supabase = await createClient();

  const [scenesResult, hotspotsResult] = await Promise.all([
    supabase.from("tour_scenes").select("*").order("sort_order").order("created_at"),
    supabase.from("tour_hotspots").select("*"),
  ]);

  if (scenesResult.error) {
    console.error("getTour scenes failed:", scenesResult.error.message);
    return [];
  }
  if (hotspotsResult.error) {
    console.error("getTour hotspots failed:", hotspotsResult.error.message);
  }

  const hotspots = hotspotsResult.data ?? [];

  return (scenesResult.data ?? []).map((scene) => ({
    ...scene,
    hotspots: hotspots.filter((hotspot) => hotspot.scene_id === scene.id),
  }));
}

export async function addScene(
  title: string,
  file: File
): Promise<{ scene?: TourScene; error?: string }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const dimensions = readImageDimensions(bytes);

  const problem = validatePanorama(file, dimensions);
  if (problem) return { error: problem };
  if (!dimensions) return { error: "That image could not be read." };

  const supabase = await createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const storagePath = `${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(SHOWROOM_360_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("addScene storage failed:", uploadError.message);
    return { error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(SHOWROOM_360_BUCKET).getPublicUrl(storagePath);

  // The first scene uploaded becomes where the tour opens, so a tour is never
  // left with panoramas but no entry point.
  const { count } = await supabase
    .from("tour_scenes")
    .select("id", { count: "exact", head: true });
  const existingCount = count ?? 0;

  const { data, error } = await supabase
    .from("tour_scenes")
    .insert({
      title,
      url: publicUrl,
      storage_path: storagePath,
      width: dimensions.width,
      height: dimensions.height,
      sort_order: existingCount,
      is_default: existingCount === 0,
    })
    .select()
    .single();

  if (error) {
    console.error("addScene row insert failed:", error.message);
    await supabase.storage.from(SHOWROOM_360_BUCKET).remove([storagePath]);
    return { error: error.message };
  }

  return { scene: data };
}

export async function deleteScene(sceneId: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: scene } = await supabase
    .from("tour_scenes")
    .select("storage_path, is_default")
    .eq("id", sceneId)
    .maybeSingle();

  if (!scene) return {};

  // Hotspots pointing *into* this scene would otherwise be deleted silently by
  // the cascade, so removing them first is the same outcome stated plainly.
  await supabase.from("tour_hotspots").delete().eq("target_scene_id", sceneId);

  const { error } = await supabase.from("tour_scenes").delete().eq("id", sceneId);
  if (error) {
    console.error("deleteScene failed:", error.message);
    return { error: error.message };
  }

  await supabase.storage.from(SHOWROOM_360_BUCKET).remove([scene.storage_path]);

  // Deleting the entry point would leave the tour with nowhere to open, so the
  // next scene in order inherits the role.
  if (scene.is_default) {
    const { data: next } = await supabase
      .from("tour_scenes")
      .select("id")
      .order("sort_order")
      .limit(1)
      .maybeSingle();

    if (next) await supabase.from("tour_scenes").update({ is_default: true }).eq("id", next.id);
  }

  return {};
}

export async function setDefaultScene(sceneId: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  // A partial unique index allows only one default row, so the old one has to
  // be cleared before the new one is set.
  await supabase.from("tour_scenes").update({ is_default: false }).eq("is_default", true);

  const { error } = await supabase
    .from("tour_scenes")
    .update({ is_default: true })
    .eq("id", sceneId);

  if (error) {
    console.error("setDefaultScene failed:", error.message);
    return { error: error.message };
  }

  return {};
}

export async function addHotspot(input: {
  sceneId: string;
  targetSceneId: string;
  label: string | null;
  pitch: number;
  yaw: number;
}): Promise<{ hotspot?: TourHotspot; error?: string }> {
  if (input.sceneId === input.targetSceneId) {
    return { error: "A hotspot has to lead to a different scene." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tour_hotspots")
    .insert({
      scene_id: input.sceneId,
      target_scene_id: input.targetSceneId,
      label: input.label,
      pitch: input.pitch,
      yaw: input.yaw,
    })
    .select()
    .single();

  if (error) {
    console.error("addHotspot failed:", error.message);
    return { error: error.message };
  }

  return { hotspot: data };
}

export async function deleteHotspot(hotspotId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("tour_hotspots").delete().eq("id", hotspotId);

  if (error) {
    console.error("deleteHotspot failed:", error.message);
    return { error: error.message };
  }

  return {};
}
