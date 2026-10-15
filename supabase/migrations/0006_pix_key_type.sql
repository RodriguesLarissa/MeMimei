-- MeMimei — tipo da chave Pix (necessário pra normalizar a chave no formato
-- exato que o DICT do Banco Central espera — sem isso, chaves digitadas com
-- pontuação, por exemplo, não são reconhecidas ao escanear o QR code).

alter table public.profiles
  add column pix_key_type text check (pix_key_type in ('cpf', 'cnpj', 'telefone', 'email', 'aleatoria'));
