import { Response } from 'express';

const NOT_CONFIGURED_MESSAGE =
  'O MeMimei ainda não está conectado a um banco de dados. Essa funcionalidade estará disponível em breve.';

export function respondNotConfigured(res: Response): void {
  res.status(503).json({ error: NOT_CONFIGURED_MESSAGE, configured: false });
}

const PAYMENTS_NOT_CONFIGURED_MESSAGE = 'O anfitrião ainda não cadastrou uma chave Pix para receber contribuições.';

export function respondPaymentsNotConfigured(res: Response): void {
  res.status(503).json({ error: PAYMENTS_NOT_CONFIGURED_MESSAGE, configured: false });
}
