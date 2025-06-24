// public/js/script.js

// --- Custom Confirm Modal Logic ---
const customConfirmModal = document.getElementById('custom-confirm-modal');
const modalOverlay = document.querySelector('.modal-overlay');
const modalUrlElement = document.getElementById('modal-url');
const continueBtn = document.getElementById('modal-continue-btn');
const cancelBtn = document.getElementById('modal-cancel-btn');

let currentHref = ''; // 用于存储当前点击的链接的href

// 显示自定义模态框
function showCustomConfirm(href) {
    currentHref = href;
    modalUrlElement.textContent = href;
    customConfirmModal.style.display = 'flex';

    // 添加动画效果
    setTimeout(() => {
        document.querySelector('.modal-content').style.transform = 'scale(1)';
        document.querySelector('.modal-content').style.opacity = '1';
    }, 10);

    // 添加心跳动画
    document.querySelector('.icon-container').style.animation = 'pulse 2s infinite';
}

// 隐藏自定义模态框
function hideCustomConfirm() {
    const modalContent = document.querySelector('.modal-content');
    modalContent.style.transform = 'scale(0.95)';
    modalContent.style.opacity = '0';

    setTimeout(() => {
        customConfirmModal.style.display = 'none';
        // 移除心跳动画
        document.querySelector('.icon-container').style.animation = 'none';
    }, 300);
}


// 为模态框按钮和遮罩层添加事件监听器
continueBtn.addEventListener('click', () => {
    if (currentHref) {
        window.location.href = currentHref; // 执行跳转
    }
    hideCustomConfirm(); // 隐藏模态框
});

cancelBtn.addEventListener('click', () => {
    hideCustomConfirm(); // 隐藏模态框，不跳转
});

modalOverlay.addEventListener('click', () => {
    hideCustomConfirm(); // 点击遮罩层也隐藏模态框
});

// --- Original Card Hover Logic ---
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// --- Modified Link Click Logic ---
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.href;

        // 检查href是否有效，并且不是页面内的锚点链接（例如 #section）
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
            return; // 对于这些链接，不触发模态框，让其按原样执行
        }

        e.preventDefault(); // 阻止默认的链接跳转行为
        showCustomConfirm(href); // 显示自定义确认框
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const modalContent = document.querySelector('.modal-content');
    modalContent.style.transform = 'scale(0.95)';
    modalContent.style.opacity = '0';
    modalContent.style.transition = 'all 0.3s ease-out';
});