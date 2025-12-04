/* hamburger.js - Logic for Elysia Navigation & Google Translate Integration */

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById('hamburger-menu');
  const menu = document.getElementById('dropdown');
  const langSwitch = document.getElementById('nav-lang-switch');
  
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
  // 2. 交互事件监听
  // ============================
  
  if (hamburger) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });
  }

  document.addEventListener('click', (e) => {
    if (menu && menu.classList.contains('show')) {
      if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
        closeMenu();
      }
    }
  });

  // ============================
  // 3. 按钮自动隐藏逻辑 (沉浸模式)
  // ============================
  function hideHamburger() {
    if (menu && menu.classList.contains('show')) return;
    if (hamburger) hamburger.classList.add('fade-out');
  }

  function showHamburger() {
    if (hamburger) hamburger.classList.remove('fade-out');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideHamburger, AUTO_HIDE_DELAY);
  }

  const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
  events.forEach(evt => {
    window.addEventListener(evt, showHamburger);
  });
  showHamburger();

  // =========================================
  // 4. Google 翻译集成逻辑 (核弹修复版)
  // =========================================

  // 4.1 动态注入 Google 翻译脚本
  if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);

      // 创建隐藏的容器
      const div = document.createElement('div');
      div.id = 'google_translate_element';
      div.style.display = 'none';
      document.body.insertBefore(div, document.body.firstChild);
  }

  // 4.2 初始化配置
  window.googleTranslateElementInit = function() {
      new google.translate.TranslateElement({
          pageLanguage: 'zh-CN',
          includedLanguages: 'en,zh-CN',
          // 使用 SIMPLE 布局，减少原生横幅出现的概率
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
      }, 'google_translate_element');
  };

  // 4.3 【核弹监控】防止 Google 强行修改 body 样式或插入横幅
  const observer = new MutationObserver((mutations) => {
      // A. 强制重置 body 的 top 样式 (防止页面下沉)
      if (document.body.style.top !== '0px' && document.body.style.top !== '') {
          document.body.style.top = '0px';
          document.body.style.position = 'static';
      }
      
      // B. 暴力隐藏所有谷歌相关的 iframe 和横幅
      const banners = document.querySelectorAll('.goog-te-banner-frame, iframe.skiptranslate, body > .skiptranslate');
      banners.forEach(el => {
          if (el.style.display !== 'none') {
              el.style.display = 'none';
              el.style.visibility = 'hidden';
              el.style.height = '0';
              el.style.width = '0';
              el.style.opacity = '0';
              el.style.pointerEvents = 'none';
          }
      });
  });

  // 开始监控
  observer.observe(document.body, { attributes: true, childList: true, subtree: true });
  observer.observe(document.documentElement, { attributes: true });

  // =========================================
  // 5. 语言切换与 Cookie 控制
  // =========================================

  function getCookie(name) {
      const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
      return v ? v[2] : null;
  }

  function setCookie(name, value, days) {
      const d = new Date();
      d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
      document.cookie = name + "=" + value + ";path=/";
  }

  // 根据当前状态更新按钮文字
  const currentLangCookie = getCookie('googtrans');
  const langSpan = langSwitch ? langSwitch.querySelector('.lang-text') : null;
  const langIcon = langSwitch ? langSwitch.querySelector('.lang-badge') : null;

  if (langSpan && langIcon) {
      if (currentLangCookie && currentLangCookie.includes('/en')) {
          // 当前是英文，显示切回中文的提示
          langSpan.innerText = '中文';
          langIcon.innerText = 'CN';
      } else {
          // 当前是中文，显示切到英文的提示
          langSpan.innerText = 'EN';
          langIcon.innerText = '文';
      }
  }

  // 点击按钮切换语言
  if (langSwitch) {
      langSwitch.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation(); // 防止菜单立即关闭，虽然会刷新
          
          const currentCookie = getCookie('googtrans');

          if (currentCookie && currentCookie.includes('/en')) {
              // 切换回中文：清除 Cookie
              setCookie('googtrans', '/zh-CN/zh-CN', 0);
              // 彻底清除可能的残留
              document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + document.domain + "; path=/;";
          } else {
              // 切换到英文
              setCookie('googtrans', '/zh-CN/en', 1);
          }

          // 刷新页面以应用
          location.reload();
      });
  }
});
