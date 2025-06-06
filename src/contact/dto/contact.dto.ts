import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  MaxLength,
} from '@nestjs/class-validator';

export class ContactDto {
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @MaxLength(100, { message: 'Le nom ne peut excéder 100 caractères' })
  nom: string;

  @IsOptional()
  @MaxLength(100, {
    message: "Le nom de l'entreprise ne peut excéder 100 caractères",
  })
  entreprise?: string;

  @IsEmail({}, { message: "L'adresse e-mail n'est pas valide" })
  @IsNotEmpty({ message: "L'adresse e-mail est obligatoire" })
  email: string;

  @IsNotEmpty({ message: 'Le message est obligatoire' })
  @MaxLength(2000, { message: 'Le message ne peut excéder 2000 caractères' })
  message: string;

  @IsNotEmpty({ message: 'Le lien est obligatoire' })
  @IsUrl({ require_tld: false }, { message: "Le lien n'est pas valide" })
  @MaxLength(500, { message: 'Le lien ne peut excéder 500 caractères' })
  source: string;
}
