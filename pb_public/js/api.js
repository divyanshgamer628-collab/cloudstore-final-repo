// js/api.js

const API_BASE = '';

// Auth token helpers
function getAuthToken() {
    return localStorage.getItem('authToken');
}

function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

function clearAuthToken() {
    localStorage.removeItem('authToken');
}

// Current user helpers
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser'));
    } catch {
        return null;
    }
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}

// ========== AUTH ==========

const AuthAPI = {
    isAuthenticated() {
        return !!getAuthToken();
    },

    async login(identifier, password) {
        const response = await fetch(`${API_BASE}/api/collections/users/auth-with-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity: identifier, password }),
        });
        const result = await response.json();
        if (response.ok) {
            setAuthToken(result.token);
            setCurrentUser(result.record);
            return { success: true };
        } else {
            return { success: false, error: result.data?.message || 'Login failed' };
        }
    },

    async register(username, password, passwordConfirm) {
        const response = await fetch(`${API_BASE}/api/collections/users/records`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, passwordConfirm }),
        });
        const result = await response.json();
        if (response.ok) {
            return { success: true };
        } else {
            return { success: false, error: result.data?.message || 'Registration failed' };
        }
    },

    logout() {
        clearAuthToken();
        clearCurrentUser();
    },
};

// ========== FILES ==========

const FilesAPI = {
    async getFiles(folderId = null) {
        if (!folderId) return [];
        const query = `?filter=(folder='${folderId}')`;
        const response = await fetch(`${API_BASE}/api/collections/files/records${query}`, {
            headers: { 'Authorization': `Bearer ${getAuthToken()}` },
        });
        if (!response.ok) return [];
        const result = await response.json();
        return result.items || [];
    },

    async uploadFile(file, folderId, onProgress = null) {
        const currentUser = getCurrentUser();
        if (!folderId || !currentUser?.id) {
            return { success: false, error: "Cannot upload file: missing folder or user information." };
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        formData.append('size', file.size);
        formData.append('type', file.type);
        formData.append('folder', folderId);
        formData.append('owner', currentUser.id);
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    onProgress(percentComplete);
                }
            });
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve({ success: true, data: JSON.parse(xhr.responseText) });
                } else {
                    const error = JSON.parse(xhr.responseText);
                    console.error("UPLOAD ERROR:", error);
                    resolve({ success: false, error: error.message || 'Upload failed' });
                }
            });
            xhr.addEventListener('error', () => {
                resolve({ success: false, error: 'A network error occurred during the upload.' });
            });
            xhr.open('POST', `${API_BASE}/api/collections/files/records`);
            xhr.setRequestHeader('Authorization', `Bearer ${getAuthToken()}`);
            xhr.send(formData);
        });
    },

    // ✅ ADDED THIS FUNCTION
    async deleteFile(fileId) {
        const response = await fetch(`${API_BASE}/api/collections/files/records/${fileId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getAuthToken()}` },
        });
        if (response.ok) {
            return { success: true };
        } else {
            return { success: false, error: 'Failed to delete file.' };
        }
    },
};

// ========== FOLDERS ==========

const FoldersAPI = {
    async getFolders() {
        const response = await fetch(`${API_BASE}/api/collections/folders/records`, {
            headers: { 'Authorization': `Bearer ${getAuthToken()}` },
        });
        if (!response.ok) return [];
        const result = await response.json();
        return result.items || [];
    },

    async createFolder(name) {
        const currentUser = getCurrentUser();
        if (!currentUser?.id) return { success: false, error: "User not found." };
        const response = await fetch(`${API_BASE}/api/collections/folders/records`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`,
            },
            body: JSON.stringify({ name, owner: currentUser.id }),
        });
        const result = await response.json();
        if (response.ok) {
            return { success: true, data: result };
        } else {
            console.error("FOLDER CREATE ERROR:", result);
            return { success: false, error: result.data?.message || 'Folder creation failed' };
        }
    },
    
    // ✅ ADDED THIS FUNCTION
    async deleteFolder(folderId) {
        const response = await fetch(`${API_BASE}/api/collections/folders/records/${folderId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getAuthToken()}` },
        });
        if (response.ok) {
            return { success: true };
        } else {
            // NOTE: PocketBase will fail to delete a folder if it's not empty.
            // This requires custom backend logic to handle recursively.
            return { success: false, error: 'Failed to delete folder. It may not be empty.' };
        }
    },
};

window.CloudStoreAPI = { AuthAPI, FilesAPI, FoldersAPI };