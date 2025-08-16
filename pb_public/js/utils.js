/**
 * Utility functions for the CloudStore application
 */

// Show notification to user
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    const notificationClose = document.getElementById('notificationClose');
    
    if (!notification || !notificationText) return;
    
    // Remove existing type classes
    notification.classList.remove('success', 'error', 'warning', 'info');
    
    // Add new type class
    notification.classList.add(type);
    
    // Set message
    notificationText.textContent = message;
    
    // Show notification
    notification.classList.remove('hidden');
    
    // Auto hide after duration
    const hideTimeout = setTimeout(() => {
        hideNotification();
    }, duration);
    
    // Close button handler
    notificationClose.onclick = () => {
        clearTimeout(hideTimeout);
        hideNotification();
    };
}

// Hide notification
function hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.classList.add('hidden');
    }
}

// Toggle button loading state
function toggleButtonLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'Today';
    } else if (diffDays === 2) {
        return 'Yesterday';
    } else if (diffDays <= 7) {
        return `${diffDays - 1} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Get file type from filename
function getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    const audioTypes = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'];
    const documentTypes = ['doc', 'docx', 'txt', 'rtf', 'odt'];
    const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];
    const codeTypes = ['js', 'html', 'css', 'php', 'py', 'java', 'cpp', 'c', 'json', 'xml'];
    
    if (extension === 'pdf') return 'pdf';
    if (imageTypes.includes(extension)) return 'image';
    if (videoTypes.includes(extension)) return 'video';
    if (audioTypes.includes(extension)) return 'audio';
    if (documentTypes.includes(extension)) return 'document';
    if (archiveTypes.includes(extension)) return 'archive';
    if (codeTypes.includes(extension)) return 'code';
    
    return 'default';
}

// Generate random ID
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!', 'success', 2000);
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showNotification('Copied to clipboard!', 'success', 2000);
            return true;
        } catch (err) {
            showNotification('Failed to copy to clipboard', 'error');
            return false;
        } finally {
            document.body.removeChild(textArea);
        }
    }
}

// Validate file type and size
function validateFile(file, maxSize = 100 * 1024 * 1024) { // 100MB default
    const allowedTypes = [
        'image/', 'video/', 'audio/', 'text/', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument',
        'application/zip', 'application/x-rar-compressed', 'application/json'
    ];
    
    // Check file size
    if (file.size > maxSize) {
        return {
            valid: false,
            error: `File size must be less than ${formatFileSize(maxSize)}`
        };
    }
    
    // Check file type
    const isAllowed = allowedTypes.some(type => file.type.startsWith(type));
    if (!isAllowed) {
        return {
            valid: false,
            error: 'File type not allowed'
        };
    }
    
    return { valid: true };
}

// Dark mode functionality
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (darkModeToggle) {
        darkModeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
    
    // Toggle handler
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            darkModeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        });
    }
}

// Initialize dark mode when DOM is loaded
document.addEventListener('DOMContentLoaded', initDarkMode);

// Modal utilities
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Initialize modal close handlers
document.addEventListener('DOMContentLoaded', () => {
    // Close modals when clicking outside or on close button
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
            document.body.style.overflow = '';
        }
        
        if (e.target.classList.contains('modal-close')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal:not(.hidden)');
            if (openModal) {
                openModal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }
    });
});

// Export functions for use in other modules
window.CloudStoreUtils = {
    showNotification,
    hideNotification,
    toggleButtonLoading,
    formatFileSize,
    formatDate,
    getFileType,
    generateId,
    debounce,
    copyToClipboard,
    validateFile,
    showModal,
    hideModal
};
