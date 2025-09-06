/**
 * Regex para validação de CPF (11 dígitos)
 */
export const CPF_REGEX = /^\d{11}$/;

/**
 * Regex para validação de CNPJ (14 dígitos)
 */
export const CNPJ_REGEX = /^\d{14}$/;

/**
 * Regex para validação genérica de CPF ou CNPJ
 */
export const CPF_CNPJ_REGEX = /^\d{11}$|^\d{14}$/;

/**
 * Regex para validação de senha forte
 */
export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export const DOC_MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Valida se a string fornecida é um CPF válido
 */
export function isCPF(cpf: string): boolean {
  return CPF_REGEX.test(cpf);
}

/**
 * Valida se a string fornecida é um CNPJ válido
 */
export function isCNPJ(cnpj: string): boolean {
  return CNPJ_REGEX.test(cnpj);
}

/**
 * Valida se é CPF ou CNPJ
 */
export function isCPFOrCNPJ(value: string): boolean {
  return CPF_REGEX.test(value) || CNPJ_REGEX.test(value);
}
