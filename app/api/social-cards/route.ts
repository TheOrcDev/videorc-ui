import { isSocialCapture } from "@/lib/social-capture";
import { getSocialCards, previewOptions } from "@/lib/social-catalog";
import { source } from "@/lib/source";

export const GET = () => {
  if (!isSocialCapture()) {
    return new Response(null, { status: 404 });
  }
  return Response.json(
    { cards: getSocialCards(source.getPages()), previewOptions },
    {
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    }
  );
};
