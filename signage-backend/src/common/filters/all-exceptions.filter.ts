import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    this.logger.error({
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    if (exception instanceof Error) {
      message = exception.message;

      if (exception.message.includes('duplicate key')) {
        status = HttpStatus.CONFLICT;
        message = 'Data sudah ada (duplicate)';
      } else if (exception.message.includes('not found')) {
        status = HttpStatus.NOT_FOUND;
        message = 'Data tidak ditemukan';
      }
    }

    const errorResponse = {
      success: false,
      error: {
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
      },
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.error['stack'] = exception instanceof Error ? exception.stack : null;
    }

    response.status(status).json(errorResponse);
  }
}