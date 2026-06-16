const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const navPanel = document.querySelector(".nav-panel");
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const sections = Array.from(document.querySelectorAll("main section[id]"));
const revealItems = document.querySelectorAll(".reveal");
const backToTop = document.querySelector(".back-to-top");
const themeToggle = document.querySelector(".theme-toggle");
const themeToggleText = document.querySelector(".theme-toggle-text");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const root = document.documentElement;
const themeStorageKey = "theme-preference";

const getCurrentTheme = () =>
  root.getAttribute("data-theme") === "dark" ? "dark" : "light";

const syncThemeUi = () => {
  const isDark = getCurrentTheme() === "dark";

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );
  }

  if (themeToggleText) {
    themeToggleText.textContent = isDark ? "Light mode" : "Dark mode";
  }

  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", isDark ? "#0f161b" : "#f6f4f1");
  }
};

const closeMenu = () => {
  if (!menuToggle || !navPanel) {
    return;
  }

  navPanel.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  body.classList.remove("menu-open");
};

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", nextTheme);

    try {
      localStorage.setItem(themeStorageKey, nextTheme);
    } catch (error) {
      // Ignore storage failures and keep the chosen theme for this session.
    }

    syncThemeUi();
  });
}

if (menuToggle && navPanel) {
  // Keep the mobile navigation state synchronized with the toggle button.
  menuToggle.addEventListener("click", () => {
    const isOpen = navPanel.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
    body.classList.toggle("menu-open", isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

const setActiveLink = () => {
  const scrollPosition = window.scrollY + 140;
  let currentSectionId = sections[0]?.id || "";

  sections.forEach((section) => {
    if (scrollPosition >= section.offsetTop) {
      currentSectionId = section.id;
    }
  });

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${currentSectionId}`;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

if ("IntersectionObserver" in window) {
  // Reveal content progressively while keeping a no-JS fallback path.
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const updateBackToTop = () => {
  if (!backToTop) {
    return;
  }

  const shouldShow = window.scrollY > 500;
  backToTop.classList.toggle("is-visible", shouldShow);
};

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
    });
  });
}

document.addEventListener("click", (event) => {
  if (!navPanel || !menuToggle) {
    return;
  }

  if (
    navPanel.classList.contains("is-open") &&
    !navPanel.contains(event.target) &&
    !menuToggle.contains(event.target)
  ) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

window.addEventListener("scroll", () => {
  setActiveLink();
  updateBackToTop();
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 1040 && navPanel) {
    closeMenu();
  }
});

setActiveLink();
updateBackToTop();
syncThemeUi();
