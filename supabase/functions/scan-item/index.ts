// Edge Function: reconhece o item a partir da foto no S3, via Claude no
// Amazon Bedrock (cobrado na conta AWS — sem chave direta da Anthropic).
// Fluxo: presigned GET no S3 → Bedrock InvokeModel (Claude visão) extrai
// {nome, franquia, ...} em JSON → casa com o catálogo (items) e devolve candidatos.
// Segredos: S3_* (mesmo IAM, com bedrock:InvokeModel), BEDROCK_REGION, BEDROCK_MODEL.
// SUPABASE_URL/SERVICE_ROLE_KEY são injetados automaticamente.
import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.20';
import { encodeBase64 } from 'https://deno.land/std@0.224.0/encoding/base64.ts';

const REGION = Deno.env.get('S3_REGION')!;
const BUCKET = Deno.env.get('S3_BUCKET')!;
const BEDROCK_REGION = Deno.env.get('BEDROCK_REGION') ?? 'sa-east-1';
const BEDROCK_MODEL = Deno.env.get('BEDROCK_MODEL') ?? 'global.anthropic.claude-haiku-4-5-20251001-v1:0';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const accessKeyId = Deno.env.get('S3_ACCESS_KEY_ID')!;
const secretAccessKey = Deno.env.get('S3_SECRET_ACCESS_KEY')!;
const s3 = new AwsClient({ accessKeyId, secretAccessKey, region: REGION, service: 's3' });
const bedrock = new AwsClient({ accessKeyId, secretAccessKey, region: BEDROCK_REGION, service: 'bedrock' });

const MEDIA: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const PROMPT =
  'Identifique o item colecionável nesta foto (carta de TCG, figurinha de álbum, ' +
  'action figure, Funko, HQ ou game). Responda APENAS com um objeto JSON válido, ' +
  'sem texto ao redor, com as chaves: name (string), franchise (string), category ' +
  '(um de: card, sticker, figure, comic, game, other), cardNumber (string ou ""), ' +
  'set (string ou ""), rarity (string ou ""), confidence (número de 0 a 1). Se não ' +
  'tiver certeza, use confidence baixo.';

interface Recognized {
  name?: string;
  franchise?: string;
  category?: string;
  cardNumber?: string;
  set?: string;
  rarity?: string;
  confidence?: number;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const { key } = await req.json().catch(() => ({}));
  if (!key || typeof key !== 'string') return json({ error: 'key_required' }, 400);
  const ext = key.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mediaType = MEDIA[ext] ?? 'image/jpeg';

  // 1. Baixa a foto do S3 via presigned GET.
  const target = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  const signedGet = await s3.sign(target, { method: 'GET', aws: { signQuery: true } });
  const imgResp = await fetch(signedGet.url);
  if (!imgResp.ok) return json({ error: 'image_fetch_failed', status: imgResp.status }, 502);
  const b64 = encodeBase64(new Uint8Array(await imgResp.arrayBuffer()));

  // 2. Claude no Bedrock (visão) → JSON.
  const bedrockUrl =
    `https://bedrock-runtime.${BEDROCK_REGION}.amazonaws.com/model/` +
    `${encodeURIComponent(BEDROCK_MODEL)}/invoke`;
  const bedrockBody = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: b64 } },
          { type: 'text', text: PROMPT },
        ],
      },
    ],
  });
  const signed = await bedrock.sign(bedrockUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: bedrockBody,
  });
  const aiResp = await fetch(signed);
  if (!aiResp.ok) {
    return json({ error: 'recognition_failed', status: aiResp.status, detail: await aiResp.text() }, 502);
  }
  const ai = await aiResp.json();
  const text = (ai.content ?? []).find((b: { type: string }) => b.type === 'text')?.text ?? '';
  const extracted = parseJson(text);
  if (!extracted) return json({ error: 'unrecognized', raw: text.slice(0, 200) }, 422);

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

// Extrai o primeiro objeto JSON do texto (o modelo pode envolver em prosa).
function parseJson(text: string): Recognized | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as Recognized;
  } catch {
    return null;
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
