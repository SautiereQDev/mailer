import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { BlacklistModule } from '../blacklist/blacklist.module';

@Module({
  imports: [MailerModule, BlacklistModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
