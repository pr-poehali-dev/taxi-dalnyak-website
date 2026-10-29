import {useEffect, type ReactNode} from "react";
import {HeadContent, Outlet, Scripts, createRootRoute} from "@tanstack/react-router";
import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import {PLATFORM_META, PLATFORM_SCRIPTS} from "@/platform/scripts.gen";
import {HMR_CLIENT} from "@/platform/dev-hmr";
import PageNotFound from "@/pages/PageNotFound";
import {initGlobalGoals} from "@/lib/metrika";
import {registerVisit, initVisitKeyLinks} from "@/lib/tracking";
import appCss from "@/index.css?url";

const TITLE = "Заказать такси межгород — Такси Дальняк | Дальние поездки по России";
const DESCRIPTION =
    "Междугороднее такси по России от 200 км. Цена известна заранее, оплата наличными или переводом, подача 24/7. Звоните +7 (995) 645-51-25.";
const KEYWORDS =
    "заказать такси межгород, такси между городами, междугороднее такси, такси из города в город, такси между городами россии, перевозка сотрудников межгород, вахтовые перевозки, корпоративное такси по договору, такси военнослужащему домой, забрать бойца из зоны сво, такси на новые территории, такси донецк луганск херсон";
const OG_TITLE = "Заказать такси межгород — Такси Дальняк";
const OG_DESCRIPTION = "Цена известна заранее, без накруток. Стандарт, Комфорт и Минивэн. Заказ и подача 24/7.";
const OG_IMAGE = "https://taxidalnyack.ru/og-dalnyak.jpg";
const FAVICON = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/favicon-1775385139095.jpg";
const FONTS = "https://fonts.googleapis.com/css2?family=Oswald:wght@700;800;900&family=Manrope:wght@400;500;600;700;800&display=swap";

const LD_JSON = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            "@id": "https://taxidalnyack.ru#org",
            "name": "Такси Дальняк",
            "alternateName": "Такси межгород Дальняк",
            "url": "https://taxidalnyack.ru",
            "logo": "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/9f1988fa-044e-4fe0-9ed6-d8c75200c13b.jpg",
            "image": "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/9f1988fa-044e-4fe0-9ed6-d8c75200c13b.jpg",
            "telephone": "+79956455125",
            "priceRange": "от 30 ₽/км",
            "areaServed": {"@type": "Country", "name": "Россия"},
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+79956455125",
                "contactType": "customer service",
                "areaServed": "RU",
                "availableLanguage": "Russian",
            },
            "sameAs": [
                "https://yandex.ru/maps/org/82867613833",
                "https://t.me/Mezhgorod1816",
                "https://t.me/gorodvgorode1",
                "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw",
            ],
        },
        {
            "@type": "TaxiService",
            "@id": "https://taxidalnyack.ru#service",
            "name": "Такси Дальняк",
            "description": "Заказать такси межгород. Поездки между городами России от 200 км по фиксированной цене.",
            "url": "https://taxidalnyack.ru/",
            "telephone": "+79956455125",
            "image": "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/9f1988fa-044e-4fe0-9ed6-d8c75200c13b.jpg",
            "serviceType": "Междугороднее такси",
            "provider": {"@id": "https://taxidalnyack.ru#org"},
            "areaServed": [
                {"@type": "Country", "name": "Россия"},
                {"@type": "AdministrativeArea", "name": "Донецкая Народная Республика"},
                {"@type": "AdministrativeArea", "name": "Луганская Народная Республика"},
                {"@type": "AdministrativeArea", "name": "Запорожская область"},
                {"@type": "AdministrativeArea", "name": "Херсонская область"},
            ],
            "audience": {"@type": "Audience", "audienceType": "Военнослужащие, вахтовики, сотрудники компаний, семьи военных"},
            "hoursAvailable": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "00:00",
                "closes": "23:59",
            },
        },
        {
            "@type": "FAQPage",
            "mainEntity": [
                {"@type": "Question", "name": "Можно ли заказать такси для военнослужащего домой или в часть?", "acceptedAnswer": {"@type": "Answer", "text": "Да. Отвезём военнослужащего из отпуска домой и обратно, встретим на вокзале, в аэропорту или в пункте сбора. Цена фиксированная, предоплата не нужна."}},
                {"@type": "Question", "name": "Ездите ли вы в Донецк, Луганск, Херсон и Запорожскую область?", "acceptedAnswer": {"@type": "Answer", "text": "Да, выполняем междугородние поездки на новые территории: Донецк, Луганск, Мариуполь, Мелитополь, Бердянск, Херсон. Маршрут и цену согласуем заранее."}},
                {"@type": "Question", "name": "Работаете ли вы с вахтовиками и организациями?", "acceptedAnswer": {"@type": "Answer", "text": "Да, перевозим вахтовиков и сотрудников компаний по договору с закрывающими документами."}},
                {"@type": "Question", "name": "Нужна ли предоплата?", "acceptedAnswer": {"@type": "Answer", "text": "Нет, оплата производится при посадке в автомобиль."}},
            ],
        },
        {
            "@type": "WebSite",
            "@id": "https://taxidalnyack.ru#website",
            "url": "https://taxidalnyack.ru",
            "name": "Такси Дальняк",
            "inLanguage": "ru-RU",
            "publisher": {"@id": "https://taxidalnyack.ru#org"},
        },
    ],
};

