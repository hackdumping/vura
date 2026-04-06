export interface FunnelConfig {
    theme: {
        bg: string;
        bg2: string;
        bg3: string;
        txt: string;
        sub: string;
        light: string;
        border: string;
        border2: string;
        gold: string;
        goldLight: string;
        green: string;
        red: string;
        blue: string;
    };
    steps: FunnelStep[];
}

export type StepType = 'hook' | 'question' | 'educatif' | 'capture' | 'loading' | 'resultats' | 'vente';

export interface FunnelStep {
    id: string;
    type: StepType;
    // Common fields
    eyebrow?: string;
    title?: string;
    lead?: string;
    cta?: string;

    // Hook specific
    icon?: string;
    heroLabel?: string;
    stats?: { value: string; label: string }[];

    // Question specific
    choices?: { text: string; subtext?: string }[];

    // Educatif specific
    cardTitle?: string;
    cardText?: string;
    gridItems?: { emoji: string; name: string; desc: string }[];
    educatifBullets?: { title: string; desc: string }[];

    // Capture specific
    captureDesc?: string;
    fields?: { type: 'name' | 'phone' | 'email'; label: string; placeholder: string; required?: boolean }[];
    secureText?: string;

    // Loading specific
    loadChecklist?: string[];

    // Resultats specific
    resBadge?: string;
    resScore?: number;
    resMsg?: string;
    perfs?: { label: string; pct: number }[];

    // Vente specific
    ebookIcon?: string;
    ebookTitle?: string;
    ebookSub?: string;
    ebookTag?: string;
    oldPrice?: string;
    newPrice?: string;
    countdown?: number; // minutes
    checkList?: string[];
    guarantee?: string;
    testimonials?: { name: string; stars: string; text: string }[];
    redirectUrl?: string; // Added for post-click redirection
    urgencyText?: string;
    securePayText?: string;
}

export const defaultTheme = {
    bg: '#ffffff',
    bg2: '#f5f5f7',
    bg3: '#fafafa',
    txt: '#1d1d1f',
    sub: '#6e6e73',
    light: '#86868b',
    border: '#d2d2d7',
    border2: '#e5e5ea',
    gold: '#b8860b',
    goldLight: '#d4a017',
    green: '#34c759',
    red: '#ff3b30',
    blue: '#0071e3',
};

