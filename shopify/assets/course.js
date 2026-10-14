/* Общ JS за уроците: оцветяване на кода, бутони „Копирай“, прогрес по стъпките, тестове.

   Тест: <div class="quiz" data-quiz="..."></div> + window.QUIZ = [{ q, o:[...], a, w, from? }]
   Прогрес: бутони .done-btn[data-done="id"] + връзки .side a[data-step="id"] + #pbar/#ptext */
(function () {
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // ---- оцветяване + копиране
  document.querySelectorAll("pre code").forEach(el => {
    const raw = el.textContent;
    let html = esc(raw);
    if (el.classList.contains("lq")) {
      html = html.replace(/(\{%-?[\s\S]*?-?%\}|\{\{-?[\s\S]*?-?\}\})/g, '<span class="t">$1</span>');
    } else if (el.classList.contains("sh")) {
      html = html.split("\n").map(l => /^\s*#/.test(l) ? '<span class="c">' + l + "</span>" : l).join("\n");
    } else if (el.classList.contains("out")) {
      html = html.replace(/(https?:\/\/\S+)/g, '<span class="o">$1</span>');
    }
    el.innerHTML = html;
    if (el.classList.contains("out") || !el.closest(".code")) return;
    const btn = document.createElement("button");
    btn.className = "copy"; btn.type = "button"; btn.textContent = "Копирай";
    btn.addEventListener("click", () => {
      const text = el.classList.contains("sh")
        ? raw.split("\n").filter(l => l.trim() && !/^\s*#/.test(l)).join("\n")
        : raw;
      const ok = () => { btn.textContent = "Копирано"; setTimeout(() => (btn.textContent = "Копирай"), 1400); };
      const fallback = () => { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = "Ctrl+C"; };
      try { navigator.clipboard.writeText(text).then(ok, fallback); } catch (e) { fallback(); }
    });
    el.closest(".code").appendChild(btn);
  });

  // ---- прогрес
  const KEY = "course-done:" + location.pathname;
  let done = {};
  try { done = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
  const steps = [...document.querySelectorAll(".done-btn")];
  function render() {
    let n = 0;
    steps.forEach(b => {
      const on = !!done[b.dataset.done];
      b.setAttribute("aria-pressed", on);
      const link = document.querySelector('.side a[data-step="' + b.dataset.done + '"]');
      if (link) link.classList.toggle("done", on);
      if (on) n++;
    });
    const bar = document.getElementById("pbar"), txt = document.getElementById("ptext");
    if (bar) bar.style.width = (steps.length ? n / steps.length * 100 : 0) + "%";
    if (txt) txt.textContent = n + " от " + steps.length + " стъпки";
  }
  steps.forEach(b => b.addEventListener("click", () => {
    done[b.dataset.done] = !done[b.dataset.done];
    try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {}
    render();
  }));
  render();

  // ---- тест
  document.querySelectorAll(".quiz").forEach(box => {
    const Q = window[box.dataset.quiz || "QUIZ"] || [];
    const scoreEl = document.createElement("div"); scoreEl.className = "score"; scoreEl.hidden = true;
    let answered = 0, correct = 0;
    Q.forEach((item, i) => {
      const d = document.createElement("div"); d.className = "q";
      const p = document.createElement("p"); p.innerHTML = (i + 1) + ". " + item.q + (item.from ? ` <span class="from">${item.from}</span>` : "");
      const opts = document.createElement("div"); opts.className = "opts";
      const why = document.createElement("p"); why.className = "why"; why.hidden = true; why.innerHTML = item.w;
      item.o.forEach((t, j) => {
        const b = document.createElement("button"); b.type = "button"; b.id = (box.id || "quiz") + "-q" + i + "o" + j; b.innerHTML = t;
        b.addEventListener("click", () => {
          [...opts.children].forEach((x, k) => { x.disabled = true; if (k === item.a) x.classList.add("right"); });
          if (j !== item.a) b.classList.add("wrong"); else correct++;
          why.hidden = false; answered++;
          if (answered === Q.length) {
            scoreEl.hidden = false;
            scoreEl.textContent = "Резултат: " + correct + " / " + Q.length + (correct === Q.length ? ". Отлично." : ". Върни се към частите с грешните отговори и опитай пак утре.");
          }
        });
        opts.appendChild(b);
      });
      d.append(p, opts, why); box.appendChild(d);
    });
    box.appendChild(scoreEl);
  });
})();
