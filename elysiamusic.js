/* elysiamusic.js - Final Version: High Performance & Sync Fixed */

/* =========================================================
   🔥 PART 1: Firebase 初始化 & 配置
   ========================================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile,
  setPersistence, browserLocalPersistence   
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  initializeFirestore, doc, setDoc, updateDoc, arrayUnion, arrayRemove, 
  onSnapshot, increment, persistentLocalCache, persistentMultipleTabManager
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDeda0UP6TzdfraFcqMwIkE_iNwJ2xbeKs",
  authDomain: "elysiamusic-dddcf.firebaseapp.com",
  projectId: "elysiamusic-dddcf",
  storageBucket: "elysiamusic-dddcf.firebasestorage.app",
  messagingSenderId: "379051710566",
  appId: "1:379051710566:web:fee2278f8b6118a0c275a7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
const provider = new GoogleAuthProvider();

/* =========================================================
   🔥 PART 1.5: Cloudflare 全局逻辑
   ========================================================= */
window.isCaptchaVerified = false;
window.checkLoginButtonState = function() {
  const btn = document.getElementById("email-submit-btn");
  const emailVal = document.getElementById("email-input")?.value.trim();
  const passVal = document.getElementById("pass-input")?.value.trim();
  if (!btn) return;
  
  const isValid = emailVal?.length > 0 && passVal?.length >= 6 && window.isCaptchaVerified;
  btn.disabled = !isValid;
  btn.style.opacity = isValid ? "1" : "0.6";
  btn.style.cursor = isValid ? "pointer" : "not-allowed";
};
window.onTurnstileSuccess = function() { window.isCaptchaVerified = true; window.checkLoginButtonState(); };
window.onTurnstileExpired = function() { window.isCaptchaVerified = false; window.checkLoginButtonState(); };

