import { Test, TestingModule } from '@nestjs/testing';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { ContactModule } from './contact.module';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

describe('ContactModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    // Set up environment variables for testing
    process.env.NODE_ENV = 'test';
    process.env.MAIL_HOST = 'localhost';
    process.env.MAIL_PORT = '1025';
    process.env.MAIL_USER = '';
    process.env.MAIL_PASSWORD = '';
    process.env.MAIL_FROM_NAME = 'Test Mailer';
    process.env.MAIL_FROM_EMAIL = 'test@example.com';

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MailerModule.forRoot({
          transport: {
            host: 'localhost',
            port: 1025,
            secure: false,
          },
          defaults: {
            from: '"Test Mailer" <test@example.com>',
          },
        }),
        ContactModule,
      ],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have ContactController', () => {
    const controller = module.get<ContactController>(ContactController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(ContactController);
  });

  it('should have ContactService', () => {
    const service = module.get<ContactService>(ContactService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(ContactService);
  });

  it('should inject ContactService into ContactController', () => {
    const controller = module.get<ContactController>(ContactController);
    const service = module.get<ContactService>(ContactService);
    
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    
    // Verify that the service is properly injected
    expect(controller['contactService']).toBe(service);
  });
});
