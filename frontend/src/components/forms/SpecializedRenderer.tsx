import { Box, Typography, Button, TextField } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';

const MotionBox = motion(Box as any);

interface Props {
    form: any;
    onSubmit: (data: any) => Promise<void>;
    submitting: boolean;
}

export default function SpecializedRenderer({ form, onSubmit, submitting }: Props) {
    const [activeStep, setActiveStep] = useState(0);
    const [answers, setAnswers] = useState<any>({});
    const fields = form.fields || [];
    const totalSteps = fields.length;
    const currentField = fields[activeStep];

    const handleNext = () => {
        if (activeStep < totalSteps - 1) {
            setActiveStep((prev) => prev + 1);
        } else {
            onSubmit(answers);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const updateAnswer = (value: any) => {
        setAnswers({ ...answers, [currentField.id]: value });
    };

    const renderField = () => {
        if (!currentField) return null;
        const value = answers[currentField.id] || '';

        switch (currentField.type) {
            case 'text':
            case 'email':
            case 'number':
                return (
                    <TextField
                        fullWidth autoFocus variant="standard" placeholder="..."
                        type={currentField.type === 'number' ? 'number' : 'text'}
                        value={value} onChange={(e) => updateAnswer(e.target.value)}
                        InputProps={{ disableUnderline: true, style: { fontSize: '2.5rem', fontWeight: 800, textAlign: 'center' } }}
                        sx={{ mt: 4 }}
                        onKeyPress={(e) => e.key === 'Enter' && value && handleNext()}
                    />
                );
            case 'textarea':
                return (
                    <TextField
                        fullWidth autoFocus multiline rows={4} variant="standard" placeholder="..."
                        value={value} onChange={(e) => updateAnswer(e.target.value)}
                        InputProps={{ disableUnderline: true, style: { fontSize: '1.8rem', fontWeight: 700, textAlign: 'center' } }}
                        sx={{ mt: 4 }}
                    />
                );
            case 'single_choice':
                return (
                    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {(currentField.options || []).map((opt: string) => (
                            <Button
                                key={opt} variant={value === opt ? "contained" : "outlined"}
                                onClick={() => { updateAnswer(opt); setTimeout(handleNext, 300); }}
                                sx={{ py: 2, borderRadius: 3, fontWeight: 700, fontSize: '1.1rem', textTransform: 'none', borderColor: '#4F46E5', color: value === opt ? 'white' : '#4F46E5', background: value === opt ? '#4F46E5' : 'transparent' }}
                            >
                                {opt}
                            </Button>
                        ))}
                    </Box>
                );
            case 'multiple_choice':
                const selected = Array.isArray(value) ? value : [];
                return (
                    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {(currentField.options || []).map((opt: string) => {
                            const isSel = selected.includes(opt);
                            return (
                                <Button
                                    key={opt} variant={isSel ? "contained" : "outlined"}
                                    onClick={() => {
                                        const next = isSel ? selected.filter(s => s !== opt) : [...selected, opt];
                                        updateAnswer(next);
                                    }}
                                    sx={{ py: 2, borderRadius: 3, fontWeight: 700, fontSize: '1.1rem', textTransform: 'none', borderColor: '#4F46E5', color: isSel ? 'white' : '#4F46E5', background: isSel ? '#4F46E5' : 'transparent' }}
                                >
                                    {opt}
                                </Button>
                            );
                        })}
                    </Box>
                );
            case 'date':
                return (
                    <TextField
                        fullWidth type="date" variant="outlined"
                        value={value} onChange={(e) => updateAnswer(e.target.value)}
                        sx={{ mt: 4, '& .MuiOutlinedInput-root': { borderRadius: 3, fontSize: '1.5rem', fontWeight: 700 } }}
                    />
                );
            default:
                return null;
        }
    };

    const isNextDisabled = currentField?.required && !answers[currentField.id];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', px: 2 }}>
            <Box sx={{ width: '100%', maxWidth: 700 }}>
                {/* Progress bar */}
                <Box sx={{ mb: 8, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={800} color="#4F46E5" sx={{ mb: 1 }}>
                        {activeStep + 1} / {totalSteps}
                    </Typography>
                    <Box sx={{ width: '100%', height: 6, background: 'rgba(79,70,229,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((activeStep + 1) / totalSteps) * 100}%` }}
                            style={{ height: '100%', background: '#4F46E5' }}
                        />
                    </Box>
                </Box>

                <AnimatePresence mode="wait">
                    <MotionBox
                        key={activeStep}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05, y: -20 }}
                        transition={{ duration: 0.3 }}
                        sx={{ textAlign: 'center' }}
                    >
                        <Typography variant="h4" fontWeight={900} letterSpacing="-0.03em" sx={{ mb: 2, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
                            {currentField?.label}
                        </Typography>
                        {renderField()}
                    </MotionBox>
                </AnimatePresence>

                <Box sx={{ mt: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBack}
                        disabled={activeStep === 0}
                        sx={{ color: 'text.secondary', fontWeight: 700 }}
                    >
                        Retour
                    </Button>
                    <Button
                        variant="contained"
                        endIcon={activeStep === totalSteps - 1 ? <CheckIcon /> : <ArrowForwardIcon />}
                        onClick={handleNext}
                        disabled={isNextDisabled || submitting}
                        sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: 800, background: '#4F46E5', boxShadow: '0 10px 20px rgba(79,70,229,0.2)' }}
                    >
                        {submitting ? '...' : (activeStep === totalSteps - 1 ? 'Terminer' : 'Continuer')}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
