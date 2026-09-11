"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateUploadedFile } from "@/lib/file-validation";

export async function createDeliverable(formData) {
  const clientId = formData.get("client_id")?.toString();
  const title = formData.get("title")?.toString().trim();
  const file = formData.get("file");

  if (!clientId || !title) return { error: "Client and title are required." };

  const fileError = validateUploadedFile(file);
  if (fileError) return { error: fileError };

  const supabase = await createClient();
  const path = `${clientId}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("deliverables")
    .upload(path, file, { contentType: file.type || "application/octet-stream" });

  if (uploadError) {
    return { error: "Couldn't upload the file. Please try again." };
  }

  const { error } = await supabase.from("deliverables").insert({
    client_id: clientId,
    project_id: formData.get("project_id")?.toString() || null,
    title,
    description: formData.get("description")?.toString().trim() || null,
    file_path: path,
    file_name: file.name,
  });

  if (error) {
    await supabase.storage.from("deliverables").remove([path]);
    return { error: "Couldn't save the deliverable. Please try again." };
  }

  revalidatePath("/dashboard/deliverables");
  return { success: true };
}

export async function updateDeliverableStatus(deliverableId, status) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("deliverables")
    .update({ status })
    .eq("id", deliverableId);

  if (error) return { error: "Couldn't update the deliverable." };
  revalidatePath("/dashboard/deliverables");
  return { success: true };
}

export async function getDownloadUrl(filePath) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("deliverables")
    .createSignedUrl(filePath, 60 * 5);

  if (error) return { error: "Couldn't generate a download link." };
  return { url: data.signedUrl };
}
