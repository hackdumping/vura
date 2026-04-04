import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Radio, RadioGroup, FormControlLabel, Paper, LinearProgress, CircularProgress, Container } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface FunnelRendererProps {
    form: any;
    onSubmit: (answers: any) => void;
}

export default function FunnelRenderer({ form, onSubmit }: FunnelRendererProps) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<any>({});
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingStep, setLoadingStep] = useState(0);

    const config = form.funnel_config || {};
    const fields = form.fields || [];
    const totalQuestions = fields.length;

    useEffect(() => {
        if (step === totalQuestions + 1) { // Loading Screen
            const interval = setInterval(() => {
                setLoadingProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(() => setStep(step + 1), 800);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 60);

            const stepsArray = config.analysis?.steps || ["Analyse biométrique...", "Identification des carences...", "Calcul du score d'éclat..."];
            const stepInterval = setInterval(() => {
                setLoadingStep(prev => (prev + 1) % stepsArray.length);
            }, 1200);

            return () => {
                clearInterval(interval);
                clearInterval(stepInterval);
            };
        }
    }, [step, totalQuestions, config.analysis?.steps]);

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(Math.max(0, step - 1));

    const renderIntro = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ textAlign: 'center', width: '100%' }}>
            <Box sx={{ mb: 4, display: 'inline-flex', width: 80, height: 80, borderRadius: '24px', background: 'rgba(79,70,229,0.1)', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
                {config.intro?.heroIcon || '🚀'}
            </Box>
            <Typography variant="overline" sx={{ display: 'block', mb: 1, color: '#4F46E5', fontWeight: 700, letterSpacing: '0.1em' }}>
                {config.intro?.eyebrow || 'OFFRE EXCLUSIVE'}
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ mb: 2, letterSpacing: '-0.04em', color: '#1d1d1f' }}>
                {config.intro?.title || form.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: '#86868b', maxWidth: 400, mx: 'auto', fontSize: '1.1rem' }}>
                {config.intro?.subtitle || form.description}
            </Typography>

            {(config.stats || []).length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 5 }}>
                    {(config.stats || []).map((stat: any, i: number) => (
                        <Box key={i}>
                            <Typography variant="h5" fontWeight={800} color="#1d1d1f">{stat.value}</Typography>
                            <Typography variant="caption" color="#86868b" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>{stat.label}</Typography>
                        </Box>
                    ))}
                </Box>
            )}

            <Button onClick={handleNext} variant="contained" fullWidth
                sx={{ py: 2, borderRadius: '16px', fontSize: '1.1rem', fontWeight: 700, textTransform: 'none', background: '#0071e3', '&:hover': { background: '#0077ed' } }}>
                {config.intro?.cta || 'Commencer →'}
            </Button>
        </motion.div>
    );

    const renderQuestion = (index: number) => {
        const field = fields[index];
        const progress = ((index + 1) / totalQuestions) * 100;

        return (
            <motion.div key={`q-${index}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} style={{ width: '100%' }}>
                <Box sx={{ mb: 6 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" fontWeight={700} color="#86868b">QUESTION {index + 1}/{totalQuestions}</Typography>
                        <Typography variant="caption" fontWeight={700} color="#0071e3">{Math.round(progress)}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, bgcolor: '#f5f5f7', '& .MuiLinearProgress-bar': { bgcolor: '#0071e3', borderRadius: 3 } }} />
                </Box>

                <Typography variant="h4" fontWeight={800} sx={{ mb: 4, letterSpacing: '-0.02em', color: '#1d1d1f' }}>
                    {field.label}
                </Typography>

                <Box sx={{ mb: 6 }}>
                    {['text', 'email', 'textarea'].includes(field.type) ? (
                        <TextField
                            fullWidth multiline={field.type === 'textarea'} rows={field.type === 'textarea' ? 4 : 1}
                            variant="outlined" placeholder="Votre réponse ici..."
                            value={answers[field.id] || ''}
                            onChange={(e) => setAnswers({ ...answers, [field.id]: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: '#f5f5f7', border: 'none', '& fieldset': { border: 'none' }, '&.Mui-focused': { bgcolor: '#fff', boxShadow: '0 0 0 4px rgba(0,113,227,0.1)' } } }}
                        />
                    ) : (field.type === 'single_choice' || field.type === 'multiple_choice') ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {(field.options || []).map((opt: string) => {
                                const isSelected = field.type === 'multiple_choice'
                                    ? (answers[field.id] || []).includes(opt)
                                    : answers[field.id] === opt;

                                return (
                                    <Paper key={opt} onClick={() => {
                                        if (field.type === 'multiple_choice') {
                                            const current = answers[field.id] || [];
                                            const next = current.includes(opt) ? current.filter((x: string) => x !== opt) : [...current, opt];
                                            setAnswers({ ...answers, [field.id]: next });
                                        } else {
                                            setAnswers({ ...answers, [field.id]: opt });
                                        }
                                    }}
                                        sx={{ p: 2, borderRadius: '14px', cursor: 'pointer', border: '2px solid', borderColor: isSelected ? '#0071e3' : 'transparent', bgcolor: isSelected ? 'rgba(0,113,227,0.05)' : '#f5f5f7', boxShadow: 'none', '&:hover': { bgcolor: isSelected ? 'rgba(0,113,227,0.05)' : '#eef0f2' } }}>
                                        <Typography fontWeight={600} color={isSelected ? '#0071e3' : '#1d1d1f'}>{opt}</Typography>
                                    </Paper>
                                );
                            })}
                        </Box>
                    ) : null}
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button onClick={handleBack} sx={{ py: 2, px: 3, borderRadius: '14px', color: '#86868b', fontWeight: 600 }}>Retour</Button>
                    <Button onClick={handleNext} variant="contained" fullWidth disabled={field.required && !answers[field.id]}
                        sx={{ py: 2, borderRadius: '14px', fontWeight: 700, textTransform: 'none', background: '#0071e3', '&:hover': { background: '#0077ed' } }}>
                        Suivant
                    </Button>
                </Box>
            </motion.div>
        );
    };

    const renderLoading = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', width: '100%' }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
                <CircularProgress variant="determinate" value={loadingProgress} size={100} thickness={4} sx={{ color: '#0071e3' }} />
                <Box sx={{ inset: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" fontWeight={800} color="#1d1d1f">{Math.round(loadingProgress)}%</Typography>
                </Box>
            </Box>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 2, color: '#1d1d1f' }}>{config.analysis?.title || 'Analyse de vos réponses...'}</Typography>
            <Box sx={{ mt: 2, height: 24 }}>
                <AnimatePresence mode="wait">
                    <motion.div key={loadingStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <Typography color="#86868b" fontWeight={500}>
                            {(config.analysis?.steps || ["Analyse biométrique...", "Identification des carences...", "Calcul du score d'éclat..."])[loadingStep]}
                        </Typography>
                    </motion.div>
                </AnimatePresence>
            </Box>
        </motion.div>
    );

    const renderResults = () => (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', width: '100%' }}>
            <Box sx={{ mb: 3, display: 'inline-block', p: 1, px: 2, borderRadius: '20px', background: 'rgba(52,199,89,0.1)', color: '#34c759' }}>
                <Typography variant="caption" fontWeight={800} sx={{ letterSpacing: '0.05em' }}>{config.results?.badge || 'POTENTIEL ÉCLAT DÉTECTÉ'}</Typography>
            </Box>
            <Typography variant="h3" fontWeight={800} sx={{ mb: 3, color: '#1d1d1f', letterSpacing: '-0.04em' }}>
                🎉 {config.results?.message || 'Bonne nouvelle ! Nous pouvons vous aider.'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 5, color: '#86868b', fontSize: '1.1rem' }}>
                Basé sur votre profil, nous avons la solution exacte pour transformer vos résultats dès aujourd'hui.
            </Typography>
            <Button onClick={() => {
                onSubmit(answers);
                handleNext();
            }} variant="contained" fullWidth
                sx={{ py: 2, borderRadius: '16px', fontSize: '1.1rem', fontWeight: 700, textTransform: 'none', background: '#34c759', '&:hover': { background: '#30b753' } }}>
                Découvrir mon programme personnalisé →
            </Button>
        </motion.div>
    );

    const renderMainOffer = () => {
        const adv = form.offer_advantages || [];
        return (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%' }}>
                <Box sx={{ p: 4, borderRadius: '24px', background: '#f5f5f7', border: '1px solid #d2d2d7' }}>
                    <Typography variant="overline" sx={{ color: '#0071e3', fontWeight: 800 }}>VOTRE SOLUTION</Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 2, color: '#1d1d1f' }}>{form.offer_title || 'Le Pack Éclat Naturel'}</Typography>
                    <Typography variant="body1" sx={{ mb: 4, color: '#86868b' }}>{form.offer_description}</Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
                        {adv.map((a: string, i: number) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <CheckCircleIcon sx={{ color: '#34c759', fontSize: 20 }} />
                                <Typography fontWeight={600} color="#1d1d1f">{a}</Typography>
                            </Box>
                        ))}
                    </Box>

                    <Button component="a" href={form.offer_button_url} target="_blank" variant="contained" fullWidth
                        sx={{ py: 2, borderRadius: '16px', fontSize: '1.2rem', fontWeight: 800, textTransform: 'none', background: '#0071e3' }}>
                        {form.offer_button_text || 'Commander maintenant'}
                    </Button>
                </Box>
            </motion.div>
        );
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', p: 3 }}>
            <Container maxWidth="sm">
                <AnimatePresence mode="wait">
                    {step === 0 && renderIntro()}
                    {step >= 1 && step <= totalQuestions && renderQuestion(step - 1)}
                    {step === totalQuestions + 1 && renderLoading()}
                    {step === totalQuestions + 2 && renderResults()}
                    {step >= totalQuestions + 3 && renderMainOffer()}
                </AnimatePresence>
            </Container>
        </Box>
    );
}
