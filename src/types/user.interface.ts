import { RsaKeys } from './rsaKeys.interface';

export interface User {
  email: string;
  password: string;
}

export interface UserWithRsaKeys extends User {
  rsaKeys: RsaKeys;
}
