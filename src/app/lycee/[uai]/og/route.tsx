import { renderShareImage } from "@/lib/share-image";

export async function GET(_req: Request, { params }: { params: Promise<{ uai: string }> }) {
  return renderShareImage((await params).uai, "og");
}
