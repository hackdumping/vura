import { useState, useEffect } from 'react';
import { Typography, TextField, Button, Box, Paper, IconButton, Select, MenuItem, Switch, FormControlLabel, Container, Chip, Divider, CircularProgress } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAppStore } from '../store';
import { copyToClipboard } from '../utils/clipboard';

interface FormField {
    id?: number;
    type: string;
    label: string;
    required: boolean;
    order: number;
    options?: any;
}

export default function FormBuilder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { themeMode, t } = useAppStore();
    const isDark = themeMode === 'dark';
    const b = t.builder as any;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [fields, setFields] = useState<FormField[]>([]);
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);
    const [publicId, setPublicId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Specialized (Premium)
    const [isSpecialized, setIsSpecialized] = useState(false);
    const [offerTitle, setOfferTitle] = useState('');
    const [offerDescription, setOfferDescription] = useState('');
    const [offerButtonText, setOfferButtonText] = useState('');
    const [offerButtonUrl, setOfferButtonUrl] = useState('');
    const [offerAdvantages, setOfferAdvantages] = useState<string[]>([]);
    const [funnelConfig, setFunnelConfig] = useState<any>({
        intro: { enabled: true, title: '', subtitle: '', eyebrow: '', heroIcon: '🚀', cta: '' },
        analysis: { enabled: true, title: '', steps: [] },
        results: { enabled: true, badge: '', message: '' },
        stats: []
    });

    const user = useAppStore(state => state.user);
    const isPremium = user?.is_premium || false;

    const FIELD_TYPES = [
        { value: 'text', label: b.shortText, emoji: '📝' },
        { value: 'textarea', label: b.longText, emoji: '📄' },
        { value: 'email', label: b.emailField, emoji: '✉️' },
        { value: 'single_choice', label: b.singleChoice, emoji: '🔘' },
        { value: 'multiple_choice', label: b.multipleChoice, emoji: '☑️' },
        { value: 'date', label: b.dateField, emoji: '📅' },
    ];

    useEffect(() => {
        if (id) {
            api.get(`forms/builder/${id}/`).then(res => {
                setTitle(res.data.title);
                setDescription(res.data.description);
                setIsPublished(res.data.is_published);
                setFields(res.data.fields || []);
                setPublicId(res.data.public_id);
                // Specialized
                setIsSpecialized(res.data.is_specialized || false);
                setOfferTitle(res.data.offer_title || '');
                setOfferDescription(res.data.offer_description || '');
                setOfferButtonText(res.data.offer_button_text || '');
                setOfferButtonUrl(res.data.offer_button_url || '');
                setOfferAdvantages(res.data.offer_advantages || []);
                setFunnelConfig(res.data.funnel_config && Object.keys(res.data.funnel_config).length ? res.data.funnel_config : funnelConfig);
            }).finally(() => setLoading(false));
        } else {
            const params = new URLSearchParams(window.location.search);
            if (params.get('type') === 'funnel') {
                setIsSpecialized(true);
                setTitle('Mon Tunnel de Vente');
            }
        }
    }, [id]);

    const addField = () => setFields([...fields, { type: 'text', label: '', required: false, order: fields.length }]);
    const removeField = (i: number) => setFields(fields.filter((_, idx) => idx !== i));
    const updateField = (i: number, key: string, value: any) => { const u = [...fields]; u[i] = { ...u[i], [key]: value }; setFields(u); };
    const onDragEnd = (result: any) => {
        if (!result.destination) return;
        const items = Array.from(fields);
        const [moved] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, moved);
        setFields(items.map((item, idx) => ({ ...item, order: idx })));
    };
    const copyLink = async () => {
        if (!publicId) return;
        const success = await copyToClipboard(`${window.location.origin}/p/${publicId}`);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                title, description, is_published: isPublished, fields,
                is_specialized: isSpecialized,
                offer_title: offerTitle,
                offer_description: offerDescription,
                offer_button_text: offerButtonText,
                offer_button_url: offerButtonUrl,
                offer_advantages: offerAdvantages,
                funnel_config: funnelConfig
            };
            if (id) { await api.put(`forms/builder/${id}/`, payload); }
            else { const res = await api.post('forms/builder/', payload); setPublicId(res.data.public_id); navigate(`/builder/${res.data.id}`, { replace: true }); }
        } catch { alert('Erreur lors de la sauvegarde.'); }
        finally { setSaving(false); }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress sx={{ color: '#4F46E5' }} /></Box>;

    return (
        <Box sx={{ minHeight: '100vh', pt: 9, pb: 8, background: isDark ? '#050615' : '#F8F8FC', '&::before': { content: '""', position: 'fixed', inset: 0, backgroundImage: isDark ? 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)' : 'radial-gradient(rgba(79,70,229,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none', zIndex: 0 } }}>
            <Box sx={{ position: 'sticky', top: 72, zIndex: 10, background: isDark ? 'rgba(5,6,21,0.9)' : 'rgba(248,248,252,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid', borderColor: 'divider', py: 1.5, px: 3 }}>
                <Box sx={{ maxWidth: 800, mx: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')} sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 500, p: 0 }}>{b.dashboard}</Button>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
                        {isPublished && publicId && (
                            <Button size="small" startIcon={<ContentCopyIcon fontSize="small" />} onClick={copyLink} sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#06B6D4', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 2, px: 1.5 }}>
                                {copied ? b.copied : b.copyLink}
                            </Button>
                        )}
                        <FormControlLabel control={<Switch size="small" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />} label={<Typography variant="caption" fontWeight={700} color="text.secondary">{b.published}</Typography>} sx={{ m: 0 }} />
                        <Button variant="contained" size="small" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving} sx={{ fontWeight: 700, borderRadius: 2, px: 2, background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)', boxShadow: 'none' }}>
                            {saving ? '...' : b.save}
                        </Button>
                    </Box>
                </Box>
            </Box>

            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, mt: 4 }}>
                {/* Mode Toggle (Premium) */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 3, background: isSpecialized ? 'rgba(79,70,229,0.08)' : (isDark ? 'rgba(13,15,31,0.5)' : '#FFFFFF'), border: '1px solid', borderColor: isSpecialized ? '#4F46E5' : 'divider', transition: 'all 0.3s ease' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isSpecialized ? '#4F46E5' : 'rgba(79,70,229,0.1)', color: isSpecialized ? 'white' : '#4F46E5' }}>
                                <RocketLaunchIcon fontSize="small" />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={800}>{b.specialMode}</Typography>
                                <Typography variant="caption" color="text.secondary">{b.specialModeDesc}</Typography>
                            </Box>
                        </Box>
                        <Switch
                            checked={isSpecialized}
                            onChange={(e) => {
                                if (!isPremium) { navigate('/upgrade'); return; }
                                setIsSpecialized(e.target.checked);
                            }}
                            sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#4F46E5' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#4F46E5' } }}
                        />
                    </Box>
                </Paper>

                <Paper sx={{ p: 4, mb: 3, borderRadius: 3, borderTop: '4px solid', borderTopColor: '#4F46E5', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#E8EAF0', background: isDark ? '#0D0F1F' : '#FFFFFF' }}>
                    <TextField fullWidth multiline variant="standard" placeholder={b.formTitle} value={title} onChange={(e) => setTitle(e.target.value)} InputProps={{ disableUnderline: true, style: { fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2 } }} sx={{ mb: 2 }} />
                    <Divider sx={{ mb: 2, borderColor: 'divider' }} />
                    <TextField fullWidth variant="standard" placeholder={b.addDesc} value={description} onChange={(e) => setDescription(e.target.value)} InputProps={{ disableUnderline: true, style: { fontSize: '0.95rem', color: '#8B8FA8' } }} />
                </Paper>

                {/* Funnel Sections Configuration */}
                {isSpecialized && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
                        {/* Intro Screen */}
                        <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#E8EAF0', background: isDark ? '#0D0F1F' : '#FFFFFF' }}>
                            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                🚀 {b.screenIntro}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 2 }}>
                                    <TextField label={b.heroIcon} variant="outlined" size="small" value={funnelConfig.intro.heroIcon} onChange={(e) => setFunnelConfig({ ...funnelConfig, intro: { ...funnelConfig.intro, heroIcon: e.target.value } })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                    <TextField label={b.eyebrow} variant="outlined" size="small" value={funnelConfig.intro.eyebrow} onChange={(e) => setFunnelConfig({ ...funnelConfig, intro: { ...funnelConfig.intro, eyebrow: e.target.value } })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                </Box>
                                <TextField fullWidth label={b.formTitle} variant="outlined" size="small" value={funnelConfig.intro.title} placeholder={title} onChange={(e) => setFunnelConfig({ ...funnelConfig, intro: { ...funnelConfig.intro, title: e.target.value } })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                <TextField fullWidth multiline rows={2} label={b.addDesc} variant="outlined" size="small" value={funnelConfig.intro.subtitle} placeholder={description} onChange={(e) => setFunnelConfig({ ...funnelConfig, intro: { ...funnelConfig.intro, subtitle: e.target.value } })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                <TextField fullWidth label={b.ctaText} variant="outlined" size="small" value={funnelConfig.intro.cta} placeholder="Commencer →" onChange={(e) => setFunnelConfig({ ...funnelConfig, intro: { ...funnelConfig.intro, cta: e.target.value } })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />

                                <Divider sx={{ my: 1 }} />
                                <Typography variant="caption" fontWeight={700} color="text.secondary">{b.stats}</Typography>
                                <TextField fullWidth variant="outlined" size="small" placeholder="100% : Naturel, 21j : Résultats" value={funnelConfig.stats.map((s: any) => `${s.value} : ${s.label}`).join(', ')} onChange={(e) => {
                                    const stats = e.target.value.split(',').map(s => {
                                        const [v, l] = s.split(':').map(x => x.trim());
                                        return v && l ? { value: v, label: l } : null;
                                    }).filter(Boolean);
                                    setFunnelConfig({ ...funnelConfig, stats });
                                }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                            </Box>
                        </Paper>

                        {/* Loading/Analysis Screen */}
                        <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#E8EAF0', background: isDark ? '#0D0F1F' : '#FFFFFF' }}>
                            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                ⚙️ {b.screenLoading}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <TextField fullWidth label={b.formTitle} variant="outlined" size="small" value={funnelConfig.analysis.title} placeholder="Analyse en cours..." onChange={(e) => setFunnelConfig({ ...funnelConfig, analysis: { ...funnelConfig.analysis, title: e.target.value } })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                <TextField fullWidth multiline rows={2} label="Étapes (une par ligne)" variant="outlined" size="small" value={funnelConfig.analysis.steps.join('\n')} onChange={(e) => setFunnelConfig({ ...funnelConfig, analysis: { ...funnelConfig.analysis, steps: e.target.value.split('\n').filter(s => s.trim()) } })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                            </Box>
                        </Paper>

                        {/* Result Screen */}
                        <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#E8EAF0', background: isDark ? '#0D0F1F' : '#FFFFFF' }}>
                            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                ✅ {b.screenResults}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <TextField fullWidth label="Badge / Score" variant="outlined" size="small" value={funnelConfig.results.badge} placeholder="Fort potentiel détecté" onChange={(e) => setFunnelConfig({ ...funnelConfig, results: { ...funnelConfig.results, badge: e.target.value } })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                <TextField fullWidth multiline rows={2} label="Message" variant="outlined" size="small" value={funnelConfig.results.message} onChange={(e) => setFunnelConfig({ ...funnelConfig, results: { ...funnelConfig.results, message: e.target.value } })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                            </Box>
                        </Paper>
                    </Box>
                )}

                {/* Offer Configuration (Visible if specialized mode is ON) */}
                {isSpecialized && (
                    <Paper sx={{ p: 4, mb: 3, borderRadius: 3, border: '1px solid', borderColor: '#4F46E5', background: isDark ? 'rgba(79,70,229,0.03)' : 'rgba(79,70,229,0.01)' }}>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AutoAwesomeIcon sx={{ fontSize: 20, color: '#4F46E5' }} />
                            {b.offerConfig}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <TextField fullWidth label={b.offerTitle} variant="outlined" size="small" value={offerTitle} onChange={(e) => setOfferTitle(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                            <TextField fullWidth multiline rows={3} label={b.offerDesc} variant="outlined" size="small" value={offerDescription} onChange={(e) => setOfferDescription(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <TextField fullWidth label={b.offerBtnText} variant="outlined" size="small" value={offerButtonText} onChange={(e) => setOfferButtonText(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                <TextField fullWidth label={b.offerBtnUrl} variant="outlined" size="small" value={offerButtonUrl} onChange={(e) => setOfferButtonUrl(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                            </Box>
                            <TextField
                                fullWidth multiline rows={4}
                                label={b.offerAdvantages}
                                helperText={b.offerAdvantagesHint}
                                variant="outlined" size="small"
                                value={offerAdvantages.join('\n')}
                                onChange={(e) => setOfferAdvantages(e.target.value.split('\n').filter(s => s.trim()))}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Box>
                    </Paper>
                )}

                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="fields">
                        {(provided) => (
                            <Box {...provided.droppableProps} ref={provided.innerRef} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {fields.map((field, i) => (
                                    <Draggable key={`f-${i}`} draggableId={`f-${i}`} index={i}>
                                        {(provided, snapshot) => (
                                            <Paper ref={provided.innerRef} {...provided.draggableProps}
                                                sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: snapshot.isDragging ? '#4F46E5' : isDark ? 'rgba(255,255,255,0.07)' : '#E8EAF0', background: isDark ? '#0D0F1F' : '#FFFFFF', boxShadow: snapshot.isDragging ? '0 0 30px rgba(79,70,229,0.3)' : 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                    <Box {...provided.dragHandleProps} sx={{ color: 'text.disabled', mt: 0.5, cursor: 'grab' }}><DragIndicatorIcon fontSize="small" /></Box>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
                                                            <TextField fullWidth variant="standard" size="small" placeholder={b.question} value={field.label} onChange={(e) => updateField(i, 'label', e.target.value)} InputProps={{ disableUnderline: true, style: { fontWeight: 600, fontSize: '0.95rem' } }} />
                                                            <Select size="small" value={field.type} onChange={(e) => updateField(i, 'type', e.target.value)} sx={{ minWidth: { xs: '100%', sm: 160 }, fontSize: '0.8rem', borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' } }}>
                                                                {FIELD_TYPES.map(ft => <MenuItem key={ft.value} value={ft.value} sx={{ fontSize: '0.85rem' }}>{ft.emoji} {ft.label}</MenuItem>)}
                                                            </Select>
                                                        </Box>
                                                        {['single_choice', 'multiple_choice'].includes(field.type) && (
                                                            <TextField fullWidth size="small" label={b.options} value={Array.isArray(field.options) ? field.options.join(', ') : (field.options || '')} onChange={(e) => updateField(i, 'options', e.target.value.split(',').map((s: string) => s.trim()))} sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                                                        )}
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <FormControlLabel control={<Switch size="small" checked={field.required} onChange={(e) => updateField(i, 'required', e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#4F46E5' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#4F46E5' } }} />} label={<Typography variant="body2" fontSize="0.8rem" color="text.secondary">{b.required}</Typography>} />
                                                            <Chip label={FIELD_TYPES.find(ft => ft.value === field.type)?.label || field.type} size="small" sx={{ fontSize: '0.7rem', height: 22, background: 'rgba(79,70,229,0.1)', color: '#6366F1' }} />
                                                        </Box>
                                                    </Box>
                                                    <IconButton size="small" onClick={() => removeField(i)} sx={{ color: 'text.disabled', '&:hover': { color: '#EF4444', background: 'rgba(239,68,68,0.08)' }, borderRadius: 2 }}><DeleteIcon fontSize="small" /></IconButton>
                                                </Box>
                                            </Paper>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </Box>
                        )}
                    </Droppable>
                </DragDropContext>

                <Box onClick={addField} sx={{ mt: 2, p: 3, borderRadius: 3, textAlign: 'center', cursor: 'pointer', border: '2px dashed', borderColor: isDark ? 'rgba(79,70,229,0.25)' : '#C7D2FE', color: '#6366F1', '&:hover': { borderColor: '#4F46E5', background: 'rgba(79,70,229,0.04)' }, transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <AddIcon fontSize="small" />
                    <Typography variant="body2" fontWeight={700} color="#6366F1">{b.addQuestion}</Typography>
                </Box>
            </Container>
        </Box>
    );
}
