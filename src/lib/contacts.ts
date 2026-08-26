export interface Contacts {
  PHONE: string;
  PHONE_HREF: string;
  VK_HREF: string;
  TG_HREF: string;
  REVIEWS_TG_HREF: string;
  MAX_HREF: string;
}

export const DEFAULT_CONTACTS: Contacts = {
  PHONE: "+7 (995) 645-51-25",
  PHONE_HREF: "tel:+79956455125",
  VK_HREF: "https://vk.com/dalnyack",
  TG_HREF: "https://t.me/Mezhgorod1816",
  REVIEWS_TG_HREF: "https://t.me/gorodvgorode1",
  MAX_HREF: "https://max.ru/u/f9LHodD0cOLXF8YYOcofc0nCB_QzuJK3zunO0A5XBUyuWM654AGfmsC_fCc",
};

// Отдельный номер и Макс для Яндекс.Директа — чтобы звонки из Директа
// не смешивались со звонками из VK и с органики.
export const DIRECT_ADS_CONTACTS: Contacts = {
  ...DEFAULT_CONTACTS,
  PHONE: "+7 (922) 505-51-25",
  PHONE_HREF: "tel:+79225055125",
  MAX_HREF:
    "https://max.ru/u/f9LHodD0cOI2GygpC-YhvtMDVdYEJcCG3IhGQlqUoFV99elHxgibg8U3KVw",
};

/** @deprecated Оставлено для обратной совместимости: старая ссылка /vk. */
export const VK_ADS_CONTACTS = DIRECT_ADS_CONTACTS;