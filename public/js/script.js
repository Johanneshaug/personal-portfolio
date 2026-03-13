const translations = {
    en: {
        "nav-home": "Home",
        "nav-about": "About",
        "nav-projects": "Projects",
        "nav-contact": "Contact",
        "hero-title": "Hello, I'm <span class=\"highlight\">Johannes Haug</span>.",
        "hero-subtitle": "IT Specialist & Business Informatics Student at Munich University of Applied Sciences.",
        "hero-btn-work": "View My Work",
        "hero-btn-contact": "Get in Touch",
        "about-title": "Career & Education",
        "about-text": "I am a passionate developer and IT specialist based in Munich, bridging the gap between infrastructure and software engineering.",
        "edu-hm-title": "Munich University of Applied Sciences (HM)",
        "edu-hm-desc": "B.Sc. Business Informatics – Information Technology",
        "edu-ihk-title": "Apprenticeship",
        "edu-ihk-desc": "IT Specialist for System Integration",
        "edu-ihk-date": "Completed",
        "projects-title": "Selected Projects",
        "proj-portfolio-title": "Personal Portfolio",
        "proj-portfolio-desc": "My modern, dark-themed personal portfolio built with HTML, CSS & JS, hosted on Google Cloud Firebase.",
        "proj-github": "View on GitHub",
        "proj-github-2": "View on GitHub",
        "proj-github-3": "View on GitHub",
        "proj-tz-title": "Timezone Converter",
        "proj-tz-desc": "A draggable timezone planner that shows multiple timezones at once.",
        "proj-subnet-title": "Subnet Calculator",
        "proj-subnet-desc": "A simple network calculator to quickly compute subnet masks, host ranges, and broadcast addresses from CIDR notation.",
        "proj-demo": "View Demo",
        "proj-demo-subnet": "View Demo",
        "contact-title": "Let's Connect",
        "contact-text": "Currently open to <strong>part-time opportunities</strong> and <strong>internships</strong>.",
        "contact-btn": "Say Hello",
        "lang-toggle": "DE",
        "footer-text": "&copy; 2026 Johannes Haug. All rights reserved."
    },
    de: {
        "nav-home": "Startseite",
        "nav-about": "Über mich",
        "nav-projects": "Projekte",
        "nav-contact": "Kontakt",
        "hero-title": "Hallo, ich bin <span class=\"highlight\">Johannes Haug</span>.",
        "hero-subtitle": "Fachinformatiker & Wirtschaftsinformatik-Student an der Hochschule München.",
        "hero-btn-work": "Meine Projekte",
        "hero-btn-contact": "Kontakt aufnehmen",
        "about-title": "Werdegang & Ausbildung",
        "about-text": "Ich bin ein leidenschaftlicher Entwickler und IT-Spezialist aus München, der die Lücke zwischen Infrastruktur und Softwareentwicklung schließt.",
        "edu-hm-title": "Hochschule München (HM)",
        "edu-hm-desc": "B.Sc. Wirtschaftsinformatik",
        "edu-ihk-title": "Ausbildung",
        "edu-ihk-desc": "Fachinformatiker für Systemintegration",
        "edu-ihk-date": "Abgeschlossen",
        "projects-title": "Ausgewählte Projekte",
        "proj-portfolio-title": "Persönliches Portfolio",
        "proj-portfolio-desc": "Mein modernes, dunkles persönliches Portfolio, erstellt mit HTML, CSS & JS, gehostet auf der Google Cloud.",
        "proj-github": "Auf GitHub ansehen",
        "proj-github-2": "Auf GitHub ansehen",
        "proj-github-3": "Auf GitHub ansehen",
        "proj-tz-title": "Zeitzonen-Konverter",
        "proj-tz-desc": "Ein Tool, das hilft, Meetings in verschiedenen Zeitzonen zu planen.",
        "proj-subnet-title": "Subnetz-Rechner",
        "proj-subnet-desc": "Ein einfaches Netzwerk-Tool, um Subnetzmasken, Host-Bereiche und Broadcast-Adressen aus der CIDR-Notation zu berechnen.",
        "proj-demo": "Demo ansehen",
        "proj-demo-subnet": "Demo ansehen",
        "contact-title": "Kontakt",
        "contact-text": "Derzeit offen für <strong>Teilzeitarbeit</strong> und <strong>Praktika</strong>.",
        "contact-btn": "Hallo sagen",
        "lang-toggle": "EN",
        "footer-text": "&copy; 2026 Johannes Haug. Alle Rechte vorbehalten."
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            // Hamburger animation
            const spans = hamburger.querySelectorAll('span');
            if (navLinks.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a:not(.lang-btn)').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                
                // Reset hamburger
                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    });

    // Smooth Scroll for Anchor Links (Polyfill-like behavior if CSS smooth-scroll fails or for more control)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Account for fixed header
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
    
    // Simple Reveal on Scroll Animation
    const observerOptions = {
        root: null,
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);
    
    // Add animation classes to elements
    const animatedElements = document.querySelectorAll('.hero-title, .hero-subtitle, .section-title, .project-card, .about-text, .stat-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
    
    // Add the class style dynamically since we're handling the animation logic here
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .fade-in-up {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(styleSheet);

    // Language Toggle Logic
    const langBtn = document.getElementById('lang-toggle');
    let currentLang = localStorage.getItem('lang') || 'de'; // standard is German

    const setLanguage = (lang) => {
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });
        if (langBtn) {
            langBtn.textContent = translations[lang]['lang-toggle'];
        }
        localStorage.setItem('lang', lang);
    };

    // Initialize with current language
    setLanguage(currentLang);

    if (langBtn) {
        langBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentLang = currentLang === 'de' ? 'en' : 'de';
            setLanguage(currentLang);
        });
    }
});
