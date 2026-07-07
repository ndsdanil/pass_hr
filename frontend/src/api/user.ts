import { apiClient } from './client';

interface PasswordUpdate {
  current_password: string;
  new_password: string;
}

interface UserUpdate {
  email: string;
}

/**
 * Обновление пароля пользователя
 * @param data Данные для обновления пароля
 */
export const updatePassword = async (data: PasswordUpdate): Promise<void> => {
  await apiClient.put('/users/me/password', data);
};

/**
 * Обновление email пользователя
 * @param data Новый email
 */
export const updateEmail = async (data: UserUpdate): Promise<void> => {
  await apiClient.put('/users/me/email', data);
};

/**
 * Удаление аккаунта пользователя и всех связанных данных (резюме, вакансии и т.д.)
 */
export const deleteAccount = async (): Promise<void> => {
  await apiClient.delete('/users/me');
}; 