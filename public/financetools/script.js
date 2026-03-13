/**
 * Finance Tools Dashboard - Core Logic
 * Handles dashboard interactions and tool loading.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initializing the app
    const appInfo = {
        name: "Finance Tools Dashboard",
        version: "1.0.0",
        author: "Johannes Haug"
    };

    console.log(`Initialized ${appInfo.name} v${appInfo.version}`);

    // Smooth Scrolling for links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Dashboard Tool Definitions (Future Ready)
    const futureTools = [
        /* {
            id: 'investment-calc',
            title: 'Investment Calculator',
            desc: 'Powerful projections for compound interest and asset growth.',
            icon: `<svg>...</svg>`
        } */
    ];

    // Feature highlight: Hover interactions
    const cards = document.querySelectorAll('.tool-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Placeholder for sound effects or micro-animations
        });
    });
});
