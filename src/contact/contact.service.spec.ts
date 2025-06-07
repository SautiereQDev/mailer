import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';

describe('ContactService', () => {
  let service: ContactService;
  let mailerService: MailerService;
  let logger: Logger;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
    mailerService = module.get<MailerService>(MailerService);
    logger = service['logger'];

    // Mock logger methods
    jest.spyOn(logger, 'log').mockImplementation();
    jest.spyOn(logger, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendContactEmail', () => {
    const baseContactDto: ContactDto = {
      nom: 'John Doe',
      email: 'john.doe@example.com',
      message: 'Test message content',
      source: 'https://example.com',
    };

    const contactDtoWithEntreprise: ContactDto = {
      ...baseContactDto,
      company: 'Test Company',
    };

    const contactDtoWithEmptyEntreprise: ContactDto = {
      ...baseContactDto,
      company: '',
    };

    const contactDtoWithWhitespaceEntreprise: ContactDto = {
      ...baseContactDto,
      company: '   ',
    };

    beforeEach(() => {
      process.env.MAIL_FROM_EMAIL = 'admin@example.com';
    });

    it('should send email successfully without entreprise field', async () => {
      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendContactEmail(baseContactDto);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'john.doe@example.com',
        cc: 'admin@example.com',
        subject: 'Nouveau message de John Doe ',
        template: 'contact',
        context: {
          nom: 'John Doe',
          email: 'john.doe@example.com',
          message: 'Test message content',
          source: 'https://example.com',
        },
      });
      expect(logger.log).toHaveBeenCalledWith(
        'E-mail de contact envoyé pour john.doe@example.com',
      );
    });

    it('should send email successfully with entreprise field', async () => {
      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendContactEmail(contactDtoWithEntreprise);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'john.doe@example.com',
        cc: 'admin@example.com',
        subject: 'Nouveau message de John Doe (Test Company)',
        template: 'contact',
        context: {
          nom: 'John Doe',
          email: 'john.doe@example.com',
          message: 'Test message content',
          source: 'https://example.com',
          entreprise: 'Test Company',
        },
      });
      expect(logger.log).toHaveBeenCalledWith(
        'E-mail de contact envoyé pour john.doe@example.com',
      );
    });

    it('should not include entreprise in context when entreprise is empty string', async () => {
      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendContactEmail(contactDtoWithEmptyEntreprise);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'john.doe@example.com',
        cc: 'admin@example.com',
        subject: 'Nouveau message de John Doe ',
        template: 'contact',
        context: {
          nom: 'John Doe',
          email: 'john.doe@example.com',
          message: 'Test message content',
          source: 'https://example.com',
        },
      });
    });

    it('should not include entreprise in context when entreprise is only whitespace', async () => {
      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendContactEmail(contactDtoWithWhitespaceEntreprise);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'john.doe@example.com',
        cc: 'admin@example.com',
        subject: 'Nouveau message de John Doe ',
        template: 'contact',
        context: {
          nom: 'John Doe',
          email: 'john.doe@example.com',
          message: 'Test message content',
          source: 'https://example.com',
        },
      });
    });

    it('should handle undefined entreprise field', async () => {
      mockMailerService.sendMail.mockResolvedValue(undefined);
      const contactWithUndefinedEntreprise = {
        ...baseContactDto,
        entreprise: undefined,
      };

      await service.sendContactEmail(contactWithUndefinedEntreprise);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'john.doe@example.com',
        cc: 'admin@example.com',
        subject: 'Nouveau message de John Doe ',
        template: 'contact',
        context: {
          nom: 'John Doe',
          email: 'john.doe@example.com',
          message: 'Test message content',
          source: 'https://example.com',
        },
      });
    });

    it('should log error and rethrow when mailer service fails', async () => {
      const error = new Error('SMTP connection failed');
      mockMailerService.sendMail.mockRejectedValue(error);

      await expect(service.sendContactEmail(baseContactDto)).rejects.toThrow(
        error,
      );

      expect(logger.error).toHaveBeenCalledWith(
        "Erreur lors de l'envoi du mail de contact",
        error.stack,
      );
    });

    it('should log error correctly for non-Error objects', async () => {
      const error = 'String error';
      mockMailerService.sendMail.mockRejectedValue(error);

      await expect(service.sendContactEmail(baseContactDto)).rejects.toEqual(
        error,
      );

      expect(logger.error).toHaveBeenCalledWith(
        "Erreur lors de l'envoi du mail de contact",
        error,
      );
    });

    it('should handle special characters in contact data', async () => {
      mockMailerService.sendMail.mockResolvedValue(undefined);
      const specialCharContactDto: ContactDto = {
        nom: "Jean-François O'Connor",
        email: 'jean.francois@example.com',
        message: 'Message with special chars: é, è, à, ç, ñ, 中文',
        source: 'https://example.com/path?param=value&other=123',
        company: 'Société & Co.',
      };

      await service.sendContactEmail(specialCharContactDto);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'jean.francois@example.com',
        cc: 'admin@example.com',
        subject: "Nouveau message de Jean-François O'Connor (Société & Co.)",
        template: 'contact',
        context: {
          nom: "Jean-François O'Connor",
          email: 'jean.francois@example.com',
          message: 'Message with special chars: é, è, à, ç, ñ, 中文',
          source: 'https://example.com/path?param=value&other=123',
          entreprise: 'Société & Co.',
        },
      });
    });

    it('should handle long messages', async () => {
      mockMailerService.sendMail.mockResolvedValue(undefined);
      const longMessage = 'A'.repeat(1999); // Just under the 2000 character limit
      const longMessageContactDto: ContactDto = {
        ...baseContactDto,
        message: longMessage,
      };

      await service.sendContactEmail(longMessageContactDto);

      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            message: longMessage,
          }),
        }),
      );
    });
  });
});
