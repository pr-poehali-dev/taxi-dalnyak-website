import Home from "./Home";
import { VK_ADS_CONTACTS } from "@/lib/contacts";

export default function QuickVk() {
  return <Home contacts={VK_ADS_CONTACTS} source="vk_ads" />;
}
