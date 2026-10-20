import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Btn } from "./ui";
import { useBackClose } from "@/lib/useBackClose";

export interface Slide {
  icon: string;
  title: string;
  text: string;
}

export const CLIENT_SLIDES: Slide[] = [
  { icon: "MapPin", title: "Откуда и куда", text: "Точка подачи ставится по GPS. Нажмите на строку «Куда», введите город или адрес и выберите из списка. Строку «Откуда» тоже можно изменить." },
  { icon: "Car", title: "Выберите класс авто", text: "Стандарт, Комфорт или Минивэн. Цена известна сразу и зависит от расстояния. Платные дороги и мосты оплачиваются отдельно." },
  { icon: "Banknote", title: "Цену можно повысить", text: "Если нужно уехать быстрее, предложите больше кнопкой «+». Понизить цену нельзя." },
  { icon: "CalendarClock", title: "Поездка на другое время", text: "Над кнопкой заказа выберите «На другое время», затем день и время подачи. Водителя найдём заранее и напомним за час и за 15 минут." },
  { icon: "Menu", title: "Меню слева", text: "Нажмите на три полоски вверху слева: там история заказов, промокоды, копи-км, подсказки и связь с поддержкой." },
  { icon: "Gift", title: "Копи-км", text: "За каждую поездку возвращаем часть километров на ваш счёт. Приглашайте друзей и тратьте километры на скидку при следующем заказе." },
  { icon: "Wallet", title: "Оплата водителю", text: "Рассчитываетесь напрямую с водителем: переводом или наличными. Лучше оплатить в начале поездки." },
  { icon: "Bell", title: "Мы сообщим обо всём", text: "Придут уведомления: водитель найден, выехал, приехал. Можно написать водителю в чате внутри приложения." },
  { icon: "Star", title: "Оцените поездку", text: "После поездки поставьте оценку водителю. Это делает сервис лучше для всех." },
];

export const DRIVER_SLIDES: Slide[] = [
  { icon: "FileCheck", title: "Пройдите проверку", text: "Загрузите права, СТС и фото авто. Диспетчер проверит документы и назначит вам тарифы." },
  { icon: "Power", title: "Выйдите на линию", text: "Только водители на линии видят заказы и получают уведомления. Разрешите уведомления и геолокацию." },
  { icon: "Wallet", title: "Баланс и комиссия", text: "Для взятия заказа нужны деньги на балансе. Комиссия сервиса списывается при взятии заказа. Если заказ отменён, она возвращается." },
  { icon: "ListChecks", title: "Ведите заказ по шагам", text: "Нажимайте: «Выехал», «На месте», «Начать поездку», «Завершить». Клиент видит каждый шаг." },
  { icon: "MessageCircle", title: "Общайтесь в чате", text: "Номер пассажира скрыт. Все вопросы решайте в чате заказа, диспетчер видит переписку." },
  { icon: "ShieldAlert", title: "Не отменяйте заказы", text: "Частые отказы ведут к блокировке аккаунта. Берите только те заказы, которые точно выполните." },
  { icon: "Zap", title: "Приоритет", text: "С подпиской вы видите новые заказы раньше остальных водителей." },
];

export default function Tutorial({ slides, onClose }: { slides: Slide[]; onClose: () => void }) {
  useBackClose(onClose);
  const [i, setI] = useState(0);
  const s = slides[i];
  const last = i === slides.length - 1;
  return (
    <div className="fixed inset-0 z-[3500] flex flex-col bg-white p-6 text-neutral-900" style={{ fontFamily: "Manrope, sans-serif" }}>
      <button onClick={onClose} className="self-end text-sm font-semibold text-neutral-400">Пропустить</button>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span className="flex h-28 w-28 items-center justify-center rounded-[32px] bg-[#fcd34d]">
          <Icon name={s.icon} fallback="Info" size={52} />
        </span>
        <h2 className="mt-8 text-2xl font-extrabold text-neutral-900">{s.title}</h2>
        <p className="mt-3 max-w-xs text-neutral-600">{s.text}</p>
      </div>
      <div className="mb-5 flex justify-center gap-1.5">
        {slides.map((_, k) => <span key={k} className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-neutral-900" : "w-2 bg-neutral-200"}`} />)}
      </div>
      <div className="flex gap-3">
        {i > 0 && <Btn kind="ghost" onClick={() => setI(i - 1)} className="flex-1">Назад</Btn>}
        <Btn onClick={() => (last ? onClose() : setI(i + 1))} className="flex-[2] text-lg">{last ? "Понятно" : "Далее"}</Btn>
      </div>
    </div>
  );
}
