import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { BlacklistModule } from '../blacklist/blacklist.module';

@Module({
  imports: [BlacklistModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
