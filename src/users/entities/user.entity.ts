// main-backend/src/users/entities/user.entity.ts

export enum UserRole {
  ADMIN = 'admin',    // Rol con permisos globales [cite: 45]
  USER = 'user',      // Rol con permisos estándar [cite: 46]
}

export class User {
  id: string;
  email: string;        
  passwordHash: string;  
  role: UserRole;        
  
  balance: number;       
  
  isActive: boolean;     

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}