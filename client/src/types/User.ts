interface UserWithoutPassword {
  _id: string;
  username: string;
  email: string;
  password: string;
  active: boolean;
  isOnline: boolean;
}

interface User extends UserWithoutPassword {
  password: string;
}

export type { User, UserWithoutPassword };
