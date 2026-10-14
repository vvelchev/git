/* Симулатор: полетата Price / Compare-at price от админа → какво вижда Liquid → какво вижда клиентът.
   Нужни са: liquidjs (UMD) и liquid-playground.js, заредени преди този файл.

   Употреба: <div class="price-sim" data-id="sim1"></div>
   Шаблонът, който се изпълнява, е видим в симулатора, за да се види връзката код → резултат. */
(function (root) {
  const TEMPLATE = `{%- assign selected_variant = product.selected_or_first_available_variant -%}
{%- if selected_variant.compare_at_price > selected_variant.price -%}
  {%- assign discount = selected_variant.compare_at_price | minus: selected_variant.price | times: 100 | divided_by: selected_variant.compare_at_price -%}
  <span class="badge">-{{ discount }}%</span>
  <s>{{ selected_variant.compare_at_price | money }}</s>
{%- endif %}
<b>{{ selected_variant.price | money }}</b>`;

  const PRESETS = [
    { label: "Промоция", price: "49,99", cmp: "65,00" },
    { label: "Без стара цена", price: "49,99", cmp: "" },
    { label: "Стара цена 0,00", price: "49,99", cmp: "0,00" },
    { label: "Стара < нова", price: "49,99", cmp: "39,99" }
  ];

  const toCents = v => {
    const s = String(v).trim().replace(/\s/g, "").replace(",", ".");
    if (s === "") return null;
    const n = Number(s);
    return isFinite(n) ? Math.round(n * 100) : NaN;
  };
  const show = v => v === null ? "nil" : String(v);

  function mount(el) {
    const id = el.dataset.id || "sim";
    const engine = root.ShopifyLiquid.createEngine();
    el.innerHTML = `
      <div class="ps-grid">
        <div class="ps-admin" role="group" aria-labelledby="${id}-h">
          <div class="ps-head" id="${id}-h">Админ · Pricing</div>
          <label for="${id}-price">Price</label>
          <div class="ps-money"><input id="${id}-price" inputmode="decimal" autocomplete="off"><span>€</span></div>
          <label for="${id}-cmp">Compare-at price</label>
          <div class="ps-money"><input id="${id}-cmp" inputmode="decimal" autocomplete="off" placeholder="празно"><span>€</span></div>
          <div class="ps-presets">${PRESETS.map((p, i) => `<button type="button" class="lp-btn" data-p="${i}">${p.label}</button>`).join("")}</div>
        </div>
        <div class="ps-liquid">
          <div class="ps-head">Liquid получава</div>
          <dl class="kv ps-vals"></dl>
        </div>
        <div class="ps-shop">
          <div class="ps-head">Клиентът вижда</div>
          <div class="ps-card"><div class="ps-img" aria-hidden="true"></div><div class="ps-title">Ленена риза</div><div class="ps-out"></div></div>
        </div>
      </div>
      <details class="ps-code"><summary>Liquid кодът, който се изпълнява</summary><pre><code class="lq"></code></pre></details>`;
    el.querySelector(".ps-code code").textContent = TEMPLATE;

    const price = el.querySelector(`#${id}-price`), cmp = el.querySelector(`#${id}-cmp`);
    const vals = el.querySelector(".ps-vals"), out = el.querySelector(".ps-out");

    async function run() {
      const p = toCents(price.value), c = toCents(cmp.value);
      if (p === null || Number.isNaN(p) || Number.isNaN(c)) {
        vals.innerHTML = `<dt>грешка</dt><dd>Въведи число, например 49,99</dd>`;
        out.textContent = "";
        return;
      }
      const sale = c !== null && c > p;
      vals.innerHTML = `
        <dt>variant.price</dt><dd>${p}</dd>
        <dt>variant.compare_at_price</dt><dd>${show(c)}</dd>
        <dt>compare_at_price &gt; price</dt><dd class="${sale ? "yes" : "no"}">${sale}</dd>
        ${sale ? `<dt>отстъпка</dt><dd>(${c} − ${p}) × 100 ÷ ${c} = ${Math.floor((c - p) * 100 / c)}%</dd>` : ""}`;
      const variant = { price: p, compare_at_price: c };
      const html = await engine.parseAndRender(TEMPLATE, { product: { selected_or_first_available_variant: variant } });
      out.innerHTML = html; // шаблонът е наш, данните са числа
    }
    function set(p) { price.value = p.price; cmp.value = p.cmp; run(); }
    price.addEventListener("input", run);
    cmp.addEventListener("input", run);
    el.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => set(PRESETS[b.dataset.p])));
    set(PRESETS[0]);
  }

  if (typeof document !== "undefined") {
    const go = () => document.querySelectorAll(".price-sim").forEach(mount);
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", go) : go();
  }
})(typeof window !== "undefined" ? window : globalThis);
