import { useState } from 'react';
import type { FieldErrors } from '../utils/auth.validation';

export function useAuthForm<T extends object>(
  initialValues: T,
  validate: (values: T) => FieldErrors<T>,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [submitted, setSubmitted] = useState(false);

  const setValue = (name: keyof T, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const errors: FieldErrors<T> = submitted ? validate(values) : {};

  const attemptSubmit = (pick?: Array<keyof T>): boolean => {
    setSubmitted(true);
    const all = validate(values);
    if (!pick) return Object.keys(all).length === 0;
    return !pick.some((key) => Boolean(all[key]));
  };

  return { values, errors, setValue, attemptSubmit };
}