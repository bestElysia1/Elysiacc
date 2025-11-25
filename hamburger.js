/* hamburger.js */

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById('hamburger-menu');
  const menu = document.getElementById('dropdown');
  let hideTimer;
  let isMenuAnimating = false;

  // ============================
  // 1. 菜单开关逻辑 (含动画处理)
  // ============================
  function toggleMenu() {
    if (isMenuAnimating) return; // 防止狂点导致动画错乱

    const isOpen = menu.classList.contains('is-open');

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function openMenu() {
    menu.classList.remove('is-closing');
    menu.classList.add('is-open');
    // 显示后重置自动隐藏计时器
    resetHideTimer();
  }

  function closeMenu() {
    // 标记开始关闭动画
    isMenuAnimating = true;
    menu.classList.remove('is-open');
    menu.classList.add('is-closing');

    // 监听动画结束事件，动画播完后再完全隐藏
    menu.addEventListener('animationend', function onEnd() {
      menu.classList.remove('is-closing');
      isMenuAnimating = false;
      menu.removeEventListener('animationend', onEnd);
    }, { once: true });
  }

  // 绑定点击事件
  if (hamburger) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation(); // 阻止冒泡
      toggleMenu();
    });
  }

  // ============================
  // 2. 点击外部关闭菜单
  // ============================
  document.addEventListener('click', (event) => {
    // 如果菜单是打开的，且点击目标既不是菜单也不是按钮
    if (menu.classList.contains('is-open') && 
        !menu.contains(event.target) && 
        !hamburger.contains(event.target)) {
      closeMenu();
    }
  });

  // ============================
  // 3. 按钮自动隐藏/显示逻辑 (30秒无操作)
  // ============================
  function hideHamburger() {
    // 如果菜单正开着，不要隐藏按钮
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
    hideTimer = setTimeout(hideHamburger, 30000); // 30秒
  }

  // 监听交互来重置计时器
  ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'].forEach(evt => {
    window.addEventListener(evt, showHamburger);
  });

  // 初始化计时器
  showHamburger();
});
