import { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, Button, CircularProgress, Chip, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import BarChartIcon from '@mui/icons-material/BarChart';
import EditIcon from '@mui/icons-material/Edit';
import LinkIcon from '@mui/icons-material/Link';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import api from '../api';
import { useAppStore } from '../store';
import { copyToClipboard } from '../utils/clipboard';

const MotionBox = motion(Box as any);

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.05, ease: 'easeOut' } }),
};

export default function Dashboard() {
    const [forms, setForms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const { themeMode, user, t } = useAppStore();
    const isDark = themeMode === 'dark';
    const d = t.dashboard;

    useEffect(() => {
        api.get('forms/builder/').then(res => setForms(res.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    const copyLink = async (publicId: string) => {
        const success = await copyToClipboard(`${window.location.origin}/p/${publicId}`);
        if (success) {
            setCopiedId(publicId);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    const handleDelete = async () => {
        if (!deleteDialog) return;
        setDeleting(true);
        try {
            await api.delete(`forms/builder/${deleteDialog.id}/`);
            setForms(forms.filter(f => f.id !== deleteDialog.id));
        } catch { /* ignore */ }
        finally { setDeleting(false); setDeleteDialog(null); }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress sx={{ color: '#4F46E5' }} /></Box>;

    return (
        <Box sx={{ minHeight: '100vh', pt: 10, pb: 8, background: isDark ? '#050615' : '#FAFAFA', '&::before': { content: '""', position: 'fixed', inset: 0, backgroundImage: isDark ? 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)' : 'radial-gradient(rgba(0,0,0,0.025) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none', zIndex: 0 } }}>
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <MotionBox initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: { xs: 5, md: 8 } }}>
                    <Box>
                        <Typography variant="overline" sx={{ color: '#4F46E5', fontWeight: 700, letterSpacing: '0.1em' }}>{d.title}</Typography>
                        <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em" sx={{ mt: 0.5 }}>
                            {user ? `${d.hello}, ${user.username} 👋` : d.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {forms.length} formulaire{forms.length !== 1 ? 's' : ''} créé{forms.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                    <Button onClick={() => user?.is_premium ? setShowCreateDialog(true) : window.location.href = '/builder'} variant="contained" startIcon={<AddIcon />}
                        sx={{ width: { xs: '100%', sm: 'auto' }, fontWeight: 700, borderRadius: 2, px: 3, py: 1.5, background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)', boxShadow: '0 0 30px rgba(79,70,229,0.3)', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 0 40px rgba(79,70,229,0.4)' }, transition: 'all 0.2s ease' }}>
                        {d.newForm}
                    </Button>
                </MotionBox>

                {!user?.is_premium && (
                    <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} sx={{ mb: 6 }}>
                        <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, background: isDark ? 'linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(6,182,212,0.1) 100%)' : 'linear-gradient(135deg, #EEF2FF 0%, #E0F2FE 100%)', border: '1px solid', borderColor: isDark ? 'rgba(79,70,229,0.3)' : '#C7D2FE', position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                                <Box>
                                    <Typography variant="h5" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                        <RocketLaunchIcon sx={{ color: '#4F46E5' }} />
                                        {d.upgradeTitle}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {d.upgradeDesc}
                                    </Typography>
                                </Box>
                                <Button component={Link as any} to="/upgrade" variant="contained" sx={{ fontWeight: 700, borderRadius: 2, px: 4, py: 1.5, background: '#4F46E5', boxShadow: '0 10px 20px rgba(79,70,229,0.2)', whiteSpace: 'nowrap' }}>
                                    {d.upgradeBtn}
                                </Button>
                            </Box>
                            <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)', filter: 'blur(20px)' }} />
                        </Paper>
                    </MotionBox>
                )}

                {forms.length === 0 ? (
                    <MotionBox initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                        sx={{ textAlign: 'center', py: 14, px: 4, borderRadius: 4, border: '2px dashed', borderColor: isDark ? 'rgba(79,70,229,0.3)' : '#C7D2FE', background: isDark ? 'rgba(79,70,229,0.04)' : '#F5F3FF' }}>
                        <Box sx={{ fontSize: 64, mb: 2 }}>📋</Box>
                        <Typography variant="h5" fontWeight={700} gutterBottom>{d.noForms}</Typography>
                        <Typography color="text.secondary" sx={{ mb: 4 }}>{d.noFormsDesc}</Typography>
                        <Button component={Link as any} to="/builder" variant="contained" startIcon={<AddIcon />}
                            sx={{ fontWeight: 700, borderRadius: 2, px: 4, py: 1.5, background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)' }}>
                            {d.createFirst}
                        </Button>
                    </MotionBox>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                        {forms.map((form: any, i: number) => (
                            <MotionBox key={form.id} custom={i} variants={fadeUp} initial="hidden" animate="visible" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                                <Paper sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#E8EAF0', background: isDark ? '#0D0F1F' : '#FFFFFF', '&:hover': { borderColor: isDark ? 'rgba(79,70,229,0.3)' : '#C7D2FE' }, transition: 'all 0.2s ease' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Chip size="small" icon={form.is_published ? <CheckCircleIcon fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" />} label={form.is_published ? d.published : d.draft}
                                            sx={{ fontWeight: 600, fontSize: '0.7rem', background: form.is_published ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.12)', color: form.is_published ? '#10B981' : '#9CA3AF', border: 'none', height: 24 }} />
                                        <Typography variant="caption" color="text.secondary">{form.fields?.length || 0} {d.fields}</Typography>
                                    </Box>
                                    <Typography variant="h6" fontWeight={700} letterSpacing="-0.01em" sx={{ mb: 1, flexGrow: 1 }}>{form.title}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {form.description || d.noDesc}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 'auto' }}>
                                        <Button size="small" variant="outlined" startIcon={<EditIcon fontSize="small" />} component={Link as any} to={`/builder/${form.id}`} sx={{ borderRadius: 2, fontSize: '0.8rem', borderColor: 'divider', color: 'text.secondary' }}>{d.edit}</Button>
                                        <Button size="small" variant="contained" startIcon={<BarChartIcon fontSize="small" />} component={Link as any} to={`/dashboard/analytics/${form.id}`} sx={{ borderRadius: 2, fontSize: '0.8rem', background: 'linear-gradient(135deg, #4F46E5, #6366F1)' }}>{d.analytics}</Button>
                                        {form.is_published && (
                                            <Tooltip title={copiedId === form.public_id ? d.copied : d.copyLink}>
                                                <IconButton size="small" onClick={() => copyLink(form.public_id)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                                    <LinkIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip title="Supprimer">
                                            <IconButton size="small" onClick={() => setDeleteDialog(form)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, ml: 'auto', color: 'text.disabled', '&:hover': { color: '#EF4444', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)' } }}>
                                                <DeleteOutlineIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Paper>
                            </MotionBox>
                        ))}
                    </Box>
                )}
            </Container>

            {/* Delete confirmation dialog */}
            <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)} PaperProps={{ sx: { borderRadius: 3, background: isDark ? '#0D0F1F' : '#FFFFFF', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E8EAF0' } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Supprimer ce formulaire ?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Le formulaire <strong>"{deleteDialog?.title}"</strong> sera supprimé définitivement avec toutes ses réponses. Cette action est irréversible.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button onClick={() => setDeleteDialog(null)} sx={{ color: 'text.secondary', borderRadius: 2 }}>Annuler</Button>
                    <Button onClick={handleDelete} disabled={deleting} variant="contained" sx={{ borderRadius: 2, background: '#EF4444', '&:hover': { background: '#DC2626' } }}>
                        {deleting ? 'Suppression...' : 'Supprimer'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Type Selection Dialog */}
            <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} PaperProps={{ sx: { borderRadius: 4, background: isDark ? '#0D0F1F' : '#FFFFFF', maxWidth: 500 } }}>
                <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pt: 4 }}>{d.selectType}</DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Paper component={Link as any} to="/builder" onClick={() => setShowCreateDialog(false)} sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer', textDecoration: 'none', color: 'inherit', border: '1px solid', borderColor: 'divider', '&:hover': { borderColor: '#4F46E5', background: isDark ? 'rgba(79,70,229,0.05)' : 'rgba(79,70,229,0.02)' } }}>
                            <Box sx={{ fontSize: 40 }}>📋</Box>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>{d.typeStandard}</Typography>
                                <Typography variant="body2" color="text.secondary">{d.typeStandardDesc}</Typography>
                            </Box>
                        </Paper>
                        <Paper component={Link as any} to="/builder?type=funnel" onClick={() => setShowCreateDialog(false)} sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer', textDecoration: 'none', color: 'inherit', border: '2px solid', borderColor: isDark ? 'rgba(79,70,229,0.3)' : '#C7D2FE', background: isDark ? 'rgba(79,70,229,0.05)' : '#F5F3FF', '&:hover': { borderColor: '#4F46E5' } }}>
                            <Box sx={{ fontSize: 40 }}>🚀</Box>
                            <Box>
                                <Typography variant="h6" fontWeight={700} color="#4F46E5">{d.typeSpecialized}</Typography>
                                <Typography variant="body2" color="text.secondary">{d.typeSpecializedDesc}</Typography>
                            </Box>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
                    <Button onClick={() => setShowCreateDialog(false)} color="inherit">{t.common.cancel || 'Annuler'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
