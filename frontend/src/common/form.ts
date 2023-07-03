import { FieldError } from 'react-hook-form';

export function toFormMessage(fieldError?: FieldError): { type: 'error', text?: string; }[] | undefined {

  if (!fieldError) {
    return undefined;
  }

  return [{
    type: 'error',
    text: fieldError.message
  }];

}
