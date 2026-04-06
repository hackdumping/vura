export type StepType = 'hook' | 'question' | 'educatif' | 'capture' | 'loading' | 'resultats' | 'vente';

export interface FunnelStep {
    id: string;
    type: StepType;
    title?: string;
    lead?: string;
    eyebrow?: string;
    icon?: string;
    heroLabel?: string;
    stats?: { value: string; label: string }[];
    choices?: { text: string; subtext?: string; nextId?: string }[];
    cta?: string;
    cardTitle?: string;
    cardText?: string;
    gridItems?: { emoji: string; name: string; desc: string }[];
    fields?: any[];
    captureDesc?: string;
    secureText?: string;
    loadingText?: string;
    resultsTitle?: string;
    resultsScore?: string;
    resultsDesc?: string;
    ebookTitle?: string;
    ebookSub?: string;
    ebookIcon?: string;
    ebookLink?: string;
    saleTitle?: string;
    salePrice?: string;
    oldPrice?: string;
    newPrice?: string;
    saleDesc?: string;
    saleButtonText?: string;
    saleButtonUrl?: string;
    countdown?: number;
    guarantee?: string;
    redirectUrl?: string;
    urgencyText?: string;
    securePayText?: string;
}

export interface FunnelTheme {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
}

export interface FunnelConfig {
    steps: FunnelStep[];
    theme: FunnelTheme;
}

export const defaultTheme: FunnelTheme = {
    primaryColor: '#4F46E5',
    backgroundColor: '#f8fafc',
    textColor: '#1e293b',
    fontFamily: 'Inter'
};

