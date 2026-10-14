export type RegisterStepNumber = 1 | 2;

export interface RegisterWizardStep {
  number: RegisterStepNumber;
  label: string;
}

export const REGISTER_STEPS: RegisterWizardStep[] = [
  { number: 1, label: 'Datos personales' },
  { number: 2, label: 'Licencia de conducir' },
];