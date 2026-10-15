export type PixKeyType = 'cpf' | 'cnpj' | 'telefone' | 'email' | 'aleatoria';

export interface Profile {
  displayName: string;
  pixKey: string;
  pixKeyType: PixKeyType | '';
  pixCity: string;
}
