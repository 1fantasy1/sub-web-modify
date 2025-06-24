// public/js/script.js

// 添加卡片悬停动画效果
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        // 移除可能存在的旧样式，确保平滑过渡
        card.style.transform = '';
        void card.offsetWidth; // 强制浏览器重绘，确保动画生效
        card.style.transform = 'translateY(-10px)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// 链接点击提示
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // 阻止默认的链接跳转行为
        const href = link.href;
        // 使用更友好的方式显示提示，例如模态框或自定义提示
        // 这里为了保持与之前一致，仍使用 alert，但请注意其用户体验
        if (confirm(`您即将访问：\n${href}\n\n请确认链接安全性后继续。`)) {
            window.location.href = href; // 如果用户点击“确定”，则跳转
        }
    });
});