const METRIKA = `(function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=111028538', 'ym');
ym(111028538, 'init', {ssr:true, webvisor:true, clickmap:true, referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`;

type AppKind = "" | "driver" | "office" | "client";

function appKind(p: string): AppKind {
    if (p.indexOf("/app/driver") === 0) return "driver";
    if (p.indexOf("/app/office-k7x2") === 0) return "office";
    if (p.indexOf("/app/client") === 0 || p === "/app" || p === "/app/") return "client";
    return "";
}

const APP_SHELL: Record<Exclude<AppKind, "">, { icon: string; name: string; title: string }> = {
    driver: {icon: "/apple-touch-icon-driver.png", name: "Водитель", title: "Дальняк Водитель"},
    office: {icon: "/apple-touch-icon-office.png", name: "Диспетчер", title: "Дальняк Диспетчер"},
    client: {icon: "/apple-touch-icon.png", name: "Дальняк", title: "Такси Дальняк"},
};

export const Route = createRootRoute({
    head: ({matches}) => {
        const leaf = matches[matches.length - 1];
        const k = appKind(leaf?.pathname ?? "");
        const shell = k ? APP_SHELL[k] : null;
        return {
            meta: [
                {charSet: "utf-8"},
                {name: "viewport", content: "width=device-width, initial-scale=1.0"},
                {title: TITLE},
                {name: "description", content: DESCRIPTION},
                {name: "keywords", content: KEYWORDS},
                {name: "robots", content: "index, follow"},
                {name: "author", content: "Такси Дальняк"},
                {name: "yandex-verification", content: "c02ae83c0178ef59"},
                {name: "mobile-web-app-capable", content: "yes"},
                {name: "apple-mobile-web-app-capable", content: "yes"},
                {name: "apple-mobile-web-app-status-bar-style", content: "black-translucent"},
                {name: "apple-mobile-web-app-title", content: shell ? shell.name : "Дальняк"},
                {name: "theme-color", content: "#c9a84c"},
                {property: "og:type", content: "website"},
                {property: "og:locale", content: "ru_RU"},
                {property: "og:site_name", content: "Такси Дальняк"},
                {property: "og:title", content: OG_TITLE},
                {property: "og:description", content: OG_DESCRIPTION},
                {property: "og:image", content: OG_IMAGE},
                {property: "og:image:width", content: "1200"},
                {property: "og:image:height", content: "630"},
                {property: "og:image:type", content: "image/jpeg"},
                {property: "og:image:alt", content: "Такси Дальняк: заказать такси межгород"},
                {property: "og:url", content: "https://taxidalnyack.ru/"},
                {name: "twitter:card", content: "summary_large_image"},
                {name: "twitter:title", content: OG_TITLE},
                {name: "twitter:description", content: OG_DESCRIPTION},
                {name: "twitter:image", content: OG_IMAGE},
                {"script:ld+json": LD_JSON},
                ...PLATFORM_META,
            ],
            links: [
                {rel: "stylesheet", href: appCss},
                {rel: "icon", type: "image/jpg", href: FAVICON},
                {rel: "manifest", href: k ? `/app-${k}.webmanifest` : "/manifest.json"},
                {rel: "apple-touch-icon", href: shell ? shell.icon : "/apple-touch-icon.png"},
                {rel: "preconnect", href: "https://cdn.poehali.dev", crossOrigin: "anonymous"},
                {rel: "preload", as: "image", href: "/poster-home.webp", type: "image/webp", fetchPriority: "high"},
                {rel: "preconnect", href: "https://fonts.googleapis.com"},
                {rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous"},
                {rel: "stylesheet", href: FONTS},
            ],
            // IMPORTANT: DO NOT REMOVE PLATFORM SCRIPTS AND THE DEV HMR CLIENT!
            scripts: [
                ...(import.meta.env.DEV ? [{children: HMR_CLIENT}] : []),
                ...PLATFORM_SCRIPTS,
                {children: METRIKA},
            ],
        };
    },
    component: RootComponent,
    notFoundComponent: PageNotFound,
});

function RootComponent() {
    useEffect(() => {
        initGlobalGoals();
        initVisitKeyLinks();
        registerVisit();

        // Service Worker — оффлайн-режим
        if ("serviceWorker" in navigator) {
            const register = () => {
                navigator.serviceWorker.register("/sw.js").catch(() => {});
            };
            if (document.readyState === "complete") register();
            else window.addEventListener("load", register, {once: true});
        }
    }, []);

    return (
        <RootDocument>
            <TooltipProvider>
                <Toaster/>
                <Sonner/>
                <Outlet/>
            </TooltipProvider>
        </RootDocument>
    );
}

function RootDocument({children}: { children: ReactNode }) {
    return (
        <html lang="ru">
        <head>
            <HeadContent/>
        </head>
        <body style={{background: "#2d456b", margin: 0}}>
        {children}
        <noscript>
            <div><img src="https://mc.yandex.ru/watch/111028538" style={{position: "absolute", left: "-9999px"}} alt=""/></div>
        </noscript>
        <Scripts/>
        </body>
        </html>
    );
}
