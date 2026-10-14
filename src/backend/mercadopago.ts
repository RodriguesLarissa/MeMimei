import { MercadoPagoConfig, Payment } from 'mercadopago';
import { backendEnv, isMercadoPagoConfigured } from './env';

export const mercadoPagoPayment: Payment | null = isMercadoPagoConfigured
  ? new Payment(new MercadoPagoConfig({ accessToken: backendEnv.mercadoPagoAccessToken }))
  : null;
