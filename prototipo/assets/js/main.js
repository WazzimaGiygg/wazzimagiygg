/* ============================================================
   WIKI WORK WORLD | Wiki wiZZard Model
   Script principal de interface
   ============================================================ */

// Aguarda o DOM carregar
document.addEventListener("DOMContentLoaded", () => {
  console.log("🌐 WIKI WORK WORLD iniciado");

  // === 1. Menu Responsivo ===
  const navToggle = document.querySelector("#menu-toggle");
  const navMenu = document.querySelector("nav ul");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("open");
      navToggle.classList.toggle("active");
    });
  }

  // === 2. Scroll Suave para âncoras ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // === 3. Tema Claro/Escuro ===
  const themeBtn = document.querySelector("#theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-theme");
      const mode = document.body.classList.contains("dark-theme") ? "🌙 Escuro" : "☀️ Claro";
      console.log(`Tema alterado: ${mode}`);
    });
  }

  // === 4. Efeitos de Aparição (Scroll Animation) ===
  const elements = document.querySelectorAll(".feature, .hero");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.2 });

  elements.forEach(el => observer.observe(el));

  // === 5. Saudação Dinâmica ===
  const heroTitle = document.querySelector(".hero h2");
  if (heroTitle) {
    const hora = new Date().getHours();
    let saudacao = "Olá!";
    if (hora >= 5 && hora < 12) saudacao = "Bom dia ☀️";
    else if (hora >= 12 && hora < 18) saudacao = "Boa tarde 🌤️";
    else saudacao = "Boa noite 🌙";

    heroTitle.textContent = `${saudacao} — Construindo o conhecimento coletivo do mundo.`;
  }
});
