import fs from "fs";
import path from "path";
import type { Plugin } from "vite";

const SITE = "https://taxidalnyack.ru";

interface PageData {
  route: string;
  title: string;
  description: string;
  h1: string;
  about: string;
  features: string[];
  routes: string[];
  city: string;
  keywords: string;
}

function str(src: string, key: string): string {
  const m = src.match(new RegExp(`${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  return m ? m[1].replace(/\\"/g, '"') : "";
}

function arr(src: string, key: string): string[] {
  const m = src.match(new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\]`));
  if (!m) return [];
  return [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(x => x[1].replace(/\\"/g, '"'));
}

const SLUG_PATH: Record<string, string> = { moscow: "moskva", nizhny: "nizhniy" };

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function collect(root: string): PageData[] {
  const pages: PageData[] = [];

  const home = fs.readFileSync(path.join(root, "src/pages/Home.tsx"), "utf-8");
  pages.push({
    route: "/",
    title: str(home, "seoTitle"),
    description: str(home, "seoDescription"),
    h1: str(home, "h1").replace(/\[\/?gold\]/g, ""),
    about: str(home, "about"),
    features: arr(home, "features").slice(0, 8),
    routes: arr(home, "routes").slice(0, 40),
    city: "Россия",
    keywords: str(home, "seoKeywords"),
  });

  // малые города из общего справочника
  const townsSrc = fs.readFileSync(path.join(root, "src/data/towns.ts"), "utf-8");
  const blocks = townsSrc.split(/\n  \{\n/).slice(1);
  for (const b of blocks) {
    const slug = str(b, "slug");
    if (!slug) continue;
    const city = str(b, "city");
    const rod = str(b, "cityRod");
    const pred = str(b, "cityPred");
    const region = str(b, "region");
    const intro = str(b, "intro").replace(/"\s*\+\s*"/g, "");
    const nearby = str(b, "nearby");
    const rm = b.match(/routes:\s*(\w+)_ROUTES\("([^"]+)"\)/);
    const set = rm ? rm[1] : "KHERSON";
    const base = rm ? rm[2] : city;
    const DESTS: Record<string, string[]> = {
      KHERSON: ["Москва","Ростов-на-Дону","Краснодар","Симферополь","Севастополь","Джанкой","Мелитополь","Бердянск","Мариуполь","Донецк","Луганск","Воронеж","Волгоград","Ставрополь","Сочи","Санкт-Петербург","Белгород","Таганрог","Анапа","Керчь"],
      ZAPOROZHYE: ["Москва","Ростов-на-Дону","Краснодар","Мариуполь","Донецк","Симферополь","Севастополь","Джанкой","Керчь","Луганск","Херсон","Геническ","Воронеж","Волгоград","Ставрополь","Сочи","Анапа","Таганрог","Санкт-Петербург","Белгород"],
      RND: ["Москва","Ростов-на-Дону","Краснодар","Воронеж","Сочи","Санкт-Петербург","Волгоград","Ставрополь","Луганск","Донецк","Мариуполь","Анапа","Геленджик","Пятигорск","Белгород","Симферополь","Астрахань","Саратов","Нижний Новгород","Таганрог"],
      DNR: ["Москва","Ростов-на-Дону","Донецк","Луганск","Краснодар","Таганрог","Мариуполь","Воронеж","Белгород","Волгоград","Санкт-Петербург","Ставрополь","Сочи","Симферополь","Севастополь","Курск","Анапа","Саратов","Нижний Новгород","Керчь"],
      LNR: ["Москва","Ростов-на-Дону","Луганск","Донецк","Краснодар","Воронеж","Белгород","Волгоград","Санкт-Петербург","Мариуполь","Таганрог","Ставрополь","Сочи","Курск","Симферополь","Севастополь","Саратов","Пенза","Нижний Новгород","Анапа"],
      SOUTH: ["Москва","Ростов-на-Дону","Воронеж","Краснодар","Санкт-Петербург","Волгоград","Белгород","Сочи","Ставрополь","Луганск","Донецк","Курск","Симферополь","Анапа","Таганрог","Липецк","Саратов","Нижний Новгород","Пятигорск","Тула"],
    };
    const dests = DESTS[set] ?? DESTS.KHERSON;
    const routes = dests.filter(d => d !== city).map(d => `${base} – ${d}`);
    pages.push({
      route: "/" + slug,
      title: `Такси из ${rod}${str(b, "titleSuffix")} в другой город — ${dests.slice(0,4).join(", ")} | Такси Дальняк`,
      description: `Заказать междугороднее такси из ${rod} (${region}) в ${dests.slice(0,4).join(", ")} и другие города России. Прямой рейс без пересадок, фиксированная цена, подача круглосуточно.`,
      h1: `Такси из ${rod} в любой город России`,
      about: `${intro} ${nearby} Машина едет только за вами — попутчиков не подсаживаем, остановки делаем по вашей просьбе.`,
      features: [
        `Подача в ${pred} и сёлах района`,
        `Прямые рейсы: ${dests[0]}, ${dests[1]}`,
        "Работаем на новых территориях с 2014 года",
        "Фиксированная цена — без доплат в дороге",
        "Помощь с багажом, остановки в пути",
        "Круглосуточно, включая ночные выезды",
      ],
      routes,
      city,
      keywords: [
        `такси ${city}`,
        `такси из ${rod}`,
        `междугороднее такси ${city}`,
        ...routes.slice(0, 6).map(r => `такси ${r.replace(" – ", " ")}`),
        `такси ${region.toLowerCase()}`,
        str(b, "extraKeywords"),
      ].filter(Boolean).join(", "),
    });
  }

  const dir = path.join(root, "src/pages/regions");
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith(".tsx"))) {
    const src = fs.readFileSync(path.join(dir, file), "utf-8");
    const slug = str(src, "slug");
    if (!slug) continue;
    const rod = str(src, "cityRod");
    pages.push({
      route: "/" + (SLUG_PATH[slug] ?? slug),
      title: str(src, "seoTitle") || `Заказать такси из ${rod} в другой город от 200 км — Такси Дальняк`,
      description:
        str(src, "seoDescription") ||
        `Такси из ${rod} в другой город по фиксированной цене. Междугородние поездки от 200 км, круглосуточно.`,
      h1: (str(src, "h1") || `Заказать такси из ${rod} в другой город`).replace(/\[\/?gold\]/g, ""),
      about: str(src, "about"),
      features: arr(src, "features").slice(0, 8),
      routes: arr(src, "routes").slice(0, 40),
      city: str(src, "city"),
      keywords:
        str(src, "seoKeywords") ||
        `такси ${rod}, заказать такси ${rod}, межгород ${rod}, такси из ${rod} в другой город`,
    });
  }
  return pages;
}

function body(p: PageData): string {
  const feats = p.features.map(f => `<li>${esc(f)}</li>`).join("");
  const routes = p.routes.map(r => `<li>${esc(r)}</li>`).join("");
  return [
    `<div id="prerender">`,
    `<h1>${esc(p.h1)}</h1>`,
    p.about ? `<p>${esc(p.about)}</p>` : "",
    feats ? `<h2>Почему выбирают Такси Дальняк</h2><ul>${feats}</ul>` : "",
    routes ? `<h2>Направления — ${esc(p.city)}</h2><ul>${routes}</ul>` : "",
    `<h2>Стоимость и условия</h2>`,
    `<p>Междугородние поездки от 200 км. Цена фиксируется до выезда и не меняется в дороге. Оплата наличными или картой водителю. Круглосуточный диспетчер: +7 (995) 645-51-25.</p>`,
    `</div>`,
  ].join("");
}

const PHONE = "+79956455125";
const YA_ORG = "https://yandex.ru/maps/org/82867613833";
const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/9f1988fa-044e-4fe0-9ed6-d8c75200c13b.jpg";

function schema(p: PageData): string {
  const url = SITE + p.route;
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": SITE + "#org",
      name: "Такси Дальняк",
      alternateName: "Такси межгород Дальняк",
      url: SITE,
      logo: LOGO,
      image: LOGO,
      telephone: PHONE,
      priceRange: "от 30 ₽/км",
      areaServed: { "@type": "Country", name: "Россия" },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: PHONE,
        contactType: "customer service",
        areaServed: "RU",
        availableLanguage: "Russian",
      },
      sameAs: [
        YA_ORG,
        "https://t.me/Mezhgorod1816",
        "https://t.me/gorodvgorode1",
      ],
    },
    {
      "@type": "TaxiService",
      "@id": url + "#service",
      name: `Такси Дальняк — ${p.city}`,
      description: p.description,
      url,
      telephone: PHONE,
      image: LOGO,
      serviceType: "Междугороднее такси",
      provider: { "@id": SITE + "#org" },
      areaServed:
        p.city === "Россия"
          ? { "@type": "Country", name: "Россия" }
          : { "@type": "City", name: p.city },
      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59",
      },
    },
    {
      "@type": "WebPage",
      "@id": url + "#page",
      url,
      name: p.title,
      description: p.description,
      isPartOf: { "@id": SITE + "#org" },
      inLanguage: "ru-RU",
    },
  ];

  if (p.route !== "/") {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: p.city, item: url },
      ],
    });
  }

  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
  return `<script type="application/ld+json">${json.replace(/</g, "\\u003c")}</script>`;
}

