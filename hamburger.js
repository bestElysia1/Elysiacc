/* hamburger.js */

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById('hamburger-menu');
  const menu = document.getElementById('dropdown');
  
  // 自动隐藏配置
  let hideTimer;
  const AUTO_HIDE_TIME = 30000;

  // ============================
  // 1. 菜单开关 (Toggle)
  // ============================
  function toggleMenu() {
    // 检查是否有 show 类
    const isShow = menu.classList.contains('show');
    
    if (isShow) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function openMenu() {
    menu.classList.add('show');
    // 按钮本身轻微反馈
    if(hamburger) hamburger.style.transform = "scale(0.92)";
    setTimeout(() => { if(hamburger) hamburger.style.transform = ""; }, 150);
    resetHideTimer();
  }

  function closeMenu() {
    menu.classList.remove('show');
  }

  // ============================
  // 2. 点击事件绑定
  // ============================
  if (hamburger) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation(); // 阻止冒泡
      toggleMenu();
    });
  }

  // 点击外部关闭
  document.addEventListener('click', (e) => {
    // 如果点击的不是菜单内部，且不是汉堡按钮，且菜单是打开的
    if (menu.classList.contains('show') && 
        !menu.contains(e.target) && 
        !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  // ============================
  // 3. 自动隐藏逻辑
  // ============================
  function hideHamburger() {
    // 菜单打开时禁止隐藏按钮
    if (menu.classList.contains('show')) return;
    if (hamburger) hamburger.classList.add('fade-out');
  }

  function showHamburger() {
    if (hamburger) hamburger.classList.remove('fade-out');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideHamburger, AUTO_HIDE_TIME);
  }

  // 监听各种操作以重置计时器
  ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'].forEach(evt => {
    window.addEventListener(evt, showHamburger);
  });

  // 初始化
  showHamburger();
});
