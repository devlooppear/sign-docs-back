/**
 * Gera um nome de documento baseado no nome do arquivo original e timestamp.
 * Exemplo: contrato_1694012345678
 */
export function generateDocumentName(originalName: string): string {
  const timestamp = Date.now();
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  return `${baseName}_${timestamp}`;
}
