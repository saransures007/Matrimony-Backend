import bcrypt from 'bcrypt';
const rounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
export const hashPassword = (plain:string) => bcrypt.hash(plain, rounds);
export const comparePassword = (plain:string, hashed:string) => bcrypt.compare(plain, hashed);
