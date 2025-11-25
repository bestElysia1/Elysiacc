/* hamburger.js - Logic for the physics menu */

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById('hamburger-menu');
  const menu = document.getElementById('dropdown');
  
  // 配置参数
  const AUTO_HIDE_DELAY = 30000; // 30秒自动隐藏按钮
  let hideTimer;
  let isAnimating = false;

  // ============================
  // 1. 核心开关逻辑
  // ============================
  function toggleMenu() {
    if (isAnimating) return; // 动画播放中禁止操作，防止鬼畜

    const isOpen = menu.classList.contains('is-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function openMenu() {
    isAnimating = true;
    menu.classList.remove('is-closing');
    menu.classList.add('is-open');
    
    // 打开时，按钮本身也可以做一个微小的交互
    if(hamburger) hamburger.style.transform = "scale(0.9)";
    setTimeout(() => { if(hamburger) hamburger.style.transform = ""; }, 150);

    // 动画结束后解除锁定
    menu.addEventListener('animationend', () => {
      isAnimating = false;
    }, { once: true });

    resetHideTimer(); // 打开菜单时重置隐藏计时器
  }

  function closeMenu() {
    isAnimating = true;
    menu.classList.remove('is-open');
    menu.classList.add('is-closing');

    // 监听退出动画结束
    menu.addEventListener('animationend', function onEnd() {
      menu.classList.remove('is-closing');
      isAnimating = false;
    }, { once: true });
  }

  // ============================
  // 2. 事件绑定
  // ============================
  if (hamburger) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });
  }

  // 点击空白处关闭
  document.addEventListener('click', (event) => {
    // 只有当菜单打开，且点击位置不在菜单内也不在按钮内时才关闭
    if (menu.classList.contains('is-open') && 
        !menu.contains(event.target) && 
        !hamburger.contains(event.target)) {
      closeMenu();
    }
  });

  // ============================
  // 3. 按钮自动沉浸模式 (自动隐藏)
  // ============================
  function hideHamburger() {
    // 菜单打开时绝对不隐藏按钮
    if (menu.classList.contains('is-open')) return;
    
    if (hamburger) {
      hamburger.classList.add('fade-out');
    }
  }

  function showHamburger() {
    if (hamburger) {
      hamburger.classList.remove('fade-out');
    }
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideHamburger, AUTO_HIDE_DELAY);
  }

  // 任何操作都唤醒按钮
  ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'].forEach(evt => {
    window.addEventListener(evt, showHamburger);
  });

  // 初始化
  showHamburger();
});
