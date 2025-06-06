import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ContactDto } from './contact.dto';

describe('ContactDto', () => {
  const validData = {
    nom: 'John Doe',
    email: 'john.doe@example.com',
    message: 'This is a test message',
    source: 'https://example.com',
  };

  describe('Valid cases', () => {
    it('should validate successfully with all required fields', async () => {
      const dto = plainToClass(ContactDto, validData);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate successfully with entreprise field', async () => {
      const dataWithEntreprise = {
        ...validData,
        entreprise: 'Test Company',
      };
      const dto = plainToClass(ContactDto, dataWithEntreprise);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate successfully without entreprise field', async () => {
      const dto = plainToClass(ContactDto, validData);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate successfully with empty entreprise', async () => {
      const dataWithEmptyEntreprise = {
        ...validData,
        entreprise: '',
      };
      const dto = plainToClass(ContactDto, dataWithEmptyEntreprise);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate URLs without TLD requirement', async () => {
      const dataWithLocalUrl = {
        ...validData,
        source: 'http://localhost:3000',
      };
      const dto = plainToClass(ContactDto, dataWithLocalUrl);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Invalid nom field', () => {
    it('should fail validation when nom is empty', async () => {
      const invalidData = { ...validData, nom: '' };
      const dto = plainToClass(ContactDto, invalidData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('nom');
      expect(errors[0].constraints?.isNotEmpty).toBe('Le nom est obligatoire');
    });

    it('should fail validation when nom is missing', async () => {
      const { nom, ...invalidData } = validData;
      const dto = plainToClass(ContactDto, invalidData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('nom');
      expect(errors[0].constraints?.isNotEmpty).toBe('Le nom est obligatoire');
    });

    it('should fail validation when nom exceeds 100 characters', async () => {
      const invalidData = { ...validData, nom: 'A'.repeat(101) };
      const dto = plainToClass(ContactDto, invalidData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('nom');
      expect(errors[0].constraints?.maxLength).toBe(
        'Le nom ne peut excéder 100 caractères',
      );
    });

    it('should validate successfully when nom is exactly 100 characters', async () => {
      const validDataWithMaxNom = { ...validData, nom: 'A'.repeat(100) };
      const dto = plainToClass(ContactDto, validDataWithMaxNom);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Invalid entreprise field', () => {
    it('should fail validation when entreprise exceeds 100 characters', async () => {
      const invalidData = { ...validData, entreprise: 'A'.repeat(101) };
      const dto = plainToClass(ContactDto, invalidData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('entreprise');
      expect(errors[0].constraints?.maxLength).toBe(
        "Le nom de l'entreprise ne peut excéder 100 caractères",
      );
    });

    it('should validate successfully when entreprise is exactly 100 characters', async () => {
      const validDataWithMaxEntreprise = {
        ...validData,
        entreprise: 'A'.repeat(100),
      };
      const dto = plainToClass(ContactDto, validDataWithMaxEntreprise);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Invalid email field', () => {
    it('should fail validation when email is empty', async () => {
      const invalidData = { ...validData, email: '' };
      const dto = plainToClass(ContactDto, invalidData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints?.isNotEmpty).toBe(
        "L'adresse e-mail est obligatoire",
      );
    });

    it('should fail validation when email is missing', async () => {
      const { email, ...invalidData } = validData;
      const dto = plainToClass(ContactDto, invalidData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints?.isNotEmpty).toBe(
        "L'adresse e-mail est obligatoire",
      );
    });

    it('should fail validation when email format is invalid', async () => {
      const invalidData = { ...validData, email: 'invalid-email' };
      const dto = plainToClass(ContactDto, invalidData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints?.isEmail).toBe(
        "L'adresse e-mail n'est pas valide",
      );
    });

    it('should validate various valid email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'firstname-lastname@example-domain.com',
        'user123@123domain.com',
      ];

      for (const email of validEmails) {
        const data = { ...validData, email };
        const dto = plainToClass(ContactDto, data);
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('Invalid message field', () => {
    it('should fail validation when message is empty', async () => {
      const invalidData = { ...validData, message: '' };
      const dto = plainToClass(ContactDto, invalidData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('message');
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'Le message est obligatoire',
      );
    });

    it('should fail validation when message is missing', async () => {
      const { message, ...invalidData } = validData;
      const dto = plainToClass(ContactDto, invalidData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('message');
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'Le message est obligatoire',
      );
    });

    it('should fail validation when message exceeds 2000 characters', async () => {
      const invalidData = { ...validData, message: 'A'.repeat(2001) };
      const dto = plainToClass(ContactDto, invalidData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('message');
      expect(errors[0].constraints?.maxLength).toBe(
        'Le message ne peut excéder 2000 caractères',
      );
    });

    it('should validate successfully when message is exactly 2000 characters', async () => {
      const validDataWithMaxMessage = {
        ...validData,
        message: 'A'.repeat(2000),
      };
      const dto = plainToClass(ContactDto, validDataWithMaxMessage);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Invalid source field', () => {
    it('should fail validation when source is missing', async () => {
      const { source, ...invalidData } = validData;
      const dto = plainToClass(ContactDto, invalidData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('source');
      expect(errors[0].constraints?.isNotEmpty).toBe('Le lien est obligatoire');
    });

    it('should fail validation when source is not a valid URL', async () => {
      const invalidData = {
        ...validData,
        source: 'invalid url without protocol',
      };
      const dto = plainToClass(ContactDto, invalidData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('source');
      expect(errors[0].constraints?.isUrl).toBe("Le lien n'est pas valide");
    });

    it('should fail validation when source exceeds 500 characters', async () => {
      const longUrl = 'https://example.com/' + 'A'.repeat(500);
      const invalidData = { ...validData, source: longUrl };
      const dto = plainToClass(ContactDto, invalidData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('source');
      expect(errors[0].constraints?.maxLength).toBe(
        'Le lien ne peut excéder 500 caractères',
      );
    });

    it('should validate various valid URL formats', async () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://subdomain.example.com/path?param=value',
        'http://192.168.1.1:8080',
        'ftp://ftp.example.com',
      ];

      for (const source of validUrls) {
        const data = { ...validData, source };
        const dto = plainToClass(ContactDto, data);
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('Multiple validation errors', () => {
    it('should return multiple errors for multiple invalid fields', async () => {
      const invalidData = {
        nom: '', // Missing nom
        email: 'invalid-email', // Invalid email
        message: '', // Missing message
        source: '', // Empty source (will fail IsNotEmpty)
        entreprise: undefined, // Explicitly set to undefined
      };
      const dto = plainToClass(ContactDto, invalidData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(4);
      const errorProperties = errors.map((error) => error.property);
      expect(errorProperties).toContain('nom');
      expect(errorProperties).toContain('email');
      expect(errorProperties).toContain('message');
      expect(errorProperties).toContain('source');
    });
  });
});