/* =========================================================
   🔥 PART 2: 播放器核心逻辑
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  
  const allSongsLibrary = window.allSongsLibrary || [];
  if (!allSongsLibrary.length) console.warn("No songs loaded from songs.js");

  // --- 数据状态 ---
  let userFavorites = [];
  let userPlayHistory = {}; 
  let currentUser = null;
  let lastSaveTime = 0; 
  
  // 歌词状态
  let currentLyrics = []; 
  let hasLyrics = false; 
  let isLyricsLoading = false; 
  let currentLyricIndex = -1;

  // 播放状态
  let currentPlaylistKey = 'piano';
  let currentList = allSongsLibrary.filter(s => s.category === 'piano');
  let currentIndex = 0;
  let playMode = 0; // 0:List, 1:One, 2:Shuffle
  let shuffleQueue = [];

  // --- DOM 元素获取 ---
  const audio = new Audio();
  audio.crossOrigin = "anonymous";
  audio.preload = "auto";
  audio.playsInline = true;

  // 容器
  const player = document.getElementById("elysiaPlayer");
  const fsPlayer = document.getElementById("fullscreenPlayer");
  
  // 底部迷你播放器元素
  const playPauseBtn = document.getElementById("playPauseBtn");
  const nextBtn = document.getElementById("nextBtn");
  const titleEl = document.getElementById("songTitle");
  const miniCoverBtn = document.getElementById("miniCoverBtn");
  const miniCoverImg = document.getElementById("miniCoverImg");
  const progressBar = document.getElementById("progressBar");
  const playlistTitleBtn = document.getElementById("playlistTitleBtn"); // 即使隐藏了也获取一下防止报错

  // 全屏播放器元素
  const fsCloseBtn = document.getElementById("fsCloseBtn");
  const fsCoverImg = document.getElementById("fsCoverImg");
  const fsTitle = document.getElementById("fsTitle");
  const fsArtist = document.getElementById("fsArtist");
  const fsPlayBtn = document.getElementById("fsPlayPauseBtn");
  const fsPrevBtn = document.getElementById("fsPrevBtn");
  const fsNextBtn = document.getElementById("fsNextBtn");
  const fsProgressWrap = document.getElementById("fsProgressWrap");
  const fsProgressBarFill = document.getElementById("fsProgressBarFill");
  const fsTimeCurrent = document.getElementById("fsTimeCurrent");
  const fsTimeTotal = document.getElementById("fsTimeTotal");
  const fsHeartBtn = document.getElementById("fsHeartBtn");
  const fsModeBtn = document.getElementById("fsModeBtn");
  const fsBackdrop = document.getElementById("fsBackdrop"); // 如果HTML里有这个，或者直接用fsPlayer

  // 菜单元素
  const songListEl = document.getElementById("playlist");
  const playlistMenuEl = document.getElementById("playlistMenu");

  // --- 图标定义 ---
  const ICONS = {
    play: `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    next: `<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`,
    heart: `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
    mode0: `<svg viewBox="0 0 24 24"><path d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4zm2-2v-4h-2v3H5v-6h2v4h12z"/></svg>`,
    mode1: `<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>`,
    mode2: `<svg viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`
  };
  const modeIcons = [ICONS.mode0, ICONS.mode1, ICONS.mode2];

  // 歌单配置
  let playlistsConfig = [
    { key: "All songs", name: "所有歌曲", filter: (s) => s.category !== 'piano' },
    { key: "history_rank", name: "我的听歌排行", filter: (s) => (userPlayHistory[s.title] || 0) > 0 },
    { key: "piano", name: " ピアノ音楽", filter: (s) => s.category === 'piano' },
    { key: "mon", name: "月曜日", filter: (s) => s.category === 'mon' },
    { key: "tue", name: "火曜日", filter: (s) => s.category === 'tue' },
    { key: "wed", name: "水曜日", filter: (s) => s.category === 'wed' },
    { key: "thu", name: "木曜日", filter: (s) => s.category === 'thu' },
    { key: "fri", name: "金曜日", filter: (s) => s.category === 'fri' },
    { key: "sat", name: "土曜日", filter: (s) => s.category === 'sat' },
    { key: "sun", name: "日曜日", filter: (s) => s.category === 'sun' },
    { key: "unknown", name: "前方的区域后面再来探索吧～", filter: (s) => s.category === 'unknown' },
  ];

  // 初始化 UI
  function initUI() {
    playPauseBtn.innerHTML = ICONS.play;
    nextBtn.innerHTML = ICONS.next;
    fsPlayBtn.innerHTML = ICONS.play;
    fsHeartBtn.innerHTML = ICONS.heart;
    fsModeBtn.innerHTML = modeIcons[0];
  }
  initUI();

  // --- 核心播放逻辑 ---

  async function loadSong(index, autoPlay = false) {
    if (!currentList.length) return;
    // 索引边界检查
    if (index < 0) index = currentList.length - 1;
    if (index >= currentList.length) index = 0;
    
    currentIndex = index;
    const song = currentList[currentIndex];
    
    // 1. 同步图片 & 背景
    const coverUrl = song.cover || 'assets/cover_placeholder.jpg';
    miniCoverImg.src = coverUrl;
    fsCoverImg.src = coverUrl;
    // 🔥 关键优化：更新 CSS 变量以实现全屏背景模糊，解决卡顿
    fsPlayer.style.setProperty('--bg-img', `url(${coverUrl})`);
    
    // 2. 同步文字
    fsTitle.innerText = song.title;
    fsArtist.innerText = song.artist || "Unknown";
    
    // 3. 重置歌词
    currentLyrics = []; hasLyrics = false; currentLyricIndex = -1;
    updateTitleOrLyric(song.title);
    fetchLyrics(song);

    // 4. 设置音频
    audio.src = song.src;
    audio.loop = (playMode === 1); // 单曲循环由 Audio 原生属性处理
    
    // 5. 播放控制
    if (autoPlay) {
      try { 
          await audio.play(); 
          updatePlayState(true); 
      } catch(e) { 
          console.warn("Autoplay blocked:", e); 
          updatePlayState(false); 
      }
    } else {
      updatePlayState(false);
    }
    
    // 6. 其他状态同步
    updateHeartStatus();
    updateMediaSession(song);
    recordPlayHistory(song.title);
  }

  function updatePlayState(isPlaying) {
    const icon = isPlaying ? ICONS.pause : ICONS.play;
    
    // 迷你播放器
    playPauseBtn.innerHTML = icon;
    
    // 全屏播放器
    fsPlayBtn.innerHTML = icon;
    if(isPlaying) {
      fsPlayBtn.classList.add("playing");
      player.classList.add("playing"); // 用于封面旋转动画
    } else {
      fsPlayBtn.classList.remove("playing");
      player.classList.remove("playing");
    }
  }

  function togglePlay() {
    if (audio.paused) {
      audio.play().catch(e => console.log(e));
      updatePlayState(true);
    } else {
      audio.pause();
      updatePlayState(false);
    }
  }

  function playNext(userTriggered = true) {
    // 如果是单曲循环且不是用户切歌，则不切下一首（Audio loop 会处理）
    if (playMode === 1 && !userTriggered) return; 
    
    let nextIdx;
    if (playMode === 2) {
      // 随机播放逻辑
      if (shuffleQueue.length === 0) {
          shuffleQueue = Array.from({length: currentList.length}, (_, i) => i);
          // 洗牌算法
          for (let i = shuffleQueue.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffleQueue[i], shuffleQueue[j]] = [shuffleQueue[j], shuffleQueue[i]];
          }
      }
      nextIdx = shuffleQueue.pop();
    } else {
      // 顺序播放
      nextIdx = (currentIndex + 1) % currentList.length;
    }
    loadSong(nextIdx, true);
  }

  function playPrev() {
    let prev = currentIndex - 1;
    if (prev < 0) prev = currentList.length - 1;
    loadSong(prev, true);
  }

  // --- 歌词 & 滚动标题逻辑 ---
  async function fetchLyrics(song) {
    if(!song.lrc) return;
    try {
      const res = await fetch(song.lrc);
      if(res.ok) {
        const text = await res.text();
        parseLRC(text);
        hasLyrics = true;
      }
    } catch(e) {}
  }

  function parseLRC(text) {
    const lines = text.split('\n');
    const regex = /^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
    lines.forEach(line => {
      const match = line.match(regex);
      if(match) {
        const time = parseInt(match[1])*60 + parseInt(match[2]) + parseInt(match[3].substring(0,3).padEnd(3,'0'))/1000;
        currentLyrics.push({time, text: match[4].trim()});
      }
    });
  }

  function updateTitleOrLyric(textOverride = null) {
    let text = textOverride || currentList[currentIndex].title;
    
    // 如果正在播放且有歌词，显示歌词
    if (!audio.paused && hasLyrics && currentLyricIndex >= 0 && currentLyrics[currentLyricIndex]) {
      text = currentLyrics[currentLyricIndex].text;
    }
    
    // 更新 DOM
    titleEl.innerHTML = `<span class="scroll-inner">${text}</span>`;
    const inner = titleEl.querySelector('.scroll-inner');
    
    // 计算是否需要滚动
    if(inner.scrollWidth > titleEl.clientWidth) {
      // 根据长度动态设置滚动时长
      const duration = (inner.scrollWidth / 40) + 2; 
      inner.style.setProperty('--scroll-duration', `${duration}s`);
      inner.classList.add('scrolling');
    } else {
      inner.classList.remove('scrolling');
    }
  }

  // --- 事件监听 (Event Listeners) ---

  // 1. 全屏开关 (包含卡顿修复逻辑)
  miniCoverBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    // 打开全屏
    fsPlayer.classList.add("active");
    // 🔥 隐藏底部播放器，防止视觉重叠和点击冲突
    player.classList.add("ui-hidden");
    
    // 关闭其他菜单
    hideMenu(songListEl);
    hideMenu(playlistMenuEl);
  });

  fsCloseBtn.addEventListener("click", () => {
    // 关闭全屏
    fsPlayer.classList.remove("active");
    // 🔥 恢复底部播放器
    player.classList.remove("ui-hidden");
  });

  // 2. 按钮控制
  playPauseBtn.addEventListener("click", togglePlay);
  fsPlayBtn.addEventListener("click", togglePlay);
  
  nextBtn.addEventListener("click", () => playNext(true));
  fsNextBtn.addEventListener("click", () => playNext(true));
  fsPrevBtn.addEventListener("click", playPrev);

  // 3. 进度条 & 时间更新
  audio.addEventListener('timeupdate', () => {
    if(!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    
    // 同步两个进度条
    progressBar.style.width = pct + "%";
    fsProgressBarFill.style.width = pct + "%";
    
    // 更新全屏时间
    const fmt = t => {
      const m = Math.floor(t/60);
      const s = Math.floor(t%60).toString().padStart(2,'0');
      return `${m}:${s}`;
    };
    fsTimeCurrent.innerText = fmt(audio.currentTime);
    fsTimeTotal.innerText = fmt(audio.duration);

    // 歌词同步
    if(hasLyrics) {
      let idx = -1;
      for(let i=0; i<currentLyrics.length; i++) {
        if(audio.currentTime >= currentLyrics[i].time) idx = i;
        else break;
      }
      if(idx !== currentLyricIndex) {
        currentLyricIndex = idx;
        updateTitleOrLyric();
      }
    }
    
    // 自动保存播放进度
    if(Date.now() - lastSaveTime > 10000 && currentUser) {
        savePlaybackState();
        lastSaveTime = Date.now();
    }
  });

  // 全屏进度条拖拽 (简单点击跳转)
  fsProgressWrap.addEventListener("click", (e) => {
    const rect = fsProgressWrap.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if(audio.duration) audio.currentTime = pos * audio.duration;
  });

  // 自动下一首
  audio.addEventListener("ended", () => playNext(false));

  // 4. 模式切换 & 收藏
  fsModeBtn.addEventListener("click", () => {
    playMode = (playMode + 1) % 3;
    fsModeBtn.innerHTML = modeIcons[playMode];
    audio.loop = (playMode === 1);
    if(currentUser) setDoc(doc(db, "users", currentUser.uid), { playMode }, { merge: true });
  });

  fsHeartBtn.addEventListener("click", async () => {
    if(!currentUser) {
        alert("请先登录~");
        document.getElementById("login-modal-overlay")?.classList.add("active");
        return;
    }
    const title = currentList[currentIndex].title;
    const ref = doc(db, "users", currentUser.uid);
    
    if(userFavorites.includes(title)) {
      // 取消收藏
      await updateDoc(ref, { favorites: arrayRemove(title) });
      userFavorites = userFavorites.filter(t => t !== title);
      fsHeartBtn.classList.remove("liked");
    } else {
      // 添加收藏
      await updateDoc(ref, { favorites: arrayUnion(title) });
      userFavorites.push(title);
      fsHeartBtn.classList.add("liked");
    }
  });

  function updateHeartStatus() {
    const title = currentList[currentIndex]?.title;
    if(userFavorites.includes(title)) fsHeartBtn.classList.add("liked");
    else fsHeartBtn.classList.remove("liked");
  }

  // --- 歌单菜单逻辑 ---
  // (点击迷你播放器的歌名/列表按钮，或直接外部调用)
  
  function hideMenu(el) {
    if (el && el.classList.contains("show")) {
        el.classList.remove("show");
        el.classList.add("hide");
    }
  }
  function toggleMenu(el) {
    if (el.classList.contains("show")) hideMenu(el);
    else {
      el.classList.remove("hide");
      el.classList.add("show");
    }
  }

  // 迷你播放器点击歌名 -> 显隐当前播放列表
  titleEl.addEventListener("click", (e) => {
    e.stopPropagation();
    hideMenu(playlistMenuEl);
    toggleMenu(songListEl);
  });
  
  // 列表点击切歌
  songListEl.addEventListener("click", (e) => {
      const item = e.target.closest(".playlist-item");
      if(item) {
          loadSong(parseInt(item.dataset.index), true);
          // 切歌后播放
      }
  });

  // --- 辅助函数 ---
  async function recordPlayHistory(title) {
    if(currentUser) {
      await setDoc(doc(db, "users", currentUser.uid), { 
        playHistory: { [title]: increment(1) }
      }, { merge: true });
    }
  }
  
  async function savePlaybackState() {
     if(!currentUser) return;
     try {
         await setDoc(doc(db, "users", currentUser.uid), {
             lastPlayed: {
                 title: currentList[currentIndex].title,
                 time: audio.currentTime,
                 playlist: currentPlaylistKey
             }
         }, { merge: true });
     } catch(e) {}
  }

  function updateMediaSession(song) {
    if('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title, artist: song.artist || "Elysia Player",
        artwork: [{ src: song.cover || 'assets/cover_placeholder.jpg', sizes: '512x512', type: 'image/jpeg' }]
      });
      navigator.mediaSession.setActionHandler('play', togglePlay);
      navigator.mediaSession.setActionHandler('pause', togglePlay);
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext(true));
      navigator.mediaSession.setActionHandler('previoustrack', playPrev);
    }
  }

  // --- 登录/用户状态 (Firebase) ---
  
  // 登录框交互
  const navAuthBtn = document.getElementById("nav-auth-btn");
  const modalOverlay = document.getElementById("login-modal-overlay");
  const closeModalBtn = document.getElementById("close-modal-btn");
  
  if(navAuthBtn) navAuthBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modalOverlay.classList.add("active");
      try { window.turnstile.reset(); } catch(e){}
  });
  if(closeModalBtn) closeModalBtn.addEventListener("click", () => modalOverlay.classList.remove("active"));

  // 邮箱登录
  const emailSubmitBtn = document.getElementById("email-submit-btn");
  if(emailSubmitBtn) {
      emailSubmitBtn.addEventListener("click", async () => {
          if(emailSubmitBtn.disabled) return;
          const email = document.getElementById("email-input").value;
          const pass = document.getElementById("pass-input").value;
          const errEl = document.getElementById("auth-error-msg");
          
          try {
              await setPersistence(auth, browserLocalPersistence);
              await createUserWithEmailAndPassword(auth, email, pass);
              await updateProfile(auth.currentUser, { 
                  displayName: email.split("@")[0], 
                  photoURL: "assets/bannernetwork.png" 
              });
              modalOverlay.classList.remove("active");
          } catch(e) {
              if(e.code === 'auth/email-already-in-use') {
                  try {
                      await signInWithEmailAndPassword(auth, email, pass);
                      modalOverlay.classList.remove("active");
                  } catch(e2) { errEl.innerText = "密码错误或登录失败"; }
              } else {
                  errEl.innerText = e.message;
              }
          }
      });
  }
  
  // Google 登录
  document.getElementById("google-login-btn")?.addEventListener("click", async () => {
      try { await signInWithPopup(auth, provider); modalOverlay.classList.remove("active"); } catch(e){}
  });
  
  // 登出
  document.getElementById("logout-confirm-btn")?.addEventListener("click", () => {
      signOut(auth).then(() => modalOverlay.classList.remove("active"));
  });

  // 状态监听
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    const navText = document.getElementById("nav-auth-text");
    const navIcon = document.getElementById("auth-icon-slot");
    const loginActions = document.getElementById("login-actions");
    const userInfo = document.getElementById("user-info-panel");
    
    if(user) {
      // UI 更新
      const name = user.displayName || user.email.split("@")[0];
      const pic = user.photoURL || "assets/bannernetwork.png";
      if(navText) navText.innerText = name;
      if(navIcon) navIcon.innerHTML = `<img src="${pic}" style="width:100%;height:100%;border-radius:50%">`;
      if(loginActions) loginActions.style.display = "none";
      if(userInfo) userInfo.style.display = "block";
      document.getElementById("modal-user-name").innerText = name;
      document.getElementById("modal-user-avatar").src = pic;

      // 加载用户数据
      onSnapshot(doc(db, "users", user.uid), (snap) => {
        if(snap.exists()) {
          const d = snap.data();
          userFavorites = d.favorites || [];
          userPlayHistory = d.playHistory || {};
          if(d.playMode !== undefined) {
             playMode = d.playMode;
             fsModeBtn.innerHTML = modeIcons[playMode];
             audio.loop = (playMode === 1);
          }
          // 恢复上次播放 (简化版)
          if(d.lastPlayed && !initialRestoreDone) {
              // 这里可以加恢复逻辑，为保持代码简洁略过，核心是 loadSong(savedIndex)
          }
        } else {
          // 初始化新用户
          setDoc(doc(db, "users", user.uid), { favorites: [], playHistory: {} }, { merge: true });
        }
        updateHeartStatus();
      });
    } else {
      // 登出状态
      if(navText) navText.innerText = "登录 / 同步";
      if(navIcon) navIcon.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`;
      if(loginActions) loginActions.style.display = "block";
      if(userInfo) userInfo.style.display = "none";
      userFavorites = [];
      updateHeartStatus();
    }
  });
  
  // 输入框监听 (Button State)
  const emailIn = document.getElementById("email-input");
  const passIn = document.getElementById("pass-input");
  if(emailIn) emailIn.addEventListener("input", window.checkLoginButtonState);
  if(passIn) passIn.addEventListener("input", window.checkLoginButtonState);

  let initialRestoreDone = false;

  // 启动播放器 (加载第一首)
  if(currentList.length > 0) loadSong(0, false);
});
