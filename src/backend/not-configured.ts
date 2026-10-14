import { Response } from 'express';

const NOT_CONFIGURED_MESSAGE =
  'O MeMimei ainda não está conectado a um banco de dados. Essa funcionalidade estará disponível em breve.';

export function respondNotConfigured(res: Response): void {
  res.status(503).json({ error: NOT_CONFIGURED_MESSAGE, configured: false });
}
