// Note type
export interface Note {
  id: number;
  userId: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// User type
export interface User {
  id: number;
  email: string;
  name?: string;
  avatar?: string;
}

// AuthState type
export interface AuthState {
  user: User | null;
  token: string | null;
}

// AuthContextType type
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}
