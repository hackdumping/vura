import { Box, Container, Typography, Button, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const MotionBox = motion(Box as any);

interface Props {
    form: any;
}

export default function OfferPage({ form }: Props) {

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 10, background: '#050615', position: 'relative', overflow: 'hidden' }}>
            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                <MotionBox initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
                    <Paper sx={{ p: { xs: 4, md: 8 }, borderRadius: 6, background: 'rgba(13,15,31,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}>
                        <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '50%', background: 'rgba(79,70,229,0.1)', color: '#4F46E5', mb: 3 }}>
                            <AutoAwesomeIcon sx={{ fontSize: 40 }} />
                        </Box>

                        <Typography variant="h3" fontWeight={900} letterSpacing="-0.04em" sx={{ mb: 2, color: 'white', fontSize: { xs: '2rem', md: '3.5rem' } }}>
                            {form.offer_title || 'Offre Spéciale'}
                        </Typography>

                        <Typography variant="h6" color="rgba(255,255,255,0.7)" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
                            {form.offer_description || 'Découvrez comment notre solution peut vous aider à atteindre vos objectifs.'}
                        </Typography>

                        {form.offer_advantages && form.offer_advantages.length > 0 && (
                            <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
                                <List sx={{ display: 'inline-block', textAlign: 'left' }}>
                                    {form.offer_advantages.map((adv: string, i: number) => (
                                        <ListItem key={i} sx={{ px: 0, py: 1 }}>
                                            <ListItemIcon sx={{ minWidth: 40 }}><CheckCircleIcon sx={{ color: '#10B981' }} /></ListItemIcon>
                                            <ListItemText primary={adv} primaryTypographyProps={{ color: 'white', fontWeight: 600, fontSize: '1.1rem' }} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}

                        <Button
                            variant="contained" size="large" fullWidth
                            href={form.offer_button_url || '#'}
                            target="_blank"
                            endIcon={<ArrowForwardIcon />}
                            sx={{ py: 2.5, borderRadius: 4, fontWeight: 900, fontSize: '1.2rem', background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)', boxShadow: '0 20px 40px rgba(79,70,229,0.4)', '&:hover': { transform: 'scale(1.02)', boxShadow: '0 25px 50px rgba(79,70,229,0.5)' }, transition: 'all 0.3s ease' }}
                        >
                            {form.offer_button_text || 'Commencer maintenant'}
                        </Button>

                        <Typography variant="caption" sx={{ mt: 4, display: 'block', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                            Propulsé par Vura Premium
                        </Typography>
                    </Paper>
                </MotionBox>
            </Container>

            {/* Background Blobs */}
            <Box sx={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0 }} />
            <Box sx={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0 }} />
        </Box>
    );
}