export const generateFunnelHTML = (
    config: FunnelConfig,
    formFields?: any[],
    publicId?: string,
    apiUrl?: string,
    startStep: number = 1,
    formId?: number | string
) => {
    const { steps, theme } = config;

    const generateStepHTML = (step: FunnelStep, index: number): string => {
        let content = '';
        const stepNum = index + 1;
        const backBtn = index > 0 ? `<button class="back-btn" onclick="goTo('${stepNum - 1}')">‹ Retour</button>` : '';
        const eyebrowStr = step.eyebrow ? `<div class="eyebrow">${step.eyebrow}</div>` : '';
        const titleStr = step.title ? `<h1>${step.title}</h1>` : '';
        const leadStr = step.lead ? `<p class="lead">${step.lead}</p>` : '';

        const renderIcon = (iconStr: string | undefined, className: string) => {
            if (!iconStr) return '';
            if (iconStr.startsWith('http') || iconStr.startsWith('data:image')) {
                return `<div class="${className}"><img src="${iconStr}" alt="icon"/></div>`;
            }
            return `<div class="${className}">${iconStr}</div>`;
        };

        switch (step.type) {
            case 'hook':
                content = `
          ${step.icon || step.heroLabel ? `<div class="hero"><div class="hero-inner">${renderIcon(step.icon, 'hero-icon')}${step.heroLabel ? `<span class="hero-label">${step.heroLabel}</span>` : ''}</div></div>` : ''}
          ${eyebrowStr}${titleStr}${leadStr}
          ${step.stats ? `<div class="stat-row">${step.stats.map(s => `<div class="stat-box"><div class="num">${s.value}</div><div class="lbl">${s.label}</div></div>`).join('')}</div>` : ''}
          <div class="spacer"></div>
          <button class="cta" onclick="goTo('${stepNum + 1}')">${step.cta || 'Continuer →'}</button>
        `;
                break;
            case 'question':
                content = `
          ${backBtn}${eyebrowStr}${titleStr}${leadStr}
          ${step.choices ? `<div class="choices">${step.choices.map(c => `<button class="choice" onclick="goTo('${stepNum + 1}')"><div><div class="ct">${c.text}</div>${c.subtext ? `<div class="cs">${c.subtext}</div>` : ''}</div><span class="arr">›</span></button>`).join('')}</div>` : ''}
        `;
                break;
            case 'educatif':
                content = `
          ${backBtn}${eyebrowStr}${titleStr}
          ${step.cardTitle || step.cardText ? `<div class="card">${step.cardTitle ? `<div class="card-title">${step.cardTitle}</div>` : ''}${step.cardText ? `<p>${step.cardText}</p>` : ''}</div>` : ''}
          ${step.gridItems ? `<div class="ing-grid">${step.gridItems.map(g => `<div class="ing-box"><span class="ie">${g.emoji}</span><div class="in">${g.name}</div><div class="id">${g.desc}</div></div>`).join('')}</div>` : ''}
          <button class="cta" onclick="goTo('${stepNum + 1}')">${step.cta || 'Continuer →'}</button>
        `;
                break;
            case 'capture':
                content = `
          <div class="capture-box" style="padding:0">
            ${backBtn}
            <div class="icon-pulse">🔒</div>
            ${step.title ? `<h2>${step.title}</h2>` : ''}
            ${step.captureDesc ? `<p style="color:#64748b;font-size:15px;margin-bottom:24px;">${step.captureDesc}</p>` : ''}
            <form id="capture-form-${step.id}" onsubmit="handleCapture(event, '${stepNum + 1}')">
              ${(step.fields || []).map((f: any) => {
                    const bField = (formFields || []).find((bf: any) => bf.id === f.id || bf.id === f);
                    const fId = bField ? bField.id : (f.id || f);
                    const fLabel = bField ? bField.label : (f.label || f);
                    const fType = bField ? bField.type : (f.type || 'text');
                    const req = (bField ? bField.required : f.required);
                    return `
                  <div class="field-box">
                    <label>${fLabel}${req ? '*' : ''}</label>
                    <input type="${fType === 'email' ? 'email' : 'text'}" placeholder="${f.placeholder || ''}" oninput="updateAnswer('${fId}', this.value)" ${req ? 'required' : ''}>
                  </div>
                `;
                }).join('')}
              ${step.secureText ? `<p style="font-size:12px;color:#94a3b8;text-align:center;margin-top:12px;">${step.secureText}</p>` : ''}
              <div class="spacer"></div>
              <button type="submit" class="cta">${step.cta || 'Accéder aux résultats →'}</button>
            </form>
          </div>
        `;
                break;
            case 'loading':
                content = `
          <div class="loader-wrap">
            <div class="spinner"></div>
            <p>${step.loadingText || 'Analyse de vos réponses...'}</p>
          </div>
          <script>
            setTimeout(() => goTo('${stepNum + 1}'), 2500);
          </script>
        `;
                break;
            case 'resultats':
                content = `
          ${eyebrowStr}
          <h1>${step.resultsTitle || 'Vos Résultats'}</h1>
          <div class="score-circle">
            <svg viewBox="0 0 36 36" class="circular-chart"><path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/><path id="pf" class="circle" stroke-dasharray="0, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/></svg>
            <div class="score-inner">
              <div class="score-val">${step.resultsScore || '92%'}</div>
            </div>
          </div>
          <p class="lead">${step.resultsDesc || 'Félicitations ! Vous avez un profil prometteur.'}</p>
          <div class="ebook-box">
            ${renderIcon(step.ebookIcon, 'ebook-icon')}
            <div style="flex:1">
              <div class="ebook-title">${step.ebookTitle || 'Guide Premium.pdf'}</div>
              ${step.ebookSub ? `<div style="font-size:12px;color:#64748b;margin-bottom:4px;">${step.ebookSub}</div>` : ''}
              <a href="${step.ebookLink || '#'}" class="ebook-link" target="_blank">Télécharger le guide</a>
            </div>
          </div>
          <button class="cta" onclick="goTo('${stepNum + 1}')">${step.cta || 'Continuer →'}</button>
        `;
                break;
            case 'vente':
                content = `
          ${eyebrowStr}
          <h1>${step.saleTitle || 'Offre Spéciale'}</h1>
          <div class="price-wrap" style="display:flex;align-items:baseline;gap:12px;margin-bottom:16px;">
            <span class="price-tag" style="font-size:48px;font-weight:800;color:var(--primary);">${step.newPrice || step.salePrice || '49€'}</span>
            ${step.oldPrice ? `<span style="text-decoration:line-through;color:#94a3b8;font-size:24px;">${step.oldPrice}</span>` : ''}
          </div>
          <p class="lead">${step.saleDesc || 'Accédez à la solution complète dès maintenant.'}</p>
          <div class="urgency" style="background:#fff7ed;color:#9a3412;padding:12px;border-radius:12px;font-size:13px;font-weight:600;margin-bottom:24px;border:1px solid #ffedd5;">${step.urgencyText || '⚠️ Prix limité — peut augmenter à tout moment'}</div>
          <button class="cta" onclick="handlePurchase('${step.saleButtonUrl || '#'}')">${step.saleButtonText || 'Profiter de l\'offre'}</button>
          <div style="text-align:center;font-size:12px;color:#94a3b8;margin-top:16px;">${step.securePayText || '🔒 Paiement sécurisé · Accès immédiat'}</div>
        `;
                break;
        }
        return `<div class="screen" id="screen-${stepNum}">${content}</div>`;
    };

    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=${theme.fontFamily.replace(/ /g, '+')}:wght@400;600;700;800&display=swap" rel="stylesheet">
    <title>Vura Tunnel</title>
    <style>
        :root { 
            --primary: ${theme.primaryColor}; 
            --bg: ${theme.backgroundColor}; 
            --text: ${theme.textColor}; 
            --card-bg: ${theme.backgroundColor === '#ffffff' || theme.backgroundColor === '#f8fafc' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.08)'};
            --border: ${theme.backgroundColor === '#ffffff' || theme.backgroundColor === '#f8fafc' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'};
        }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; font-family: '${theme.fontFamily}', sans-serif; background-color: var(--bg); color: var(--text); display: flex; justify-content: center; min-height: 100vh; }
        .container { width: 100%; max-width: 450px; padding: 24px; display: flex; flex-direction: column; position: relative; }
        .progress-container { position: fixed; top: 0; left: 0; width: 100%; height: 4px; background: rgba(0,0,0,0.05); z-index: 100; }
        .progress-bar { height: 100%; background: var(--primary); width: 0%; transition: width 0.4s ease; }
        .screen { display: none; width: 100%; animation: fadeIn 0.4s ease; }
        .screen.active { display: flex; flex-direction: column; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .back-btn { background: none; border: none; color: inherit; opacity: 0.6; font-size: 16px; margin-bottom: 24px; cursor: pointer; display: flex; align-items: center; }
        .eyebrow { color: var(--primary); font-weight: 700; font-size: 14px; text-transform: uppercase; margin-bottom: 8px; }
        h1 { font-size: 32px; font-weight: 800; line-height: 1.1; margin: 0 0 16px; letter-spacing: -0.02em; }
        .lead { font-size: 18px; opacity: 0.7; line-height: 1.5; margin-bottom: 32px; }
        .hero { margin-bottom: 40px; display: flex; justify-content: center; width: 100%; }
        .hero-inner { background: var(--card-bg); backdrop-filter: blur(10px); border-radius: 28px; padding: 32px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 15px 35px -5px rgba(0,0,0,0.12); border: 1px solid var(--border); width: 100%; max-width: 240px; transition: transform 0.3s ease; }
        .hero-inner:hover { transform: translateY(-5px); }
        .hero-icon { width: 100px; height: 100px; border-radius: 22px; display: flex; align-items: center; justify-content: center; font-size: 56px; margin-bottom: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.08); overflow: hidden; }
        .hero-icon img { width: 100%; height: 100%; object-fit: cover; }
        .hero-label { font-weight: 700; font-size: 16px; letter-spacing: -0.01em; opacity: 0.9; }
        .stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
        .stat-box { background: var(--card-bg); backdrop-filter: blur(10px); padding: 16px; border-radius: 16px; border: 1px solid var(--border); }
        .stat-box .num { font-size: 24px; font-weight: 800; color: var(--primary); }
        .stat-box .lbl { font-size: 12px; opacity: 0.7; font-weight: 600; }
        .choices { display: flex; flex-direction: column; gap: 12px; }
        .choice { background: var(--card-bg); backdrop-filter: blur(10px); border: 1px solid var(--border); padding: 20px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.2s; text-align: left; color: inherit; }
        .choice:hover { border-color: var(--primary); background: rgba(0,0,0,0.02); }
        .choice .ct { font-weight: 600; font-size: 16px; }
        .choice .cs { font-size: 13px; opacity: 0.7; margin-top: 2px; }
        .choice .arr { color: #cbd5e1; font-size: 20px; }
        .card { background: var(--card-bg); backdrop-filter: blur(10px); padding: 24px; border-radius: 24px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05); margin-bottom: 24px; border: 1px solid var(--border); }
        .card-title { font-weight: 700; font-size: 18px; margin-bottom: 8px; }
        .ing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 32px; }
        .ing-box { background: var(--card-bg); padding: 16px; border-radius: 16px; text-align: center; border: 1px solid var(--border); }
        .ing-box .ie { font-size: 24px; display: block; margin-bottom: 8px; }
        .ing-box .in { font-weight: 700; font-size: 14px; }
        .ing-box .id { font-size: 11px; opacity: 0.7; margin-top: 4px; }
        .field-box { margin-bottom: 20px; }
        .field-box label { display: block; font-weight: 600; font-size: 14px; margin-bottom: 8px; opacity: 0.7; }
        .field-box input { width: 100%; padding: 16px; border-radius: 12px; border: 1px solid var(--border); font-size: 16px; outline: none; background: var(--card-bg); color: inherit; }
        .cta { background: var(--primary); color: white; border: none; padding: 18px; border-radius: 16px; font-size: 16px; font-weight: 700; cursor: pointer; width: 100%; box-shadow: 0 10px 20px -5px var(--primary); }
        .loader-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; text-align: center; }
        .spinner { width: 40px; height: 40px; border: 4px solid rgba(0,0,0,0.05); border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .score-circle { position: relative; width: 150px; height: 150px; margin: 0 auto 32px; }
        .circular-chart { display: block; margin: 10px auto; max-width: 100%; }
        .circle-bg { fill: none; stroke: var(--border); stroke-width: 2.8; }
        .circle { fill: none; stroke-width: 2.8; stroke-linecap: round; stroke: var(--primary); transition: stroke-dasharray 2s ease; }
        .score-inner { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .score-val { font-size: 32px; font-weight: 800; color: var(--primary); }
        .ebook-box { background: var(--card-bg); border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 16px; margin-bottom: 32px; border: 1px dashed var(--border); }
        .ebook-icon { width: 48px; border-radius: 8px; }
        .ebook-title { font-weight: 700; font-size: 14px; }
        .ebook-link { font-size: 13px; color: var(--primary); font-weight: 600; text-decoration: none; }
        .spacer { flex: 1; min-height: 24px; }
    </style>
</head>
<body>
    <div class="progress-container"><div id="p-bar" class="progress-bar"></div></div>
    <div class="container">
        ${steps.map((s, i) => generateStepHTML(s, i)).join('\n')}
    </div>
    <script>
        window.VURA_API_URL = '${apiUrl || ""}';
        window.VURA_FORM_ID = '${formId || ""}';
        let answers = {};
        function updateAnswer(fieldId, value){ answers[fieldId] = value; }
        function updateProgress(id) {
            const total = ${steps.length};
            document.getElementById('p-bar').style.width = (id / total * 100) + '%';
        }
        async function trackImpression(id) {
            if (!id || !window.VURA_FORM_ID) return;
            try {
                await fetch(window.VURA_API_URL + 'forms/builder/' + window.VURA_FORM_ID + '/track_impression/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ step_id: id })
                });
            } catch(e) {}
        }
        function goTo(id){
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            const target = document.getElementById('screen-' + id);
            if (target) {
                target.classList.add('active');
                updateProgress(id);
                window.scrollTo(0, 0);
                const stepsArr = ${JSON.stringify(steps)};
                const step = stepsArr[parseInt(id)-1];
                if (step) trackImpression(step.id);
                if (target.querySelector('.circular-chart')) {
                    setTimeout(() => {
                        const circle = target.querySelector('.circle');
                        if (circle) circle.style.strokeDasharray = '92, 100';
                    }, 100);
                }
            }
        }
        async function handleCapture(event, nextId){
            event.preventDefault();
            const btn = event.target.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.innerText = 'Chargement...';
            try {
                const resp = await fetch(window.VURA_API_URL + 'forms/p/${publicId}/submit/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        answers: Object.entries(answers).map(([fId, val]) => ({ field_id: fId, value: val }))
                    })
                });
                if (resp.ok) goTo(nextId);
                else throw new Error();
            } catch(e) {
                alert('Erreur soumission - Simulation activée');
                goTo(nextId);
            }
        }
        function handlePurchase(url){
            const finalUrl = url.startsWith('http') ? url : 'https://' + url;
            window.open(finalUrl, '_blank');
        }
        document.addEventListener('DOMContentLoaded', () => goTo('${startStep}'));
    </script>
</body>
</html>`;
    return htmlContent;
};
