/**
 * Core/Server API Client
 * Portfolio (Next.js) → Core/Server (Node.js) bağlantısı
 */

const API_BASE_URL = process.env.NEXT_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Generic API fetch wrapper
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Bir hata oluştu',
      };
    }

    return {
      success: true,
      data,
      message: data.message,
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: 'Sunucuya bağlanılamadı',
    };
  }
}

// ==================== AUTH / VERIFICATION ====================

/**
 * Email'e doğrulama kodu gönder
 */
export async function sendVerificationCode(email: string) {
  return fetchApi<{ message: string }>('/racers/send-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Doğrulama kodunu kontrol et
 */
export async function verifyCode(email: string, code: string) {
  return fetchApi<{ message: string; verified: boolean }>('/racers/verify-email', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

// ==================== RACER REGISTRATION ====================

export interface RacerRegistrationData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  emergencyPhone?: string;
  idNumber?: string;
  birthDate?: string;
  nationality?: string;
  bloodType?: string;
  needsTransfer?: boolean;
  needsBikeRental?: boolean;
}

/**
 * Yeni yarışçı kaydı
 */
export async function registerRacer(data: RacerRegistrationData) {
  return fetchApi<{ id: number; message: string }>('/racers/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ==================== SOUVENIR ====================

export interface SouvenirData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * Hatıra bileti maili gönder
 */
export async function sendSouvenirTicket(data: SouvenirData) {
  return fetchApi<{ message: string }>('/souvenir/send-ticket', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
