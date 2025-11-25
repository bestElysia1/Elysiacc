/* hamburger.js - Logic for Elysia Navigation */

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById('hamburger-menu');
  const menu = document.getElementById('dropdown');
  
  // 30秒无操作自动隐藏按钮
  let hideTimer;
  const AUTO_HIDE_DELAY = 30000;

  // ============================
  // 1. 菜单开关逻辑
  // ============================
  function toggleMenu() {
    if (!menu) return;

    // 切换 .show 类触发 CSS 动画
    const isOpening = !menu.classList.contains('show');
    
    if (isOpening) {
      menu.classList.add('show');
      // 打开时，给按钮一个微小的缩放反馈
      if (hamburger) {
        hamburger.style.transform = "scale(0.92)";
        setTimeout(() => { hamburger.style.transform = ""; }, 200);
      }
      // 菜单打开时，重置并暂停自动隐藏
      showHamburger();
    } else {
      menu.classList.remove('show');
    }
  }

  function closeMenu() {
    if (menu) menu.classList.remove('show');
  }

  // ============================
  // 2. 事件监听
  // ============================
  
  // 按钮点击
  if (hamburger) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation(); // 阻止冒泡
      toggleMenu();
    });
  }

  // 点击外部关闭
  document.addEventListener('click', (e) => {
    // 只有当菜单显示时才检测
    if (menu && menu.classList.contains('show')) {
      // 点击目标既不是菜单内部，也不是按钮本身
      if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
        closeMenu();
      }
    }
  });

  // ============================
  // 3. 按钮自动隐藏逻辑 (沉浸模式)
  // ============================
  function hideHamburger() {
    // 如果菜单是打开的，绝对不要隐藏按钮
    if (menu && menu.classList.contains('show')) return;
    
    if (hamburger) {
      hamburger.classList.add('fade-out');
    }
  }

  function showHamburger() {
    if (hamburger) {
      hamburger.classList.remove('fade-out');
    }
    // 重置计时器
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideHamburger, AUTO_HIDE_DELAY);
  }

  // 监听所有用户交互，重置计时器
  const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
  events.forEach(evt => {
    window.addEventListener(evt, showHamburger);
  });

  // 初始化启动
  showHamburger();
});
