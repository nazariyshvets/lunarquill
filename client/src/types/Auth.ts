interface LoginFormValues {
  email: string;
  password: string;
}

interface SignupFormValues {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export type { LoginFormValues, SignupFormValues };
