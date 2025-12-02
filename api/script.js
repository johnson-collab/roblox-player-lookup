let currentUser = null;
let bloxydex = [];

// Load data on page load
window.addEventListener('DOMContentLoaded', loadUserData);

async function loadUserData() {
    const userData = localStorage.getItem('current_user');
    if (userData) {
        currentUser = JSON.parse(userData);
        showLoggedInView();
    }
    
    const bloxydexData = localStorage.getItem('bloxydex');
    if (bloxydexData) {
        bloxydex = JSON.parse(bloxydexData);
        updateBloxydexCount();
    }
}

// Login functionality
document.getElementById('generateLoginCodeBtn').addEventListener('click', () => {
    const code = `BLOXYAUTH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    document.getElementById('loginCode').value = code;
    document.getElementById('loginCodeHint').classList.remove('hidden');
});

document.getElementById('loginBtn').addEventListener('click', handleLogin);

async function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const code = document.getElementById('loginCode').value.trim();
    const errorDiv = document.getElementById('loginError');
    const loginBtn = document.getElementById('loginBtn');

    errorDiv.classList.add('hidden');

    if (!username) {
        showError(errorDiv, 'Please enter a username');
        return;
    }
    if (!code) {
        showError(errorDiv, 'Please generate a login code first');
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Verifying...';

    try {
        const response = await fetch(`/api/user?username=${encodeURIComponent(username)}`);
        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            throw new Error('User not found');
        }

        const userId = data.data[0].id;
        
        // Get user details
        const detailsResponse = await fetch(`/api/userdetails?userId=${userId}`);
        const details = await detailsResponse.json();

        // Check if code is in bio
        if (!details.description || !details.description.includes(code)) {
            showError(errorDiv, 'Code not found in your About section. Please add it and try again.');
            return;
        }

        currentUser = {
            id: details.id,
            username: details.name,
            displayName: details.displayName,
            description: details.description,
            created: details.created
        };

        localStorage.setItem('current_user', JSON.stringify(currentUser));
        showLoggedInView();
        document.getElementById('loginCode').value = '';
        document.getElementById('loginUsername').value = '';
    } catch (error) {
        showError(errorDiv, 'Failed to verify user. Please check the username and try again.');
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
}

// Collect functionality
document.getElementById('generateCollectCodeBtn').addEventListener('click', () => {
    const code = `${Math.random().toString(36).substr(2, 9).toUpperCase()}-glosbloxymon`;
    document.getElementById('collectCode').value = code;
    document.getElementById('collectCodeHint').classList.remove('hidden');
});

document.getElementById('collectBtn').addEventListener('click', handleCollect);

async function handleCollect() {
    const username = document.getElementById('collectUsername').value.trim();
    const code = document.getElementById('collectCode').value.trim();
    const errorDiv = document.getElementById('collectError');
    const successDiv = document.getElementById('collectSuccess');
    const collectBtn = document.getElementById('collectBtn');

    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');

    if (!username) {
        showError(errorDiv, 'Please enter a username to collect');
        return;
    }
    if (!code) {
        showError(errorDiv, 'Please generate a collection code first');
        return;
    }

    collectBtn.disabled = true;
    collectBtn.textContent = 'Collecting...';

    try {
        const response = await fetch(`/api/user?username=${encodeURIComponent(username)}`);
        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            throw new Error('User not found');
        }

        const userId = data.data[0].id;
        
        // Get user details
        const detailsResponse = await fetch(`/api/userdetails?userId=${userId}`);
        const details = await detailsResponse.json();

        // Check if code is in bio
        if (!details.description || !details.description.includes(code)) {
            showError(errorDiv, 'Collection code not found in their About section. Ask them to add it!');
            return;
        }

        // Check if already collected
        if (bloxydex.some(p => p.id === details.id)) {
            showError(errorDiv, 'You already collected this player!');
            return;
        }

        const collectedPlayer = {
            id: details.id,
            username: details.name,
            displayName: details.displayName,
            description: details.description,
            created: details.created,
            dateCaught: new Date().toISOString(),
            collectionCode: code
        };

        bloxydex.push(collectedPlayer);
        localStorage.setItem('bloxydex', JSON.stringify(bloxydex));
        updateBloxydexCount();
        
        successDiv.textContent = `Successfully collected ${details.displayName}!`;
        successDiv.classList.remove('hidden');
        
        document.getElementById('collectUsername').value = '';
        document.getElementById('collectCode').value = '';
        document.getElementById('collectCodeHint').classList.add('hidden');
    } catch (error) {
        showError(errorDiv, 'Failed to collect player. Please check the username and try again.');
    } finally {
        collectBtn.disabled = false;
        collectBtn.textContent = 'Collect Player';
    }
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('current_user');
    showLoginView();
});

// Tab switching
document.getElementById('bloxydexTab').addEventListener('click', () => {
    switchTab('bloxydex');
});

document.getElementById('collectTab').addEventListener('click', () => {
    switchTab('collect');
});

function switchTab(tab) {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('collectSection').classList.add('hidden');
    document.getElementById('bloxydexSection').classList.add('hidden');

    document.getElementById('bloxydexTab').classList.remove('bg-white', 'text-purple-900');
    document.getElementById('bloxydexTab').classList.add('bg-white/10', 'text-white');
    document.getElementById('collectTab').classList.remove('bg-white', 'text-purple-900');
    document.getElementById('collectTab').classList.add('bg-white/10', 'text-white');

    if (tab === 'bloxydex') {
        document.getElementById('bloxydexSection').classList.remove('hidden');
        document.getElementById('bloxydexTab').classList.add('bg-white', 'text-purple-900');
        document.getElementById('bloxydexTab').classList.remove('bg-white/10', 'text-white');
        renderBloxydex();
    } else if (tab === 'collect') {
        document.getElementById('collectSection').classList.remove('hidden');
        document.getElementById('collectTab').classList.add('bg-white', 'text-purple-900');
        document.getElementById('collectTab').classList.remove('bg-white/10', 'text-white');
    }
}

function showLoggedInView() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('userBar').classList.remove('hidden');
    document.getElementById('tabButtons').classList.remove('hidden');
    document.getElementById('userDisplayName').textContent = currentUser.displayName;
    document.getElementById('userUsername').textContent = `@${currentUser.username}`;
    switchTab('bloxydex');
}

function showLoginView() {
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('collectSection').classList.add('hidden');
    document.getElementById('bloxydexSection').classList.add('hidden');
    document.getElementById('userBar').classList.add('hidden');
    document.getElementById('tabButtons').classList.add('hidden');
}

function updateBloxydexCount() {
    document.getElementById('bloxydexCount').textContent = bloxydex.length;
}

function renderBloxydex() {
    const container = document.getElementById('bloxydexList');
    
    if (bloxydex.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="text-6xl mb-4">🏆</div>
                <p class="text-white/70 text-lg">No players collected yet!</p>
                <p class="text-blue-200 mt-2">Start collecting players to build your Bloxydex</p>
            </div>
        `;
        return;
    }

    container.innerHTML = bloxydex.map(player => `
        <div class="bg-white/10 rounded-lg p-4 border border-white/20 mb-4">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span class="text-white text-2xl">👤</span>
                    </div>
                    <div>
                        <h3 class="text-white font-bold text-lg">${escapeHtml(player.displayName)}</h3>
                        <p class="text-blue-200 text-sm">@${escapeHtml(player.username)}</p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="flex items-center gap-1 text-yellow-300 text-sm">
                        <span>#${player.id}</span>
                    </div>
                </div>
            </div>
            
            <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2 text-blue-200">
                    <span>📅</span>
                    <span>Caught: ${new Date(player.dateCaught).toLocaleDateString()}</span>
                </div>
                <div class="text-white/70">
                    <span class="font-semibold">Account Created:</span> ${new Date(player.created).toLocaleDateString()}
                </div>
                ${player.description ? `
                    <div class="text-white/70 mt-2 p-2 bg-white/5 rounded">
                        <span class="font-semibold">Bio:</span> ${escapeHtml(player.description.slice(0, 100))}${player.description.length > 100 ? '...' : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function showError(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
