import { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, CircularProgress, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TableSortLabel, Snackbar, Alert, IconButton } from '@mui/material';
import { ContentPaste, Visibility as VisibilityIcon, Group as GroupIcon, TrendingUp as TrendingUpIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../api';
import { useAppStore } from '../store';
import { copyToClipboard } from '../utils/clipboard';

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#3B82F6', '#84CC16', '#6366F1'];

type Order = 'asc' | 'desc';

export default function Analytics() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { themeMode, t } = useAppStore();
    const isDark = themeMode === 'dark';
    const a = t.analyticsPage;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState<Order>('desc');
    const [orderBy, setOrderBy] = useState<string>('submitted_at');
    const [syncing, setSyncing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, msg: '' });

    const handleDeleteResponse = async (responseId: number) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")) return;

        try {
            await api.delete(`forms/builder/${id}/responses/${responseId}/`);
            setData((prev: any) => ({
                ...prev,
                responses: prev.responses.filter((r: any) => r.id !== responseId),
                total_responses: prev.total_responses - 1
            }));
            setSnackbar({ open: true, msg: "Enregistrement supprimé" });
        } catch (error) {
            setSnackbar({ open: true, msg: "Erreur lors de la suppression" });
        }
    };

    useEffect(() => {
        if (!useAppStore.getState().token) {
            navigate('/login');
            return;
        }
        api.get(`forms/builder/${id}/analytics/`).then(res => setData(res.data)).catch(console.error).finally(() => setLoading(false));
    }, [id, navigate]);

    const handleGoogleSheetsSync = async () => {
        setSyncing(true);
        try {
            const res = await api.get(`integrations/${id}/get-magic-link/`);
            const { formula } = res.data;

            // Clipboard Copy of the Magic Formula
            await copyToClipboard(formula);

            // Open Sheets
            window.open('https://sheets.new', '_blank');

            setSnackbar({
                open: true,
                msg: isDark ? 'Formule magique copiée ! Collez dans la cellule A1.' : 'Magic formula copied! Paste in cell A1.'
            });
        } catch {
            alert('Erreur lors de la préparation de la synchronisation.');
        } finally {
            setSyncing(false);
        }
    };

    const handleExcelExport = async () => {
        try {
            const response = await api.get(`integrations/${id}/export/excel/`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `vura_export_${id}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch { alert('Erreur lors de l\'export Excel.'); }
    };

    const handleChangePage = (_: unknown, newPage: number) => { setPage(newPage); };
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleRequestSort = (property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress sx={{ color: '#4F46E5' }} /></Box>;
    if (!data) return <Typography align="center" mt={10}>{a.noData}</Typography>;

    // Helpers to access response answers safely
    const getAnswerForField = (answers: any[], fieldId: number) => {
        const found = answers.find(ans => ans.field_id === fieldId);
        if (!found || found.value === null) return '-';
        if (Array.isArray(found.value)) return found.value.join(', ');
        return found.value.toString();
    };

    const descendingComparator = (aObj: any, bObj: any, orderByField: string) => {
        const aValue = orderByField === 'submitted_at' ? new Date(aObj.submitted_at).getTime() : getAnswerForField(aObj.answers || [], parseInt(orderByField));
        const bValue = orderByField === 'submitted_at' ? new Date(bObj.submitted_at).getTime() : getAnswerForField(bObj.answers || [], parseInt(orderByField));

        if (bValue < aValue) return -1;
        if (bValue > aValue) return 1;
        return 0;
    };

    const getComparator = (sortOrder: Order, sortOrderBy: string) => {
        return sortOrder === 'desc'
            ? (aObj: any, bObj: any) => descendingComparator(aObj, bObj, sortOrderBy)
            : (aObj: any, bObj: any) => -descendingComparator(aObj, bObj, sortOrderBy);
    };

    const responses = data.responses || [];
    const fields = data.fields || [];
    const sortedResponses = [...responses].sort(getComparator(order, orderBy));

    // Format daily responses
    const dailyData = (data.daily_responses || []).map((d: any) => ({
        date: new Date(d.date).toLocaleDateString(isDark ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' }),
        count: d.count
    }));

    return (
        <Box sx={{ minHeight: '100vh', pt: 10, pb: 8, background: isDark ? '#050615' : '#FAFAFA', '&::before': { content: '""', position: 'fixed', inset: 0, backgroundImage: isDark ? 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)' : 'radial-gradient(rgba(0,0,0,0.025) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none', zIndex: 0 } }}>
            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: { xs: 3, md: 5 }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">{a.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
                        <Button variant="outlined" component={Link as any} to="/dashboard" sx={{ borderColor: 'divider', color: 'text.secondary', borderRadius: 2, flexGrow: { xs: 1, sm: 0 } }}>{a.back}</Button>
                        <Button
                            variant="contained"
                            onClick={handleGoogleSheetsSync}
                            disabled={syncing}
                            startIcon={syncing ? <CircularProgress size={18} color="inherit" /> : <Box component="img" src="https://www.gstatic.com/images/branding/product/1x/sheets_2020q4_48dp.png" sx={{ width: 18, filter: 'brightness(1.2)' }} />}
                            sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)', flexGrow: { xs: 1, sm: 0 } }}
                        >
                            {syncing ? '...' : a.syncSheets}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleExcelExport}
                            startIcon={<Box component="img" src="https://www.gstatic.com/images/branding/product/1x/excel_2020q4_48dp.png" sx={{ width: 18, filter: 'brightness(1.2)' }} />}
                            sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #4F46E5, #6366F1)', boxShadow: '0 4px 15px rgba(79,70,229,0.3)', flexGrow: { xs: 1, sm: 0 } }}
                        >
                            {a.exportExcel}
                        </Button>
                    </Box>
                </Box>

                <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, textAlign: 'center', mb: 5, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#E8EAF0', background: isDark ? '#0D0F1F' : '#FFFFFF' }}>
                    <Typography variant="h2" sx={{ fontWeight: 900, background: 'linear-gradient(135deg, #4F46E5, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        {data.total_responses}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>{a.totalResponses}</Typography>
                </Paper>

                {/* Daily Submissions Line Chart */}
                {dailyData.length > 0 && (
                    <Paper sx={{ p: 4, borderRadius: 3, mb: 5, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#E8EAF0', background: isDark ? '#0D0F1F' : '#FFFFFF' }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
                            {isDark ? 'Soumissions par jour' : 'Daily Submissions'}
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dailyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} vertical={false} />
                                <XAxis dataKey="date" stroke={isDark ? '#9CA3AF' : '#6B7280'} tick={{ fontSize: 12 }} dy={10} />
                                <YAxis stroke={isDark ? '#9CA3AF' : '#6B7280'} tick={{ fontSize: 12 }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, background: isDark ? '#1F2937' : '#FFFFFF', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#4F46E5', fontWeight: 600 }}
                                />
                                <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: isDark ? '#0D0F1F' : '#FFFFFF' }} activeDot={{ r: 6, stroke: '#06B6D4' }} name="Réponses" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                )}

                {/* Specialized Tunnel Metrics */}
                {data.is_specialized && (
                    <Box sx={{ mb: 5 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 5 }}>
                            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', border: '1px solid', borderColor: isDark ? 'rgba(79,70,229,0.3)' : '#C7D2FE', background: isDark ? 'rgba(79,70,229,0.05)' : '#F5F3FF', position: 'relative', overflow: 'hidden' }}>
                                <VisibilityIcon sx={{ position: 'absolute', top: -10, right: -10, fontSize: 80, opacity: 0.05, color: '#4F46E5' }} />
                                <Typography variant="h4" fontWeight={900} color="#4F46E5">{data.views || 0}</Typography>
                                <Typography variant="caption" fontWeight={700} color="text.secondary">VUES TOTALES (IMPRESSIONS)</Typography>
                            </Paper>
                            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', border: '1px solid', borderColor: isDark ? 'rgba(16,185,129,0.3)' : '#D1FAE5', background: isDark ? 'rgba(16,185,129,0.05)' : '#F0FDF4', position: 'relative', overflow: 'hidden' }}>
                                <GroupIcon sx={{ position: 'absolute', top: -10, right: -10, fontSize: 80, opacity: 0.05, color: '#10B981' }} />
                                <Typography variant="h4" fontWeight={900} color="#10B981">{data.total_responses || 0}</Typography>
                                <Typography variant="caption" fontWeight={700} color="text.secondary">CONVERSIONS (CAPTURES)</Typography>
                            </Paper>
                            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center', border: '1px solid', borderColor: isDark ? 'rgba(245,158,11,0.3)' : '#FEF3C7', background: isDark ? 'rgba(245,158,11,0.05)' : '#FFFBEB', position: 'relative', overflow: 'hidden' }}>
                                <TrendingUpIcon sx={{ position: 'absolute', top: -10, right: -10, fontSize: 80, opacity: 0.05, color: '#F59E0B' }} />
                                <Typography variant="h4" fontWeight={900} color="#F59E0B">
                                    {data.views > 0 ? ((data.total_responses / data.views) * 100).toFixed(1) : 0}%
                                </Typography>
                                <Typography variant="caption" fontWeight={700} color="text.secondary">TAUX DE CONVERSION GLOBAL</Typography>
                            </Paper>
                        </Box>

                        {data.funnel_data && data.funnel_data.length > 0 && (
                            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, mb: 5, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#E8EAF0', background: isDark ? '#0D0F1F' : '#FFFFFF' }}>
                                <Typography variant="h6" fontWeight={800} sx={{ mb: 4 }}>Entonnoir de Conversion par Étape</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {data.funnel_data.map((step: any, idx: number) => {
                                        const prevViews = idx > 0 ? data.funnel_data[idx - 1].views : data.views;
                                        const dropRate = prevViews > 0 ? ((step.views / prevViews) * 100).toFixed(1) : 0;
                                        return (
                                            <Box key={step.id} sx={{ position: 'relative' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                    <Box sx={{ minWidth: 120 }}>
                                                        <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                                            Étape {idx + 1}: {step.type}
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight={700} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {step.label}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ flex: 1, height: 40, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6', borderRadius: 1.5, position: 'relative', overflow: 'hidden' }}>
                                                        <Box sx={{
                                                            height: '100%',
                                                            width: `${data.views > 0 ? (step.views / data.views) * 100 : 0}%`,
                                                            background: 'linear-gradient(90deg, #4F46E5, #6366F1)',
                                                            transition: 'width 1s ease-in-out',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'flex-end',
                                                            px: 2
                                                        }}>
                                                            <Typography variant="caption" fontWeight={900} color="white">
                                                                {step.views}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ minWidth: 80, textAlign: 'right' }}>
                                                        <Typography variant="body2" fontWeight={800}>
                                                            {dropRate}%
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">de l'étape précedente</Typography>
                                                    </Box>
                                                </Box>
                                                {idx < data.funnel_data.length - 1 && (
                                                    <Box sx={{ height: 20, ml: 128 / 8, borderLeft: '2px dashed', borderColor: 'divider' }} />
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Paper>
                        )}
                    </Box>
                )}

                {/* Pie Charts Grid for Choice Fields */}
                {data.fields_summary && data.fields_summary.length > 0 && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 3, mb: 6 }}>
                        {data.fields_summary.map((field: any) => {
                            const chartData = Object.keys(field.counts).map(key => ({ name: key, value: field.counts[key] }));
                            return (
                                <Paper key={field.field_id} sx={{ p: 3, borderRadius: 3, height: 350, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#E8EAF0', background: isDark ? '#0D0F1F' : '#FFFFFF' }}>
                                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={field.label}>{field.label}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>{field.type}</Typography>
                                    {chartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="75%">
                                            <PieChart>
                                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={chartData.length <= 5}>
                                                    {chartData.map((_, index) => <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip contentStyle={{ borderRadius: 8, background: isDark ? '#1F2937' : '#FFFFFF', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                {chartData.length <= 6 && <Legend />}
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <Typography color="text.secondary" align="center" mt={8}>{a.noChoiceData}</Typography>
                                    )}
                                </Paper>
                            );
                        })}
                    </Box>
                )}

                {/* Responses Data Table with Sortable Columns */}
                <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em" sx={{ mb: 3 }}>{a.responsesList}</Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : '#E8EAF0', background: isDark ? '#0D0F1F' : '#FFFFFF', mb: 4, overflowX: 'auto' }}>
                    <Table stickyHeader sx={{ minWidth: 800 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, background: isDark ? '#111827' : '#F9FAFB', borderColor: 'divider' }}>
                                    <TableSortLabel
                                        active={orderBy === 'submitted_at'}
                                        direction={orderBy === 'submitted_at' ? order : 'asc'}
                                        onClick={() => handleRequestSort('submitted_at')}
                                    >
                                        {a.submittedAt}
                                    </TableSortLabel>
                                </TableCell>
                                {fields.map((f: any) => (
                                    <TableCell key={f.id} sx={{ fontWeight: 700, background: isDark ? '#111827' : '#F9FAFB', borderColor: 'divider', whiteSpace: 'nowrap', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }} title={f.label}>
                                        <TableSortLabel
                                            active={orderBy === f.id.toString()}
                                            direction={orderBy === f.id.toString() ? order : 'asc'}
                                            onClick={() => handleRequestSort(f.id.toString())}
                                        >
                                            {f.label}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                                <TableCell sx={{ fontWeight: 700, background: isDark ? '#111827' : '#F9FAFB', borderColor: 'divider', textAlign: 'right' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedResponses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((resp: any) => (
                                <TableRow key={resp.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' } }}>
                                    <TableCell sx={{ borderColor: 'divider', whiteSpace: 'nowrap' }}>
                                        {new Date(resp.submitted_at).toLocaleString(isDark ? 'fr-FR' : 'en-US')}
                                    </TableCell>
                                    {fields.map((f: any) => (
                                        <TableCell key={f.id} sx={{ borderColor: 'divider', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={getAnswerForField(resp.answers || [], f.id)}>
                                            {getAnswerForField(resp.answers || [], f.id)}
                                        </TableCell>
                                    ))}
                                    <TableCell align="right" sx={{ borderColor: 'divider' }}>
                                        <IconButton size="small" color="error" onClick={() => handleDeleteResponse(resp.id)} sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {responses.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={fields.length + 2} align="center" sx={{ py: 5, borderColor: 'divider', color: 'text.secondary' }}>
                                        {a.noData}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={responses.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ borderTop: '1px solid', borderColor: 'divider', color: 'text.secondary' }}
                />
            </Container>

            {/* Instruction Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" icon={<ContentPaste />} sx={{ borderRadius: 2, fontWeight: 600 }}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
        </Box >
    );
}
