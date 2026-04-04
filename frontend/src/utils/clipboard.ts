export const copyToClipboard = async (text: string): Promise<boolean> => {
    // Try Modern API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Modern clipboard error:', err);
        }
    }

    // Fallback: execCommand('copy')
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;

        // Prevent scrolling to bottom
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    } catch (err) {
        console.error('Fallback clipboard error:', err);
        return false;
    }
};
