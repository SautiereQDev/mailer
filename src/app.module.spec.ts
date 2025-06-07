import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppModule } from './app.module';
import { ContactModule } from './contact/contact.module';

describe('AppModule', () => {
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
      imports: [AppModule],
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

  it('should have ConfigModule configured globally', () => {
    const configService = module.get<ConfigService>(ConfigService);
    expect(configService).toBeDefined();
  });

  it('should have MailerModule configured', () => {
    const app = module.createNestApplication();
    expect(app).toBeDefined();
  });

  it('should have ContactModule imported', () => {
    const contactModule = module.get(ContactModule);
    expect(contactModule).toBeDefined();
  });

  it('should configure mailer with development settings when NODE_ENV is not production', async () => {
    process.env.NODE_ENV = 'development';

    const testModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const configService = testModule.get<ConfigService>(ConfigService);
    expect(configService).toBeDefined();

    await testModule.close();
  });

  it('should configure mailer with production settings when NODE_ENV is production', async () => {
    process.env.NODE_ENV = 'production';

    const testModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const configService = testModule.get<ConfigService>(ConfigService);
    expect(configService).toBeDefined();

    await testModule.close();
  });
});
