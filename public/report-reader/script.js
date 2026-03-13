/**
 * Company Analyser - AI Company Report Analyzer
 * Mock implementation of AI backend interface.
 */

let revenueChartInstance = null;
let performanceChartInstance = null;
let cashflowChartInstance = null;
let rdChartInstance = null;
let allSortedMetrics = null; // stores full sorted data for range filtering

const companyDatabase = {
    'TSLA': {
        name: 'Tesla, Inc.',
        filings: ['10-K 2023', '10-Q Q3 2024', '10-Q Q2 2024'],
        summary: 'Tesla continues its dominance in EV manufacturing while expanding into energy storage and autonomous driving software (FSD). The company is transitioning from a vehicle manufacturer to an AI and robotics entity.',
        financials: [
            'Gross margins normalized at 18.2% despite price adjustments.',
            'CASH POSITION: $29.1B in cash and investments.',
            'R&D SPEND: Increased 34% YoY focusing on AI training and Optimus.'
        ],
        risks: [
            'Production delays in Giga Berlin and Giga Texas extensions.',
            'Competitive pressure in the Chinese market from local OEMs.',
            'Dependence on key executive leadership (Elon Musk).'
        ],
        strategy: [
            'Scaling Gen-3 platform for affordable vehicle production.',
            'Dojo supercomputer ramp-up for FSD training capacity.',
            'Expansion of Megapack production capacity in Lathrop.'
        ]
    },
    'AAPL': {
        name: 'Apple Inc.',
        filings: ['10-K 2023', '10-Q Q4 2024'],
        summary: 'Apple is pivoting heavily toward "Apple Intelligence" and spatial computing with Vision Pro. Services revenue continues to be the primary engine for margin expansion.',
        financials: [
            'Services revenue hit an all-time record of $24.2B.',
            'NET INCOME: $23.0B for the quarter.',
            'DIVIDENDS: $3.8B returned to shareholders via buybacks.'
        ],
        risks: [
            'Regulatory scrutiny of the App Store and European DMA compliance.',
            'Hardware cyclicality and longer replacement cycles for iPhone.',
            'Geopolitical tensions affecting the Greater China supply chain.'
        ],
        strategy: [
            'Integration of Generative AI across iOS and macOS ecosystems.',
            'Deepening health and wellness features in Watch and iPad.',
            'Internalizing more semiconductor designs (M-series, A-series).'
        ]
    },
    'AMZN': {
        name: 'Amazon.com, Inc.',
        filings: ['10-K 2023', '10-Q Q3 2024'],
        summary: 'Amazon Web Services (AWS) remains the clear market leader in cloud infrastructure, benefiting from the generative AI boom. Retail logistics efficiency has significantly improved margins.',
        financials: [
            'AWS revenue grew 19% YoY reaching $27.5B.',
            'OPERATING INCOME: Triple YoY to $15.3B.',
            'ADVERTISING: Revenue up 24% to $12.7B.'
        ],
        risks: [
            'FTC antitrust lawsuits regarding retail dominance.',
            'Cybersecurity threats to AWS infrastructure.',
            'Inflationary impact on global shipping and energy costs.'
        ],
        strategy: [
            'Deployment of custom AI chips (Trainium, Inferentia).',
            'Expansion of Project Kuiper satellite broadband network.',
            'Further regionalization of U.S. fulfillment centers for speed.'
        ]
    }
};

