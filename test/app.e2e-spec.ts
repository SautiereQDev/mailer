import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { MailerService } from '@nestjs-modules/mailer';
import { AppModule } from './../src/app.module';

describe('Contact API (e2e)', () => {
  let app: INestApplication;
  let mailerService: MailerService;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  beforeAll(async () => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.MAIL_HOST = 'localhost';
    process.env.MAIL_PORT = '1025';
    process.env.MAIL_USER = '';
    process.env.MAIL_PASSWORD = '';
    process.env.MAIL_FROM_NAME = 'Test Mailer';
    process.env.MAIL_FROM_EMAIL = 'test@example.com';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailerService)
      .useValue(mockMailerService)
      .compile();

    app = moduleFixture.createNestApplication();
    
    // Configure global validation pipe to match main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        errorHttpStatusCode: 400,
      }),
    );

    mailerService = moduleFixture.get<MailerService>(MailerService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockMailerService.sendMail.mockResolvedValue(undefined);
  });

  describe('/contact (POST)', () => {
    const validContactData = {
      nom: 'John Doe',
      email: 'john.doe@example.com',
      message: 'This is a test message',
      source: 'https://example.com',
    };

    const validContactDataWithEntreprise = {
      ...validContactData,
      entreprise: 'Test Company',
    };

    describe('Successful requests', () => {
      it('should successfully send contact email without entreprise', () => {
        return request(app.getHttpServer())
          .post('/contact')
          .send(validContactData)
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body).toEqual({
              success: true,
              message: 'E-mail envoyé avec succès',
            });
            expect(mockMailerService.sendMail).toHaveBeenCalledWith({
              to: 'john.doe@example.com',
              cc: 'test@example.com',
              subject: 'Nouveau message de John Doe ',
              template: 'contact',
              context: {
                nom: 'John Doe',
                email: 'john.doe@example.com',
                message: 'This is a test message',
                source: 'https://example.com',
              },
            });
          });
      });

      it('should successfully send contact email with entreprise', () => {
        return request(app.getHttpServer())
          .post('/contact')
          .send(validContactDataWithEntreprise)
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body).toEqual({
              success: true,
              message: 'E-mail envoyé avec succès',
            });
            expect(mockMailerService.sendMail).toHaveBeenCalledWith({
              to: 'john.doe@example.com',
              cc: 'test@example.com',
              subject: 'Nouveau message de John Doe (Test Company)',
              template: 'contact',
              context: {
                nom: 'John Doe',
                email: 'john.doe@example.com',
                message: 'This is a test message',
                source: 'https://example.com',
                entreprise: 'Test Company',
              },
            });
          });
      });

      it('should handle contact with empty entreprise field', () => {
        const dataWithEmptyEntreprise = {
          ...validContactData,
          entreprise: '',
        };

        return request(app.getHttpServer())
          .post('/contact')
          .send(dataWithEmptyEntreprise)
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body).toEqual({
              success: true,
              message: 'E-mail envoyé avec succès',
            });
            expect(mockMailerService.sendMail).toHaveBeenCalledWith({
              to: 'john.doe@example.com',
              cc: 'test@example.com',
              subject: 'Nouveau message de John Doe ',
              template: 'contact',
              context: {
                nom: 'John Doe',
                email: 'john.doe@example.com',
                message: 'This is a test message',
                source: 'https://example.com',
              },
            });
          });
      });

      it('should handle contact with whitespace-only entreprise field', () => {
        const dataWithWhitespaceEntreprise = {
          ...validContactData,
          entreprise: '   ',
        };

        return request(app.getHttpServer())
          .post('/contact')
          .send(dataWithWhitespaceEntreprise)
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(mockMailerService.sendMail).toHaveBeenCalledWith(
              expect.objectContaining({
                context: expect.not.objectContaining({
                  entreprise: expect.anything(),
                }),
              }),
            );
          });
      });

      it('should handle special characters in contact data', () => {
        const specialCharData = {
          nom: 'Jean-François O\'Connor',
          email: 'jean.francois@example.com',
          message: 'Message with special chars: é, è, à, ç, ñ, 中文',
          source: 'https://example.com/path?param=value&other=123',
          entreprise: 'Société & Co.',
        };

        return request(app.getHttpServer())
          .post('/contact')
          .send(specialCharData)
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(mockMailerService.sendMail).toHaveBeenCalledWith({
              to: 'jean.francois@example.com',
              cc: 'test@example.com',
              subject: 'Nouveau message de Jean-François O\'Connor (Société & Co.)',
              template: 'contact',
              context: {
                nom: 'Jean-François O\'Connor',
                email: 'jean.francois@example.com',
                message: 'Message with special chars: é, è, à, ç, ñ, 中文',
                source: 'https://example.com/path?param=value&other=123',
                entreprise: 'Société & Co.',
              },
            });
          });
      });
    });

    describe('Validation errors', () => {
      it('should return 400 when nom is missing', () => {
        const { nom, ...invalidData } = validContactData;
        return request(app.getHttpServer())
          .post('/contact')
          .send(invalidData)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toContain('Le nom est obligatoire');
            expect(mockMailerService.sendMail).not.toHaveBeenCalled();
          });
      });

      it('should return 400 when nom is empty', () => {
        const invalidData = { ...validContactData, nom: '' };
        return request(app.getHttpServer())
          .post('/contact')
          .send(invalidData)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toContain('Le nom est obligatoire');
          });
      });

      it('should return 400 when nom exceeds 100 characters', () => {
        const invalidData = { ...validContactData, nom: 'A'.repeat(101) };
        return request(app.getHttpServer())
          .post('/contact')
          .send(invalidData)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toContain('Le nom ne peut excéder 100 caractères');
          });
      });

      it('should return 400 when email is missing', () => {
        const { email, ...invalidData } = validContactData;
        return request(app.getHttpServer())
          .post('/contact')
          .send(invalidData)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toContain("L'adresse e-mail est obligatoire");
          });
      });

      it('should return 400 when email format is invalid', () => {
        const invalidData = { ...validContactData, email: 'invalid-email' };
        return request(app.getHttpServer())
          .post('/contact')
          .send(invalidData)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toContain("L'adresse e-mail n'est pas valide");
          });
      });

      it('should return 400 when message is missing', () => {
        const { message, ...invalidData } = validContactData;
        return request(app.getHttpServer())
          .post('/contact')
          .send(invalidData)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toContain('Le message est obligatoire');
          });
      });

      it('should return 400 when message exceeds 2000 characters', () => {
        const invalidData = { ...validContactData, message: 'A'.repeat(2001) };
        return request(app.getHttpServer())
          .post('/contact')
          .send(invalidData)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toContain('Le message ne peut excéder 2000 caractères');
          });
      });

      it('should return 400 when source is not a valid URL', () => {
        const invalidData = { ...validContactData, source: 'not-a-url' };
        return request(app.getHttpServer())
          .post('/contact')
          .send(invalidData)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toContain("Le lien n'est pas valide");
          });
      });

      it('should return 400 when source exceeds 500 characters', () => {
        const longUrl = 'https://example.com/' + 'A'.repeat(500);
        const invalidData = { ...validContactData, source: longUrl };
        return request(app.getHttpServer())
          .post('/contact')
          .send(invalidData)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toContain('Le lien ne peut excéder 500 caractères');
          });
      });

      it('should return 400 when entreprise exceeds 100 characters', () => {
        const invalidData = { ...validContactData, entreprise: 'A'.repeat(101) };
        return request(app.getHttpServer())
          .post('/contact')
          .send(invalidData)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(res.body.message).toContain("Le nom de l'entreprise ne peut excéder 100 caractères");
          });
      });

      it('should return 400 with multiple validation errors', () => {
        const invalidData = {
          nom: '',
          email: 'invalid-email',
          message: '',
          source: 'not-a-url',
          entreprise: 'A'.repeat(101),
        };
        return request(app.getHttpServer())
          .post('/contact')
          .send(invalidData)
          .expect(HttpStatus.BAD_REQUEST)
          .expect((res) => {
            expect(Array.isArray(res.body.message)).toBe(true);
            expect(res.body.message.length).toBeGreaterThan(1);
          });
      });

      it('should return 400 when unknown fields are provided', () => {
        const invalidData = {
          ...validContactData,
          unknownField: 'should be rejected',
          anotherUnknownField: 123,
        };
        return request(app.getHttpServer())
          .post('/contact')
          .send(invalidData)
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('Server errors', () => {
      it('should return 500 when mailer service fails', () => {
        mockMailerService.sendMail.mockRejectedValue(new Error('SMTP connection failed'));

        return request(app.getHttpServer())
          .post('/contact')
          .send(validContactData)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it('should return 500 when mailer service throws custom error', () => {
        mockMailerService.sendMail.mockRejectedValue(new Error('Template not found'));

        return request(app.getHttpServer())
          .post('/contact')
          .send(validContactData)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('Content-Type validation', () => {
      it('should accept application/json content-type', () => {
        return request(app.getHttpServer())
          .post('/contact')
          .set('Content-Type', 'application/json')
          .send(validContactData)
          .expect(HttpStatus.OK);
      });

      it('should reject non-JSON content-type', () => {
        return request(app.getHttpServer())
          .post('/contact')
          .set('Content-Type', 'text/plain')
          .send('invalid data')
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('HTTP Methods', () => {
      it('should reject GET requests', () => {
        return request(app.getHttpServer())
          .get('/contact')
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should reject PUT requests', () => {
        return request(app.getHttpServer())
          .put('/contact')
          .send(validContactData)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should reject DELETE requests', () => {
        return request(app.getHttpServer())
          .delete('/contact')
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should reject PATCH requests', () => {
        return request(app.getHttpServer())
          .patch('/contact')
          .send(validContactData)
          .expect(HttpStatus.NOT_FOUND);
      });
    });
  });

  describe('Health check', () => {
    it('should respond to root path', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(HttpStatus.NOT_FOUND); // Since we don't have a root controller
    });
  });

  describe('Edge cases', () => {
    it('should handle maximum valid field lengths', () => {
      const maxLengthData = {
        nom: 'A'.repeat(100),
        email: 'test@example.com',
        message: 'M'.repeat(2000),
        source: 'https://example.com/' + 'P'.repeat(470), // Total ~500 chars
        entreprise: 'E'.repeat(100),
      };

      return request(app.getHttpServer())
        .post('/contact')
        .send(maxLengthData)
        .expect(HttpStatus.OK);
    });

    it('should handle minimum valid data', () => {
      const minData = {
        nom: 'A',
        email: 'a@b.co',
        message: 'M',
        source: 'http://a.co',
      };

      return request(app.getHttpServer())
        .post('/contact')
        .send(minData)
        .expect(HttpStatus.OK);
    });

    it('should handle various valid URL formats in source', async () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://subdomain.example.com/path?param=value',
        'http://192.168.1.1:8080',
        'ftp://ftp.example.com',
      ];

      for (const source of validUrls) {
        const data = { ...validContactData, source };
        await request(app.getHttpServer())
          .post('/contact')
          .send(data)
          .expect(HttpStatus.OK);
      }
    });
  });
});
