// ===== SCRIPT.JS – Interactieve elementen =====

document.addEventListener("DOMContentLoaded", () => {

  // --- Mobiel menu toggle ---
  const navToggle = document.querySelector(".nav-toggle");
  const navList = document.querySelector(".nav-list");

  navToggle?.addEventListener("click", () => {
    const isOpen = navList.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen);
    navToggle.setAttribute("aria-label", isOpen ? "Menu sluiten" : "Menu openen");
  });

  // Sluit menu bij klik op een nav-link
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navList.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Menu openen");
    });
  });

  // --- Scroll shadow op header ---
  const header = document.querySelector(".site-header");

  window.addEventListener("scroll", () => {
    header?.classList.toggle("scrolled", window.scrollY > 0);
  }, { passive: true });

  // --- FAQ Accordeon ---
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen);
    });
  });

  // --- Scroll to top ---
  const scrollBtn = document.getElementById("scroll-top");

  window.addEventListener("scroll", () => {
    scrollBtn?.classList.toggle("visible", window.scrollY > 400);
  }, { passive: true });

  scrollBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // --- Schuif (slider) ---
  const slider = document.getElementById("schuif-slider");
  const pctJij = document.getElementById("schuif-pct-jij");
  const pctKlant = document.getElementById("schuif-pct-klant");
  const result = document.getElementById("schuif-result");
  const resultLabel = document.getElementById("schuif-result-label");
  const resultName = document.getElementById("schuif-result-name");
  const resultDesc = document.getElementById("schuif-result-desc");

  const schuifData = [
    {
      min: 0, max: 30,
      cls: "schuif-result--boekhouden",
      name: "Boekhouden",
      desc: "Jij voert de hele administratie. Je klant levert bonnetjes aan via de AFAS Link app en accordeert aangiftes. Volledige ontzorging."
    },
    {
      min: 31, max: 70,
      cls: "schuif-result--together",
      name: "2Gether",
      desc: "Een logische rolverdeling. Je klant doet zijn dagelijkse zaken zoals factureren en bonnen scannen. Jij houdt regie op de boekhouding en doet de aangiftes en jaarrekening."
    },
    {
      min: 71, max: 100,
      cls: "schuif-result--ondernemen",
      name: "Ondernemen",
      desc: "Je klant doet alles zelf in zijn eigen omgeving. Jij kijkt periodiek mee als vierde oog en geeft advies. Eindcontrole en jaarrekening blijven bij jou."
    }
  ];

  let currentSmaak = "";

  function updateSchuif() {
    const val = parseInt(slider.value, 10);
    const jij = 100 - val;

    pctJij.textContent = jij + "% jij";
    pctKlant.textContent = val + "% klant";

    const match = schuifData.find((d) => val >= d.min && val <= d.max);
    if (match && match.cls !== currentSmaak) {
      currentSmaak = match.cls;
      result.className = "schuif-result " + match.cls;
      resultLabel.textContent = "DIT PAST BIJ JOU";
      resultName.textContent = match.name;
      resultDesc.style.animation = "none";
      // Force reflow to restart animation
      void resultDesc.offsetWidth;
      resultDesc.style.animation = "";
      resultDesc.textContent = match.desc;
    }
  }

  if (slider) {
    slider.addEventListener("input", updateSchuif);
    updateSchuif();
  }

  // --- Rekentool ---
  const calcAdmins = document.getElementById("calc-admins");
  const calcUren = document.getElementById("calc-uren");
  const calcTarief = document.getElementById("calc-tarief");
  const resultUren = document.getElementById("calc-result-uren");
  const resultWaarde = document.getElementById("calc-result-waarde");
  const resultExtra = document.getElementById("calc-result-extra");

  const euroFormat = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  });

  const numFormat = new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: 0
  });

  function animateValue(el, start, end, duration, formatter) {
    const range = end - start;
    if (range === 0) { el.textContent = formatter(end); return; }
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(start + range * eased);
      el.textContent = formatter(current);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  let prevUren = 0, prevWaarde = 0, prevExtra = 0;

  function updateRekentool() {
    const admins = parseFloat(calcAdmins.value) || 0;
    const urenPerAdmin = parseFloat(calcUren.value) || 0;
    const tarief = parseFloat(calcTarief.value) || 0;

    const huidigeUren = admins * urenPerAdmin * 12;
    const besparing = Math.round(huidigeUren * 0.40);
    const waardeBesparing = Math.round(besparing * tarief);
    const urenJaar = urenPerAdmin * 12;
    const extraAdmins = urenJaar > 0 ? Math.floor(besparing / urenJaar) : 0;

    animateValue(resultUren, prevUren, besparing, 600, (v) => numFormat.format(v));
    animateValue(resultWaarde, prevWaarde, waardeBesparing, 600, (v) => euroFormat.format(v));
    animateValue(resultExtra, prevExtra, extraAdmins, 600, (v) => numFormat.format(v));

    prevUren = besparing;
    prevWaarde = waardeBesparing;
    prevExtra = extraAdmins;
  }

  if (calcAdmins && calcUren && calcTarief) {
    [calcAdmins, calcUren, calcTarief].forEach((input) => {
      input.addEventListener("input", updateRekentool);
    });
    updateRekentool();
  }

});
