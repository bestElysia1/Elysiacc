/* elysiastyle.js - Main interactions for Elysia Guide */

document.addEventListener("DOMContentLoaded", () => {
  
  // ======================================
  // 1. 倒计时逻辑 (Countdown)
  // ======================================
  const target = new Date('2025-12-31T23:59:59+08:00').getTime();
  const el = document.getElementById('countdownNums');
  
  if (el) {
    function updateCount() {
      const now = Date.now();
      let diff = target - now;
      if (diff < 0) diff = 0;
      
      const days = Math.floor(diff / (24*60*60*1000));
      diff -= days * 24*60*60*1000;
      
      const hrs = Math.floor(diff / (60*60*1000));
      diff -= hrs * 60*60*1000;
      
      const mins = Math.floor(diff / (60*1000));
      diff -= mins * 60*1000;
      
      const secs = Math.floor(diff / 1000);
      
      el.textContent = `${days} 天 ${String(hrs).padStart(2,'0')} : ${String(mins).padStart(2,'0')} : ${String(secs).padStart(2,'0')}`;
    }
    updateCount(); 
    setInterval(updateCount, 1000);
  }

  // ======================================
  // 2. 裸眼3D Banner 交互
  // ======================================
  const banner3d = document.getElementById("banner3d");
  const bannerLayer = banner3d?.querySelector(".banner-layer");
  const bannerGlow = banner3d?.querySelector(".banner-glow");

  if (banner3d && bannerLayer && bannerGlow) {
    // 桌面端：鼠标 3D 视差
    if (window.matchMedia("(pointer:fine)").matches) {
      banner3d.addEventListener("mousemove", e => {
        const rect = banner3d.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotY = ((x / rect.width) - 0.5) * 16;
        const rotX = ((y / rect.height) - 0.5) * -12;
        
        bannerLayer.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
        bannerGlow.style.background = `radial-gradient(circle at ${x / rect.width * 100}% ${y / rect.height * 100}%, rgba(255,255,255,0.35), transparent 70%)`;
      });

      banner3d.addEventListener("mouseleave", () => {
        bannerLayer.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
        bannerGlow.style.background = "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.25), transparent 70%)";
      });
    }

    // 移动端：滚动视差（假3D）
    if (window.matchMedia("(pointer:coarse)").matches) {
      window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;
        const rotX = Math.min(scrollY / 30, 10);
        const rotY = Math.sin(scrollY / 180) * 8;
        bannerLayer.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
      });
    }
  }

  // ======================================
  // 3. 视频自动切换逻辑 (Elysia Video)
  // ======================================
  const videoA = document.getElementById("videoA");
  const videoB = document.getElementById("videoB");

  if (videoA && videoB) {
    const videos = [
      "assets/elysiatest.mp4", "assets/elysiatest2.mp4", "assets/elysiatest3.mp4",
      "assets/elysiatest4.mp4", "assets/elysiatest5.mp4", "assets/elysiatest6.mp4",
      "assets/elysiatest7.mp4", "assets/elysiatest8.mp4", "assets/elysiatest9.mp4.MOV",
      "assets/elysiatest10.mp4.MOV", "assets/elysiatest11.mp4.MOV", "assets/elysiatest12.mov",
      "assets/elysiatest13.MOV", "assets/elysiatest14.mov", "assets/elysiatest15.mov",
      "assets/elysiatest16.mov", "assets/elysiatest17.mov"
    ];

    let current = videoA;
    let next = videoB;
    let index = 0;
    let nextReady = false;
    let switching = false;

    // 预加载所有视频对象
    const cachePool = videos.map(src => {
      const v = document.createElement("video");
      v.src = src;
      v.preload = "auto";
      v.muted = true;
      v.load();
      return v;
    });

    function preloadNext() {
      const nextIndex = (index + 1) % videos.length;
      next.src = cachePool[nextIndex].src;
      nextReady = false;
      next.load();
      next.addEventListener("canplaythrough", () => nextReady = true, { once: true });
    }

    function switchVideo() {
      if (switching) return;
      switching = true;

      if (!nextReady) {
        // 如果还没缓冲好，稍后重试
        setTimeout(() => { switching = false; switchVideo(); }, 300);
        return;
      }

      next.currentTime = 0;
      next.play().then(() => {
        next.style.opacity = "1";
        current.style.opacity = "0";

        setTimeout(() => {
          current.pause();
          [current, next] = [next, current];
          index = (index + 1) % videos.length;
          switching = false;
          preloadNext();
          bindEvents(); 
        }, 800);
      }).catch(err => {
        switching = false;
        console.warn("⚠️ 播放被阻止:", err);
      });
    }

    function bindEvents() {
      current.onended = switchVideo;
      current.ontimeupdate = () => {
        if (!nextReady && current.duration && current.currentTime / current.duration > 0.85) {
          preloadNext();
        }
        // 容错: 若时间卡死不触发 ended
        if (current.currentTime > 0 && current.duration && current.currentTime >= current.duration - 0.05) {
          switchVideo();
        }
      };
    }

    // 初始播放
    current.src = videos[index];
    bindEvents();
    preloadNext();
    current.play().catch(err => console.log("⚠️ 自动播放被阻止:", err));
  }

  // ======================================
  // 4. 链接自动在新标签页打开
  // ======================================
  document.querySelectorAll('a[href]').forEach(a => {
    if (!a.target) a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

  // ======================================
  // 5. 🔋 智能节能模式 PRO (iOS 18 PWA 强力版)
  // ======================================
  const visualElements = [
    document.getElementById('sakura-video'),
    document.getElementById('videoA'),
    document.getElementById('videoB')
  ];

  // 核心暂停逻辑
  function suspendVisuals() {
    console.log('[Elysia] ❄️ 进入后台/锁屏，执行强力节能...');
    visualElements.forEach(v => {
      if (v) {
        // 1. 记录播放状态
        if (!v.paused) {
          v.dataset.wasPlaying = "true";
          v.pause();
        }
        // 2. [关键] 强制隐藏 DOM，通知 iOS 释放 GPU 纹理
        v.style.display = 'none';
      }
    });
  }

  // 核心恢复逻辑
  function resumeVisuals() {
    console.log('[Elysia] 🔥 回到前台，恢复视觉特效...');
    visualElements.forEach(v => {
      if (v) {
        // 1. 恢复显示
        v.style.display = 'block'; 
        
        // 2. 恢复播放
        if (v.dataset.wasPlaying === "true") {
          setTimeout(() => {
             v.play().catch(err => console.log("恢复播放被阻拦:", err));
          }, 50);
          v.dataset.wasPlaying = "false";
        }
      }
    });

    // 🌸 强制兜底检查：樱花必须动起来
    const sakura = document.getElementById('sakura-video');
    if (sakura) {
        sakura.style.display = 'block'; 
        if(sakura.paused) sakura.play().catch(()=>{});
    }
  }

  // 事件 A: 标准可见性变化
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      suspendVisuals();
    } else {
      resumeVisuals();
    }
  });

  // 事件 B: iOS 特有的页面挂起
  window.addEventListener("pagehide", () => {
    suspendVisuals();
  });

  // 事件 C: 窗口失焦 (PWA)
  window.addEventListener("blur", () => {
    if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
       suspendVisuals();
    }
  });
  
  // 事件 D: 窗口获焦
  window.addEventListener("focus", () => {
    if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
       if (!document.hidden) resumeVisuals();
    }
  });

  // ====================================
  // 6. 📜 滚动交互检测 (Scroll Observer)
  // ====================================
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1 
  });

  document.querySelectorAll('section, .container ul li').forEach((el) => {
    observer.observe(el);
  });

}); // 🔥 这里是你原本缺失的闭合标签！
