// 禁止右键菜单
document.addEventListener('contextmenu', e => e.preventDefault());

// 禁止常见开发者快捷键（静默版）
document.addEventListener('keydown', e => {
  if (
    e.key === 'F12' || 
    (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
    (e.ctrlKey && ['U', 'S'].includes(e.key.toUpperCase()))
  ) {
    e.preventDefault();
    e.stopPropagation();
  }
}, true);



(function() {
  // ========== 配置 ==========
  const config = {
    checkInterval: 1200,
    sizeThreshold: 160,            // 按需调整
    onDetect: (detail) => {
      console.warn('[DevToolsDetect]', detail);
    },
    ignoreMobile: true,
    redirectUrl: '/404.html'
  };

  // 移动端跳过
  if (config.ignoreMobile && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return;

  // ========== 状态 ==========
  let detected = false;
  let lastDetectInfo = null;

  function markDetected(reason, meta = {}) {
    if (detected) return;
    detected = true;
    lastDetectInfo = { reason, meta, time: new Date().toISOString(), ua: navigator.userAgent };

    if (typeof config.onDetect === 'function') {
      try { config.onDetect(lastDetectInfo); } catch (_) {}
    }

    forceRedirect();
  }

  function forceRedirect() {
    try {
      history.replaceState(null, '', config.redirectUrl);
      window.location.href = config.redirectUrl;
    } catch (_) {
      window.location.href = config.redirectUrl;
    }
  }

  // ========== 1) 控制台 getter 检测 ==========
  (function consoleBait() {
    try {
      const bait = new Image();
      Object.defineProperty(bait, 'id', {
        get() {
          markDetected('console-getter');
          return '';
        }
      });
      setInterval(() => {
        try { console.log(bait); } catch (_) {}
      }, config.checkInterval);
    } catch (_) {}
  })();

  // ========== 2) 尺寸差检测（dock、Lab、面板） ==========
  (function sizeCheck() {
    setInterval(() => {
      try {
        const wdiff = Math.abs(window.outerWidth - window.innerWidth);
        const hdiff = Math.abs(window.outerHeight - window.innerHeight);

        if (wdiff > config.sizeThreshold || hdiff > config.sizeThreshold) {
          markDetected('size-diff', { wdiff, hdiff });
        }
      } catch (_) {}
    }, config.checkInterval);
  })();

  // ========== 3) RegExp toString 检测 ==========
  (function regExpCheck() {
    try {
      const reg = /./;
      if (reg.toString() !== '/./') {
        markDetected('regexp-tostring');
      }
    } catch (_) {}
  })();

  // ========== 4) Function toString 检测 ==========
  (function funcToStringCheck() {
    try {
      const func = function() {};
      if (func.toString.toString().includes('[native code]') === false) {
        markDetected('func-tostring');
      }
    } catch (_) {}
  })();

  // 初次调用一次
  regExpCheck();
  funcToStringCheck();

  // Debug API
  window.__DevToolsDetect = {
    isDetected: () => detected,
    lastInfo: () => lastDetectInfo,
    reset: () => { detected = false; lastDetectInfo = null; }
  };

})();