let currentFilings = []; // Global store for loaded filings
let currentTicker = "";

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('company-search');
    const analyzeBtn = document.getElementById('analyze-btn');
    const dashboard = document.getElementById('dashboard');
    const hero = document.getElementById('analyze');
    const suggestionsBox = document.getElementById('search-suggestions');
    const loader = document.getElementById('ai-loader');
    // Shared Search Logic for multiple searchbars
    const initSearch = (input, suggestions) => {
        input.addEventListener('input', async (e) => {
            const query = e.target.value.trim().toUpperCase();
            suggestions.innerHTML = '';

            if (query.length < 1) {
                suggestions.classList.add('hidden');
                return;
            }

            try {
                const response = await fetch(`http://localhost:5001/search?q=${query}`);
                if (!response.ok) return;

                const matches = await response.json();

                if (matches.length > 0) {
                    suggestions.classList.remove('hidden');
                    matches.forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'suggestion-item';
                        div.innerHTML = `<span style="color: #00f2ff; font-weight: bold;">${item.ticker}</span> - ${item.title}`;
                        div.addEventListener('click', () => {
                            input.value = item.ticker;
                            suggestions.classList.add('hidden');
                            showReportList(item.ticker);
                        });
                        suggestions.appendChild(div);
                    });
                } else {
                    suggestions.classList.add('hidden');
                }
            } catch (err) {
                console.error('Search error:', err);
            }
        });

        // Handle Enter Key
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const ticker = input.value.trim().toUpperCase();
                if (ticker) {
                    suggestions.classList.add('hidden');
                    showReportList(ticker);
                }
            }
        });
    };

    const dashboardSearch = document.getElementById('dashboard-search');
    const dashboardSuggestions = document.getElementById('dashboard-suggestions');

    // Initialize both searchbars
    initSearch(searchInput, suggestionsBox);
    if (dashboardSearch) initSearch(dashboardSearch, dashboardSuggestions);

    // Close all suggestions if clicked outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            document.querySelectorAll('.dropdown-suggestions').forEach(el => el.classList.add('hidden'));
        }
    });

    // Restore Settings Toggle logic
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsMenu = document.getElementById('settings-menu');
    const include10QCheckbox = document.getElementById('include-10q');

    settingsToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMenu.classList.toggle('hidden');
        settingsToggle.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (settingsMenu && !settingsMenu.contains(e.target) && e.target !== settingsToggle) {
            settingsMenu.classList.add('hidden');
            settingsToggle.classList.remove('active');
        }
    });

    include10QCheckbox.addEventListener('change', () => {
        if (currentFilings.length > 0) {
            renderReportList(currentTicker, currentFilings);
        }
    });

    // analyzeBtn for the main search
    analyzeBtn.addEventListener('click', async () => {
        const ticker = searchInput.value.trim().toUpperCase();
        if (!ticker || ticker.length < 1) {
            alert('Please enter a valid ticker (e.g., TSLA)');
            return;
        }

        // Show minimal loading while fetching reports
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Searching...';

        try {
            await showReportList(ticker);
        } catch (err) {
            alert(err.message);
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = 'Generate Insights';
        }
    });

    async function showReportList(ticker) {
        // Fetch real data from backend to verify ticker
        const response = await fetch(`http://localhost:5001/company/${ticker}`);
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Company not found in SEC EDGAR.');
        }

        const companyData = await response.json();
        currentFilings = companyData.filings;
        currentTicker = ticker;

        // Show Dashboard
        hero.classList.add('hidden');
        dashboard.classList.remove('hidden');
        document.getElementById('company-display-name').textContent = ticker;
        document.getElementById('active-report-label').textContent = "Generating Historical Trend...";
        document.getElementById('ai-results').classList.add('hidden');
        document.getElementById('error-display').classList.add('hidden');

        window.scrollTo({ top: dashboard.offsetTop - 100, behavior: 'smooth' });

        // Auto-start trend analysis immediately
        startAIProcess(ticker, "Historical Strategic Trend", null, 'trend');
    }

    async function startAIProcess(ticker, reportName, accession, mode = 'individual') {
        // Update headers immediately
        document.getElementById('company-display-name').textContent = ticker;
        document.getElementById('active-report-label').textContent = mode === 'trend' ? "Generating Historical Strategic Trend..." : `Analyzing: ${reportName}`;

        loader.classList.remove('hidden');
        document.getElementById('ai-results').classList.add('hidden');
        document.getElementById('error-display').classList.add('hidden');

        // Reset steps
        document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));

        try {
            // CALL THE LOCAL PYTHON BACKEND
            const response = await fetch('http://localhost:5001/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticker: ticker,
                    report: reportName,
                    accession: accession,
                    mode: mode
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Backend analysis failed.');
            }

            const analysisData = await response.json();

            // Step through the "AI Scanning" phases for effect
            const steps = document.querySelectorAll('.step');
            for (let i = 0; i < steps.length; i++) {
                steps[i].classList.add('active');
                await new Promise(r => setTimeout(r, 600));
            }

            // Finalize and Show Result
            document.getElementById('company-display-name').textContent = mode === 'trend' ? `${ticker} Historical Trend` : `${ticker} Intelligence Report`;
            document.getElementById('active-report-label').textContent = reportName;

            injectData(analysisData);
            loader.classList.add('hidden');
            document.getElementById('ai-results').classList.remove('hidden');

            if (analysisData.metrics) {
                document.getElementById('metrics-charts').classList.remove('hidden');
                renderCharts(analysisData.metrics);

                const sourcesEl = document.getElementById('chart-sources');
                if (analysisData.metric_sources) {
                    sourcesEl.textContent = `Data Source: ${analysisData.metric_sources}`;
                    sourcesEl.style.display = 'block';
                } else {
                    sourcesEl.style.display = 'none';
                }
            } else {
                document.getElementById('metrics-charts').classList.add('hidden');
                document.getElementById('chart-sources').style.display = 'none';
            }

        } catch (error) {
            console.error(error);
            // Show error in UI instead of a temporary alert
            const errDisplay = document.getElementById('error-display');
            const errText = document.getElementById('error-text');

            errDisplay.classList.remove('hidden');
            errText.textContent = error.message;

            loader.classList.add('hidden');
        }
    }

    function injectData(data) {
        document.getElementById('summary-text').textContent = data.summary;

        // Leadership History (CEOs only) — horizontal timeline
        const leadershipList = document.getElementById('leadership-list');
        if (leadershipList) {
            leadershipList.innerHTML = '';
            leadershipList.style.display = 'flex';
            leadershipList.style.flexWrap = 'wrap';
            leadershipList.style.gap = '0';
            leadershipList.style.alignItems = 'stretch';
            leadershipList.style.padding = '0';

            if (data.leadership && data.leadership.length > 0) {
                // Deduplicate consecutive same-CEO entries
                const merged = [];
                data.leadership.forEach(item => {
                    const execName = item.ceo || "Unknown";
                    const last = merged[merged.length - 1];
                    if (last && last.ceo === execName) {
                        // Extend the period end year
                        const endYear = item.period.split('-')[1] || item.period.split('–')[1] || 'Present';
                        last.period = last.period.split('-')[0] + '-' + endYear.trim();
                    } else {
                        merged.push({ ...item, ceo: execName });
                    }
                });

                merged.forEach((item, index) => {
                    const execName = item.ceo;
                    let nameHtml = execName;
                    if (item.wikipedia_link && item.wikipedia_link !== '') {
                        nameHtml = `<a href="${item.wikipedia_link}" target="_blank" style="color: #fff; font-weight: bold; text-decoration: underline; text-decoration-color: rgba(0,242,255,0.4); transition: color 0.2s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='#fff'">${execName}</a>`;
                    }

                    const card = document.createElement('div');
                    card.style.cssText = `
                        display: flex;
                        align-items: center;
                        flex-shrink: 0;
                    `;

                    card.innerHTML = `
                        <div style="
                            background: rgba(0,242,255,0.05);
                            border: 1px solid rgba(0,242,255,0.15);
                            border-radius: 10px;
                            padding: 0.75rem 1rem;
                            text-align: center;
                            min-width: 120px;
                            transition: border-color 0.2s;
                        " onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='rgba(0,242,255,0.15)'">
                            <div style="font-size: 0.75rem; color: var(--primary); font-weight: bold; margin-bottom: 0.3rem;">${item.period}</div>
                            <div style="font-size: 0.9rem;">${nameHtml}</div>
                        </div>
                        ${index < merged.length - 1 ? `<div style="padding: 0 0.4rem; color: rgba(0,242,255,0.4); font-size: 1.2rem;">→</div>` : ''}
                    `;
                    leadershipList.appendChild(card);
                });
            }
        }

        const strategyEvoList = document.getElementById('strategy-evo-list');
        strategyEvoList.innerHTML = '';
        if (data.evolution && data.evolution.length > 0) {
            strategyEvoList.innerHTML = data.evolution.map(item => `<li>${item}</li>`).join('');
        } else {
            strategyEvoList.innerHTML = '<li>Strategic milestones not found in these reports.</li>';
        }

        const financialList = document.getElementById('financial-list');
        financialList.innerHTML = data.financials.map(item => `<li>${item}</li>`).join('');

        const riskList = document.getElementById('risk-list');
        riskList.innerHTML = data.risks.map(item => `<li>${item}</li>`).join('');

        const strategyList = document.getElementById('strategy-list');
        strategyList.innerHTML = data.outlook.map(item => `<li>${item}</li>`).join('');

        // Append Source Links to ALL insight cards globally (graphs + text boxes)
        const cards = document.querySelectorAll('.insight-card');
        cards.forEach(card => {
            // Remove previous source tag if it exists (for new searches)
            const existingSource = card.querySelector('.card-source-footer');
            if (existingSource) existingSource.remove();

            let linksHTML = [];
            if (data.sec_url) {
                linksHTML.push(`<a href="${data.sec_url}" target="_blank" style="color: var(--primary); text-decoration: none; transition: color 0.2s;">SEC Filing ↗</a>`);
            }
            if (data.wiki_url) {
                linksHTML.push(`<a href="${data.wiki_url}" target="_blank" style="color: var(--primary); text-decoration: none; transition: color 0.2s;">Wikipedia ↗</a>`);
            }

            if (linksHTML.length > 0) {
                const sourceDiv = document.createElement('div');
                sourceDiv.className = 'card-source-footer';
                sourceDiv.style.marginTop = "15px";
                sourceDiv.style.paddingTop = "10px";
                sourceDiv.style.borderTop = "1px solid rgba(255, 255, 255, 0.05)";
                sourceDiv.style.fontSize = "0.75rem";
                sourceDiv.style.textAlign = "right";
                sourceDiv.style.color = "rgba(255, 255, 255, 0.4)";
                sourceDiv.innerHTML = `Source: ${linksHTML.join(' <span style="margin: 0 5px;">|</span> ')}`;
                card.appendChild(sourceDiv);
            }
        });
    }
    function renderCharts(metrics) {
        // Sort data oldest → newest and cache globally
        const paired = metrics.labels.map((label, i) => ({
            label,
            revenue: (metrics.revenue || [])[i],
            ebitda: (metrics.ebitda || [])[i],
            net_income: (metrics.net_income || [])[i],
            cashflow: (metrics.cashflow || [])[i],
            rd_spend: (metrics.rd_spend || [])[i],
        }));
        paired.sort((a, b) => parseInt(a.label) - parseInt(b.label));
        allSortedMetrics = paired;

        const commonScales = {
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#adb5bd' } },
            x: { grid: { display: false }, ticks: { color: '#adb5bd' } }
        };

        // Build each chart independently
        buildSingleChart({
            canvasId: 'revenueChart',
            instanceKey: 'revenueChartInstance',
            type: 'bar',
            dataKey: 'revenue',
            label: 'Revenue (M USD)',
            color: '#00f2ff',
            bg: 'rgba(0,242,255,0.4)',
            bar: true,
            scales: commonScales,
        });

        buildSingleChart({
            canvasId: 'performanceChart',
            instanceKey: 'performanceChartInstance',
            type: 'line',
            dataKey: ['net_income', 'ebitda'],
            label: ['Net Income (M USD)', 'EBITDA (M USD)'],
            color: ['#ff4b2b', '#c77dff'],
            bg: ['rgba(255,75,43,0.1)', 'rgba(199,125,255,0.1)'],
            scales: commonScales,
        });

        buildSingleChart({
            canvasId: 'cashflowChart',
            instanceKey: 'cashflowChartInstance',
            type: 'line',
            dataKey: 'cashflow',
            label: 'Free Cashflow (M USD)',
            color: '#10b981',
            bg: 'rgba(16,185,129,0.1)',
            scales: commonScales,
        });

        buildSingleChart({
            canvasId: 'rdChart',
            instanceKey: 'rdChartInstance',
            type: 'bar',
            dataKey: 'rd_spend',
            label: 'R&D Spending (M USD)',
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.4)',
            bar: true,
            scales: commonScales,
        });
    }

    // Chart instance registry
    const chartInstances = {};

    function buildSingleChart({ canvasId, instanceKey, type, dataKey, label, color, bg, bar, scales }) {
        const total = allSortedMetrics.length;
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        // Inject per-chart filter buttons at the bottom-left of the card
        const card = canvas.closest('.insight-card');
        if (card) {
            let btnRow = card.querySelector('.per-chart-range');
            if (!btnRow) {
                btnRow = document.createElement('div');
                btnRow.className = 'per-chart-range';
                btnRow.style.cssText = 'display:flex; gap:0.4rem; margin-top:0.75rem;';
                card.appendChild(btnRow);
            }
            btnRow.innerHTML = '';

            const ranges = [{ label: 'ALL', value: 'all' }];
            if (total > 5) ranges.push({ label: '5Y', value: '5' });
            if (total > 10) ranges.push({ label: '10Y', value: '10' });

            ranges.forEach(r => {
                const btn = document.createElement('button');
                btn.className = 'chart-range-btn' + (r.value === 'all' ? ' active' : '');
                btn.textContent = r.label;
                btn.dataset.range = r.value;
                btn.onclick = () => {
                    btnRow.querySelectorAll('.chart-range-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const sliced = r.value === 'all' ? allSortedMetrics : allSortedMetrics.slice(-parseInt(r.value));
                    drawChart(canvasId, instanceKey, type, dataKey, label, color, bg, bar, scales, sliced);
                };
                btnRow.appendChild(btn);
            });
        }

        drawChart(canvasId, instanceKey, type, dataKey, label, color, bg, bar, scales, allSortedMetrics);
    }

    function drawChart(canvasId, instanceKey, type, dataKey, label, color, bg, bar, scales, sorted) {
        if (chartInstances[instanceKey]) {
            chartInstances[instanceKey].destroy();
        }
        const ctx = document.getElementById(canvasId).getContext('2d');
        const labels = sorted.map(d => d.label);

        let datasets;
        if (Array.isArray(dataKey)) {
            // Multi-series chart (e.g. EBITDA + Net Income)
            datasets = dataKey.map((key, i) => {
                const data = sorted.map(d => d[key]);
                if (!data.some(v => v != null)) return null;
                return {
                    label: label[i],
                    data,
                    borderColor: color[i],
                    backgroundColor: bg[i],
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                };
            }).filter(Boolean);
        } else {
            const data = sorted.map(d => d[dataKey]);
            if (!data.some(v => v != null)) return; // Skip chart if no data
            datasets = [{
                label,
                data,
                borderColor: color,
                backgroundColor: bg,
                borderWidth: bar ? 2 : 3,
                borderRadius: bar ? 5 : undefined,
                fill: !bar,
                tension: bar ? undefined : 0.4,
            }];
        }

        if (datasets.length === 0) return;

        chartInstances[instanceKey] = new Chart(ctx, {
            type,
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales,
                plugins: { legend: { labels: { color: '#fff' } } }
            }
        });
    }

    // Handle Closing Search Suggestions
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            suggestionsBox.classList.add('hidden');
        }
    });
});
