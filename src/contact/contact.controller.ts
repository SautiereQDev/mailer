import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
  Req,
  HttpException,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';
import { Throttle } from '@nestjs/throttler';
import { BlacklistService } from '../blacklist/blacklist.service';
import { Request } from 'express';

@Controller('contact')
export class ContactController {
  private readonly MAX_ATTEMPTS = 5; // Même valeur que dans BlacklistService

  constructor(
    private readonly contactService: ContactService,
    private readonly blacklistService: BlacklistService,
  ) {}

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
  async receiveContact(
    @Body() contactDto: ContactDto,
    @Req() request: Request,
  ) {
    try {
      await this.contactService.sendContactEmail(contactDto);
      return { success: true, message: 'E-mail envoyé avec succès' };
    } catch (error) {
      const ip = request.socket.remoteAddress || '0.0.0.0';
      const isNowBlocked = this.blacklistService.recordFailedAttempt(ip);
      const remainingAttempts =
        this.MAX_ATTEMPTS - this.blacklistService.getFailedAttempts(ip);

      if (isNowBlocked) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error:
              'Votre IP a été bloquée en raison de trop nombreuses tentatives échouées',
            remainingAttempts: 0,
          },
          HttpStatus.FORBIDDEN,
        );
      }

      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: "Erreur lors de l'envoi de l'email",
          remainingAttempts,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
