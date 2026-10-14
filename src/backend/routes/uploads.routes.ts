import { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { supabaseAdmin } from '../supabase-admin';
import { requireAuth } from '../middleware/require-auth';
import { respondNotConfigured } from '../not-configured';

export const uploadsRouter = Router();
uploadsRouter.use(requireAuth);

const BUCKET = 'event-images';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

uploadsRouter.post('/', upload.single('file'), async (req, res) => {
  if (!supabaseAdmin) {
    respondNotConfigured(res);
    return;
  }

  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    return;
  }
  if (!file.mimetype.startsWith('image/')) {
    res.status(400).json({ error: 'Escolha um arquivo de imagem (JPG, PNG, WEBP...).' });
    return;
  }

  const extension = file.originalname.includes('.') ? file.originalname.split('.').pop() : 'jpg';
  const path = `${req.session.userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, file.buffer, {
    contentType: file.mimetype,
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    res.status(500).json({ error: 'Não foi possível enviar a imagem. Tente novamente.' });
    return;
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  res.status(201).json({ url: data.publicUrl });
});

uploadsRouter.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ error: 'A imagem precisa ter no máximo 5MB.' });
    return;
  }
  next(err);
});

const deleteSchema = z.object({ url: z.string() });

function extractPath(url: string): string | null {
  const marker = `/${BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}

uploadsRouter.delete('/', async (req, res) => {
  if (!supabaseAdmin) {
    respondNotConfigured(res);
    return;
  }

  const parsed = deleteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'URL inválida.' });
    return;
  }

  const path = extractPath(parsed.data.url);
  if (path) {
    await supabaseAdmin.storage.from(BUCKET).remove([path]);
  }

  res.json({ success: true });
});
