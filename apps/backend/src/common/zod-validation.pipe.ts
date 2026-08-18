import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (err) {
      if (err instanceof ZodError) {
        const flattened = err.flatten();
        // convert zod field-errors into a concise array of messages
        const messages = Object.entries(flattened.fieldErrors).flatMap(
          ([field, errs]) => (errs ?? []).map((m) => `${field}: ${m}`),
        );
        throw {
          statusCode: 422,
          message: messages.length ? messages : flattened.formErrors,
          error: 'Unprocessable Entity',
        };
      }
      throw err;
    }
  }
}
