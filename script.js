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
  let rekentoolRevealed = false;

  function calcValues() {
    const admins = parseFloat(calcAdmins.value) || 0;
    const urenPerAdmin = parseFloat(calcUren.value) || 0;
    const tarief = parseFloat(calcTarief.value) || 0;

    const huidigeUren = admins * urenPerAdmin * 12;
    const besparing = Math.round(huidigeUren * 0.40);
    const waardeBesparing = Math.round(besparing * tarief);
    const urenJaar = urenPerAdmin * 12;
    const extraAdmins = urenJaar > 0 ? Math.floor(besparing / urenJaar) : 0;

    return { besparing, waardeBesparing, extraAdmins };
  }

  function setRekentoolStatic() {
    const v = calcValues();
    resultUren.textContent = numFormat.format(v.besparing);
    resultWaarde.textContent = euroFormat.format(v.waardeBesparing);
    resultExtra.textContent = numFormat.format(v.extraAdmins);
    prevUren = v.besparing;
    prevWaarde = v.waardeBesparing;
    prevExtra = v.extraAdmins;
  }

  function updateRekentool(animate) {
    const v = calcValues();
    const dur = animate ? 1200 : 600;

    animateValue(resultUren, animate ? 0 : prevUren, v.besparing, dur, (val) => numFormat.format(val));
    animateValue(resultWaarde, animate ? 0 : prevWaarde, v.waardeBesparing, dur, (val) => euroFormat.format(val));
    animateValue(resultExtra, animate ? 0 : prevExtra, v.extraAdmins, dur, (val) => numFormat.format(val));

    prevUren = v.besparing;
    prevWaarde = v.waardeBesparing;
    prevExtra = v.extraAdmins;
  }

  if (calcAdmins && calcUren && calcTarief) {
    // Show correct static values immediately
    setRekentoolStatic();

    [calcAdmins, calcUren, calcTarief].forEach((input) => {
      input.addEventListener("input", () => updateRekentool(false));
    });

    // Animate from 0 when section scrolls into view
    const rekentoolSection = document.getElementById("rekentool");
    if (rekentoolSection) {
      const rekentoolObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !rekentoolRevealed) {
            rekentoolRevealed = true;
            updateRekentool(true);
            rekentoolObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      rekentoolObserver.observe(rekentoolSection);
    }
  }

  // --- Scroll-reveal (Intersection Observer) ---
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll(".reveal").forEach((el) => {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("is-visible");
    });
  }

  // --- Animated counters in cijfersectie ---
  const statNumbers = document.querySelectorAll(".stat-number[data-count-to]");

  if (statNumbers.length > 0) {
    function animateCounter(el) {
      const target = parseInt(el.dataset.countTo, 10);
      const suffix = el.dataset.countSuffix || "";
      const displayTemplate = el.dataset.countDisplay || null;
      const duration = 1800;
      const startTime = performance.now();

      function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
      }

      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutQuart(progress);
        const current = Math.round(eased * target);

        if (displayTemplate) {
          el.textContent = displayTemplate.replace("{n}", current);
        } else {
          el.textContent = current + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      }

      if (prefersReducedMotion) {
        if (displayTemplate) {
          el.textContent = displayTemplate.replace("{n}", target);
        } else {
          el.textContent = target + suffix;
        }
      } else {
        if (displayTemplate) {
          el.textContent = displayTemplate.replace("{n}", "0");
        } else {
          el.textContent = "0" + suffix;
        }
        requestAnimationFrame(tick);
      }
    }

    const statsSection = document.getElementById("cijfers");
    if (statsSection) {
      let statsAnimated = false;
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;
            statNumbers.forEach(animateCounter);
            statsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      statsObserver.observe(statsSection);
    }
  }

  // --- Scroll progress bar ---
  const progressBar = document.getElementById("scroll-progress");

  // --- Hero parallax ---
  const heroBg = document.getElementById("hero-bg");
  const heroContent = document.querySelector(".hero-content");
  const heroSection = document.getElementById("hero");
  const isDesktop = window.matchMedia("(min-width: 768px)").matches;
  let ticking = false;

  function onScroll() {
    const scrollY = window.scrollY;

    // Progress bar
    if (progressBar && !prefersReducedMotion) {
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = scrollHeight > 0 ? (scrollY / scrollHeight) * 100 : 0;
      progressBar.style.width = pct + "%";
    }

    // Hero parallax (desktop only)
    if (isDesktop && !prefersReducedMotion && heroSection) {
      const heroH = heroSection.offsetHeight;
      if (scrollY <= heroH) {
        const scale = 1 + (scrollY / 600) * 0.05;
        if (heroBg) {
          heroBg.style.transform = "translateY(" + (scrollY * 0.4) + "px) scale(" + Math.min(scale, 1.05) + ")";
        }
        if (heroContent) {
          const opacity = 1 - (scrollY / heroH) * 0.7;
          heroContent.style.opacity = Math.max(opacity, 0.3);
        }
      }
    }

    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // --- Magnetic buttons ---
  const canHover = window.matchMedia("(hover: hover)").matches;
  if (canHover && !prefersReducedMotion) {
    document.querySelectorAll(".btn-primary").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          btn.style.transform = "translate(" + (dx * 0.2) + "px, " + (dy * 0.2) + "px)";
        }
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0, 0)";
      });
    });
  }

  // --- 3D Tilt effect op smaken-kaarten en visie-blokken ---
  if (canHover && !prefersReducedMotion) {
    const tiltCards = document.querySelectorAll(".smaak-card, .visie-block");
    tiltCards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotateX = (y - 0.5) * -10;
        const rotateY = (x - 0.5) * 10;
        card.style.transform = "perspective(1000px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) scale(1.02)";
        card.style.setProperty("--mouse-x", (x * 100) + "%");
        card.style.setProperty("--mouse-y", (y * 100) + "%");
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
      });
    });
  }

  // --- Werkdag tijdlijn ---
  const werkdagData = [
    {
      fase: "Start van de dag",
      profit: "Mailbox checken. 14 mailtjes van klanten met bonnetjes en vragen. Bijlages downloaden, sorteren, handmatig op de juiste plek in de klantadministratie zetten.",
      sb: "Admin Center openen. Ik zie direct welke klanten vandaag aandacht nodig hebben. Bonnen staan al in het systeem via de AFAS Link app.",
      stressProfit: 14,
      stressSB: 3
    },
    {
      fase: "Btw-aangifte voorbereiden",
      profit: "Per klantadministratie schakelen via grootboekrekeningen, btw-overzicht draaien, controleren, exporteren naar Excel. De rondrekening reken ik handmatig na, want die is er niet.",
      sb: "Per klant een eigen administratie, gebouwd op het Referentie Grootboekschema (RGS). De btw-rondrekening verschijnt automatisch. Ik check de afwijkingen die SB heeft gesignaleerd. Goedkeuren, klaar.",
      stressProfit: 11,
      stressSB: 2
    },
    {
      fase: "Lunch",
      profit: "Snel even, want vanmiddag moet ik nog drie jaarrekeningen in elkaar zetten.",
      sb: "Rustig. Drie jaarrekeningen staan al klaar, alleen nog controleren vanmiddag.",
      stressProfit: 9,
      stressSB: 2
    },
    {
      fase: "Klant belt met vraag",
      profit: "Klant vraagt naar een factuur. Ik zoek in de mail, in de klantmap, in Profit. Geen klanttoegang, dus ik moet het opzoeken en terugbellen.",
      sb: "Klant ziet het zelf in zijn eigen dashboard. Ik kijk mee in dezelfde administratie. Vraag direct beantwoord.",
      stressProfit: 8,
      stressSB: 1
    },
    {
      fase: "Jaarrekening maken",
      profit: "Cijfers verzamelen uit de klantadministratie, kruisverbanden controleren, exports maken, Word-document opmaken, PDF genereren.",
      sb: "Klik op \u2018Jaarrekening genereren\u2019. Doordat SB op het Referentie Grootboekschema (RGS) draait, staan alle posten op de juiste plek. Ik check, pas wat tekst aan, klaar.",
      stressProfit: 6,
      stressSB: 1
    },
    {
      fase: "Einde werkdag",
      profit: "Lijstje van morgen maken. Gisteren ben ik tot 19:00 doorgegaan. Vandaag hopelijk niet.",
      sb: "Laptop dicht. Klanten hebben hun cijfers gezien, jaarrekeningen liggen klaar. Tijd voor thuis.",
      stressProfit: 5,
      stressSB: 0
    }
  ];

  const werkdagDots = document.querySelectorAll(".werkdag-dot");
  const werkdagProfitEl = document.getElementById("werkdagProfit");
  const werkdagSBEl = document.getElementById("werkdagSB");
  const werkdagFaseEl = document.getElementById("werkdagFase");
  let werkdagIndex = 0;

  function setWerkdagSlide(index) {
    werkdagIndex = index;
    var d = werkdagData[index];

    // Update dots
    werkdagDots.forEach(function(dot, i) {
      dot.classList.toggle("is-active", i === index);
      dot.setAttribute("aria-selected", i === index ? "true" : "false");
    });

    // Fase title
    if (werkdagFaseEl) werkdagFaseEl.textContent = d.fase;

    if (prefersReducedMotion) {
      // Direct swap
      if (werkdagProfitEl) {
        werkdagProfitEl.innerHTML = '<p class="werkdag-col__text">' + d.profit + '</p>' +
          '<span class="werkdag-stress">Openstaande taken: <strong>' + d.stressProfit + '</strong></span>';
      }
      if (werkdagSBEl) {
        werkdagSBEl.innerHTML = '<p class="werkdag-col__text">' + d.sb + '</p>' +
          (d.stressSB > 0 ? '<span class="werkdag-stress werkdag-stress--sb">Openstaande taken: <strong>' + d.stressSB + '</strong></span>' : '<span class="werkdag-stress werkdag-stress--sb">Alles afgehandeld \u2713</span>');
      }
    } else {
      // Fade transition
      [werkdagProfitEl, werkdagSBEl].forEach(function(el) {
        if (el) el.style.opacity = "0";
      });
      setTimeout(function() {
        if (werkdagProfitEl) {
          werkdagProfitEl.innerHTML = '<p class="werkdag-col__text">' + d.profit + '</p>' +
            '<span class="werkdag-stress">Openstaande taken: <strong>' + d.stressProfit + '</strong></span>';
        }
        if (werkdagSBEl) {
          werkdagSBEl.innerHTML = '<p class="werkdag-col__text">' + d.sb + '</p>' +
            (d.stressSB > 0 ? '<span class="werkdag-stress werkdag-stress--sb">Openstaande taken: <strong>' + d.stressSB + '</strong></span>' : '<span class="werkdag-stress werkdag-stress--sb">Alles afgehandeld \u2713</span>');
        }
        [werkdagProfitEl, werkdagSBEl].forEach(function(el) {
          if (el) el.style.opacity = "1";
        });
      }, 200);
    }
  }

  werkdagDots.forEach(function(dot) {
    dot.addEventListener("click", function() {
      var idx = parseInt(dot.getAttribute("data-index"), 10);
      setWerkdagSlide(idx);
    });
  });

  // --- Klantverhalen Carousel ---
  (function() {
    var track = document.getElementById("kvTrack");
    if (!track) return;

    var prevBtns = [document.getElementById("kvPrev"), document.getElementById("kvPrevMobile")];
    var nextBtns = [document.getElementById("kvNext"), document.getElementById("kvNextMobile")];
    var allArrows = prevBtns.concat(nextBtns).filter(Boolean);
    var kvAutoTimer = null;
    var kvAutoDelay = null;

    function getCardWidth() {
      var card = track.querySelector(".kv-card");
      if (!card) return 300;
      var style = getComputedStyle(track);
      var gap = parseInt(style.gap) || 24;
      return card.offsetWidth + gap;
    }

    function updateArrows() {
      var atStart = track.scrollLeft <= 4;
      var atEnd = track.scrollLeft + track.offsetWidth >= track.scrollWidth - 4;
      prevBtns.forEach(function(b) {
        if (b) {
          b.classList.toggle("is-disabled", atStart);
          b.disabled = atStart;
        }
      });
      nextBtns.forEach(function(b) {
        if (b) {
          b.classList.toggle("is-disabled", atEnd);
          b.disabled = atEnd;
        }
      });
    }

    function scrollNext() {
      track.scrollLeft += getCardWidth();
    }

    function scrollPrev() {
      track.scrollLeft -= getCardWidth();
    }

    nextBtns.forEach(function(b) {
      if (b) b.addEventListener("click", function() { pauseAutoplay(); scrollNext(); });
    });
    prevBtns.forEach(function(b) {
      if (b) b.addEventListener("click", function() { pauseAutoplay(); scrollPrev(); });
    });

    track.addEventListener("scroll", updateArrows, { passive: true });
    updateArrows();

    // Auto-play
    function startAutoplay() {
      stopAutoplay();
      kvAutoTimer = setInterval(function() {
        var atEnd = track.scrollLeft + track.offsetWidth >= track.scrollWidth - 4;
        if (atEnd) {
          track.scrollLeft = 0;
        } else {
          scrollNext();
        }
      }, 5000);
    }

    function stopAutoplay() {
      if (kvAutoTimer) {
        clearInterval(kvAutoTimer);
        kvAutoTimer = null;
      }
    }

    function pauseAutoplay() {
      stopAutoplay();
      if (kvAutoDelay) clearTimeout(kvAutoDelay);
      kvAutoDelay = setTimeout(startAutoplay, 10000);
    }

    // Pause on user interaction
    track.addEventListener("mouseenter", pauseAutoplay);
    track.addEventListener("touchstart", pauseAutoplay, { passive: true });

    // Start auto-play after 3 seconds
    setTimeout(startAutoplay, 3000);

    // Keyboard nav
    track.addEventListener("keydown", function(e) {
      if (e.key === "ArrowRight") { pauseAutoplay(); scrollNext(); }
      if (e.key === "ArrowLeft") { pauseAutoplay(); scrollPrev(); }
    });
  })();

});
