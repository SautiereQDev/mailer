import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlacklistService {
  private blacklistedIps: Set<string> = new Set();
  private failedAttempts: Map<string, { count: number; timestamp: number }> = new Map();
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

  constructor(private configService: ConfigService) {
    // Charger les IPs bloquées depuis la configuration
    const blockedIps = this.configService.get<string>('BLOCKED_IPS');
    if (blockedIps) {
      blockedIps.split(',').forEach(ip => this.blacklistedIps.add(ip.trim()));
    }
  }

  isBlacklisted(ip: string): boolean {
    return this.blacklistedIps.has(ip);
  }

  addToBlacklist(ip: string): void {
    this.blacklistedIps.add(ip);
    // Ici, vous pourriez implémenter la persistance dans une base de données
  }

  removeFromBlacklist(ip: string): void {
    this.blacklistedIps.delete(ip);
  }

  recordFailedAttempt(ip: string): boolean {
    const now = Date.now();
    const attempt = this.failedAttempts.get(ip);

    if (!attempt) {
      this.failedAttempts.set(ip, { count: 1, timestamp: now });
      return false;
    }

    // Réinitialiser le compteur si la dernière tentative date de plus de 24h
    if (now - attempt.timestamp > this.BLOCK_DURATION) {
      this.failedAttempts.set(ip, { count: 1, timestamp: now });
      return false;
    }

    attempt.count++;
    attempt.timestamp = now;
    this.failedAttempts.set(ip, attempt);

    // Bloquer l'IP si trop de tentatives échouées
    if (attempt.count >= this.MAX_FAILED_ATTEMPTS) {
      this.addToBlacklist(ip);
      return true;
    }

    return false;
  }

  getFailedAttempts(ip: string): number {
    const attempt = this.failedAttempts.get(ip);
    if (!attempt) return 0;
    
    // Réinitialiser si plus de 24h
    if (Date.now() - attempt.timestamp > this.BLOCK_DURATION) {
      this.failedAttempts.delete(ip);
      return 0;
    }

    return attempt.count;
  }
} 