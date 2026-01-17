// Portfolio site JS: smooth scroll + active nav + year
(function () {
    "use strict";

    // ===== Smooth scroll for nav links =====
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (href && href.startsWith("#")) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (!target) return;
                const top =
                    target.getBoundingClientRect().top +
                    window.scrollY -
                    72; // offset for sticky nav
                window.scrollTo({
                    top,
                    behavior: "smooth",
                });
            }
        });
    });

    // ===== Active nav link on scroll =====
    const sections = document.querySelectorAll("section[id]");
    const sectionMap = Array.from(sections).map((sec) => ({
        id: sec.id,
        offsetTop: sec.offsetTop,
    }));

    function onScroll() {
        const scrollPos = window.scrollY + 90; // offset for nav

        let currentId = "home";
        for (const sec of sectionMap) {
            if (scrollPos >= sec.offsetTop) {
                currentId = sec.id;
            }
        }

        navLinks.forEach((link) => {
            const href = link.getAttribute("href");
            if (href === "#" + currentId) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
    }

    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", () => {
        // recompute offsets on resize
        sectionMap.forEach((sec) => {
            const el = document.getElementById(sec.id);
            sec.offsetTop = el ? el.offsetTop : 0;
        });
    });

    // ===== Footer year =====
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Initial call
    onScroll();
})();