/* hamburger.js - Logic for Dropdown, Auto-hide & Google Translate */

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
    const isOpening = !menu.classList.contains('show');
    if (isOpening) {
      menu.classList.remove('hide'); // 确保移除隐藏类
      menu.classList.add('show');
      if (hamburger) {
        hamburger.style.transform = "scale(0.92)";
        setTimeout(() => { hamburger.style.transform = ""; }, 200);
      }
      showHamburger();
    } else {
      menu.classList.remove('show');
      // 可选：如果要配合 CSS 的退出动画，可以在这里加 class
    }
  }

  function closeMenu() {
    if (menu && menu.classList.contains('show')) {
      menu.classList.remove('show');
    }
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

  // 点击页面其他地方关闭菜单
  document.addEventListener('click', (e) => {
    if (menu && menu.classList.contains('show')) {
      if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
        closeMenu();
      }
    }
  });

  // 🔥【新增】点击菜单内部的链接后，自动收起菜单
  // 这对“登录”按钮特别重要，否则点击后弹窗出来了，背景里的菜单还开着
  if (menu) {
    menu.addEventListener('click', (e) => {
      // 如果点击的是链接 (A标签) 或其子元素
      if (e.target.closest('a')) {
        //稍微延迟一点点关闭，让用户看到点击反馈
        setTimeout(closeMenu, 150); 
      }
    });
  }

  // ============================
  // 3. 按钮自动隐藏逻辑
  // ============================
  function hideHamburger() {
    // 如果菜单开着，或者弹窗开着(如果有overlay)，就不隐藏汉堡按钮
    if (menu && menu.classList.contains('show')) return;
    const modal = document.getElementById('login-modal-overlay');
    if (modal && modal.classList.contains('active')) return;

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
  // 4. Google 翻译集成逻辑
  // =========================================
  if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);

      const div = document.createElement('div');
      div.id = 'google_translate_element';
      div.style.display = 'none';
      document.body.insertBefore(div, document.body.firstChild);
  }

  window.googleTranslateElementInit = function() {
      new google.translate.TranslateElement({
          pageLanguage: 'zh-CN',
          includedLanguages: 'en,zh-CN',
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
      }, 'google_translate_element');
  };

  const observer = new MutationObserver((mutations) => {
      if (document.body.style.top !== '0px' && document.body.style.top !== '') {
          document.body.style.top = '0px';
          document.body.style.position = 'static';
      }
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
  observer.observe(document.body, { attributes: true, childList: true, subtree: true });
  observer.observe(document.documentElement, { attributes: true });

  // =========================================
  // 5. 语言切换与 Cookie 控制
  // =========================================

  // 获取 Cookie
  function getCookie(name) {
      const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
      return v ? v[2] : null;
  }

  // 设置 Cookie
  function setCookie(name, value, days) {
      const d = new Date();
      d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
      const domain = document.domain;
      document.cookie = name + "=" + value + ";path=/;expires=" + d.toUTCString();
      document.cookie = name + "=" + value + ";path=/;domain=" + domain + ";expires=" + d.toUTCString();
      document.cookie = name + "=" + value + ";path=/;domain=." + domain + ";expires=" + d.toUTCString();
  }

  // UI 更新逻辑
  const currentLangCookie = getCookie('googtrans');
  const langSpan = langSwitch ? langSwitch.querySelector('.lang-text') : null;

  // 判断是否是英文状态
  const isEnglish = currentLangCookie && (currentLangCookie.includes('/en') || currentLangCookie.includes('en'));

  // 更新按钮文字
  if (langSpan) {
      if (isEnglish) {
          langSpan.innerText = 'CN'; 
      } else {
          langSpan.innerText = 'EN';
      }
  }

  // 点击事件
  if (langSwitch) {
      langSwitch.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation(); 
          
          if (isEnglish) {
              // 切换回中文
              setCookie('googtrans', '/zh-CN/zh-CN', 1);
              localStorage.removeItem('googtrans');
          } else {
              // 切换到英文
              setCookie('googtrans', '/zh-CN/en', 1);
          }

          location.reload();
      });
  }
});
