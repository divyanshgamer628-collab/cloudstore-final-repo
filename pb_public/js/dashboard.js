// js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    // Main elements
    const fileGrid = document.getElementById('fileGrid');
    const fileInput = document.getElementById('fileInput');
    const folderSelect = document.getElementById('folderSelect');
    
    // Buttons
    const uploadBtn = document.getElementById('uploadBtn');
    const createFolderBtn = document.getElementById('createFolderBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');

    // User Menu
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');

    // Modals & Context Menu
    const contextMenu = document.getElementById('contextMenu');
    const deleteModal = document.getElementById('deleteModal');
    const deleteItemName = document.getElementById('deleteItemName');
    
    // State variables
    let selectedFolderId = '';
    let itemToDelete = null; // To store { id, name, type: 'file' | 'folder' }

    // ========== User Menu Toggle ==========
    userMenuBtn.addEventListener('click', () => userDropdown.classList.toggle('hidden'));
    document.addEventListener('click', (e) => {
        if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.add('hidden');
        }
    });

    // ========== Load Folders ==========
    async function loadFolders() {
        const folders = await CloudStoreAPI.FoldersAPI.getFolders();
        const currentVal = folderSelect.value; // Preserve selection if possible
        folderSelect.innerHTML = '<option value="">-- Select a Folder --</option>';
        folders.forEach(folder => {
            const option = new Option(folder.name, folder.id);
            folderSelect.appendChild(option);
        });
        
        if (folders.find(f => f.id === currentVal)) {
            folderSelect.value = currentVal;
        }

        if (folders.length > 0 && !folderSelect.value) {
            folderSelect.value = folders[0].id;
        }
        
        selectedFolderId = folderSelect.value;
        loadFiles(selectedFolderId);
    }

    // ========== Load Files ==========
    async function loadFiles(folderId) {
        if (!folderId) {
            fileGrid.innerHTML = '<p class="text-secondary text-center">Please select a folder.</p>';
            return;
        }
        const files = await CloudStoreAPI.FilesAPI.getFiles(folderId);
        fileGrid.innerHTML = '';
        if (files.length === 0) {
            fileGrid.innerHTML = '<p class="text-secondary text-center">This folder is empty.</p>';
            return;
        }
        files.forEach(file => {
            const fileItem = createFileElement(file);
            fileGrid.appendChild(fileItem);
        });
    }
    
    // ✅ NEW: Create File DOM Element (to attach events easily)
    function createFileElement(file) {
        const fileType = getFileType(file.name);
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.setAttribute('data-type', fileType);
        const downloadUrl = `${API_BASE}/api/files/files/${file.id}/${file.file}`;
        fileItem.innerHTML = `
            <div class="file-icon"></div>
            <div class="file-name" title="${file.name}">${file.name}</div>
            <a href="${downloadUrl}" target="_blank" class="btn btn-secondary" onclick="event.stopPropagation();">Download</a>
        `;
        // Right-click event for context menu
        fileItem.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e.pageX, e.pageY, { id: file.id, name: file.name, type: 'file' });
        });
        return fileItem;
    }

    // ========== Context Menu Logic ==========
    function showContextMenu(x, y, item) {
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.classList.remove('hidden');
        
        contextMenu.querySelector('[data-action="delete"]').onclick = () => {
            itemToDelete = item;
            deleteItemName.textContent = item.name;
            showModal('deleteModal');
            contextMenu.classList.add('hidden');
        };
    }

    // Hide context menu when clicking elsewhere
    document.addEventListener('click', () => contextMenu.classList.add('hidden'));

    // ========== Upload & Create Logic ==========
    async function handleFileUpload(file) {
        if (!selectedFolderId) {
            showNotification('Please select a folder first.', 'error');
            return;
        }
        showNotification(`Uploading ${file.name}...`, 'info');
        const result = await CloudStoreAPI.FilesAPI.uploadFile(file, selectedFolderId);
        if (result.success) {
            showNotification('Upload successful.', 'success');
            loadFiles(selectedFolderId);
        } else {
            showNotification(`Upload failed: ${result.error}`, 'error');
        }
    }

    async function createFolder() {
        const folderName = prompt('Enter folder name:');
        if (!folderName || folderName.trim() === '') return;
        const result = await CloudStoreAPI.FoldersAPI.createFolder(folderName.trim());
        if (result.success) {
            showNotification('Folder created successfully.', 'success');
            await loadFolders();
            folderSelect.value = result.data.id; // Auto-select new folder
            selectedFolderId = result.data.id;
            loadFiles(selectedFolderId);
        } else {
            showNotification(`Failed to create folder: ${result.error}`, 'error');
        }
    }

    // ========== Deletion Logic ==========
    async function handleDelete() {
        if (!itemToDelete) return;

        let result;
        if (itemToDelete.type === 'file') {
            result = await CloudStoreAPI.FilesAPI.deleteFile(itemToDelete.id);
        } else {
            // Deleting folders is handled similarly but not fully implemented here
            // result = await CloudStoreAPI.FoldersAPI.deleteFolder(itemToDelete.id);
            showNotification('Folder deletion is not fully supported yet.', 'warning');
            hideModal('deleteModal');
            return;
        }

        if (result.success) {
            showNotification(`"${itemToDelete.name}" was deleted successfully.`, 'success');
            loadFiles(selectedFolderId); // Refresh the file list
        } else {
            showNotification(`Error: ${result.error}`, 'error');
        }

        hideModal('deleteModal');
        itemToDelete = null;
    }

    // ========== Event Listeners ==========
    uploadBtn.addEventListener('click', () => fileInput.click());
    createFolderBtn.addEventListener('click', createFolder);
    logoutBtn.addEventListener('click', () => {
        CloudStoreAPI.AuthAPI.logout();
        window.location.href = 'index.html';
    });
    
    fileInput.addEventListener('change', () => {
        Array.from(fileInput.files).forEach(handleFileUpload);
    });

    folderSelect.addEventListener('change', () => {
        selectedFolderId = folderSelect.value;
        loadFiles(selectedFolderId);
    });

    confirmDeleteBtn.addEventListener('click', handleDelete);
    cancelDeleteBtn.addEventListener('click', () => hideModal('deleteModal'));

    // Initial load
    loadFolders();
});