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
      menu.classList.add('show');
      if (hamburger) {
        hamburger.style.transform = "scale(0.92)";
        setTimeout(() => { hamburger.style.transform = ""; }, 200);
      }
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
  // 3. 按钮自动隐藏逻辑
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
  // 5. 语言切换与 Cookie 控制 (修复UI更新问题)
  // =========================================

  // 获取 Cookie
  function getCookie(name) {
      const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
      return v ? v[2] : null;
  }

  // 设置 Cookie (增加 domain 处理，确保覆盖)
  function setCookie(name, value, days) {
      const d = new Date();
      d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
      
      const domain = document.domain;
      // 设置根路径
      document.cookie = name + "=" + value + ";path=/;expires=" + d.toUTCString();
      // 设置带域名的路径
      document.cookie = name + "=" + value + ";path=/;domain=" + domain + ";expires=" + d.toUTCString();
      document.cookie = name + "=" + value + ";path=/;domain=." + domain + ";expires=" + d.toUTCString();
  }

  // UI 更新逻辑
  const currentLangCookie = getCookie('googtrans');
  const langSpan = langSwitch ? langSwitch.querySelector('.lang-text') : null;
  // 注意：这里删除了对 langIcon 的获取，因为HTML中已经没有这个元素了

  // 判断是否是英文状态 (Cookie 包含 /en)
  const isEnglish = currentLangCookie && (currentLangCookie.includes('/en') || currentLangCookie.includes('en'));

  // 只要找到文字 span 就进行更新
  if (langSpan) {
      if (isEnglish) {
          // 当前是英文 -> 按钮显示 CN (提示可以切回中文)
          langSpan.innerText = 'CN'; 
      } else {
          // 当前是中文 -> 按钮显示 EN (提示可以切到英文)
          langSpan.innerText = 'EN';
      }
  }

  // 点击事件
  if (langSwitch) {
      langSwitch.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation(); 
          
          if (isEnglish) {
              // 切换回中文：强制设置中文对中文翻译，并清除缓存
              setCookie('googtrans', '/zh-CN/zh-CN', 1);
              localStorage.removeItem('googtrans');
          } else {
              // 切换到英文
              setCookie('googtrans', '/zh-CN/en', 1);
          }

          // 刷新页面生效
          location.reload();
      });
  }
});
