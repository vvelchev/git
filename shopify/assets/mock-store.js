/* Примерни данни за упражненията. Имитират Shopify обектите на продуктова страница.
   Цените са в евроцентове, както ги връща Shopify (4999 = 49,99 €). */
(function (root) {
  const variants = [
    { id: 101, title: "S / Бял",   price: 4999, compare_at_price: 6500, available: true,  inventory_quantity: 4,  sku: "LR-S-WH" },
    { id: 102, title: "M / Бял",   price: 4999, compare_at_price: 6500, available: false, inventory_quantity: 0,  sku: "LR-M-WH" },
    { id: 103, title: "L / Бял",   price: 4999, compare_at_price: 6500, available: true,  inventory_quantity: 12, sku: "LR-L-WH" },
    { id: 104, title: "M / Маслинен", price: 5499, compare_at_price: null, available: true, inventory_quantity: 2, sku: "LR-M-OL" }
  ];
  const product = {
    id: 1, title: "Ленена риза", handle: "lenena-riza", vendor: "Горска сянка",
    type: "Ризи", url: "/products/lenena-riza",
    price: 4999, compare_at_price: 6500, available: true,
    price_min: 4999, price_max: 5499, price_varies: true,
    compare_at_price_min: 6500, compare_at_price_max: 6500, compare_at_price_varies: false,
    has_only_default_variant: false,
    tags: ["лято", "лен", "нова"],
    description: "<p>Лека риза от <strong>100% лен</strong>. Идеална за горещите дни.</p>",
    featured_image: { src: "lenena-riza.jpg", alt: "Ленена риза, бяла", width: 1600, height: 2000 },
    variants: variants,
    selected_or_first_available_variant: variants[0],
    published_at: "2026-09-15T09:30:00+03:00"
  };
  const products = [
    product,
    { title: "Сламена шапка", handle: "slamena-shapka", url: "/products/slamena-shapka", price: 2900, compare_at_price: null, available: true, vendor: "Горска сянка", tags: ["лято"] },
    { title: "Платнена чанта", handle: "platnena-chanta", url: "/products/platnena-chanta", price: 1800, compare_at_price: 2400, available: false, vendor: "Ръчно БГ", tags: ["аксесоари"] },
    { title: "Сандали от кожа", handle: "sandali-ot-kozha", url: "/products/sandali-ot-kozha", price: 8900, compare_at_price: null, available: true, vendor: "Ръчно БГ", tags: ["лято", "кожа"] }
  ];
  root.MOCK_STORE = {
    shop: { name: "Горска сянка", currency: "EUR", url: "https://gorska-syanka.myshopify.com" },
    product: product,
    collection: { title: "Лятна колекция", handle: "lyato", products: products, products_count: products.length },
    cart: { item_count: 3, total_price: 13798 },
    customer: null,
    settings: { show_vendor: true, accent_color: "#0B6B4D" },
    section: { id: "sale-products", settings: { heading: "На промоция", products_to_show: 3 } },
    request: { locale: { iso_code: "bg" }, page_type: "product" }
  };
})(typeof window !== "undefined" ? window : globalThis);
