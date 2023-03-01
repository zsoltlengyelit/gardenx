import { FieldError } from 'react-hook-form';
import type { FormMessage } from '@instructure/ui-form-field';

export function toFormMessage(fieldError?: FieldError): FormMessage[] | undefined {

  if (!fieldError) {
    return undefined;
  }

  return [{
    type: 'error',
    text: fieldError.message
  }];

}
