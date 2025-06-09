import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

export const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Verificar se o token ainda é válido
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            throw new Error('Token expirado');
          }
          
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Buscar dados do usuário
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Erro ao carregar usuário:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      toast.success('Login realizado com sucesso!');
      
      // Redirecionar para dashboard
      router.push('/dashboard');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    router.push('/login');
    toast.info('Logout realizado com sucesso');
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
