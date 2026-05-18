import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Enhanced Logger Service
 * Menyimpan log ke file sekaligus console
 */
@Injectable()
export class LoggerService {
  private readonly logger = new Logger(LoggerService.name);
  private readonly logDir = './logs';
  private readonly dateFormat = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  constructor() {
    this.ensureLogDirExists();
  }

  /**
   * Buat folder logs jika tidak ada
   */
  private ensureLogDirExists(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Log info message
   */
  log(message: string, context?: string, metadata?: any): void {
    const logMessage = this.formatLog('INFO', message, context, metadata);
    this.logger.log(logMessage);
    this.writeToFile('info', logMessage);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: string, metadata?: any): void {
    const logMessage = this.formatLog('WARN', message, context, metadata);
    this.logger.warn(logMessage);
    this.writeToFile('warn', logMessage);
  }

  /**
   * Log error message
   */
  error(message: string, error?: any, context?: string): void {
    const logMessage = this.formatLog('ERROR', message, context, {
      error: error?.message || error,
      stack: error?.stack,
    });
    this.logger.error(logMessage);
    this.writeToFile('error', logMessage);
  }

  /**
   * Log debug message (hanya di development)
   */
  debug(message: string, context?: string, metadata?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const logMessage = this.formatLog('DEBUG', message, context, metadata);
      this.logger.debug(logMessage);
      this.writeToFile('debug', logMessage);
    }
  }

  /**
   * Log HTTP request
   */
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: string,
  ): void {
    const logMessage = this.formatLog('HTTP', `${method} ${url} - ${statusCode}`, 'HTTP', {
      duration: `${duration}ms`,
      userId: userId || 'anonymous',
    });
    this.logger.log(logMessage);
    this.writeToFile('http', logMessage);
  }

  /**
   * Log database query
   */
  logQuery(query: string, params?: any, duration?: number): void {
    const logMessage = this.formatLog('DATABASE', query, 'Database', {
      params,
      duration: duration ? `${duration}ms` : undefined,
    });
    this.writeToFile('database', logMessage);
  }

  /**
   * Format log message
   */
  private formatLog(
    level: string,
    message: string,
    context: string = 'App',
    metadata?: any,
  ): string {
    const timestamp = new Date().toISOString();
    const metadataStr = metadata ? ` | ${JSON.stringify(metadata)}` : '';
    return `[${timestamp}] [${level}] [${context}] ${message}${metadataStr}`;
  }

  /**
   * Write log ke file
   */
  private writeToFile(type: string, logMessage: string): void {
    try {
      const filename = path.join(this.logDir, `${type}-${this.dateFormat}.log`);
      fs.appendFileSync(filename, logMessage + '\n', 'utf8');
    } catch (error) {
      console.error('Failed to write log file:', error);
    }
  }

  /**
   * Get log file content
   */
  getLogFile(type: string, date?: string): string {
    try {
      const targetDate = date || this.dateFormat;
      const filename = path.join(this.logDir, `${type}-${targetDate}.log`);

      if (!fs.existsSync(filename)) {
        return `Log file tidak ditemukan: ${filename}`;
      }

      return fs.readFileSync(filename, 'utf8');
    } catch (error) {
      return `Error membaca log file: ${error.message}`;
    }
  }

  /**
   * Get semua log files
   */
  getAllLogFiles(): string[] {
    try {
      return fs.readdirSync(this.logDir).filter((f) => f.endsWith('.log'));
    } catch (error) {
      return [];
    }
  }
}