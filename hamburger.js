/* hamburger.js */

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById('hamburger-menu');
  const menu = document.getElementById('dropdown');
  
  // 30秒无操作后自动隐藏按钮
  const AUTO_HIDE_DELAY = 30000;
  let hideTimer;

  // ============================
  // 1. 核心开关逻辑
  // ============================
  function toggleMenu() {
    if (!menu) return;
    
    // 切换 show 类
    const isShowing = menu.classList.toggle('show');
    
    // 如果打开了菜单，给按钮一个微小的缩放反馈，增加交互实感
    if (isShowing && hamburger) {
      hamburger.style.transform = "scale(0.9)";
      setTimeout(() => {
        // 清除内联样式，恢复 CSS 定义的 hover/default 状态
        hamburger.style.transform = ""; 
      }, 200);
      
      resetHideTimer(); // 打开菜单时重置计时器
    }
  }

  function closeMenu() {
    if (menu) menu.classList.remove('show');
  }

  // ============================
  // 2. 事件绑定
  // ============================
  
  // 按钮点击
  if (hamburger) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation(); // 防止冒泡触发 document 点击
      toggleMenu();
    });
  }

  // 点击空白处关闭
  document.addEventListener('click', (e) => {
    // 只有当菜单显示时才检测
    if (menu && menu.classList.contains('show')) {
      // 如果点击目标既不是菜单内部，也不是汉堡按钮
      if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
        closeMenu();
      }
    }
  });

  // ============================
  // 3. 自动隐藏按钮 (沉浸模式)
  // ============================
  function hideHamburger() {
    // 如果菜单正开着，绝对不隐藏按钮
    if (menu && menu.classList.contains('show')) return;
    
    if (hamburger) hamburger.classList.add('fade-out');
  }

  function showHamburger() {
    if (hamburger) hamburger.classList.remove('fade-out');
    
    // 重置倒计时
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideHamburger, AUTO_HIDE_DELAY);
  }

  // 监听用户活动，唤醒按钮
  ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'].forEach(evt => {
    window.addEventListener(evt, showHamburger);
  });

  // 初始化启动
  showHamburger();
});