export const generateFunnelHTML = (
    config: FunnelConfig,
    backendFields?: any[],
    publicId?: string,
    apiUrl?: string,
    initialStepNum: number = 1,
    formId?: number | string
) => {
    const { theme, steps } = config;
    const total = steps.length;

    const generateStepHTML = (step: FunnelStep, index: number) => {
        let content = '';
        const stepNum = index + 1;

        const backBtn = index > 0 ? `<button class="back-btn" onclick="goTo('${stepNum - 1}')">‹ Retour</button>` : '';
        const eyebrowStr = step.eyebrow ? `<div class="eyebrow">${step.eyebrow}</div>` : '';
        const titleStr = step.title ? `<h1>${step.title}</h1>` : '';
        const leadStr = step.lead ? `<p class="lead">${step.lead}</p>` : '';

        const renderIcon = (iconStr?: string, className?: string) => {
            if (!iconStr) return '';
            if (iconStr.startsWith('http') || iconStr.startsWith('data:image')) {
                return `<img src="${iconStr}" class="${className}" style="max-width: 100%; object-fit: contain; border-radius: 8px;" alt="icon"/>`;
            }
            return `<span class="${className}">${iconStr}</span>`;
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
                const cFields = backendFields && backendFields.length > 0 ? backendFields.sort((a: any, b: any) => a.order - b.order) : step.fields;
                content = `
                    <div class="capture-box" style="padding:0">
                        ${backBtn}
                        <div class="icon-pulse">🔒</div>
                        ${step.title ? `<h2>${step.title}</h2>` : ''}
                        ${step.captureDesc ? `<p style="color:#64748b;font-size:15px;margin-bottom:24px;">${step.captureDesc}</p>` : ''}
                        
                        <form id="capture-form-${step.id}" onsubmit="handleCaptureSubmit(event, '${stepNum + 1}', '${publicId}', '${apiUrl}')">
                            ${(cFields || []).map((f: any, i: number) => {
                    const bField = cFields ? cFields[i] : null;
                    const fieldName = bField ? bField.id : f.label;
                    const reqAttr = f.required ? 'required' : '';

                    const inputHtml = f.type === 'phone'
                        ? `<div class="phone-wrap"><span class="phone-flag">📱</span><input type="tel" name="${fieldName}" placeholder="${f.placeholder}" ${reqAttr} autocomplete="tel"/></div>`
                        : `<input type="${f.type === 'email' ? 'email' : 'text'}" name="${fieldName}" placeholder="${f.placeholder}" ${reqAttr} autocomplete="${f.type === 'name' ? 'given-name' : 'email'}"/>`;

                    return `
                                <div class="form-group">
                                    <label>${f.label} ${f.required ? '<span style="color:#ef4444">*</span>' : ''}</label>
                                    ${inputHtml}
                                </div>
                                `;
                }).join('')}
                            <div style="height:12px"></div>
                            <button type="submit" id="capture-btn" class="cta" style="width:100%;font-size:16px;">${step.cta || 'Continuer'} <span class="arr">→</span></button>
                        </form>
                        ${step.secureText ? `<div style="text-align:center;font-size:13px;color:#94a3b8;margin-top:16px;">🛡️ ${step.secureText}</div>` : ''}
                    </div>
                `;
                break;
            case 'loading':
                content = `
                    ${eyebrowStr}
                    ${titleStr}
                    <div class="circle-wrap">
                        <svg class="ring" width="120" height="120" viewBox="0 0 120 120">
                            <circle class="ring-bg" cx="60" cy="60" r="60"/>
                            <circle class="ring-fill" id="ring-fill" cx="60" cy="60" r="60"/>
                        </svg>
                        <div class="pct-txt" id="pct-txt">0%</div>
                    </div>
                    ${step.loadChecklist ? `<ul class="load-checks" id="load-checks">${step.loadChecklist.map((c, i) => `<li id="lc${i + 1}"><span class="chk"></span>${c}</li>`).join('')}</ul>` : ''}
                    <p style="font-size:13px;color:var(--light);text-align:center">Quelques secondes…</p>
                `;
                break;
            case 'resultats':
                content = `
                    <div style="text-align:center;margin-bottom:8px">${eyebrowStr}</div>
                    <div class="score-wrap">
                        <svg width="150" height="150" viewBox="0 0 150 150" style="transform:rotate(-90deg)">
                            <circle cx="75" cy="75" r="66" fill="none" stroke="var(--border2)" stroke-width="8"/>
                            <circle id="res-ring" cx="75" cy="75" r="66" fill="none" stroke="var(--txt)" stroke-width="8" stroke-linecap="round" stroke-dasharray="414.69" stroke-dashoffset="298"/>
                        </svg>
                        <div class="score-inner"><div class="sn" id="dyn-score">${step.resScore || 28}</div><div class="sl">/ 100</div></div>
                    </div>
                    ${step.resBadge ? `<div style="text-align:center;margin-bottom:24px"><div class="result-badge" id="res-badge">${step.resBadge}</div></div>` : ''}
                    ${step.perfs ? step.perfs.map((p) => `
                        <div class="perf-item">
                            <div class="perf-label"><span>${p.label}</span><span>${p.pct}%</span></div>
                            <div class="perf-track"><div class="perf-fill ${p.pct > 80 ? 'pf-high' : p.pct > 50 ? 'pf-mid' : 'pf-low'}" style="width:${p.pct}%"></div></div>
                        </div>
                    `).join('') : ''}
                    <div style="height:28px"></div>
                    ${step.resMsg ? `<div class="card" style="text-align:center;margin-bottom:24px"><p id="res-msg">${step.resMsg}</p></div>` : ''}
                    <button class="cta" onclick="goTo('${stepNum + 1}')">${step.cta || 'Voir mon programme →'}</button>
                `;
                break;
            case 'vente':
                content = `
                    <div class="ebook-cover">
                        ${renderIcon(step.ebookIcon, 'ec-icon')}
                        ${step.ebookTitle ? `<div class="ec-title">${step.ebookTitle}</div>` : ''}
                        ${step.ebookSub ? `<div class="ec-sub">${step.ebookSub}</div>` : ''}
                        ${step.ebookTag ? `<div class="ec-tag">${step.ebookTag}</div>` : ''}
                    </div>
                    ${(step.countdown === undefined || step.countdown > 0) ? `
                    <div class="countdown-box">
                        <div class="cd-lbl">Offre spéciale expire dans</div>
                        <div class="cd-timer" id="countdown">${step.countdown !== undefined ? step.countdown : 15}:00</div>
                    </div>` : ''}
                    ${step.oldPrice || step.newPrice ? `
                    <div class="price-box">
                        ${step.oldPrice ? `<div class="old-p">Prix normal : ${step.oldPrice}</div>` : ''}
                        ${step.newPrice ? `<div class="new-p">${step.newPrice}</div>` : ''}
                        <div class="disc-tag">Offre de lancement</div>
                    </div>` : ''}
                    ${step.checkList && step.checkList.length > 0 ? `
                    <ul class="check-list" style="margin-bottom:24px">
                        ${step.checkList.map(c => `<li><span class="ck"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></span>${c}</li>`).join('')}
                    </ul>` : ''}
                    ${step.guarantee ? `<div class="guarantee"><span style="font-size:22px;flex-shrink:0">🛡️</span><span><strong>Garantie</strong> — ${step.guarantee}</span></div>` : ''}
                    <div class="hr"></div>
                    ${step.testimonials && step.testimonials.length > 0 ? step.testimonials.map(t => `
                    <div class="testi">
                        <div class="tn">${t.name}</div>
                        <div class="ts">${t.stars || '★★★★★'}</div>
                        <p>${t.text}</p>
                    </div>`).join('') : ''}
                    <div class="hr"></div>
                    <div class="urgency" style="animation:pulse 1.8s infinite">${step.urgencyText !== undefined ? step.urgencyText : '⚠️ Prix limité — peut augmenter à tout moment'}</div>
                    <div style="height:12px"></div>
                    <button class="cta gold-btn" style="font-size:17px;padding:18px" onclick="handlePurchase('${step.redirectUrl || ''}')">${step.cta || 'Accéder maintenant'}</button>
                    <div class="pay-note">${step.securePayText !== undefined ? step.securePayText : '🔒 Paiement sécurisé · Accès immédiat'}</div>
                `;
                break;
        }

        return `<div class="screen ${index === 0 ? 'active' : ''}" id="screen-${stepNum}">${content}</div>`;
    };

    const loadChecklistCount = steps.find(s => s.type === 'loading')?.loadChecklist?.length || 4;

    return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Vura Tunnel</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:${theme.bg};--bg2:${theme.bg2};--bg3:${theme.bg3};
  --txt:${theme.txt};--sub:${theme.sub};--light:${theme.light};
  --border:${theme.border};--border2:${theme.border2};
  --gold:${theme.gold};--gold-light:${theme.goldLight};
  --green:${theme.green};--red:${theme.red};--blue:${theme.blue};
  --radius:14px;--radius-lg:20px;
}
body{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif;background:var(--bg);color:var(--txt);min-height:100vh;display:flex;justify-content:center;-webkit-font-smoothing:antialiased}
.app{width:100%;max-width:430px;min-height:100vh;display:flex;flex-direction:column;background:var(--bg)}
.prog-bar{height:8px;background:var(--border2);width:100%;flex-shrink:0;overflow:hidden;position:sticky;top:0;z-index:100}
.prog-fill{height:100%;background:linear-gradient(90deg, var(--blue) 0%, var(--gold) 100%);transition:width .6s cubic-bezier(.65,0,.35,1);box-shadow:0 0 10px rgba(0,0,0,0.1)}
.step-count{text-align:center;font-size:11px;color:var(--light);padding:12px 0 0;letter-spacing:.5px;font-weight:500}
.screen{display:none;flex-direction:column;flex:1;padding:32px 24px 44px;animation:up .35s cubic-bezier(.4,0,.2,1)}
.screen.active{display:flex}
@keyframes up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.back-btn{background:none;border:none;color:var(--blue);font-size:15px;cursor:pointer;text-align:left;padding:0 0 28px;display:flex;align-items:center;gap:4px;font-family:inherit;font-weight:500}
.eyebrow{font-size:12px;font-weight:600;color:var(--gold);letter-spacing:1.2px;text-transform:uppercase;margin-bottom:12px;text-align:center}
h1{font-size:28px;font-weight:700;line-height:1.25;letter-spacing:-.5px;color:var(--txt);margin-bottom:16px}
h1 em{font-style:normal;color:var(--gold-light)}
.lead{font-size:17px;color:var(--sub);line-height:1.6;margin-bottom:32px;font-weight:400}
.hero{background:var(--bg2);border-radius:var(--radius-lg);height:200px;display:flex;align-items:center;justify-content:center;margin-bottom:32px;overflow:hidden}
.hero-inner{text-align:center}
.hero-icon{font-size:72px;display:block;margin-bottom:4px;filter:drop-shadow(0 8px 24px rgba(0,0,0,.1))}
.hero-label{font-size:12px;color:var(--light);letter-spacing:1px;text-transform:uppercase;font-weight:500}
.stat-row{display:flex;gap:1px;background:var(--border2);border-radius:var(--radius);overflow:hidden;margin-bottom:32px}
.stat-box{flex:1;background:var(--bg);padding:18px 10px;text-align:center}
.stat-box .num{font-size:22px;font-weight:700;color:var(--txt);letter-spacing:-.5px}
.stat-box .lbl{font-size:11px;color:var(--light);margin-top:3px;line-height:1.4;font-weight:400}
.cta{width:100%;padding:16px;background:var(--txt);border:none;color:#fff;font-size:17px;font-weight:600;border-radius:980px;cursor:pointer;font-family:inherit;letter-spacing:-.1px;transition:opacity .15s,transform .15s}
.cta:active{opacity:.8;transform:scale(.98)}
.cta.gold-btn{background:var(--gold);color:#fff}
.spacer{flex:1}
.choices{display:flex;flex-direction:column;gap:10px;margin-bottom:32px}
.choice{background:var(--bg);border:1.5px solid var(--border);border-radius:var(--radius);padding:16px 18px;cursor:pointer;text-align:left;font-family:inherit;transition:all .2s;display:flex;align-items:center;justify-content:space-between}
.choice:hover{border-color:var(--txt);background:var(--bg3)}
.choice .ct{font-size:15px;font-weight:500;color:var(--txt)}
.choice .cs{font-size:13px;color:var(--light);margin-top:2px}
.choice .arr{color:var(--light);font-size:18px;flex-shrink:0;margin-left:12px}
.card{background:var(--bg2);border-radius:var(--radius-lg);padding:22px;margin-bottom:20px}
.card-title{font-size:12px;font-weight:600;color:var(--light);letter-spacing:.8px;text-transform:uppercase;margin-bottom:12px}
.card p{font-size:15px;color:var(--sub);line-height:1.65}
.ing-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:28px}
.ing-box{background:var(--bg2);border-radius:var(--radius);padding:16px;text-align:center}
.ing-box .ie{font-size:28px;margin-bottom:8px;display:block}
.ing-box .in{font-size:13px;font-weight:600;color:var(--txt);margin-bottom:3px}
.ing-box .id{font-size:12px;color:var(--light);line-height:1.4}
.check-list{list-style:none;display:flex;flex-direction:column;gap:14px;margin-bottom:28px}
.check-list li{display:flex;align-items:flex-start;gap:12px;font-size:15px;color:var(--txt);line-height:1.5}
.check-list li .ck{width:20px;height:20px;background:var(--txt);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.check-list li .ck svg{width:10px;height:10px;stroke:#fff;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.hr{border:none;border-top:1px solid var(--border2);margin:24px 0}
.form-group{margin-bottom:14px}
.form-group label{font-size:13px;font-weight:500;color:var(--sub);display:block;margin-bottom:8px;letter-spacing:.2px}
.form-group input{width:100%;background:var(--bg2);border:1.5px solid var(--border2);border-radius:var(--radius);padding:14px 16px;color:var(--txt);font-size:16px;font-family:inherit;outline:none;transition:border-color .2s;-webkit-appearance:none}
.form-group input:focus{border-color:var(--txt);background:var(--bg)}
.form-group input::placeholder{color:var(--light)}
.secure{font-size:12px;color:var(--light);text-align:center;margin-top:14px;display:flex;align-items:center;justify-content:center;gap:5px}
.phone-wrap{position:relative}
.phone-flag{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:18px;pointer-events:none}
.phone-wrap input{padding-left:46px}
#screen-loading{align-items:center;justify-content:center;text-align:center}
.circle-wrap{position:relative;width:120px;height:120px;margin:0 auto 36px}
svg.ring{transform:rotate(-90deg)}
.ring-bg{fill:none;stroke:var(--border2);stroke-width:6}
.ring-fill{fill:none;stroke:var(--txt);stroke-width:6;stroke-linecap:round;stroke-dasharray:376.99;stroke-dashoffset:376.99;transition:stroke-dashoffset .3s ease}
.pct-txt{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:26px;font-weight:700;color:var(--txt);letter-spacing:-.5px}
.load-checks{list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:28px;text-align:left;width:100%}
.load-checks li{font-size:14px;color:var(--light);display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--bg2);border-radius:var(--radius);transition:all .3s}
.load-checks li.done{color:var(--txt)}
.load-checks li .chk{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .3s;background:var(--bg)}
.load-checks li.done .chk{background:var(--txt);border-color:var(--txt)}
.load-checks li.done .chk::after{content:'';display:block;width:8px;height:8px;border:1.5px solid #fff;border-top:none;border-right:none;transform:rotate(-45deg) translate(1px,-1px)}
.score-wrap{position:relative;width:150px;height:150px;margin:0 auto 20px}
.score-inner{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center}
.score-inner .sn{font-size:38px;font-weight:700;color:var(--txt);letter-spacing:-1px}
.score-inner .sl{font-size:12px;color:var(--light);font-weight:500}
.result-badge{background:var(--bg2);border-radius:980px;padding:8px 18px;display:inline-block;font-size:13px;font-weight:600;color:var(--txt);margin-bottom:28px}
.perf-item{margin-bottom:16px}
.perf-label{display:flex;justify-content:space-between;font-size:13px;margin-bottom:7px;color:var(--sub);font-weight:500}
.perf-label span:last-child{color:var(--txt);font-weight:600}
.perf-track{height:6px;background:var(--border2);border-radius:6px;overflow:hidden}
.perf-fill{height:100%;border-radius:6px}
.pf-low{background:var(--red)}
.pf-mid{background:var(--gold-light)}
.pf-high{background:var(--green)}
.ebook-cover{background:var(--bg2);border-radius:var(--radius-lg);padding:32px 24px;text-align:center;margin-bottom:28px}
.ebook-cover .ec-icon{font-size:60px;display:block;margin-bottom:16px}
.ebook-cover .ec-title{font-size:21px;font-weight:700;color:var(--txt);letter-spacing:-.3px;margin-bottom:8px;line-height:1.3}
.ebook-cover .ec-sub{font-size:14px;color:var(--sub);line-height:1.6;margin-bottom:16px}
.ebook-cover .ec-tag{background:var(--txt);color:#fff;font-size:11px;font-weight:600;padding:5px 14px;border-radius:980px;letter-spacing:.5px;display:inline-block}
.price-box{text-align:center;padding:24px;background:var(--bg2);border-radius:var(--radius-lg);margin-bottom:20px}
.old-p{font-size:15px;color:var(--light);text-decoration:line-through;margin-bottom:6px}
.new-p{font-size:46px;font-weight:700;color:var(--txt);letter-spacing:-1.5px;line-height:1}
.disc-tag{display:inline-block;background:var(--green);color:#fff;font-size:12px;font-weight:600;padding:4px 12px;border-radius:980px;margin-top:10px;letter-spacing:.3px}
.countdown-box{border:1px solid var(--border2);border-radius:var(--radius);padding:16px;text-align:center;margin-bottom:20px}
.cd-lbl{font-size:12px;color:var(--light);margin-bottom:6px;font-weight:500;letter-spacing:.5px;text-transform:uppercase}
.cd-timer{font-size:34px;font-weight:700;color:var(--txt);font-variant-numeric:tabular-nums;letter-spacing:-1px}
.guarantee{display:flex;align-items:flex-start;gap:14px;background:#f2fdf5;border:1px solid #c6f0d2;border-radius:var(--radius);padding:16px;margin-bottom:20px;font-size:14px;color:#1a5c2a;line-height:1.6}
.testi{background:var(--bg2);border-radius:var(--radius);padding:18px;margin-bottom:10px}
.testi .tn{font-size:14px;font-weight:600;color:var(--txt);margin-bottom:2px}
.testi .ts{color:var(--gold);font-size:13px;margin-bottom:8px}
.urgency{font-size:13px;color:var(--red);text-align:center;margin:14px 0 6px;font-weight:500;animation:pulse 1.8s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.pay-note{font-size:12px;color:var(--light);text-align:center;margin-top:14px;display:flex;align-items:center;justify-content:center;gap:6px}
</style>
</head>
<body>
<div class="app">
<div class="prog-bar"><div class="prog-fill" id="pf" style="width:0%"></div></div>
<div class="step-count" id="sc"></div>

${steps.map((s, index) => generateStepHTML(s, index)).join('\n')}

</div>
<script>
window.VURA_API_URL = '${apiUrl || ""}';
window.VURA_FORM_ID = '${formId || ""}';
const TOTAL_QUESTION_STEPS = ${steps.filter(s => ['hook', 'question', 'educatif'].includes(s.type)).length};
let userName='';

function updateProgress(id) {
    // Only count steps before capture/loading/res/sales
    const sc=document.getElementById('sc'), pf=document.getElementById('pf');
    if (!sc) return;
    
    let currentPos = parseInt(id);
    if (isNaN(currentPos) || currentPos > TOTAL_QUESTION_STEPS) {
        sc.textContent='';
        if (id > TOTAL_QUESTION_STEPS) pf.style.width='95%';
    } else {
        sc.textContent = \`\${currentPos} / \${TOTAL_QUESTION_STEPS}\`;
        pf.style.width = \`\${(currentPos/TOTAL_QUESTION_STEPS)*100}%\`;
    }
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
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const target = document.getElementById(\`screen-\${id}\`);
  if (target) target.classList.add('active');
  window.scrollTo(0,0);
  
  // Track step impression (id is 1-based, array is 0-based)
  const stepObj = ${JSON.stringify(steps)}[parseInt(id) - 1];
  if (stepObj) trackImpression(stepObj.id);

  // Specific logic if target is 'results' to animate circle
  if (target && target.innerText.includes('score-inner')) {
      document.getElementById('pf').style.width = '100%';
  } else {
      updateProgress(id);
  }
}

// Initial track for first step
document.addEventListener('DOMContentLoaded', () => {
    const firstStep = ${JSON.stringify(steps[0])};
    if (firstStep) trackImpression(firstStep.id);
});

function startLoading(nextId){
  const nameInp = document.getElementById('inp-name');
  if (nameInp) userName = nameInp.value.trim() || '';
  
  if(userName){
    const badge = document.getElementById('res-badge');
    const msg = document.getElementById('res-msg');
    if(badge) badge.textContent = badge.textContent.replace('{name}', userName.split(' ')[0]);
    if(msg) msg.textContent = msg.textContent.replace('{name}', userName.split(' ')[0]);
  }
  
  goTo(nextId);
  
  const ring=document.getElementById('ring-fill');
  const pctEl=document.getElementById('pct-txt');
  if (!ring || !pctEl) {
      setTimeout(()=>goTo(parseInt(nextId) + 1), 2000);
      return;
  }
  
  const C=376.99;
  const loadCount = ${loadChecklistCount};
  let steps = [];
  for(let i=0; i<loadCount; i++) {
      steps.push({p: Math.floor((100 / loadCount) * (i + 1)), id: 'lc' + (i + 1)});
  }
  
  let pct=0,si=0;
  const iv=setInterval(()=>{
    pct++;
    pctEl.textContent=pct+'%';
    ring.style.strokeDashoffset=C-(C*pct/100);
    if(si<steps.length&&pct>=steps[si].p){
        const el = document.getElementById(steps[si].id);
        if(el) el.classList.add('done');
        si++;
    }
    if(pct>=100){
        clearInterval(iv);
        setTimeout(()=>goTo(parseInt(nextId) + 1), 700);
    }
  },28);
}

// Countdown
(function(){
  const venteStep = ${JSON.stringify(steps.find(s => s.type === 'vente') || null)};
  const cd = venteStep ? (venteStep.countdown !== undefined ? venteStep.countdown : 15) : 0;
  if (cd <= 0) return;
  let s=cd*60;
  const el=document.getElementById('countdown');
  if(!el) return;
  setInterval(()=>{
    if(s<=0)s=cd*60;
    el.textContent=\`\${Math.floor(s/60).toString().padStart(2,'0')}:\${(s%60).toString().padStart(2,'0')}\`;
    s--;
  },1000);
})();

window.VURA_PUBLIC_ID = '${publicId || ''}';
window.VURA_API_URL = '${apiUrl || ''}';

function handleCaptureSubmit(e, nextStep) {
    e.preventDefault();
    const btn = document.getElementById('capture-btn');
    const oldText = btn ? btn.innerHTML : 'Continuer';
    if (btn) {
        btn.innerHTML = 'Chargement...';
        btn.disabled = true;
    }

    const processNext = () => {
        const target = document.getElementById('screen-' + nextStep);
        if (target && target.innerHTML.includes('circle-wrap')) {
            startLoading(nextStep);
        } else {
            goTo(nextStep);
        }
        if (btn) {
            btn.innerHTML = oldText;
            btn.disabled = false;
        }
    };

    const fd = new FormData(e.target);
    const answers = [];
    fd.forEach((val, key) => {
        const fieldId = parseInt(key);
        if(!isNaN(fieldId)) {
            answers.push({ field_id: fieldId, value: val });
        }
    });

    const payload = { answers: answers };
    if (window.VURA_RESPONSE_ID) {
        payload.response_id = window.VURA_RESPONSE_ID;
    }

    if (window.VURA_PUBLIC_ID && window.VURA_PUBLIC_ID !== 'undefined' && window.VURA_PUBLIC_ID.trim() !== '' && answers.length > 0) {
        fetch(window.VURA_API_URL + 'forms/p/' + window.VURA_PUBLIC_ID + '/submit/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data && data.id) window.VURA_RESPONSE_ID = data.id;
            processNext();
        })
        .catch(processNext);
    } else {
        processNext();
    }
}

function handlePurchase(url){
  if (url) {
      if (!url.startsWith('http')) url = 'https://' + url;
      window.open(url, '_blank');
  } else {
      alert('🎉 Redirection vers le système de paiement… (Veuillez configurer un lien)');
  }
}

let startStep = ${initialStepNum};
goTo(startStep);
</script>
</body>
</html>`;
}
