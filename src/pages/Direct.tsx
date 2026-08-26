import Home from "./Home";
import { DIRECT_ADS_CONTACTS } from "@/lib/contacts";

// Посадочная для Яндекс.Директа: тот же короткий вид, что и главная,
// но со своим номером (+7 922 505-51-25) и отдельным Максом.
export default function Direct() {
  return <Home contacts={DIRECT_ADS_CONTACTS} source="direct_ads" />;
}
