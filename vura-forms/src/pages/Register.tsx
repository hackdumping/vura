import { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Alert, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { useAppStore } from '../store';

const MotionBox = motion(Box as any);

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const BackgroundBlobs = () => (
    <Box sx={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <MotionBox
            animate={{ scale: [1, 1.25, 1], x: [0, -60, 0], y: [0, 40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            sx={{ position: 'absolute', top: '15%', right: '10%', width: '45vw', height: '45vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)', filter: 'blur(70px)' }}
        />
        <MotionBox
            animate={{ scale: [1.2, 1, 1.2], x: [0, 50, 0], y: [0, -30, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
            sx={{ position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <MotionBox
            animate={{ scale: [1, 1.2, 1], rotate: [-45, 0, -45] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            sx={{ position: 'absolute', bottom: '0%', left: '20%', width: '30vw', height: '30vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', filter: 'blur(55px)' }}
        />
    </Box>
);

export default function Register() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', first_name: '', last_name: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { themeMode, t } = useAppStore();
    const isDark = themeMode === 'dark';
    const a = t.auth;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('users/register/', formData);
            navigate('/login');
        } catch (err: any) {
            const msg = err.response?.data;
            setError(typeof msg === 'object' ? Object.values(msg).flat().join(' ') : a.errorRegister);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', pt: 12, pb: 8, position: 'relative',
                background: isDark ? '#050615' : '#F9FAFB',
                overflow: 'hidden'
            }}
        >
            <BackgroundBlobs />

            <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
                <MotionBox
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <MotionBox variants={itemVariants} sx={{ textAlign: 'center', mb: 5 }}>
                        <Box
                            component="img"
                            src="/vura_logo.png"
                            alt="Vura"
                            sx={{
                                height: 50, mb: 2,
                                filter: isDark ? 'drop-shadow(0 0 15px rgba(79,70,229,0.3))' : 'none'
                            }}
                        />
                        <Typography variant="h4" fontWeight={900} letterSpacing="-0.04em" gutterBottom sx={{ background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            {a.registerTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {a.registerSubtitle}
                        </Typography>
                    </MotionBox>

                    <MotionBox
                        variants={itemVariants}
                        sx={{
                            p: { xs: 3, sm: 5 }, borderRadius: 4,
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(79,70,229,0.1)',
                            background: isDark ? 'rgba(13,15,31,0.7)' : 'rgba(255,255,255,0.8)',
                            backdropFilter: 'blur(30px)',
                            boxShadow: isDark ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 25px 50px -12px rgba(79,70,229,0.1)',
                            position: 'relative',
                            '&::before': {
                                content: '""', position: 'absolute', inset: -1, borderRadius: 'inherit',
                                padding: '1px', background: 'linear-gradient(135deg, rgba(79,70,229,0.3), transparent, rgba(6,182,212,0.3))',
                                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none'
                            }
                        }}
                    >
                        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontSize: '0.85rem', fontWeight: 600 }}>{error}</Alert>}
                        <Box component="form" onSubmit={handleSubmit}>
                            <MotionBox variants={itemVariants} sx={{ display: 'flex', gap: 1.5 }}>
                                <TextField fullWidth label={a.firstName} size="small" margin="dense" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                                <TextField fullWidth label={a.lastName} size="small" margin="dense" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                            </MotionBox>
                            <MotionBox variants={itemVariants}>
                                <TextField fullWidth label={a.username} size="small" margin="dense" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                            </MotionBox>
                            <MotionBox variants={itemVariants}>
                                <TextField fullWidth label={a.email} type="email" size="small" margin="dense" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                            </MotionBox>
                            <MotionBox variants={itemVariants}>
                                <TextField
                                    fullWidth
                                    label={a.password}
                                    type={showPassword ? 'text' : 'password'}
                                    size="small"
                                    margin="dense"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        edge="end"
                                                        size="small"
                                                    >
                                                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </MotionBox>

                            <MotionBox variants={itemVariants} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    type="submit"
                                    size="large"
                                    disabled={loading}
                                    sx={{
                                        mt: 4, mb: 3, py: 1.8, fontWeight: 800, borderRadius: 2.5, textTransform: 'none', fontSize: '1rem',
                                        background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                                        boxShadow: '0 10px 25px -5px rgba(79,70,229,0.4)',
                                        '&:hover': { background: 'linear-gradient(135deg, #4338CA 0%, #4F46E5 100%)', boxShadow: '0 15px 30px -5px rgba(79,70,229,0.5)' }
                                    }}
                                >
                                    {loading ? a.creatingAccount : a.createAccount}
                                </Button>
                            </MotionBox>

                            <MotionBox variants={itemVariants} sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {a.hasAccount}{' '}
                                    <Link to="/login" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 700 }}>{a.signInLink}</Link>
                                </Typography>
                            </MotionBox>
                        </Box>
                    </MotionBox>
                </MotionBox>
            </Container>
        </Box>
    );
}
