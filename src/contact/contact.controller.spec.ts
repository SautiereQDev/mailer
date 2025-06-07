import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';

describe('ContactController', () => {
  let controller: ContactController;
  let service: ContactService;

  const mockContactService = {
    sendContactEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [
        {
          provide: ContactService,
          useValue: mockContactService,
        },
      ],
    }).compile();

    controller = module.get<ContactController>(ContactController);
    service = module.get<ContactService>(ContactService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('receiveContact', () => {
    const validContactDto: ContactDto = {
      nom: 'John Doe',
      email: 'john.doe@example.com',
      message: 'Test message',
      source: 'https://example.com',
    };

    const validContactDtoWithEntreprise: ContactDto = {
      ...validContactDto,
      entreprise: 'Test Company',
    };

    it('should successfully send contact email and return success response', async () => {
      mockContactService.sendContactEmail.mockResolvedValue(undefined);

      const result = await controller.receiveContact(validContactDto);

      expect(service.sendContactEmail).toHaveBeenCalledWith(validContactDto);
      expect(service.sendContactEmail).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'E-mail envoyé avec succès',
      });
    });

    it('should successfully send contact email with entreprise field', async () => {
      mockContactService.sendContactEmail.mockResolvedValue(undefined);

      const result = await controller.receiveContact(
        validContactDtoWithEntreprise,
      );

      expect(service.sendContactEmail).toHaveBeenCalledWith(
        validContactDtoWithEntreprise,
      );
      expect(service.sendContactEmail).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        message: 'E-mail envoyé avec succès',
      });
    });

    it('should throw error when ContactService fails', async () => {
      const error = new Error('Email service error');
      mockContactService.sendContactEmail.mockRejectedValue(error);

      await expect(controller.receiveContact(validContactDto)).rejects.toThrow(
        error,
      );
      expect(service.sendContactEmail).toHaveBeenCalledWith(validContactDto);
      expect(service.sendContactEmail).toHaveBeenCalledTimes(1);
    });

    it('should handle service throwing custom error', async () => {
      const customError = new Error('SMTP connection failed');
      mockContactService.sendContactEmail.mockRejectedValue(customError);

      await expect(controller.receiveContact(validContactDto)).rejects.toThrow(
        'SMTP connection failed',
      );
    });
  });
});
