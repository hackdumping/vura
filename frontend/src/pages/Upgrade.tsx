import { Box, Container, Typography, Button, Paper, CircularProgress, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppStore } from '../store';

const MotionBox = motion(Box as any);
const MotionPaper = motion(Paper as any);

export default function Upgrade() {
    const navigate = useNavigate();
    const { themeMode, t, user, setAuth, token } = useAppStore();
    const isDark = themeMode === 'dark';
    const u = t.upgrade;
    const [upgrading, setUpgrading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (user?.is_premium && !success) {
        navigate('/dashboard');
    }

    const handleUpgrade = async () => {
        setUpgrading(true);
        try {
            // Simulation d'un délai de paiement
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Appel API pour passer en premium (backend mock ou endpoint direct)
            // Ici on simule que le backend répond OK et on met à jour localement
            // Dans une vraie app, on redirigerait vers Stripe/GeniusPay
            const updatedUser = { ...user!, is_premium: true };
            if (token) setAuth(updatedUser, token);

            setSuccess(true);
        } catch (error) {
            console.error(error);
        } finally {
            setUpgrading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', pt: 12, pb: 8, background: isDark ? '#050615' : '#F8F9FF', position: 'relative', overflow: 'hidden' }}>
            <Container maxWidth="md">
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')} sx={{ color: 'text.secondary', mb: 4 }}>
                    {u.back}
                </Button>

                <AnimatePresence mode="wait">
                    {!success ? (
                        <MotionBox key="pricing" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
                            <Box sx={{ textAlign: 'center', mb: 8 }}>
                                <Typography variant="overline" sx={{ color: '#4F46E5', fontWeight: 800, letterSpacing: '0.2em' }}>PREMIUM</Typography>
                                <Typography variant="h3" fontWeight={900} letterSpacing="-0.03em" sx={{ mt: 1, mb: 2 }}>{u.title}</Typography>
                                <Typography variant="h6" color="text.secondary" sx={{ opacity: 0.8 }}>{u.subtitle}</Typography>
                            </Box>

                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' }, gap: 4 }}>
                                <MotionPaper sx={{ p: 5, borderRadius: 5, background: isDark ? 'rgba(13,15,31,0.5)' : '#FFFFFF', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E8EAF0' }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>Vura Pro</Typography>
                                    <List sx={{ mb: 4 }}>
                                        {[u.feature1, u.feature2, u.feature3, u.feature4].map((f, i) => (
                                            <ListItem key={i} sx={{ px: 0, py: 1 }}>
                                                <ListItemIcon sx={{ minWidth: 40 }}><CheckCircleIcon sx={{ color: '#4F46E5' }} /></ListItemIcon>
                                                <ListItemText primary={f} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }} />
                                            </ListItem>
                                        ))}
                                    </List>
                                    <Button fullWidth variant="contained" size="large" onClick={handleUpgrade} disabled={upgrading}
                                        sx={{ py: 2, borderRadius: 3, fontWeight: 800, fontSize: '1.1rem', background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)', boxShadow: '0 15px 30px rgba(79,70,229,0.3)', '&:hover': { background: 'linear-gradient(135deg, #4338CA 0%, #4F46E5 100%)' } }}>
                                        {upgrading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : u.cta}
                                    </Button>
                                </MotionPaper>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Paper sx={{ p: 4, borderRadius: 5, background: 'rgba(79,70,229,0.1)', border: '1px dashed', borderColor: '#4F46E5' }}>
                                        <AutoAwesomeIcon sx={{ fontSize: 40, color: '#4F46E5', mb: 2 }} />
                                        <Typography variant="h6" fontWeight={800} gutterBottom>Unfair advantage</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Les formulaires spécialisés convertissent jusqu'à 3x plus de prospects en les guidant étape par étape.
                                        </Typography>
                                    </Paper>
                                    <Paper sx={{ p: 4, borderRadius: 5, background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: '1px solid', borderColor: 'divider' }}>
                                        <RocketLaunchIcon sx={{ fontSize: 40, color: '#06B6D4', mb: 2 }} />
                                        <Typography variant="h6" fontWeight={800} gutterBottom>Instant access</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Débloquez immédiatement toutes les fonctionnalités Pro après votre paiement.
                                        </Typography>
                                    </Paper>
                                </Box>
                            </Box>
                        </MotionBox>
                    ) : (
                        <MotionBox key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} sx={{ textAlign: 'center', py: 10 }}>
                            <Box sx={{ fontSize: 80, mb: 4 }}>🎉</Box>
                            <Typography variant="h3" fontWeight={900} sx={{ mb: 2 }}>{u.success}</Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 6 }}>Vous pouvez maintenant créer des formulaires de capture spécialisés.</Typography>
                            <Button variant="contained" size="large" onClick={() => navigate('/dashboard')} sx={{ py: 2, px: 6, borderRadius: 3, fontWeight: 800, background: '#4F46E5' }}>
                                {u.back}
                            </Button>
                        </MotionBox>
                    )}
                </AnimatePresence>
            </Container>

            {/* Background blobs */}
            <Box sx={{ position: 'fixed', top: '10%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
            <Box sx={{ position: 'fixed', bottom: '10%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
        </Box>
    );
}
