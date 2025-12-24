import * as z from "zod";

export const registerSchema = z.object({
  email: z.string().email("Geçersiz e-posta adresi"),
  firstName: z.string().min(2, "İsim çok kısa"),
  lastName: z.string().min(2, "Soyisim çok kısa"),
  gender: z.enum(["male", "female", "other"]),
  birthDate: z.string(),
  nationality: z.string().min(2, "Uyruk seçiniz"),
  phone: z.string().min(10, "Telefon numarası eksik"),
  idNumber: z.string().min(5, "TCKN veya Pasaport gerekli"),
  emergencyPhone1: z.string().min(10, "Acil durum numarası gerekli"),
  address: z.string().min(10, "Lütfen açık adresinizi giriniz"),
});