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
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const BackgroundBlobs = () => (
    <Box sx={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <MotionBox
            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            sx={{ position: 'absolute', top: '-10%', left: '10%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <MotionBox
            animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0], y: [0, -50, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            sx={{ position: 'absolute', bottom: '10%', right: '5%', width: '35vw', height: '35vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', filter: 'blur(50px)' }}
        />
        <MotionBox
            animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            sx={{ position: 'absolute', top: '40%', right: '20%', width: '25vw', height: '25vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', filter: 'blur(45px)' }}
        />
    </Box>
);

export default function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setAuth, themeMode, t } = useAppStore();
    const isDark = themeMode === 'dark';
    const a = t.auth;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('users/login/', formData);
            const token = res.data.access;
            const userRes = await api.get('users/profile/', { headers: { Authorization: `Bearer ${token}` } });
            setAuth(userRes.data, token);
            navigate('/dashboard');
        } catch {
            setError(a.errorInvalid);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative',
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
                                height: 56, mb: 2.5,
                                filter: isDark ? 'drop-shadow(0 0 20px rgba(79,70,229,0.4))' : 'none'
                            }}
                        />
                        <Typography variant="h4" fontWeight={900} letterSpacing="-0.04em" gutterBottom sx={{ background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            {a.loginTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: '0.01em' }}>
                            {a.loginSubtitle}
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
                                padding: '1px', background: 'linear-gradient(135deg, rgba(79,70,229,0.4), transparent, rgba(6,182,212,0.4))',
                                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none'
                            }
                        }}
                    >
                        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontSize: '0.85rem', fontWeight: 600 }}>{error}</Alert>}
                        <Box component="form" onSubmit={handleSubmit}>
                            <MotionBox variants={itemVariants}>
                                <TextField
                                    fullWidth
                                    label={a.username}
                                    margin="normal"
                                    required
                                    size="small"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, transition: 'all 0.2s', '&:hover fieldset': { borderColor: '#4F46E5' }, '&.Mui-focused fieldset': { borderWidth: '2px' } } }}
                                />
                            </MotionBox>
                            <MotionBox variants={itemVariants}>
                                <TextField
                                    fullWidth
                                    label={a.password}
                                    type={showPassword ? 'text' : 'password'}
                                    margin="normal"
                                    required
                                    size="small"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, transition: 'all 0.2s', '&:hover fieldset': { borderColor: '#4F46E5' }, '&.Mui-focused fieldset': { borderWidth: '2px' } } }}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        edge="end"
                                                        size="small"
                                                        sx={{ color: 'text.secondary' }}
                                                    >
                                                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </MotionBox>

                            <MotionBox variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                                    {loading ? a.signingIn : a.signIn}
                                </Button>
                            </MotionBox>

                            <MotionBox variants={itemVariants} sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {a.noAccount}{' '}
                                    <Link to="/register" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 700, transition: 'all 0.2s' }}>{a.signUpFree}</Link>
                                </Typography>
                            </MotionBox>
                        </Box>
                    </MotionBox>
                </MotionBox>
            </Container>
        </Box>
    );
}
