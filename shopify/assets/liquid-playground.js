/* Liquid playground: изпълнява Liquid в браузъра с LiquidJS + имитация на Shopify филтрите.
   Нужни са: liquidjs (UMD) и mock-store.js, заредени преди този файл.

   Употреба в урок:
   <div class="lp" data-id="ex1">
     <p class="lp-task">Текст на задачата</p>
     <script type="text/plain" data-role="start">{{ product.title }}</script>
     <script type="text/plain" data-role="expected">ЛЕНЕНА РИЗА</script>
     <script type="text/plain" data-role="hint">Подсказка…</script>
     <script type="text/plain" data-role="solution">{{ product.title | upcase }}</script>
   </div>
   Без data-role="expected" блокът е свободен пясъчник без проверка. */
(function (root) {
  // LiquidJS подава именуваните параметри (width: 400) като двойки [ключ, стойност]
  function kwargs(args) {
    const o = {};
    args.forEach(a => { if (Array.isArray(a) && a.length === 2 && typeof a[0] === "string") o[a[0]] = a[1]; });
    return o;
  }
  function amount(cents) {
    const [int, dec] = (Number(cents) / 100).toFixed(2).split(".");
    return int.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + dec;
  }
  // Имитация на bg.json от locales/
  const LOCALE = {
    products: { sale: "Промоция", sold_out: "Изчерпан", from: "от {{ price }}" },
    cart: { items: { one: "{{ count }} продукт", other: "{{ count }} продукта" } }
  };

  function registerShopifyFilters(engine) {
    const nil = v => v === null || v === undefined || v === "";
    engine.registerFilter("money", c => nil(c) ? "" : amount(c) + " €");
    engine.registerFilter("money_with_currency", c => nil(c) ? "" : amount(c) + " € EUR");
    engine.registerFilter("money_without_currency", c => nil(c) ? "" : amount(c));
    engine.registerFilter("money_without_trailing_zeros", c => nil(c) ? "" : (Number(c) % 100 === 0 ? amount(c).split(",")[0] : amount(c)) + " €");
    engine.registerFilter("image_url", function (img, ...args) {
      if (!img) return "";
      const o = kwargs(args), src = typeof img === "string" ? img : img.src;
      const q = Object.entries(o).map(([k, v]) => k + "=" + v).join("&");
      return "//cdn.shopify.com/s/files/demo/" + src + (q ? "?" + q : "");
    });
    engine.registerFilter("image_tag", function (url, ...args) {
      const o = kwargs(args);
      const attrs = Object.entries(o).map(([k, v]) => ` ${k}="${v}"`).join("");
      return `<img src="${url}"${attrs} loading="lazy">`;
    });
    engine.registerFilter("pluralize", (n, one, many) => Number(n) === 1 ? one : many);
    const translate = function (key, ...args) {
      const o = kwargs(args);
      let v = String(key).split(".").reduce((a, k) => a && a[k], LOCALE);
      if (v && typeof v === "object") v = Number(o.count) === 1 ? v.one : v.other;
      if (typeof v !== "string") return "Translation missing: bg." + key;
      return v.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => o[k] !== undefined ? o[k] : "");
    };
    engine.registerFilter("t", translate);
    engine.registerFilter("translate", translate);
    engine.registerFilter("json", v => JSON.stringify(v));
    // В Shopify делението на цяло число се закръгля надолу: 7 | divided_by: 2 = 3
    engine.registerFilter("divided_by", (a, b) => Number.isInteger(Number(b)) ? Math.floor(Number(a) / Number(b)) : Number(a) / Number(b));
    return engine;
  }

  function createEngine() {
    const L = root.liquidjs;
    return registerShopifyFilters(new L.Liquid({ strictFilters: true }));
  }

  const norm = s => String(s).replace(/\s+/g, " ").trim();
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function mount(el) {
    const engine = createEngine();
    const part = r => { const n = el.querySelector(`[data-role="${r}"]`); return n ? n.textContent.replace(/^\n/, "").replace(/\s+$/, "") : null; };
    const start = part("start") || "", expected = part("expected"), hint = part("hint"), solution = part("solution");
    const id = el.dataset.id || ("lp" + Math.random().toString(36).slice(2, 7));
    const KEY = "lp:" + location.pathname + ":" + id;
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}

    const box = document.createElement("div");
    box.className = "lp-box";
    box.innerHTML = `
      <label class="lp-label" for="${id}-code">Твоят Liquid</label>
      <textarea id="${id}-code" class="lp-code" spellcheck="false" rows="${Math.max(3, start.split("\n").length + 1)}"></textarea>
      <div class="lp-cols">
        <div class="lp-col"><div class="lp-label">Резултат</div><pre class="lp-out" aria-live="polite"></pre></div>
        ${expected !== null ? `<div class="lp-col"><div class="lp-label">Трябва да излезе</div><pre class="lp-exp">${esc(expected)}</pre></div>` : ""}
      </div>
      <div class="lp-bar">
        <span class="lp-status" role="status"></span>
        <span class="lp-actions">
          ${hint ? `<button type="button" class="lp-btn" data-act="hint">Подсказка</button>` : ""}
          ${solution ? `<button type="button" class="lp-btn" data-act="solution">Решение</button>` : ""}
          <button type="button" class="lp-btn" data-act="reset">Отначало</button>
        </span>
      </div>
      <p class="lp-hint" hidden></p>`;
    el.appendChild(box);

    const ta = box.querySelector(".lp-code"), out = box.querySelector(".lp-out"), status = box.querySelector(".lp-status"), hintEl = box.querySelector(".lp-hint");
    ta.value = saved !== null ? saved : start;

    let timer, runId = 0;
    async function run() {
      const my = ++runId;
      try { localStorage.setItem(KEY, ta.value); } catch (e) {}
      try {
        const html = await engine.parseAndRender(ta.value, root.MOCK_STORE);
        if (my !== runId) return;
        out.textContent = html.trim() === "" ? "(празно)" : html.replace(/^\s*\n|\s+$/g, "");
        out.classList.remove("err");
        if (expected === null) { status.textContent = ""; el.dataset.state = ""; return; }
        const ok = norm(html) === norm(expected);
        el.dataset.state = ok ? "ok" : "no";
        status.textContent = ok ? "✓ Вярно" : "Още не съвпада";
        el.dispatchEvent(new CustomEvent("lp:checked", { bubbles: true, detail: { id, ok } }));
      } catch (e) {
        if (my !== runId) return;
        out.textContent = "Грешка: " + (e.message || e).toString().split("\n")[0];
        out.classList.add("err");
        el.dataset.state = "no";
        status.textContent = "Liquid не може да се изпълни";
      }
    }
    ta.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(run, 250); });
    ta.addEventListener("keydown", e => {
      if (e.key === "Tab") { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText("  ", s, ta.selectionEnd, "end"); ta.dispatchEvent(new Event("input")); }
    });
    box.addEventListener("click", e => {
      const act = e.target.dataset && e.target.dataset.act;
      if (act === "hint") { hintEl.hidden = !hintEl.hidden; hintEl.textContent = hint; }
      if (act === "solution") { ta.value = solution; run(); }
      if (act === "reset") { ta.value = start; run(); }
    });
    run();
  }

  root.ShopifyLiquid = { createEngine, registerShopifyFilters, mount };
  if (typeof document !== "undefined") {
    const go = () => document.querySelectorAll(".lp").forEach(mount);
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", go) : go();
  }
})(typeof window !== "undefined" ? window : globalThis);
