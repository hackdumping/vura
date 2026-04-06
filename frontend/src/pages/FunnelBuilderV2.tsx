import { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, TextField, MenuItem, IconButton, Select, Tab, Tabs, Divider } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import type { FunnelConfig, FunnelStep, StepType } from '../utils/funnelExport';
import { defaultTheme, generateFunnelHTML } from '../utils/funnelExport';
import { useAppStore } from '../store';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function FunnelBuilderV2() {

    const { id } = useParams();
    const navigate = useNavigate();
    const themeMode = useAppStore(state => state.themeMode);
    const isDark = themeMode === 'dark';

    const [title, setTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [publishedLink, setPublishedLink] = useState('');
    const [publicId, setPublicId] = useState('');
    const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
    const [config, setConfig] = useState<FunnelConfig>({
        theme: { ...defaultTheme },
        steps: [
            { id: '1', type: 'hook', eyebrow: 'Guide Premium', title: 'Votre Titre Ici', lead: 'Une courte description', cta: 'Commencer', icon: '🚀' }
        ]
    });

    const [activeTab, setActiveTab] = useState(0);
    const [selectedStepId, setSelectedStepId] = useState<string>('1');
    const [htmlPreview, setHtmlPreview] = useState('');

    useEffect(() => {
        if (id && id !== 'new') {
            api.get(`forms/builder/${id}/`)
                .then((res: any) => {
                    const data = res.data;
                    setTitle(data.title || '');
                    if (data.public_id) {
                        setPublicId(data.public_id);
                        if (data.is_published) {
                            setPublishedLink(`${window.location.origin}/p/${data.public_id}`);
                        }
                    }
                    if (data.funnel_config && data.funnel_config.steps) {
                        setConfig(data.funnel_config);
                    }
                })
                .catch((err: any) => console.error("Error loading funnel:", err));
        }
    }, [id]);

    useEffect(() => {
        const activeIndex = config.steps.findIndex(s => s.id === selectedStepId);
        const stepNum = activeIndex >= 0 ? activeIndex + 1 : 1;
        const html = generateFunnelHTML(config, undefined, publicId, import.meta.env.VITE_API_URL, stepNum);
        setHtmlPreview(html);
    }, [config, selectedStepId, publicId]);

    const handleSave = async (publish: boolean = false, unpublish: boolean = false) => {
        setIsSaving(true);

        const fieldsPayload = config.steps
            .filter(s => s.type === 'capture')
            .flatMap(s => (s.fields || []).map((f: any, i: number) => ({
                type: f.type === 'name' ? 'text' : (f.type === 'phone' ? 'text' : f.type),
                label: f.label,
                placeholder: f.placeholder,
                required: f.required || false,
                order: i
            })));

        const payload = {
            title,
            is_specialized: true,
            funnel_config: config,
            is_published: unpublish ? false : (publish ? true : !!publishedLink),
            fields: fieldsPayload
        };

        try {
            if (id && id !== 'new') {
                await api.put(`forms/builder/${id}/`, payload);
                if (unpublish) {
                    setPublishedLink('');
                } else if (publish && publicId) {
                    setPublishedLink(`${window.location.origin}/p/${publicId}`);
                }
            } else {
                const res = await api.post('forms/builder/', payload);
                navigate(`/funnel-builder/${res.data.id}`);
            }
        } catch (err) {
            console.error('Failed to save funnel', err);
        } finally {
            setIsSaving(false);
        }
    };

    const addStep = (type: StepType) => {
        const newStep: FunnelStep = { id: Date.now().toString(), type, title: 'Nouvelle Etape' };
        if (type === 'question') newStep.choices = [{ text: 'Choix 1' }];
        if (type === 'capture') newStep.fields = [{ type: 'name', label: 'Prénom', placeholder: 'Ex: Jean' }];

        setConfig(prev => ({ ...prev, steps: [...prev.steps, newStep] }));
        setSelectedStepId(newStep.id);
    };

    const updateStep = (id: string, updates: Partial<FunnelStep>) => {
        setConfig(prev => ({
            ...prev,
            steps: prev.steps.map(s => s.id === id ? { ...s, ...updates } : s)
        }));
    };

    const removeStep = (id: string) => {
        setConfig(prev => {
            const newSteps = prev.steps.filter(s => s.id !== id);
            if (selectedStepId === id) setSelectedStepId(newSteps[0]?.id || '');
            return { ...prev, steps: newSteps };
        });
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;
        const items = Array.from(config.steps);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setConfig(prev => ({ ...prev, steps: items }));
    };

    const handleExport = () => {
        const html = generateFunnelHTML(config);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vura_funnel.html';
        a.click();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'icon' | 'ebookIcon') => {
        const file = e.target.files?.[0];
        const active = config.steps.find(s => s.id === selectedStepId);
        if (!file || !active) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                updateStep(active.id, { [fieldName]: reader.result as string });
            }
        };
        reader.readAsDataURL(file);
    };

    const handleCopyLink = () => {
        if (!publishedLink) return;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(publishedLink).then(() => alert("Lien copié dans le presse-papier !"));
        } else {
            const el = document.createElement('textarea');
            el.value = publishedLink;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            alert("Lien copié dans le presse-papier !");
        }
    };

    const activeStep = config.steps.find(s => s.id === selectedStepId);

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '100vh', pt: { xs: 8, md: 9 }, pb: { xs: '60px', md: 0 }, bgcolor: isDark ? '#050615' : '#f5f5f7' }}>

            {/* LEFT SIDEBAR - BUILDER */}
            <Paper sx={{
                width: { xs: '100%', md: 400 },
                flex: { xs: 1, md: 'none' },
                display: { xs: mobileView === 'editor' ? 'flex' : 'none', md: 'flex' },
                flexDirection: 'column',
                borderRadius: 0,
                borderRight: { xs: 'none', md: '1px solid' },
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e0e0e0',
                zIndex: 1,
                overflow: 'hidden',
                background: isDark ? '#0D0F1F' : '#FFFFFF'
            }}>
                <Box sx={{ p: { xs: 1.5, md: 2 }, borderBottom: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e0e0e0', display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>Tunnel Builder Pro</Typography>
                    <TextField
                        fullWidth size="small" variant="standard"
                        value={title} onChange={(e) => setTitle(e.target.value)}
                        placeholder="Titre du funnel"
                        InputProps={{ disableUnderline: true, style: { fontWeight: 600, fontSize: '15px' } }}
                    />
                </Box>

                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth" sx={{ borderBottom: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e0e0e0' }}>
                    <Tab label="Étapes" />
                    <Tab label="Design" />
                </Tabs>

                <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                    {activeTab === 0 && (
                        <>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 700 }}>PARCOURS UTILISATEUR</Typography>

                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="steps">
                                    {(provided) => (
                                        <Box {...provided.droppableProps} ref={provided.innerRef} sx={{ mb: 3 }}>
                                            {config.steps.map((step, index) => (
                                                <Draggable key={step.id} draggableId={step.id} index={index}>
                                                    {(provided) => (
                                                        <Paper
                                                            ref={provided.innerRef} {...provided.draggableProps}
                                                            sx={{
                                                                mb: 1.5, p: 1,
                                                                display: 'flex', alignItems: 'center', cursor: 'pointer',
                                                                borderRadius: 3,
                                                                border: '2px solid',
                                                                borderColor: selectedStepId === step.id ? '#4F46E5' : 'transparent',
                                                                bgcolor: selectedStepId === step.id ? (isDark ? 'rgba(79,70,229,0.15)' : '#F5F3FF') : (isDark ? 'rgba(255,255,255,0.03)' : '#fff'),
                                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                                                            }}
                                                            onClick={() => setSelectedStepId(step.id)}
                                                        >
                                                            <Box {...provided.dragHandleProps} sx={{ mr: 1, color: 'text.disabled', display: 'flex' }}><DragIndicatorIcon fontSize="small" /></Box>

                                                            {/* Large Icon Preview */}
                                                            <Box sx={{
                                                                width: 48, height: 48,
                                                                borderRadius: 2,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: '24px',
                                                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                                                mr: 2,
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                            }}>
                                                                {step.type === 'hook' && '🚀'}
                                                                {step.type === 'question' && '❓'}
                                                                {step.type === 'educatif' && '📖'}
                                                                {step.type === 'capture' && '🔒'}
                                                                {step.type === 'loading' && '⏳'}
                                                                {step.type === 'resultats' && '🏆'}
                                                                {step.type === 'vente' && '💰'}
                                                            </Box>

                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography variant="caption" fontWeight={800} color="primary" sx={{ letterSpacing: 1, mb: 0.5 }}>{step.type.toUpperCase()}</Typography>
                                                                <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>{step.title || 'Sans titre'}</Typography>
                                                            </Box>
                                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeStep(step.id); }} color="error" sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}><DeleteIcon fontSize="small" /></IconButton>
                                                        </Paper>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </Box>
                                    )}
                                </Droppable>
                            </DragDropContext>

                            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 1, mt: 2 }}>AJOUTER UNE ÉTAPE</Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 4 }}>
                                {[
                                    { type: 'hook', icon: '🚀', label: 'Hook' },
                                    { type: 'question', icon: '❓', label: 'Question' },
                                    { type: 'educatif', icon: '📖', label: 'Info' },
                                    { type: 'capture', icon: '🔒', label: 'Capture' },
                                    { type: 'loading', icon: '⏳', label: 'Wait' },
                                    { type: 'resultats', icon: '🏆', label: 'Score' },
                                    { type: 'vente', icon: '💰', label: 'Vente' },
                                ].map(i => (
                                    <Button
                                        key={i.type}
                                        onClick={() => addStep(i.type as StepType)}
                                        sx={{
                                            display: 'flex', flexDirection: 'column',
                                            p: 1.5, borderRadius: 3, minWidth: 0,
                                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                                            border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                                            '&:hover': { bgcolor: isDark ? 'rgba(79,70,229,0.1)' : '#EEF2FF', borderColor: '#4F46E5', transform: 'scale(1.05)' },
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Typography variant="h5" sx={{ mb: 0.5 }}>{i.icon}</Typography>
                                        <Typography variant="caption" fontWeight={800} sx={{ fontSize: '9px', color: 'text.secondary' }}>{i.label.toUpperCase()}</Typography>
                                    </Button>
                                ))}
                            </Box>

                            {/* ACTIVE STEP EDITOR */}
                            {activeStep && (
                                <Box sx={{ p: 2, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fff', borderRadius: 2, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e0e0e0' }}>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Contrôles de l'étape : {activeStep.type}</Typography>

                                    <TextField fullWidth size="small" label="Eyebrow (Surtitre)" value={activeStep.eyebrow || ''} onChange={(e) => updateStep(activeStep.id, { eyebrow: e.target.value })} sx={{ mb: 2 }} />
                                    <TextField fullWidth size="small" label="Titre (h1)" value={activeStep.title || ''} onChange={(e) => updateStep(activeStep.id, { title: e.target.value })} sx={{ mb: 2 }} />

                                    {['hook', 'question', 'educatif'].includes(activeStep.type) && (
                                        <TextField fullWidth size="small" multiline rows={2} label="Description (Lead)" value={activeStep.lead || ''} onChange={(e) => updateStep(activeStep.id, { lead: e.target.value })} sx={{ mb: 2 }} />
                                    )}

                                    {activeStep.type === 'hook' && (
                                        <>
                                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                <TextField fullWidth size="small" label="Icône (Emoji, URL, Image Locale)" value={activeStep.icon || ''} onChange={(e) => updateStep(activeStep.id, { icon: e.target.value })} />
                                                <Button variant="outlined" component="label" sx={{ whiteSpace: 'nowrap' }}>
                                                    Upload
                                                    <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'icon')} />
                                                </Button>
                                            </Box>
                                            <TextField fullWidth size="small" label="Label du Héros" value={activeStep.heroLabel || ''} onChange={(e) => updateStep(activeStep.id, { heroLabel: e.target.value })} sx={{ mb: 2 }} />
                                        </>
                                    )}

                                    {activeStep.type === 'capture' && (
                                        <Box sx={{ mb: 2 }}>
                                            <TextField fullWidth size="small" multiline rows={2} label="Description" value={activeStep.captureDesc || ''} onChange={(e) => updateStep(activeStep.id, { captureDesc: e.target.value })} sx={{ mb: 2 }} />

                                            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 1.5, mt: 1 }}>CHAMPS DU FORMULAIRE</Typography>

                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                                                {(activeStep.fields || []).map((f, i) => (
                                                    <Paper key={i} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e0e0e0', background: isDark ? 'rgba(255,255,255,0.02)' : '#f9f9fb', position: 'relative' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                                            <Typography variant="caption" fontWeight={800} color="primary">CHAMP #{i + 1}</Typography>
                                                            <IconButton size="small" color="error" onClick={() => { const nf = [...(activeStep.fields || [])]; nf.splice(i, 1); updateStep(activeStep.id, { fields: nf }); }}>
                                                                <DeleteIcon sx={{ fontSize: 18 }} />
                                                            </IconButton>
                                                        </Box>

                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                                                                <Select
                                                                    fullWidth size="small" value={f.type}
                                                                    onChange={(e) => { const nf = [...(activeStep.fields || [])]; nf[i].type = e.target.value as any; updateStep(activeStep.id, { fields: nf }); }}
                                                                    sx={{ borderRadius: 2, fontSize: '13px' }}
                                                                >
                                                                    <MenuItem value="name">Texte</MenuItem>
                                                                    <MenuItem value="email">Email</MenuItem>
                                                                    <MenuItem value="phone">Téléphone</MenuItem>
                                                                </Select>
                                                                <Button
                                                                    fullWidth size="small" variant={f.required ? "contained" : "outlined"}
                                                                    onClick={() => { const nf = [...(activeStep.fields || [])]; nf[i].required = !nf[i].required; updateStep(activeStep.id, { fields: nf }); }}
                                                                    sx={{ borderRadius: 2, fontSize: '11px', fontWeight: 700 }}
                                                                >
                                                                    {f.required ? "OBLIGATOIRE" : "OPTIONNEL"}
                                                                </Button>
                                                            </Box>

                                                            <TextField
                                                                fullWidth size="small" label="Libellé (Question)" value={f.label}
                                                                onChange={(e) => { const nf = [...(activeStep.fields || [])]; nf[i].label = e.target.value; updateStep(activeStep.id, { fields: nf }); }}
                                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                            />

                                                            <TextField
                                                                fullWidth size="small" label="Exemple (Placeholder)" value={f.placeholder}
                                                                onChange={(e) => { const nf = [...(activeStep.fields || [])]; nf[i].placeholder = e.target.value; updateStep(activeStep.id, { fields: nf }); }}
                                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                            />
                                                        </Box>
                                                    </Paper>
                                                ))}
                                            </Box>

                                            <Button
                                                fullWidth variant="outlined" startIcon={<AddIcon />}
                                                onClick={() => updateStep(activeStep.id, { fields: [...(activeStep.fields || []), { type: 'name', label: 'Nouveau champ', placeholder: '', required: false }] })}
                                                sx={{ borderRadius: 2, fontWeight: 700, borderStyle: 'dashed', py: 1 }}
                                            >
                                                Ajouter un champ
                                            </Button>

                                            <Divider sx={{ my: 3 }} />

                                            <TextField fullWidth size="small" label="Texte de réassurance (Sécurité)" placeholder="ex: 🔒 Vos données sont protégées" value={activeStep.secureText || ''} onChange={(e) => updateStep(activeStep.id, { secureText: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                        </Box>
                                    )}

                                    {activeStep.type === 'question' && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="caption" fontWeight={700}>Choix</Typography>
                                            {activeStep.choices?.map((c, i) => (
                                                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, mt: 1 }}>
                                                    <TextField fullWidth size="small" placeholder="Titre" value={c.text} onChange={(e) => { const nc = [...(activeStep.choices || [])]; nc[i].text = e.target.value; updateStep(activeStep.id, { choices: nc }); }} />
                                                    <TextField fullWidth size="small" placeholder="Sous-texte" value={c.subtext || ''} onChange={(e) => { const nc = [...(activeStep.choices || [])]; nc[i].subtext = e.target.value; updateStep(activeStep.id, { choices: nc }); }} />
                                                    <IconButton size="small" color="error" onClick={() => { const nc = [...(activeStep.choices || [])]; nc.splice(i, 1); updateStep(activeStep.id, { choices: nc }); }}><DeleteIcon fontSize="small" /></IconButton>
                                                </Box>
                                            ))}
                                            <Button size="small" variant="outlined" onClick={() => updateStep(activeStep.id, { choices: [...(activeStep.choices || []), { text: 'Nouveau choix' }] })}>Ajouter un choix</Button>
                                        </Box>
                                    )}

                                    {activeStep.type === 'vente' && (
                                        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            <Box sx={{ display: 'flex', gap: 1, width: '100%', mb: 1 }}>
                                                <TextField fullWidth size="small" label="Icône Ebook (Emoji, URL, Local)" value={activeStep.ebookIcon || ''} onChange={(e) => updateStep(activeStep.id, { ebookIcon: e.target.value })} />
                                                <Button variant="outlined" component="label" sx={{ whiteSpace: 'nowrap' }}>
                                                    Upload
                                                    <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'ebookIcon')} />
                                                </Button>
                                            </Box>
                                            <TextField fullWidth size="small" label="Titre Ebook" value={activeStep.ebookTitle || ''} onChange={(e) => updateStep(activeStep.id, { ebookTitle: e.target.value })} />
                                            <TextField fullWidth size="small" label="Sous-titre Ebook" value={activeStep.ebookSub || ''} onChange={(e) => updateStep(activeStep.id, { ebookSub: e.target.value })} />

                                            <TextField sx={{ width: '48%' }} size="small" label="Ancien Prix" value={activeStep.oldPrice || ''} onChange={(e) => updateStep(activeStep.id, { oldPrice: e.target.value })} />
                                            <TextField sx={{ width: '48%' }} size="small" label="Nouveau Prix" value={activeStep.newPrice || ''} onChange={(e) => updateStep(activeStep.id, { newPrice: e.target.value })} />

                                            <TextField sx={{ width: '48%' }} size="small" label="Minutage Urgent" type="number" value={activeStep.countdown !== undefined ? activeStep.countdown : 15} onChange={(e) => updateStep(activeStep.id, { countdown: e.target.value === '' ? undefined : parseInt(e.target.value) })} />
                                            <TextField sx={{ width: '48%' }} size="small" label="Garantie" value={activeStep.guarantee || ''} onChange={(e) => updateStep(activeStep.id, { guarantee: e.target.value })} />

                                            <TextField fullWidth size="small" label="Lien de redirection (Post-paiement)" value={activeStep.redirectUrl || ''} onChange={(e) => updateStep(activeStep.id, { redirectUrl: e.target.value })} placeholder="https://monsite.com/checkout" sx={{ mt: 1 }} />
                                            <TextField sx={{ width: '48%' }} size="small" label="Texte d'Urgence" value={activeStep.urgencyText !== undefined ? activeStep.urgencyText : '⚠️ Prix limité — peut augmenter à tout moment'} onChange={(e) => updateStep(activeStep.id, { urgencyText: e.target.value })} />
                                            <TextField sx={{ width: '48%' }} size="small" label="Texte Sécurisé" value={activeStep.securePayText !== undefined ? activeStep.securePayText : '🔒 Paiement sécurisé · Accès immédiat'} onChange={(e) => updateStep(activeStep.id, { securePayText: e.target.value })} />
                                        </Box>
                                    )}

                                    <TextField fullWidth size="small" label="Texte du bouton CTA" value={activeStep.cta || ''} onChange={(e) => updateStep(activeStep.id, { cta: e.target.value })} sx={{ mb: 2 }} />
                                </Box>
                            )}
                        </>
                    )}

                    {activeTab === 1 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>COULEURS GLOBALES</Typography>
                            {Object.entries(config.theme).map(([key, val]) => (
                                <TextField
                                    key={key} size="small" label={key} type="color" value={val}
                                    onChange={(e) => setConfig(prev => ({ ...prev, theme: { ...prev.theme, [key]: e.target.value } }))}
                                    sx={{ '& input': { padding: 0.5, height: 40 } }}
                                />
                            ))}
                        </Box>
                    )}
                </Box>
                <Box sx={{ p: { xs: 1.5, md: 2 }, borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e0e0e0', display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: isDark ? '#0D0F1F' : '#FFFFFF', zIndex: 5 }}>
                    {/* Link Box */}
                    {publishedLink && (
                        <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 0.5, bgcolor: 'rgba(16,185,129,0.1)', color: '#10B981', borderRadius: 2, border: '1px solid rgba(16,185,129,0.2)' }}>
                            <Typography variant="caption" fontWeight={700} sx={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{publishedLink}</Typography>
                            <IconButton size="small" onClick={handleCopyLink} sx={{ color: '#10B981', p: '4px', ml: 1 }}>
                                <ContentCopyIcon sx={{ fontSize: '1rem' }} />
                            </IconButton>
                        </Box>
                    )}

                    {/* Primary Actions */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="contained" onClick={() => handleSave(false)} disabled={isSaving} sx={{ minWidth: 0, px: 2, py: 1, borderRadius: 2, bgcolor: isDark ? '#1e1e2d' : '#e2e8f0', color: isDark ? '#fff' : '#1e293b', boxShadow: 'none' }}>
                            <SaveIcon sx={{ fontSize: '1.25rem' }} />
                        </Button>
                        <Button variant="contained" fullWidth onClick={() => handleSave(true)} disabled={isSaving} sx={{ borderRadius: 2, fontWeight: 700, background: publishedLink ? '#10B981' : '#4F46E5', color: '#fff', boxShadow: 'none', '&:hover': { background: publishedLink ? '#059669' : '#4338ca' } }}>
                            {publishedLink ? 'Mettre à jour' : 'Publier le Funnel'}
                        </Button>
                    </Box>

                    {/* Secondary Row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 0.5 }}>
                        <Button variant="text" size="small" onClick={handleExport} sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem', p: 0, minWidth: 0, '&:hover': { bgcolor: 'transparent' } }}>
                            ↓ Exporter HTML
                        </Button>
                        {publishedLink && (
                            <Button variant="text" color="error" size="small" onClick={() => handleSave(false, true)} disabled={isSaving} sx={{ fontWeight: 600, fontSize: '0.75rem', p: 0, minWidth: 0, '&:hover': { bgcolor: 'transparent' } }}>
                                Dépublier
                            </Button>
                        )}
                    </Box>
                </Box>
            </Paper>

            {/* RIGHT MAIN AREA - PREVIEW */}
            <Box sx={{
                flex: 1,
                display: { xs: mobileView === 'preview' ? 'flex' : 'none', md: 'flex' },
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 2, md: 4 }
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: { xs: 2, md: 3 } }}>
                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>Aperçu en Direct</Typography>
                    <Button size="small" startIcon={<PlayArrowIcon />} sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 700, borderRadius: 2 }} onClick={() => {
                        const iframe = document.getElementById('preview-frame') as HTMLIFrameElement;
                        if (iframe && iframe.contentWindow) {
                            try {
                                (iframe.contentWindow as any).goTo(1);
                            } catch (e) {
                                iframe.srcdoc = iframe.srcdoc; // fallback to reload
                            }
                        }
                    }}>
                        {window.innerWidth < 600 ? 'Rejouer' : "Rejouer l'animation"}
                    </Button>
                </Box>

                {/* Mobile Device Mockup */}
                <Box sx={{ width: '100%', maxWidth: 400, height: { xs: 'calc(100vh - 180px)', md: 800 }, maxHeight: 800, bgcolor: '#000', borderRadius: { xs: '24px', md: '40px' }, p: { xs: '8px', md: '12px' }, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
                    <Box sx={{ width: '100%', height: '100%', borderRadius: { xs: '18px', md: '30px' }, overflow: 'hidden', bgcolor: '#fff' }}>
                        <iframe
                            id="preview-frame"
                            srcDoc={htmlPreview}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            title="Live Preview"
                        />
                    </Box>
                </Box>
            </Box>

            {/* MOBILE BOTTOM NAV */}
            <Paper sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, borderTop: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e0e0e0', bgcolor: isDark ? '#0D0F1F' : '#FFFFFF' }} elevation={10}>
                <Tabs value={mobileView} onChange={(_, v) => setMobileView(v)} variant="fullWidth" sx={{ flex: 1 }}>
                    <Tab label="Éditeur" value="editor" />
                    <Tab label="Aperçu Live" value="preview" />
                </Tabs>
            </Paper>
        </Box>
    );
}
