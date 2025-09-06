import { registerAs } from '@nestjs/config';
import { DOC_MAX_FILE_SIZE } from '../common/utils/validation.util';

export default registerAs('supabase', () => ({
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_KEY,
  bucket: process.env.SUPABASE_BUCKET || 'docs-sign',
  maxFileSize: DOC_MAX_FILE_SIZE
}));
