// Theater-website/src/contexts/AuthContext.js
// Контекст для управления аутентификацией пользователей

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BASE_URL } from '../api/starpi';
import axios from 'axios';

// Создаем контекст
const AuthContext = createContext();

// Хук для удобного использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Провайдер контекста
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Загружаем данные пользователя при монтировании
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
      loadUserData(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Загрузка данных пользователя
  const loadUserData = async (authToken) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке данных пользователя:', error);
      // Если токен невалиден, удаляем его
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Регистрация
  const register = async (username, email, password, firstName, lastName) => {
    try {
      // Сначала регистрируем пользователя с базовыми полями
      const response = await axios.post(`${BASE_URL}/api/auth/local/register`, {
        username,
        email,
        password,
      });

      const { jwt, user: userData } = response.data;
      
      // Если есть дополнительные поля, обновляем профиль
      if (firstName || lastName) {
        try {
          const updateResponse = await axios.put(
            `${BASE_URL}/api/users/${userData.id}`,
            {
              firstName: firstName || '',
              lastName: lastName || '',
            },
            {
              headers: {
                Authorization: `Bearer ${jwt}`,
              },
            }
          );
          
          // Используем обновленные данные пользователя
          const updatedUser = updateResponse.data;
          localStorage.setItem('authToken', jwt);
          setToken(jwt);
          setUser(updatedUser);
          return { success: true, user: updatedUser };
        } catch (updateError) {
          // Если обновление не удалось, все равно сохраняем пользователя
          console.warn('Не удалось обновить профиль при регистрации:', updateError);
          localStorage.setItem('authToken', jwt);
          setToken(jwt);
          setUser(userData);
          return { success: true, user: userData };
        }
      } else {
        // Если дополнительных полей нет, просто сохраняем
        localStorage.setItem('authToken', jwt);
        setToken(jwt);
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Ошибка при регистрации',
      };
    }
  };

  // Вход
  const login = async (identifier, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/local`, {
        identifier, // может быть email или username
        password,
      });

      const { jwt, user: userData } = response.data;
      localStorage.setItem('authToken', jwt);
      setToken(jwt);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Ошибка при входе:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Неверный email/пароль',
      };
    }
  };

  // Выход
  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  // Обновление профиля
  const updateProfile = async (profileData) => {
    if (!token) return { success: false, error: 'Не авторизован' };

    try {
      const response = await axios.put(
        `${BASE_URL}/api/users/${user.id}`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data);
      return { success: true, user: response.data };
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Ошибка при обновлении профиля',
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
    loadUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

