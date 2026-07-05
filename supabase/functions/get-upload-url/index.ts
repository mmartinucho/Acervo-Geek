// Edge Function: gera uma presigned URL de PUT no S3 para o app subir a foto do
// item direto ao bucket (o app nunca vê as chaves da AWS — só a URL assinada).
// Segredos (S3_*) ficam no ambiente da função (supabase secrets), nunca no bundle.
import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.20';

const REGION = Deno.env.get('S3_REGION')!;
const BUCKET = Deno.env.get('S3_BUCKET')!;

const aws = new AwsClient({
  accessKeyId: Deno.env.get('S3_ACCESS_KEY_ID')!,
  secretAccessKey: Deno.env.get('S3_SECRET_ACCESS_KEY')!,
  region: REGION,
  service: 's3',
});

const EXT_OK: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { ext = 'jpg' } = await req.json().catch(() => ({}));
  const contentType = EXT_OK[String(ext).toLowerCase()];
  if (!contentType) {
    return new Response(JSON.stringify({ error: 'unsupported_ext' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const key = `uploads/${crypto.randomUUID()}.${ext}`;
  const target = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

  // Presigned PUT válida por 5 min (signQuery = assinatura na query string).
  const signed = await aws.sign(target, {
    method: 'PUT',
    headers: { 'content-type': contentType },
    aws: { signQuery: true, datetime: undefined },
  });

  return new Response(
    JSON.stringify({ uploadUrl: signed.url, key, contentType, expiresIn: 300 }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
