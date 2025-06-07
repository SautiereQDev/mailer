import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 10 } }) // Max 10 emails par IP par minute
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
    }),
  )
  async receiveContact(@Body() contactDto: ContactDto) {
    await this.contactService.sendContactEmail(contactDto);
    return { success: true, message: 'E-mail envoyé avec succès' };
  }
}
