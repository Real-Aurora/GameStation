// Fetch games data
let gamesData = [];
let currentCategory = 'All';

async function fetchGamesData() {
    try {
        const response = await fetch('games.json');
        const data = await response.json();
        gamesData = data.games;
        renderCategories(data.categories);
        renderGames(gamesData);
    } catch (error) {
        console.error('Error loading games data:', error);
    }
}

// Render categories
function renderCategories(categories) {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = categories.map(category => `
        <button class="category-btn ${category === 'All' ? 'active' : ''}" 
                data-category="${category}">
            ${category}
        </button>
    `).join('');

    // Add event listeners to category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.category;
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterGames();
        });
    });
}

// Render games
function renderGames(games) {
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.innerHTML = games.map(game => `
        <div class="game-card" data-category="${game.category}">
            <img src="${game.thumbnail}" alt="${game.title}" class="game-thumbnail">
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
                <p class="game-description">${game.description}</p>
                <button class="play-btn" data-game-id="${game.id}">Play Now</button>
            </div>
        </div>
    `).join('');

    // Add event listeners to play buttons
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const gameId = btn.dataset.gameId;
            openGameModal(gameId);
        });
    });
}

// Filter games by category
function filterGames() {
    const filteredGames = currentCategory === 'All' 
        ? gamesData 
        : gamesData.filter(game => game.category === currentCategory);
    renderGames(filteredGames);
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredGames = gamesData.filter(game => 
        game.title.toLowerCase().includes(searchTerm) || 
        game.description.toLowerCase().includes(searchTerm)
    );
    renderGames(filteredGames);
});

// Modal functionality
function openGameModal(gameId) {
    const game = gamesData.find(g => g.id === gameId);
    if (!game) return;

    const modal = document.getElementById('gameModal');
    const modalContent = modal.querySelector('.modal-content');
    const frameContainer = modal.querySelector('.game-frame-container');
    
    // 1) 针对 game3 特殊处理：加 fullscreen 类
    if (game.id === 'game3') {
        modalContent.classList.add('fullscreen');
    } else {
        modalContent.classList.remove('fullscreen');
    }

    // 设置标题并显示加载中状态
    const modalTitle = document.getElementById('modalTitle');
    modalTitle.textContent = game.title;
    frameContainer.innerHTML = '<div class="loading-spinner">Loading game...</div>';
    modal.style.display = 'block';

    // 设置游戏容器样式
    if (game.aspectRatio === '1:1') {
        frameContainer.style.width = '80vh';
        frameContainer.style.height = '80vh';
        frameContainer.style.margin = '0 auto';
    } else if (game.aspectRatio === '4:3') {
        frameContainer.style.width = 'calc(80vh * 4 / 3)';
        frameContainer.style.height = '80vh';
        frameContainer.style.margin = '0 auto';
    } else {
        frameContainer.style.width = '100%';
        frameContainer.style.height = '80vh';
        frameContainer.style.margin = '0';
    }
    
    // 延迟创建iframe，确保UI准备就绪
    setTimeout(() => {
        try {
            // 使用sandbox属性增加安全性，并允许必要的权限
            frameContainer.innerHTML = `
                <iframe 
                    src="${game.iframeUrl}" 
                    frameborder="0" 
                    allowfullscreen="true"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    style="width: 100%; height: 100%; border: none; display: block;"
                ></iframe>
            `;
        } catch (e) {
            frameContainer.innerHTML = '<div class="error-message">无法加载游戏，请尝试刷新页面或选择其他游戏。</div>';
            console.error('Error loading iframe:', e);
        }
    }, 500);
}

// Close modal
document.getElementById('closeModal').addEventListener('click', () => {
    const modal = document.getElementById('gameModal');
    const frameContainer = document.querySelector('.game-frame-container');
    modal.style.display = 'none';
    frameContainer.innerHTML = '';
});

// Close modal when clicking outside
document.getElementById('gameModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        const modal = document.getElementById('gameModal');
        const frameContainer = document.querySelector('.game-frame-container');
        modal.style.display = 'none';
        frameContainer.innerHTML = '';
    }
});

// Initialize the application
document.addEventListener('DOMContentLoaded', fetchGamesData); 