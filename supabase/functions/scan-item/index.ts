// Edge Function: reconhece o item a partir da foto no S3.
// Fluxo: presigned GET no S3 → Claude (visão) extrai {nome, franquia, ...}
// em JSON validado → casa com o catálogo (items) e devolve candidatos.
// Segredos: S3_* (presigned) + ANTHROPIC_API_KEY. SUPABASE_URL/SERVICE_ROLE_KEY
// são injetados automaticamente no ambiente da função.
import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.20';
import { encodeBase64 } from 'https://deno.land/std@0.224.0/encoding/base64.ts';

const REGION = Deno.env.get('S3_REGION')!;
const BUCKET = Deno.env.get('S3_BUCKET')!;
const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const aws = new AwsClient({
  accessKeyId: Deno.env.get('S3_ACCESS_KEY_ID')!,
  secretAccessKey: Deno.env.get('S3_SECRET_ACCESS_KEY')!,
  region: REGION,
  service: 's3',
});

const MEDIA: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

// Esquema de saída estruturada — garante JSON válido do modelo.
const SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Nome do item/carta/figurinha' },
    franchise: { type: 'string', description: 'Franquia/universo (ex.: Pokémon TCG)' },
    category: { type: 'string', enum: ['card', 'sticker', 'figure', 'comic', 'game', 'other'] },
    cardNumber: { type: 'string', description: 'Número/código impresso, se houver' },
    set: { type: 'string', description: 'Coleção/set, se identificável' },
    rarity: { type: 'string', description: 'Raridade, se identificável' },
    confidence: { type: 'number', description: 'Confiança de 0 a 1' },
  },
  required: ['name', 'franchise', 'category', 'confidence'],
  additionalProperties: false,
};

const PROMPT =
  'Identifique o item colecionável nesta foto (carta de TCG, figurinha de álbum, ' +
  'action figure, Funko, HQ ou game). Extraia o nome, a franquia/universo, a ' +
  'categoria, e o número/código, set e raridade se estiverem visíveis. Se não tiver ' +
  'certeza, use confidence baixo. Responda apenas no formato estruturado pedido.';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }
  if (!ANTHROPIC_KEY) {
    return json({ error: 'anthropic_key_missing', message: 'Configure ANTHROPIC_API_KEY.' }, 503);
  }

  const { key } = await req.json().catch(() => ({}));
  if (!key || typeof key !== 'string') {
    return json({ error: 'key_required' }, 400);
  }
  const ext = key.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mediaType = MEDIA[ext] ?? 'image/jpeg';

  // 1. Baixa a foto do S3 via presigned GET.
  const target = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  const signed = await aws.sign(target, { method: 'GET', aws: { signQuery: true } });
  const imgResp = await fetch(signed.url);
  if (!imgResp.ok) {
    return json({ error: 'image_fetch_failed', status: imgResp.status }, 502);
  }
  const b64 = encodeBase64(new Uint8Array(await imgResp.arrayBuffer()));

  // 2. Claude (visão) → extração estruturada.
  const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      output_config: { format: { type: 'json_schema', schema: SCHEMA } },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: b64 } },
            { type: 'text', text: PROMPT },
          ],
        },
      ],
    }),
  });
  if (!aiResp.ok) {
    return json({ error: 'recognition_failed', status: aiResp.status, detail: await aiResp.text() }, 502);
  }
  const ai = await aiResp.json();
  if (ai.stop_reason === 'refusal') {
    return json({ error: 'recognition_refused' }, 422);
  }
  const textBlock = (ai.content ?? []).find((b: { type: string }) => b.type === 'text');
  const extracted = JSON.parse(textBlock?.text ?? '{}');

  // 3. Casa com o catálogo (items) usando o service_role (server-side).
  const q =
    `${SUPABASE_URL}/rest/v1/items` +
    `?select=id,name,franchise,category,sticker_number,rarity,is_special` +
    `&name=ilike.*${encodeURIComponent(extracted.name ?? '')}*&limit=5`;
  const catResp = await fetch(q, {
    headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
  });
  const candidates = catResp.ok ? await catResp.json() : [];

  return json({ extracted, candidates, key });
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
