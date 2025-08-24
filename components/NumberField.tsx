'use client';

import { NumberInput, NumberInputProps } from '@mantine/core';

interface NumberFieldProps extends Omit<NumberInputProps, 'value' | 'onChange'> {
  value?: number;
  onChange?: (value: number) => void;
}

export function NumberField({ value = 0, onChange, ...props }: NumberFieldProps) {
  return (
    <NumberInput
      {...props}
      value={value}
      onChange={(val) => onChange?.(Number(val) || 0)}
      min={0}
      allowNegative={false}
      allowDecimal={false}
    />
  );
}