import { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, CircularProgress, Button, TextField, FormControl, RadioGroup, FormControlLabel, Radio, Checkbox, FormGroup } from '@mui/material';
import { useParams } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SendIcon from '@mui/icons-material/Send';
import { publicApi } from '../api';
import { useAppStore } from '../store';
import FunnelRenderer from '../components/forms/FunnelRenderer';
import OfferPage from './OfferPage';

export default function PublicForm() {
    const { public_id } = useParams();
    const { themeMode, t } = useAppStore();
    const isDark = themeMode === 'dark';
    const p = t.publicForm;
    const [form, setForm] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        publicApi.get(`forms/p/${public_id}/`).then(res => setForm(res.data)).catch(() => setForm(null)).finally(() => setLoading(false));
    }, [public_id]);

    const handleChange = (fieldId: number, value: any) => setAnswers({ ...answers, [fieldId]: value });

    const handleSubmit = async (eOrData?: any) => {
        if (eOrData && typeof eOrData === 'object' && eOrData.preventDefault) {
            eOrData.preventDefault();
        }

        if (!form) return;
        setSubmitting(true);

        const isEvent = eOrData && typeof eOrData === 'object' && eOrData.preventDefault;
        const data = isEvent ? null : eOrData;

        const submissionData = data
            ? { answers: Object.keys(data).map(fId => ({ field_id: parseInt(fId), value: data[parseInt(fId)] })) }
            : { answers: Object.keys(answers).map(fId => ({ field_id: parseInt(fId), value: answers[parseInt(fId)] })) };

        try {
            await publicApi.post(`forms/p/${public_id}/submit/`, submissionData);
            setSubmitted(true);
        } catch { alert(p.submissionFailed); }
        finally { setSubmitting(false); }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress sx={{ color: '#4F46E5' }} /></Box>;

    if (!form) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 2, background: isDark ? '#050615' : '#FAFAFA' }}>
            <Typography variant="h4" fontWeight={700}>{p.notFound}</Typography>
            <Typography color="text.secondary">{p.notFoundDesc}</Typography>
        </Box>
    );

    if (submitted) {
        if (form.is_specialized) return <OfferPage form={form} />;
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: isDark ? '#050615' : '#FAFAFA', '&::before': { content: '""', position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: isDark ? 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)' : 'radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' } }}>
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, mx: 2, maxWidth: 400, border: '1px solid', borderColor: isDark ? 'rgba(16,185,129,0.3)' : '#D1FAE5', background: isDark ? '#0D0F1F' : '#FFFFFF', position: 'relative', zIndex: 1 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 64, color: '#10B981', mb: 2 }} />
                    <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em" gutterBottom>{p.thankYou}</Typography>
                    <Typography color="text.secondary" lineHeight={1.7}>{p.thankYouDesc}</Typography>
                </Paper>
            </Box>
        );
    }

    if (form.is_specialized) return (
        <FunnelRenderer form={form} onSubmit={handleSubmit} />
    );

    return (
        <Box sx={{ minHeight: '100vh', py: 8, background: isDark ? '#050615' : '#F8F8FC', '&::before': { content: '""', position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: isDark ? 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)' : 'radial-gradient(rgba(79,70,229,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' } }}>
            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
                <Paper sx={{ p: 4, mb: 3, borderRadius: 3, borderTop: '6px solid #4F46E5', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#E8EAF0', background: isDark ? '#0D0F1F' : '#FFFFFF' }}>
                    <Typography variant="h4" fontWeight={800} letterSpacing="-0.03em" gutterBottom>{form.title}</Typography>
                    {form.description && <Typography variant="body1" color="text.secondary" lineHeight={1.7}>{form.description}</Typography>}
                </Paper>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {(form.fields || []).sort((a: any, b: any) => a.order - b.order).map((field: any) => (
                        <Paper key={field.id} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#E8EAF0', background: isDark ? '#0D0F1F' : '#FFFFFF', '&:focus-within': { borderColor: 'rgba(79,70,229,0.4)' }, transition: 'border-color 0.2s' }}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                                {field.label}{field.required && <Box component="span" sx={{ color: '#EF4444', ml: 0.5 }}>*</Box>}
                            </Typography>
                            {['text', 'email', 'date'].includes(field.type) && (
                                <TextField fullWidth required={field.required} type={field.type === 'date' ? 'date' : field.type} variant="outlined" size="small" value={answers[field.id] || ''} onChange={(e) => handleChange(field.id, e.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                            )}
                            {field.type === 'textarea' && (
                                <TextField fullWidth multiline rows={4} required={field.required} variant="outlined" size="small" value={answers[field.id] || ''} onChange={(e) => handleChange(field.id, e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                            )}
                            {field.type === 'single_choice' && (
                                <FormControl required={field.required} fullWidth>
                                    <RadioGroup value={answers[field.id] || ''} onChange={(e) => handleChange(field.id, e.target.value)}>
                                        {(field.options || []).map((opt: string, i: number) => (
                                            <FormControlLabel key={i} value={opt} control={<Radio size="small" sx={{ color: '#4F46E5', '&.Mui-checked': { color: '#4F46E5' } }} />} label={<Typography variant="body2">{opt}</Typography>} />
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                            )}
                            {field.type === 'multiple_choice' && (
                                <FormGroup>
                                    {(field.options || []).map((opt: string, i: number) => (
                                        <FormControlLabel key={i} control={<Checkbox size="small" sx={{ color: '#4F46E5', '&.Mui-checked': { color: '#4F46E5' } }} checked={(answers[field.id] || []).includes(opt)} onChange={(e) => { const curr = answers[field.id] || []; handleChange(field.id, e.target.checked ? [...curr, opt] : curr.filter((c: string) => c !== opt)); }} />} label={<Typography variant="body2">{opt}</Typography>} />
                                    ))}
                                </FormGroup>
                            )}
                        </Paper>
                    ))}
                    <Button type="submit" variant="contained" size="large" endIcon={<SendIcon />} disabled={submitting}
                        sx={{ mt: 1, py: 1.8, fontWeight: 700, borderRadius: 3, fontSize: '1rem', background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)', boxShadow: '0 0 30px rgba(79,70,229,0.3)', '&:hover': { background: 'linear-gradient(135deg, #4338CA 0%, #4F46E5 100%)', transform: 'translateY(-2px)', boxShadow: '0 0 40px rgba(79,70,229,0.4)' }, transition: 'all 0.3s ease' }}>
                        {submitting ? p.submitting : p.submit}
                    </Button>
                    <Box sx={{ textAlign: 'center', pb: 2 }}>
                        <Typography variant="caption" color="text.disabled">{p.poweredBy} <Box component="span" sx={{ fontWeight: 700, color: '#6366F1' }}>Vura</Box></Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
