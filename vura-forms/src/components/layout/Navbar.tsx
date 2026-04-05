import { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Container, Menu, MenuItem, Drawer, List, ListItem, ListItemText, ListItemButton, Divider } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import TranslateIcon from '@mui/icons-material/Translate';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useAppStore } from '../../store';

export default function Navbar() {
    const { themeMode, toggleTheme, user, logout, t, language, setLanguage } = useAppStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => { logout(); navigate('/'); };
    const isLanding = location.pathname === '/';

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                background: scrolled || !isLanding
                    ? (themeMode === 'dark' ? 'rgba(5,6,21,0.85)' : 'rgba(250,250,250,0.85)')
                    : 'transparent',
                backdropFilter: scrolled || !isLanding ? 'blur(24px)' : 'none',
                borderBottom: scrolled || !isLanding
                    ? `1px solid ${themeMode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E8EAF0'}`
                    : '1px solid transparent',
                transition: 'all 0.3s ease',
            }}
        >
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ height: 72, justifyContent: 'space-between' }}>
                    <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}>
                        <Box component="img" src="/vura_logo.png" alt="Vura" sx={{ height: 32, width: 32 }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.03em', color: themeMode === 'dark' ? '#F0F0FF' : '#0F0F1A' }}>
                            Vura
                        </Typography>
                    </Box>

                    {!user && (
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
                            {[
                                { name: t.nav.features, id: '#features' },
                                { name: t.nav.analytics, id: '#analytics' },
                                { name: t.nav.pricing, id: '#pricing' }
                            ].map(item => (
                                <Button
                                    key={item.id}
                                    component={Link}
                                    to={`/${item.id}`}
                                    sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 500, px: 1.5, '&:hover': { color: 'text.primary', background: 'transparent' } }}
                                >
                                    {item.name}
                                </Button>
                            ))}
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {/* Language Toggle */}
                        <IconButton
                            size="small"
                            onClick={(e) => setLangAnchor(e.currentTarget)}
                            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                        >
                            <TranslateIcon fontSize="small" />
                        </IconButton>
                        <Menu
                            anchorEl={langAnchor}
                            open={Boolean(langAnchor)}
                            onClose={() => setLangAnchor(null)}
                            PaperProps={{
                                sx: {
                                    mt: 1, borderRadius: 2, minWidth: 140,
                                    background: themeMode === 'dark' ? '#12152A' : '#FFFFFF',
                                    border: '1px solid',
                                    borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.08)' : '#E8EAF0',
                                },
                            }}
                        >
                            <MenuItem
                                onClick={() => { setLanguage('fr'); setLangAnchor(null); }}
                                selected={language === 'fr'}
                                sx={{ fontSize: '0.875rem', fontWeight: language === 'fr' ? 700 : 400 }}
                            >
                                🇫🇷 Français
                            </MenuItem>
                            <MenuItem
                                onClick={() => { setLanguage('en'); setLangAnchor(null); }}
                                selected={language === 'en'}
                                sx={{ fontSize: '0.875rem', fontWeight: language === 'en' ? 700 : 400 }}
                            >
                                🇬🇧 English
                            </MenuItem>
                        </Menu>

                        <IconButton size="small" onClick={toggleTheme} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                            {themeMode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
                        </IconButton>

                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
                            {user ? (
                                <>
                                    <Button component={Link as any} to="/dashboard" sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 500 }}>
                                        {t.nav.dashboard}
                                    </Button>
                                    <Button onClick={handleLogout} variant="outlined" size="small" sx={{ borderColor: 'divider', color: 'text.secondary', fontSize: '0.875rem' }}>
                                        {t.nav.logout}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button component={Link as any} to="/login" sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 500 }}>
                                        {t.nav.login}
                                    </Button>
                                    <Button
                                        component={Link as any} to="/register" variant="contained" size="small"
                                        sx={{
                                            px: 2.5, py: 1, fontSize: '0.875rem',
                                            background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                                            '&:hover': { background: 'linear-gradient(135deg, #4338CA 0%, #4F46E5 100%)' },
                                        }}
                                    >
                                        {t.nav.getStarted}
                                    </Button>
                                </>
                            )}
                        </Box>

                        {/* Mobile Menu Toggle */}
                        <IconButton
                            onClick={() => setMobileOpen(true)}
                            sx={{ display: { md: 'none' }, color: 'text.primary', ml: 1 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </Container>

            {/* Mobile Drawer */}
            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                PaperProps={{
                    sx: {
                        width: '85%', maxWidth: 320,
                        background: themeMode === 'dark' ? '#0D0F1F' : '#FFFFFF',
                    }
                }}
            >
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Menu</Typography>
                    <IconButton onClick={() => setMobileOpen(false)}><CloseIcon /></IconButton>
                </Box>
                <Divider />
                <List sx={{ p: 2 }}>
                    {!user && [
                        { name: t.nav.features, id: '#features' },
                        { name: t.nav.analytics, id: '#analytics' },
                        { name: t.nav.pricing, id: '#pricing' }
                    ].map(item => (
                        <ListItem key={item.id} disablePadding>
                            <ListItemButton component={Link} to={`/${item.id}`} sx={{ borderRadius: 2 }} onClick={() => setMobileOpen(false)}>
                                <ListItemText primary={item.name} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    {user ? (
                        <>
                            <ListItem disablePadding>
                                <ListItemButton component={Link as any} to="/dashboard" sx={{ borderRadius: 2 }} onClick={() => setMobileOpen(false)}>
                                    <ListItemText primary={t.nav.dashboard} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => { handleLogout(); setMobileOpen(false); }} sx={{ borderRadius: 2, color: 'error.main' }}>
                                    <ListItemText primary={t.nav.logout} />
                                </ListItemButton>
                            </ListItem>
                        </>
                    ) : (
                        <>
                            <ListItem disablePadding>
                                <ListItemButton component={Link as any} to="/login" sx={{ borderRadius: 2 }} onClick={() => setMobileOpen(false)}>
                                    <ListItemText primary={t.nav.login} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton
                                    component={Link as any} to="/register"
                                    onClick={() => setMobileOpen(false)}
                                    sx={{
                                        mt: 1, borderRadius: 2, textAlign: 'center',
                                        background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                                        color: 'white', '&:hover': { background: '#4338CA' }
                                    }}
                                >
                                    <ListItemText primary={t.nav.getStarted} primaryTypographyProps={{ fontWeight: 700 }} />
                                </ListItemButton>
                            </ListItem>
                        </>
                    )}
                </List>
            </Drawer>
        </AppBar>
    );
}
