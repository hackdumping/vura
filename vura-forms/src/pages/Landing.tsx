import { Box, Container, Typography, Button, Chip, Avatar } from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShareIcon from '@mui/icons-material/Share';
import TableChartIcon from '@mui/icons-material/TableChart';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { useAppStore } from '../store';
import { useRef, useEffect } from 'react';

const MotionBox = motion(Box as any);
const MotionTypography = motion(Typography as any);

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: (i = 0) => ({
        opacity: 1, scale: 1,
        transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

const slideFromLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const slideFromRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function Landing() {
    const { themeMode, t } = useAppStore();
    const location = useLocation();
    const isDark = themeMode === 'dark';
    const l = t.landing;
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const id = hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location.hash]); // We need location from react-router

    const FEATURES = [
        { icon: <AutoAwesomeIcon sx={{ fontSize: 28 }} />, title: l.feature1Title, desc: l.feature1Desc, color: '#4F46E5' },
        { icon: <BarChartIcon sx={{ fontSize: 28 }} />, title: l.feature2Title, desc: l.feature2Desc, color: '#06B6D4' },
        { icon: <ShareIcon sx={{ fontSize: 28 }} />, title: l.feature3Title, desc: l.feature3Desc, color: '#10B981' },
        { icon: <TableChartIcon sx={{ fontSize: 28 }} />, title: l.feature4Title, desc: l.feature4Desc, color: '#F59E0B' },
        { icon: <SpeedIcon sx={{ fontSize: 28 }} />, title: l.feature5Title, desc: l.feature5Desc, color: '#EF4444' },
        { icon: <SecurityIcon sx={{ fontSize: 28 }} />, title: l.feature6Title, desc: l.feature6Desc, color: '#8B5CF6' },
    ];

    const STATS = [
        { value: l.stat1Value, label: l.stat1Label },
        { value: l.stat2Value, label: l.stat2Label },
        { value: l.stat3Value, label: l.stat3Label },
        { value: l.stat4Value, label: l.stat4Label },
    ];

    const STEPS = [
        { title: l.how1Title, desc: l.how1Desc, emoji: '🎨', gradient: 'linear-gradient(135deg, #4F46E5, #6366F1)' },
        { title: l.how2Title, desc: l.how2Desc, emoji: '🔗', gradient: 'linear-gradient(135deg, #06B6D4, #22D3EE)' },
        { title: l.how3Title, desc: l.how3Desc, emoji: '📊', gradient: 'linear-gradient(135deg, #10B981, #34D399)' },
    ];

    const WHY_ITEMS = [
        { icon: <RocketLaunchIcon sx={{ fontSize: 32 }} />, title: l.why1Title, desc: l.why1Desc, color: '#4F46E5', stat: '2 min' },
        { icon: <TrendingUpIcon sx={{ fontSize: 32 }} />, title: l.why2Title, desc: l.why2Desc, color: '#06B6D4', stat: '100%' },
        { icon: <TouchAppIcon sx={{ fontSize: 32 }} />, title: l.why3Title, desc: l.why3Desc, color: '#10B981', stat: '89%' },
        { icon: <CardGiftcardIcon sx={{ fontSize: 32 }} />, title: l.why4Title, desc: l.why4Desc, color: '#F59E0B', stat: '0€' },
    ];

    const TESTIMONIALS = [
        { quote: l.test1, author: l.test1Author, role: l.test1Role, avatar: 'M' },
        { quote: l.test2, author: l.test2Author, role: l.test2Role, avatar: 'J' },
        { quote: l.test3, author: l.test3Author, role: l.test3Role, avatar: 'S' },
    ];

    return (
        <Box sx={{ overflowX: 'hidden' }}>
            {/* ═══════════════ HERO ═══════════════ */}
            <Box
                id="hero"
                ref={heroRef}
                sx={{
                    minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center',
                    background: isDark
                        ? 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(79,70,229,0.3) 0%, #050615 60%)'
                        : 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(79,70,229,0.1) 0%, #FAFAFA 60%)',
                    '&::before': {
                        content: '""', position: 'absolute', inset: 0,
                        backgroundImage: isDark ? 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)' : 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                    },
                }}
            >
                {/* Animated blobs */}
                <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    <MotionBox animate={{ scale: [1, 1.2, 1], rotate: [0, 60, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        sx={{ position: 'absolute', top: '5%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)', filter: 'blur(50px)' }} />
                    <MotionBox animate={{ scale: [1.2, 1, 1.2], rotate: [30, -30, 30] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                        sx={{ position: 'absolute', bottom: '5%', left: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />
                    <MotionBox animate={{ y: [0, -30, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        sx={{ position: 'absolute', top: '30%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
                </Box>

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: 12, pb: 8 }}>
                    <motion.div style={{ opacity: heroOpacity, scale: heroScale }}>
                        <Box sx={{ textAlign: 'center', maxWidth: 850, mx: 'auto' }}>
                            <MotionBox initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} sx={{ mb: 4 }}>
                                <Chip
                                    icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important', color: '#A5B4FC !important' }} />}
                                    label={l.badge}
                                    sx={{ background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(79,70,229,0.3)', color: '#A5B4FC', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.04em', height: 30, '& .MuiChip-label': { px: 1.5 } }}
                                />
                            </MotionBox>

                            <MotionTypography variant="h1"
                                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                                sx={{ fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' }, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em', mb: 3, color: isDark ? '#F0F0FF' : '#0F0F1A' }}>
                                {l.heroTitle1}{' '}
                                <Box component="span" sx={{ background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 40%, #06B6D4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                    {l.heroHighlight}
                                </Box>
                                {' '}{l.heroTitle2}
                            </MotionTypography>

                            <MotionTypography variant="h6"
                                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                                sx={{ color: 'text.secondary', fontWeight: 400, fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.8, mb: 6, maxWidth: 650, mx: 'auto' }}>
                                {l.heroSubtitle}
                            </MotionTypography>

                            <MotionBox initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button component={Link as any} to="/register" variant="contained" size="large" endIcon={<ArrowForwardIcon />}
                                    sx={{ px: 4, py: 1.8, fontSize: '1rem', fontWeight: 700, borderRadius: 3, background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)', boxShadow: '0 0 40px rgba(79,70,229,0.4), 0 4px 20px rgba(79,70,229,0.3)', '&:hover': { background: 'linear-gradient(135deg, #4338CA 0%, #4F46E5 100%)', boxShadow: '0 0 60px rgba(79,70,229,0.5)', transform: 'translateY(-2px)' }, transition: 'all 0.3s ease' }}>
                                    {l.cta}
                                </Button>
                                <Button component={Link as any} to="/login" variant="outlined" size="large"
                                    sx={{ px: 4, py: 1.8, fontSize: '1rem', fontWeight: 600, borderRadius: 3, borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#E8EAF0', color: 'text.secondary', '&:hover': { borderColor: '#4F46E5', color: '#4F46E5', background: 'rgba(79,70,229,0.05)' } }}>
                                    {l.ctaSecondary}
                                </Button>
                            </MotionBox>

                            <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }} sx={{ mt: 8 }}>
                                <Typography variant="caption" color="text.disabled" fontWeight={500} letterSpacing="0.05em" textTransform="uppercase">{l.trustedBy}</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 3, md: 5 }, mt: 2, opacity: 0.4, flexWrap: 'wrap' }}>
                                    {['TechCorp', 'DataViz', 'StartupFlow', 'Agence360', 'InnovateLab'].map(name => (
                                        <Typography key={name} variant="body2" fontWeight={700} color="text.secondary" sx={{ letterSpacing: '-0.01em', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{name}</Typography>
                                    ))}
                                </Box>
                            </MotionBox>
                        </Box>
                    </motion.div>
                </Container>
            </Box>

            {/* ═══════════════ STATS BAR ═══════════════ */}
            <Box sx={{ borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', py: 5, background: isDark ? 'rgba(13,15,31,0.8)' : '#FFFFFF' }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, textAlign: 'center' }}>
                        {STATS.map((stat, i) => (
                            <MotionBox key={i} custom={i} variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}>
                                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #4F46E5, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1, mb: 0.5 }}>
                                    {stat.value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>{stat.label}</Typography>
                            </MotionBox>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* ═══════════════ FEATURES ═══════════════ */}
            <Box id="features" sx={{ py: { xs: 10, md: 16 }, background: isDark ? '#050615' : '#FAFAFA' }}>
                <Container maxWidth="lg">
                    <MotionBox variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} sx={{ textAlign: 'center', mb: 10 }}>
                        <Typography variant="overline" sx={{ color: '#4F46E5', fontWeight: 700, letterSpacing: '0.15em', mb: 2, display: 'block' }}>{l.featuresTag}</Typography>
                        <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, letterSpacing: '-0.03em', color: isDark ? '#F0F0FF' : '#0F0F1A', mb: 2, whiteSpace: 'pre-line' }}>{l.featuresTitle}</Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 500, mx: 'auto' }}>{l.featuresSubtitle}</Typography>
                    </MotionBox>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                        {FEATURES.map((f, i) => (
                            <MotionBox key={i} custom={i} variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
                                whileHover={{ y: -10, transition: { duration: 0.25 } }}
                                sx={{
                                    p: 4, borderRadius: 3, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#E8EAF0',
                                    background: isDark ? 'rgba(13,15,31,0.8)' : '#FFFFFF', cursor: 'default', position: 'relative', overflow: 'hidden',
                                    '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${f.color} 0%, transparent 100%)`, opacity: 0, transition: 'opacity 0.3s' },
                                    '&:hover::before': { opacity: 1 },
                                    '&:hover': { borderColor: isDark ? 'rgba(79,70,229,0.3)' : '#C7D2FE', boxShadow: `0 20px 40px ${f.color}12` },
                                    transition: 'all 0.3s ease',
                                }}>
                                <Box sx={{ width: 56, height: 56, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${f.color}18`, color: f.color, mb: 3 }}>{f.icon}</Box>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, color: isDark ? '#F0F0FF' : '#0F0F1A' }}>{f.title}</Typography>
                                <Typography variant="body2" color="text.secondary" lineHeight={1.7}>{f.desc}</Typography>
                            </MotionBox>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* ═══════════════ HOW IT WORKS ═══════════════ */}
            <Box id="how-it-works" sx={{ py: { xs: 10, md: 16 }, background: isDark ? '#0D0F1F' : '#FFFFFF' }}>
                <Container maxWidth="lg">
                    <MotionBox variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} sx={{ textAlign: 'center', mb: 10 }}>
                        <Typography variant="overline" sx={{ color: '#06B6D4', fontWeight: 700, letterSpacing: '0.15em', mb: 2, display: 'block' }}>{l.howTag}</Typography>
                        <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, letterSpacing: '-0.03em', color: isDark ? '#F0F0FF' : '#0F0F1A', mb: 2 }}>{l.howTitle}</Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>{l.howSubtitle}</Typography>
                    </MotionBox>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
                        {STEPS.map((step, i) => (
                            <MotionBox key={i} variants={i % 2 === 0 ? slideFromLeft : slideFromRight} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                sx={{
                                    p: 5, borderRadius: 4, textAlign: 'center', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#E8EAF0',
                                    background: isDark ? 'rgba(5,6,21,0.8)' : '#FAFAFA',
                                    transition: 'all 0.3s ease', '&:hover': { borderColor: isDark ? 'rgba(79,70,229,0.3)' : '#C7D2FE' },
                                }}>
                                <MotionBox animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                                    sx={{ fontSize: 48, mb: 3, lineHeight: 1 }}>{step.emoji}</MotionBox>
                                <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em" sx={{ mb: 2, color: isDark ? '#F0F0FF' : '#0F0F1A' }}>{step.title}</Typography>
                                <Typography variant="body1" color="text.secondary" lineHeight={1.8}>{step.desc}</Typography>
                            </MotionBox>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* ═══════════════ WHY VURA (Motivational Section) ═══════════════ */}
            <Box id="analytics" sx={{
                py: { xs: 10, md: 16 }, position: 'relative', overflow: 'hidden',
                background: isDark
                    ? 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(79,70,229,0.12) 0%, #050615 70%)'
                    : 'linear-gradient(180deg, #FAFAFA 0%, #EEF2FF 50%, #FAFAFA 100%)',
            }}>
                <Container maxWidth="lg">
                    <MotionBox variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} sx={{ textAlign: 'center', mb: 10 }}>
                        <Typography variant="overline" sx={{ color: '#F59E0B', fontWeight: 700, letterSpacing: '0.15em', mb: 2, display: 'block' }}>{l.whyTag}</Typography>
                        <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, letterSpacing: '-0.03em', color: isDark ? '#F0F0FF' : '#0F0F1A', mb: 2, whiteSpace: 'pre-line' }}>{l.whyTitle}</Typography>
                        <Typography variant="body1" color="text.secondary" fontWeight={400} sx={{ maxWidth: 500, mx: 'auto' }}>{l.whySubtitle}</Typography>
                    </MotionBox>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                        {WHY_ITEMS.map((item, i) => (
                            <MotionBox key={i} custom={i} variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
                                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                                sx={{
                                    p: 4, borderRadius: 3, display: 'flex', gap: 3, alignItems: 'flex-start',
                                    border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#E8EAF0',
                                    background: isDark ? 'rgba(13,15,31,0.8)' : '#FFFFFF',
                                    '&:hover': { borderColor: `${item.color}50`, boxShadow: `0 0 30px ${item.color}15` },
                                    transition: 'all 0.3s ease', cursor: 'default',
                                }}>
                                <Box sx={{ width: 64, height: 64, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${item.color}15`, color: item.color, flexShrink: 0 }}>
                                    {item.icon}
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                        <Typography variant="h6" fontWeight={800} sx={{ color: isDark ? '#F0F0FF' : '#0F0F1A' }}>{item.title}</Typography>
                                        <Chip label={item.stat} size="small" sx={{ fontWeight: 800, fontSize: '0.75rem', background: `${item.color}20`, color: item.color, height: 24 }} />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" lineHeight={1.7}>{item.desc}</Typography>
                                </Box>
                            </MotionBox>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* ═══════════════ PRICING ═══════════════ */}
            <Box id="pricing" sx={{ py: { xs: 10, md: 16 }, background: isDark ? '#050615' : '#F8F8FC' }}>
                <Container maxWidth="lg">
                    <MotionBox variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} sx={{ textAlign: 'center', mb: 10 }}>
                        <Typography variant="overline" sx={{ color: '#6366F1', fontWeight: 700, letterSpacing: '0.15em', mb: 2, display: 'block' }}>{l.pricingTag}</Typography>
                        <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, letterSpacing: '-0.03em', color: isDark ? '#F0F0FF' : '#0F0F1A', mb: 2 }}>{l.pricingTitle}</Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>{l.pricingSubtitle}</Typography>
                    </MotionBox>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 4, maxWidth: 900, mx: 'auto' }}>
                        {/* Free Plan */}
                        <MotionBox variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
                            whileHover={{ y: -10 }}
                            sx={{
                                p: 5, borderRadius: 4, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#E8EAF0',
                                background: isDark ? 'rgba(13,15,31,0.5)' : '#FFFFFF', backdropFilter: 'blur(10px)', transition: 'all 0.3s ease'
                            }}>
                            <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>{l.planFree}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>{l.planFreeDesc}</Typography>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h3" component="span" fontWeight={900}>{l.planFreePrice}</Typography>
                                <Typography variant="body2" component="span" color="text.secondary" sx={{ ml: 1 }}>{l.planFreePriceSub}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 5 }}>
                                {l.planFreeFeatures.map((f: string, i: number) => (
                                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <AutoAwesomeIcon sx={{ fontSize: 16, color: '#4F46E5' }} />
                                        <Typography variant="body2" fontWeight={500}>{f}</Typography>
                                    </Box>
                                ))}
                            </Box>
                            <Button fullWidth variant="outlined" component={Link as any} to="/register" sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 700, borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: '#4F46E5', color: '#4F46E5' } }}>
                                {l.planButton}
                            </Button>
                        </MotionBox>

                        {/* Pro Plan */}
                        <MotionBox variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
                            whileHover={{ y: -10 }}
                            sx={{
                                p: 5, borderRadius: 4, border: '2px solid', borderColor: '#4F46E5',
                                background: isDark ? 'rgba(79,70,229,0.05)' : 'rgba(79,70,229,0.02)', position: 'relative', overflow: 'hidden',
                                boxShadow: '0 20px 50px rgba(79,70,229,0.15)', transition: 'all 0.3s ease'
                            }}>
                            <Box sx={{ position: 'absolute', top: 20, right: -30, background: '#4F46E5', color: 'white', px: 6, py: 0.5, transform: 'rotate(45deg)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em' }}>POPULAR</Box>
                            <Typography variant="h5" fontWeight={800} sx={{ mb: 1, background: 'linear-gradient(135deg, #4F46E5, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{l.planPro}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>{l.planProDesc}</Typography>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h3" component="span" fontWeight={900}>{l.planProPrice}</Typography>
                                <Typography variant="body2" component="span" color="text.secondary" sx={{ ml: 1 }}>{l.planProPriceSub}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 5 }}>
                                {l.planProFeatures.map((f: string, i: number) => (
                                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <AutoAwesomeIcon sx={{ fontSize: 16, color: '#06B6D4' }} />
                                        <Typography variant="body2" fontWeight={600}>{f}</Typography>
                                    </Box>
                                ))}
                            </Box>
                            <Button fullWidth variant="contained" component={Link as any} to="/register" sx={{ py: 2, borderRadius: 2.5, fontWeight: 800, background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)', boxShadow: '0 10px 25px rgba(79,70,229,0.4)', '&:hover': { background: 'linear-gradient(135deg, #4338CA 0%, #4F46E5 100%)', boxShadow: '0 15px 35px rgba(79,70,229,0.5)' } }}>
                                {l.planButton}
                            </Button>
                        </MotionBox>
                    </Box>
                </Container>
            </Box>

            {/* ═══════════════ TESTIMONIALS ═══════════════ */}
            <Box id="testimonials" sx={{ py: { xs: 10, md: 16 }, background: isDark ? '#0D0F1F' : '#FFFFFF' }}>
                <Container maxWidth="lg">
                    <MotionBox variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} sx={{ textAlign: 'center', mb: 10 }}>
                        <Typography variant="overline" sx={{ color: '#10B981', fontWeight: 700, letterSpacing: '0.15em', mb: 2, display: 'block' }}>{l.testTag}</Typography>
                        <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, letterSpacing: '-0.03em', color: isDark ? '#F0F0FF' : '#0F0F1A' }}>{l.testTitle}</Typography>
                    </MotionBox>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                        {TESTIMONIALS.map((item, i) => (
                            <MotionBox key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                sx={{
                                    p: 4, borderRadius: 3, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#E8EAF0',
                                    background: isDark ? 'rgba(5,6,21,0.8)' : '#FAFAFA',
                                    display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease',
                                    '&:hover': { borderColor: isDark ? 'rgba(16,185,129,0.3)' : '#A7F3D0' },
                                }}>
                                <FormatQuoteIcon sx={{ color: '#10B981', fontSize: 32, mb: 2, opacity: 0.6 }} />
                                <Typography variant="body1" sx={{ fontStyle: 'italic', lineHeight: 1.8, flexGrow: 1, mb: 3, color: isDark ? '#D1D5DB' : '#4B5563' }}>{item.quote}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: '#4F46E5', width: 40, height: 40, fontSize: '0.9rem', fontWeight: 700 }}>{item.avatar}</Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight={700}>{item.author}</Typography>
                                        <Typography variant="caption" color="text.secondary">{item.role}</Typography>
                                    </Box>
                                </Box>
                            </MotionBox>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* ═══════════════ FINAL CTA ═══════════════ */}
            <Box sx={{
                py: { xs: 10, md: 16 }, textAlign: 'center', position: 'relative', overflow: 'hidden',
                background: isDark
                    ? 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(79,70,229,0.25) 0%, #050615 70%)'
                    : 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #DBEAFE 100%)',
            }}>
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    <MotionBox variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
                        <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3.2rem' }, fontWeight: 900, letterSpacing: '-0.04em', mb: 3, color: isDark ? '#F0F0FF' : '#0F0F1A' }}>{l.ctaTitle}</Typography>
                        <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ mb: 5 }}>{l.ctaSubtitle}</Typography>
                        <Button component={Link as any} to="/register" variant="contained" size="large" endIcon={<ArrowForwardIcon />}
                            sx={{
                                px: 5, py: 2, fontSize: '1.1rem', fontWeight: 700, borderRadius: 3,
                                background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)', boxShadow: '0 0 40px rgba(79,70,229,0.4)',
                                '&:hover': { background: 'linear-gradient(135deg, #4338CA 0%, #4F46E5 100%)', transform: 'translateY(-3px)', boxShadow: '0 0 60px rgba(79,70,229,0.5)' },
                                transition: 'all 0.3s ease',
                            }}>
                            {l.ctaButton}
                        </Button>
                    </MotionBox>
                </Container>
            </Box>

            {/* ═══════════════ FOOTER ═══════════════ */}
            <Box component="footer" sx={{ py: 4, borderTop: '1px solid', borderColor: 'divider', background: isDark ? '#050615' : '#FAFAFA' }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box component="img" src="/vura_logo.png" alt="Vura" sx={{ height: 24 }} />
                            <Typography variant="body2" fontWeight={700} color="text.secondary">Vura</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">{l.footerRights}</Typography>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}
