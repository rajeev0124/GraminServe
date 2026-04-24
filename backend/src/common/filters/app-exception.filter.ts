import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
}

/**
 * Global exception filter.
 * Catches all errors and formats them into a consistent JSON response.
 * Register in main.ts via app.useGlobalFilters(new AppExceptionFilter()).
 */
@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<{ url: string }>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as { message?: string }).message ??
          exception.message
        : 'Internal server error';

    const body: ErrorResponse = {
      statusCode: status,
      error: HttpStatus[status] ?? 'UNKNOWN',
      message: Array.isArray(message) ? message.join(', ') : String(message),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(`${status} ${body.path} — ${body.message}`);

    response.status(status).json(body);
  }
}
