import { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

   // Función para decodificar JWT token (sin verificación, solo para obtener payload)
  const decodeToken = useCallback((token: string): User | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub || payload.id || payload.userId,
        username: payload.username || payload.name || payload.email?.split('@')[0] || 'Usuario',
        email: payload.email || '',
        name: payload.name
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }, []);

  // Función para obtener información del usuario actual
  const fetchUserInfo = useCallback(async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      // Tu backend tiene el endpoint /users/profile, así que lo usamos
      const response = await axios.get('http://localhost:3000/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user info from API, using token decode as fallback:', error);
      // Fallback: decodificar el token si la API falla
      const token = localStorage.getItem('token');
      if (token) {
        return decodeToken(token);
      }
      return null;
    }
  }, [decodeToken]);

  // Función para renovar el access token usando el refresh token
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return false;
      }

      const response = await axios.post('http://localhost:3000/users/refresh', {
        refreshToken
      });

      const { accessToken } = response.data;
      localStorage.setItem('token', accessToken);
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Si el refresh token también ha expirado, hacer logout
      logout();
      return false;
    }
  }, []);

  useEffect(() => {
    // Configurar interceptor de axios para manejar tokens automáticamente PRIMERO
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Si recibimos un 401 y no hemos intentado renovar el token aún
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshSuccess = await refreshAccessToken();
          if (refreshSuccess) {
            // Reintentar la petición original con el nuevo token
            const token = localStorage.getItem('token');
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );

    // DESPUÉS configurar el estado de autenticación
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Obtener información del usuario con un pequeño delay para asegurar que el interceptor esté listo
      setTimeout(() => {
        fetchUserInfo().then(userInfo => {
          if (userInfo) {
            setUser(userInfo);
          }
        });
      }, 100);
    }

    // Cleanup interceptors cuando el componente se desmonte
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshAccessToken, fetchUserInfo]);

  const login = async (token: string, refreshToken: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    setIsAuthenticated(true);
    
    // Obtener información del usuario después del login
    const userInfo = await fetchUserInfo();
    if (userInfo) {
      setUser(userInfo);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
