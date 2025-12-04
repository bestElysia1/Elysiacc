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
  // 4. Google 翻译集成逻辑 (保持不变)
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
  // 5. 语言切换与 Cookie 控制 (核心修复)
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
      document.cookie = name + "=" + value + ";path=/";
  }

  // 【功能】彻底清除 Google 翻译状态（不仅仅是 Cookie，还有 Storage）
  function clearTranslationState() {
      // 1. 清除当前域名的 cookie
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // 2. 清除带域名的 cookie (防止子域名干扰)
      const domain = document.domain;
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + domain + "; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=." + domain + "; path=/;";

      // 3. 【关键】清除 localStorage，Google 经常把设置存在这里
      localStorage.removeItem('googtrans');
      sessionStorage.removeItem('googtrans');
  }

  // UI 更新逻辑
  const currentLangCookie = getCookie('googtrans');
  const langSpan = langSwitch ? langSwitch.querySelector('.lang-text') : null;
  const langIcon = langSwitch ? langSwitch.querySelector('.lang-badge') : null;

  // 判断当前是否处于“非中文”状态 (Cookie 包含 /en)
  const isTranslated = currentLangCookie && (currentLangCookie.includes('/en') || currentLangCookie.includes('en'));

  if (langSpan && langIcon) {
      if (isTranslated) {
          // 当前是英文 -> 按钮显示“中文” (实际功能是关闭翻译)
          langSpan.innerText = '中文'; 
          langIcon.innerText = 'CN';
      } else {
          // 当前是默认(中文) -> 按钮显示“EN” (实际功能是开启翻译)
          langSpan.innerText = 'EN';
          langIcon.innerText = '文';
      }
  }

  // 点击事件
  if (langSwitch) {
      langSwitch.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation(); 
          
          if (isTranslated) {
              // 逻辑：如果当前已经翻译了，点击“中文”意味着“销毁翻译配置”，回归原生页面
              clearTranslationState();
          } else {
              // 逻辑：如果当前是原生页面，点击“EN”意味着“开启英文翻译”
              setCookie('googtrans', '/zh-CN/en', 1);
          }

          // 刷新页面生效
          location.reload();
      });
  }
});
