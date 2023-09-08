export type SignUpForm = {
  type: 'enlisted' | 'nco';
  sn: string;
  name: string;
  password: string;
  passwordConfirmation: string;
};
