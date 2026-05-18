import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    // ✅ FIXED: Gunakan Omit untuk exclude path dan method di production
    const errorResponseBase = {
      success: false,
      error: {
        statusCode: status,
        message:
          exceptionResponse.message || exception.message || 'Internal Server Error',
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV !== 'production' && {
          path: request.url,
          method: request.method,
        }),
      },
    };

    response.status(status).json(errorResponseBase);
  }
}