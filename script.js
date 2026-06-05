/* ============================================================
   CONFIG — Edita aqui antes de publicar
   ============================================================ */
const PRODUCT_NAME = "90 Recetas Fáciles con Carne Molida";
const PRICE = "US$ 5.90";
const OLD_PRICE = "US$ 19.90";
const CHECKOUT_URL = "#";

const CONFIG = {
  PRICE_BASIC:       "US$ 5.90",
  PRICE_COMPLETE:    "US$ 19.90",
  PRICE_UPSELL_ADD:  "US$ 9.90",   // valor ADICIONAL cobrado no upsell
  CHECKOUT_BASIC:    "#",           // ← Link checkout básico
  CHECKOUT_COMPLETE: "#",           // ← Link checkout completo
  GUARANTEE_DAYS:    "7",
  COUNTDOWN_HOURS:   23,            // horas do timer ao abrir pela 1ª vez
  COUNTDOWN_KEY:     "cm90_end",    // chave localStorage
};

document.addEventListener("DOMContentLoaded", () => {

  /* ----------------------------------------------------------
     CRONÔMETRO — persiste via localStorage
  ---------------------------------------------------------- */
  (() => {
    const now    = Date.now();
    const stored = parseInt(localStorage.getItem(CONFIG.COUNTDOWN_KEY) || "0", 10);
    let end      = (stored && stored > now) ? stored : now + CONFIG.COUNTDOWN_HOURS * 3_600_000;
    localStorage.setItem(CONFIG.COUNTDOWN_KEY, end.toString());

    const elH = document.getElementById("cd-h");
    const elM = document.getElementById("cd-m");
    const elS = document.getElementById("cd-s");
    if (!elH) return;

    const pad = n => String(n).padStart(2, "0");

    const tick = () => {
      let diff = Math.max(0, end - Date.now());
      elH.textContent = pad(Math.floor(diff / 3_600_000));
      elM.textContent = pad(Math.floor((diff % 3_600_000) / 60_000));
      elS.textContent = pad(Math.floor((diff % 60_000) / 1_000));
      if (diff <= 0) {
        end = Date.now() + CONFIG.COUNTDOWN_HOURS * 3_600_000;
        localStorage.setItem(CONFIG.COUNTDOWN_KEY, end.toString());
      }
    };
    tick();
    setInterval(tick, 1000);
  })();

  /* ----------------------------------------------------------
     SCROLL REVEAL
  ---------------------------------------------------------- */
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
    }),
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal-up,.reveal-left,.reveal-right").forEach(el => obs.observe(el));

  /* ----------------------------------------------------------
     SMOOTH SCROLL
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href="#oferta"]').forEach(a =>
    a.addEventListener("click", e => {
      e.preventDefault();
      document.getElementById("oferta")?.scrollIntoView({ behavior: "smooth", block: "start" });
    })
  );
  document.querySelectorAll('a[href="#dolor"]').forEach(a =>
    a.addEventListener("click", e => {
      e.preventDefault();
      document.getElementById("dolor")?.scrollIntoView({ behavior: "smooth" });
    })
  );

  /* ----------------------------------------------------------
     FLOATING CTA — aparece ao 25% do scroll
  ---------------------------------------------------------- */
  const floatEl = document.getElementById("floating-cta");
  let shown = false;
  window.addEventListener("scroll", () => {
    if (shown) return;
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    if (pct >= 25) { shown = true; floatEl?.classList.add("visible"); }
  }, { passive: true });

  document.getElementById("floating-cta-btn")?.addEventListener("click", e => {
    e.preventDefault();
    document.getElementById("oferta")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ----------------------------------------------------------
     FAQ ACCORDION
  ---------------------------------------------------------- */
  document.querySelectorAll(".faq-q").forEach(btn => {
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".faq-q").forEach(b => {
        b.setAttribute("aria-expanded", "false");
        b.nextElementSibling?.classList.remove("open");
      });
      if (!isOpen) {
        btn.setAttribute("aria-expanded", "true");
        btn.nextElementSibling?.classList.add("open");
      }
    });
  });

  /* ----------------------------------------------------------
     CARROSSEL TESTIMONIOS (mobile)
  ---------------------------------------------------------- */
  (() => {
    const grid  = document.getElementById("testimonios-grid");
    const dots  = document.getElementById("slider-dots");
    const prev  = document.getElementById("btn-prev");
    const next  = document.getElementById("btn-next");
    if (!grid || !dots) return;

    const cards = [...grid.querySelectorAll(".test-card")];
    let cur = 0, slider = false;

    const mkDots = () => {
      dots.innerHTML = "";
      cards.forEach((_, i) => {
        const d = Object.assign(document.createElement("span"), { className: "slider-dot" + (i === cur ? " active" : "") });
        d.addEventListener("click", () => go(i));
        dots.appendChild(d);
      });
    };
    const updDots = () => dots.querySelectorAll(".slider-dot").forEach((d, i) => d.classList.toggle("active", i === cur));
    const go = idx => {
      cur = (idx + cards.length) % cards.length;
      cards.forEach((c, i) => c.style.display = i === cur ? "block" : "none");
      updDots();
    };
    const startSlider = () => { slider = true; cards.forEach((c, i) => c.style.display = i === cur ? "block" : "none"); mkDots(); };
    const stopSlider  = () => { slider = false; cards.forEach(c => c.style.display = ""); dots.innerHTML = ""; };

    prev?.addEventListener("click", () => go(cur - 1));
    next?.addEventListener("click", () => go(cur + 1));

    let tx = 0;
    grid.addEventListener("touchstart", e => { tx = e.touches[0].clientX; }, { passive: true });
    grid.addEventListener("touchend", e => {
      if (!slider) return;
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) go(dx < 0 ? cur + 1 : cur - 1);
    }, { passive: true });

    const check = () => {
      if (window.innerWidth <= 900) { if (!slider) startSlider(); }
      else { if (slider) stopSlider(); }
    };
    check();
    window.addEventListener("resize", check);
  })();

  /* ----------------------------------------------------------
     UPSELL POPUP — básico abre popup, popup oferece +US$ 9.90
  ---------------------------------------------------------- */
  const overlay   = document.getElementById("upsell-overlay");
  const btnBasic  = document.getElementById("cta-basic");
  const btnYes    = document.getElementById("upsell-yes");
  const btnNo     = document.getElementById("upsell-no");

  const openUp  = e => { e?.preventDefault(); overlay?.classList.add("active"); document.body.style.overflow = "hidden"; };
  const closeUp = () => { overlay?.classList.remove("active"); document.body.style.overflow = ""; };
  const goBasic    = () => { closeUp(); if (CONFIG.CHECKOUT_BASIC    !== "#") window.open(CONFIG.CHECKOUT_BASIC,    "_blank", "noopener"); };
  const goComplete = () => { closeUp(); if (CONFIG.CHECKOUT_COMPLETE !== "#") window.open(CONFIG.CHECKOUT_COMPLETE, "_blank", "noopener"); };

  btnBasic?.addEventListener("click", openUp);
  btnNo?.addEventListener("click", goBasic);          // diz "não" → vai pro checkout básico
  btnYes?.addEventListener("click", e => { e.preventDefault(); goComplete(); });

  // Fechar ao clicar fora
  overlay?.addEventListener("click", e => { if (e.target === overlay) closeUp(); });

  // Botão completo direto
  document.getElementById("cta-complete")?.addEventListener("click", e => { e.preventDefault(); goComplete(); });

  /* ----------------------------------------------------------
     VSL LAZY LOAD — Wistia só carrega ao clicar no thumbnail
  ---------------------------------------------------------- */
  (() => {
    const thumb   = document.getElementById("vsl-thumb");
    const wrapper = document.getElementById("vsl-wrapper");
    if (!thumb || !wrapper) return;

    const loadVSL = () => {
      // Remove thumbnail
      thumb.remove();

      // Injeta iframe Wistia
      const iframe = document.createElement("iframe");
      iframe.src = "https://fast.wistia.net/embed/iframe/r1zwaej3mt?web_component=true&seo=true&autoPlay=true";
      iframe.title = "MINI VSL Video";
      iframe.allow = "autoplay; fullscreen";
      iframe.allowTransparency = true;
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("scrolling", "no");
      iframe.className = "wistia_embed";
      iframe.name = "wistia_embed";
      wrapper.appendChild(iframe);

      // Injeta player.js dinamicamente (só uma vez)
      if (!document.querySelector('script[src*="wistia"]')) {
        const s = document.createElement("script");
        s.src = "https://fast.wistia.net/player.js";
        s.async = true;
        document.head.appendChild(s);
      }
    };

    thumb.addEventListener("click", loadVSL);
    thumb.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); loadVSL(); } });
  })();

  // Hero CTA → abre checkout se configurado, senão rola para oferta
  document.getElementById("cta-hero")?.addEventListener("click", e => {
    e.preventDefault();
    if (typeof CHECKOUT_URL !== "undefined" && CHECKOUT_URL !== "#" && CHECKOUT_URL !== "") {
      window.open(CHECKOUT_URL, "_blank", "noopener");
    } else {
      document.getElementById("oferta")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  document.getElementById("cta-paraquien")?.addEventListener("click", e => {
    e.preventDefault();
    document.getElementById("oferta")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.getElementById("cta-final-btn")?.addEventListener("click", e => {
    e.preventDefault();
    document.getElementById("oferta")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ----------------------------------------------------------
     LAZY LOADING fallback
  ---------------------------------------------------------- */
  if (!("loading" in HTMLImageElement.prototype)) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { const img = e.target; if (img.dataset.src) img.src = img.dataset.src; io.unobserve(img); }
    }));
    document.querySelectorAll('img[loading="lazy"]').forEach(img => io.observe(img));
  }

  console.log("%c🌮 90 Recetas — Básico %s | Completo %s", "color:#c0392b;font-weight:bold", CONFIG.PRICE_BASIC, CONFIG.PRICE_COMPLETE);
});
