import { createStaticPix, hasError } from 'pix-utils';

export type PixKeyType = 'cpf' | 'cnpj' | 'telefone' | 'email' | 'aleatoria';

/**
 * Converte a chave pro formato exato que o DICT do Banco Central espera.
 * Sem isso, uma chave digitada com pontuação (CPF "123.456.789-00") ou sem o
 * DDI (telefone "11999999999") é um valor diferente do que está registrado —
 * o app do banco escaneia e diz que a chave "não está registrada".
 */
export function normalizePixKey(raw: string, type: PixKeyType): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  switch (type) {
    case 'cpf': {
      const digits = trimmed.replace(/\D/g, '');
      return digits.length === 11 ? digits : null;
    }
    case 'cnpj': {
      const digits = trimmed.replace(/\D/g, '');
      return digits.length === 14 ? digits : null;
    }
    case 'telefone': {
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length === 10 || digits.length === 11) return `+55${digits}`;
      if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) return `+${digits}`;
      return null;
    }
    case 'email': {
      const lower = trimmed.toLowerCase();
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower) ? lower : null;
    }
    case 'aleatoria': {
      const lower = trimmed.toLowerCase();
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(lower) ? lower : null;
    }
  }
}

interface BuildPixInput {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  infoAdicional?: string;
}

interface BuiltPix {
  brCode: string;
  qrCodeBase64: string;
}

/** Gera o Pix "copia e cola" (BR Code) e o QR code, direto da chave do anfitrião — sem nenhum provedor de pagamento no meio. */
export async function buildPix(input: BuildPixInput): Promise<BuiltPix | null> {
  const pix = createStaticPix({
    pixKey: input.pixKey,
    merchantName: input.merchantName.slice(0, 25),
    merchantCity: input.merchantCity.slice(0, 15),
    transactionAmount: input.amount,
    infoAdicional: input.infoAdicional?.slice(0, 50),
  });

  if (hasError(pix)) {
    return null;
  }

  const brCode = pix.toBRCode();
  const dataUrl = await pix.toImage();

  return { brCode, qrCodeBase64: dataUrl.replace(/^data:image\/png;base64,/, '') };
}
