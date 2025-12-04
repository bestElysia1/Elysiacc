document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById('hamburger-menu');
  const menu = document.getElementById('dropdown');
  const langSwitch = document.getElementById('nav-lang-switch');
  
  // 30秒无操作自动隐藏按钮
  let hideTimer;
  const AUTO_HIDE_DELAY = 30000;

  // ============================
  // 1. 菜单开关逻辑 (保持不变)
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
  // 2. 交互事件监听 (保持不变)
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
  // 3. 按钮自动隐藏逻辑 (保持不变)
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
  // 5. 语言切换与 Cookie 控制 (修复的核心部分)
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

  // 【新增】彻底清除 Google 翻译痕迹的函数
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

  // 判断当前是否处于“非中文”状态
  // 只要 cookie 包含 /en 或者 /zh-CN/en 即视为英文模式
  const isTranslated = currentLangCookie && (currentLangCookie.includes('/en') || currentLangCookie.includes('en'));

  if (langSpan && langIcon) {
      if (isTranslated) {
          // 当前是英文 -> 按钮显示“关闭翻译/中文”
          langSpan.innerText = '关闭翻译'; // 也可以写 '中文'
          langIcon.innerText = '×';      // 用叉号表示关闭，或者写 'CN'
          langIcon.style.borderColor = "#ff9999"; // 给个红色边框提示这是关闭
      } else {
          // 当前是默认(中文) -> 按钮显示“EN”
          langSpan.innerText = 'EN';
          langIcon.innerText = '文';
          langIcon.style.borderColor = ""; // 恢复默认颜色
      }
  }

  // 点击事件
  if (langSwitch) {
      langSwitch.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation(); 
          
          if (isTranslated) {
              // 【核心逻辑变化】
              // 如果当前是翻译状态，不要“翻译回中文”，而是“炸毁所有配置”
              // 这样浏览器就会以原生代码加载页面（即中文）
              clearTranslationState();
          } else {
              // 开启英文翻译
              setCookie('googtrans', '/zh-CN/en', 1);
          }

          // 刷新页面生效
          location.reload();
      });
  }
});
