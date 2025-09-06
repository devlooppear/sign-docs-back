import { TipoPessoa } from '../enum/tipo-pessoa.enum';

export function formatCpfCnpj(doc: string, tipo: string) {
  if (tipo === TipoPessoa.PF) {
    return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else {
    return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
}

export function generateSignatureHash({
  id,
  name,
  document_number,
  code,
}: {
  id: number;
  name: string;
  document_number: string;
  code: number;
}) {
  return require('crypto')
    .createHash('sha1')
    .update(`${id}|${name}|${document_number}|${code}`)
    .digest('hex');
}
