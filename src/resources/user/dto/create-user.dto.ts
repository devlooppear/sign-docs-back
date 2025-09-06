import {
  IsString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { UserRole } from '../../../common/enum/user-role.enum';
import { TipoPessoa } from '../../../common/enum/tipo-pessoa.enum';
import { CPF_CNPJ_REGEX, STRONG_PASSWORD_REGEX } from '../../../common/utils/validation.util';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(STRONG_PASSWORD_REGEX, {
    message:
      'Password too weak. Must have at least 8 chars, upper, lower, number, special.',
  })
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsEnum(TipoPessoa)
  person_type: TipoPessoa;

  @IsString()
  @IsNotEmpty()
  @Matches(CPF_CNPJ_REGEX, { message: 'Invalid CPF or CNPJ format' })
  document_number: string;
}
