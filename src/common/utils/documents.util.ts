/**
 * Gera um nome de documento baseado no nome do arquivo original e timestamp.
 * Exemplo: contrato_1694012345678
 */
export function generateDocumentName(originalName: string): string {
  const timestamp = Date.now();
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  return `${baseName}_${timestamp}`;
}

export function getDocumentPublicUrl(
  supabaseUrl: string,
  bucket: string,
  filePath: string,
): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
}
