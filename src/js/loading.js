// 页面加载状态管理
document.addEventListener('DOMContentLoaded', function() {
    // 移除加载遮罩
    const pageLoader = document.querySelector('.page-loader');
    if (pageLoader) {
        setTimeout(() => {
            pageLoader.classList.add('hidden');
            setTimeout(() => pageLoader.remove(), 500);
        }, 500);
    }
});