import Home from "./Home";
import { DIRECT_ADS_CONTACTS } from "@/lib/contacts";

// Посадочная для Яндекс.Директа: тот же короткий вид, что и главная,
// но с отдельным Максом.
export default function Direct() {
  return <Home contacts={DIRECT_ADS_CONTACTS} source="direct_ads" />;
}
