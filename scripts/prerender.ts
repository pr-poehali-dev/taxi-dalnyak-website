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
  });

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
      h1: (str(src, "h1") || `Такси из ${rod} в другой город`).replace(/\[\/?gold\]/g, ""),
      about: str(src, "about"),
      features: arr(src, "features").slice(0, 8),
      routes: arr(src, "routes").slice(0, 40),
      city: str(src, "city"),
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

function head(p: PageData): string {
  const url = SITE + p.route;
  return [
    `<title>${esc(p.title)}</title>`,
    `<meta name="description" content="${esc(p.description)}"/>`,
    `<link rel="canonical" href="${url}"/>`,
    `<meta property="og:title" content="${esc(p.title)}"/>`,
    `<meta property="og:description" content="${esc(p.description)}"/>`,
    `<meta property="og:url" content="${url}"/>`,
  ].join("\n    ");
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
        html = html.replace(/<link rel="canonical"[^>]*>/, "");
        html = html.replace(/<meta property="og:title"[^>]*>/, "");
        html = html.replace(/<meta property="og:description"[^>]*>/, "");
        html = html.replace(/<meta property="og:url"[^>]*>/, "");
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