function head(p: PageData): string {
  const url = SITE + p.route;
  return [
    `<title>${esc(p.title)}</title>`,
    `<meta name="description" content="${esc(p.description)}"/>`,
    p.keywords ? `<meta name="keywords" content="${esc(p.keywords)}"/>` : "",
    `<link rel="canonical" href="${url}"/>`,
    `<meta property="og:title" content="${esc(p.title)}"/>`,
    `<meta property="og:description" content="${esc(p.description)}"/>`,
    `<meta property="og:url" content="${url}"/>`,
    schema(p),
  ].filter(Boolean).join("\n    ");
}

export function prerender(): Plugin {
  let root = process.cwd();
  return {
    name: "seo-prerender",
    apply: "build",
    configResolved(cfg) {
      root = cfg.root;
    },
    closeBundle() {
      const outDir = path.join(root, "dist");
      const tplPath = path.join(outDir, "index.html");
      if (!fs.existsSync(tplPath)) return;
      const tpl = fs.readFileSync(tplPath, "utf-8");
      const pages = collect(root);

      for (const p of pages) {
        let html = tpl;
        html = html.replace(/<title>[\s\S]*?<\/title>/, "");
        html = html.replace(/<meta name="description"[^>]*>/, "");
        html = html.replace(/<meta name="keywords"[^>]*>/, "");
        html = html.replace(/<link rel="canonical"[^>]*>/, "");
        html = html.replace(/<meta property="og:title"[^>]*>/, "");
        html = html.replace(/<meta property="og:description"[^>]*>/, "");
        html = html.replace(/<meta property="og:url"[^>]*>/, "");
        html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");
        html = html.replace("</head>", `    ${head(p)}\n</head>`);
        html = html.replace('<div id="root"></div>', `<div id="root">${body(p)}</div>`);

        const target =
          p.route === "/" ? tplPath : path.join(outDir, p.route.slice(1), "index.html");
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, html, "utf-8");
      }
      console.log(`[seo-prerender] готово: ${pages.length} страниц`);
    },
  };
}