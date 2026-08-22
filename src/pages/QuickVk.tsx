import Quick from "./Quick";
import { VK_ADS_CONTACTS } from "@/lib/contacts";

export default function QuickVk() {
  return <Quick contacts={VK_ADS_CONTACTS} source="vk_ads" />;
}