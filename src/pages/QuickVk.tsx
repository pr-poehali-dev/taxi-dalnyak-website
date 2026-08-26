import Home from "./Home";
import { DEFAULT_CONTACTS } from "@/lib/contacts";

// Старая ссылка /vk. Основной трафик VK теперь идёт на главную «/»,
// здесь тот же основной номер — чтобы прежние объявления не вели в пустоту.
export default function QuickVk() {
  return <Home contacts={DEFAULT_CONTACTS} source="vk_ads" />;
}
