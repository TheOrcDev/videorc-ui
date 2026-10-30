import { serializeJsonLd } from "@/lib/json-ld";
import type { JsonLd as JsonLdData } from "@/lib/json-ld";

/** Structured data in the page, as Next's JSON-LD guide recommends. */
export const JsonLd = ({ data }: { data: JsonLdData }) => (
  <script
    // oxlint-disable-next-line react/no-danger -- JSON-LD has to be the script's text; serializeJsonLd escapes `<`.
    dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    type="application/ld+json"
  />
);
