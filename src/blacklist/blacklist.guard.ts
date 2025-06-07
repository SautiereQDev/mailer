import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { BlacklistService } from './blacklist.service';

@Injectable()
export class BlacklistGuard implements CanActivate {
  constructor(private blacklistService: BlacklistService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;

    if (this.blacklistService.isBlacklisted(ip)) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: 'Access denied: Your IP has been blocked due to suspicious activity',
        remainingAttempts: 0,
      }, HttpStatus.FORBIDDEN);
    }

    return true;
  }
} 