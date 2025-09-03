import {
  IsString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  Length,
  Matches,
} from 'class-validator';
import { UserRole } from '../../../common/enum/user-role.enum';
import { TipoPessoa } from '../../../common/enum/tipo-pessoa.enum';
import { CPF_CNPJ_REGEX } from '../../../common/utils/validation';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsEnum(TipoPessoa)
  tipo_pessoa: TipoPessoa;

  @IsString()
  @IsNotEmpty()
  @Matches(CPF_CNPJ_REGEX, { message: 'CPF ou CNPJ inválido' })
  documento: string;
}
