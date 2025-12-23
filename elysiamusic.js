/* elysiamusic.js - Ultimate Final Version (Commented & Fixed) */

/* =========================================================
   🔥 PART 1: Firebase 初始化 & 身份验证配置
   此部分负责连接 Firebase 后端，处理登录、注册、数据库同步
   ========================================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  setPersistence,           
  browserLocalPersistence   
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 引入 Firestore 数据库模块
import { 
  initializeFirestore, 
  doc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  onSnapshot, 
  increment,
  persistentLocalCache,
  persistentMultipleTabManager
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase 项目配置
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

// 初始化数据库（开启离线缓存功能）
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
console.log("[Firebase] Firestore 离线持久化已启用");

const provider = new GoogleAuthProvider();


/* =========================================================
   🔥 PART 1.5: Cloudflare 验证 & 登录框逻辑
   此部分处理 Turnstile 验证码和登录按钮的状态检查
   ========================================================= */
window.isCaptchaVerified = false;

// 检查邮箱/密码是否合法，控制登录按钮是否可点
window.checkLoginButtonState = function() {
  const btn = document.getElementById("email-submit-btn");
  const emailInput = document.getElementById("email-input");
  const passInput = document.getElementById("pass-input");
  const errorMsg = document.getElementById("auth-error-msg");

  if (!btn || !emailInput || !passInput) return;

  const emailVal = emailInput.value.trim();
  const passVal = passInput.value.trim();
  
  // 规则：有邮箱 + 密码>6位 + 验证码通过
  const isValid = emailVal.length > 0 && passVal.length >= 6 && window.isCaptchaVerified;

  if (isValid) {
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
    btn.style.filter = "none";
    btn.style.background = "linear-gradient(135deg, #9c6bff, #7b3fe4)";
    if (errorMsg && errorMsg.innerText === "请输入邮箱和密码") {
        errorMsg.innerText = "";
    }
  } else {
    btn.disabled = true;
    btn.style.opacity = "0.6";
    btn.style.cursor = "not-allowed";
    btn.style.background = ""; 
  }
};

// 验证码成功回调
window.onTurnstileSuccess = function(token) {
  console.log("[Turnstile] 验证成功");
  window.isCaptchaVerified = true;
  const err = document.getElementById("auth-error-msg");
  if (err) err.innerText = "";
  window.checkLoginButtonState();
};

// 验证码过期回调
window.onTurnstileExpired = function() {
  console.log("[Turnstile] 验证过期");
  window.isCaptchaVerified = false;
  window.checkLoginButtonState();
};


/* =========================================================
   🔥 PART 2: 播放器核心变量 & 数据准备
   这里定义了全局变量、图标、歌词解析逻辑
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  
  // 检查歌单数据是否加载
  const allSongsLibrary = window.allSongsLibrary || [];
  if (!window.allSongsLibrary) {
      console.error("严重错误：未找到歌单数据！请检查 song.js 是否在 elysiamusic.js 之前加载。");
  }

  // 用户状态变量
  let userFavorites = [];     // 收藏列表
  let userPlayHistory = {};   // 播放计数
  let currentUser = null;     // 当前登录用户
  let lastSaveTime = 0;       // 上次保存进度的时间
  let initialRestoreDone = false; // 是否已恢复上次播放进度

  // 歌词状态变量
  let currentLyrics = [];     
  let hasLyrics = false;      
  let isLyricsLoading = false; 
  let currentLyricIndex = -1; 
  let lastCountTime = 0;

  // SVG 图标定义
  const ICONS = {
    play: `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    next: `<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`,
    loopList: `<svg viewBox="0 0 24 24"><path d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4zm2-2v-4h-2v3H5v-6h2v4h12z"/></svg>`,
    loopOne: `<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>`,
    shuffle: `<svg viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`,
    heart: `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
  };

  /* --- 歌单分类配置 --- */
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

  // 动态更新“我的收藏”歌单
  function updatePlaylistConfig() {
    const favIndex = playlistsConfig.findIndex(p => p.key === "my_favorites");
    const myFavPlaylist = {
        key: "my_favorites",
        name: "私の好きな音乐",
        filter: (s) => userFavorites.includes(s.title) 
    };

    if (currentUser && userFavorites.length > 0) {
        if (favIndex === -1) {
            playlistsConfig.splice(1, 0, myFavPlaylist);
        } else {
             playlistsConfig[favIndex] = myFavPlaylist;
        }
    } else {
        if (favIndex !== -1) {
            playlistsConfig.splice(favIndex, 1);
            if (currentPlaylistKey === 'my_favorites') {
                changePlaylist('All songs'); // 如果当前在收藏夹但没收藏了，切回首页
            }
        }
    }
    renderPlaylistMenu();
  }

  // 播放历史记录功能
  async function recordPlayHistory(songTitle) {
    if (!currentUser) return; 
    const currentCount = userPlayHistory[songTitle] || 0;
    userPlayHistory[songTitle] = currentCount + 1;
    
    // 实时更新排行UI
    if (currentPlaylistKey === 'history_rank') {
        renderSongListDOM(); 
    }
    // 上传到数据库
    const userDocRef = doc(db, "users", currentUser.uid);
    try {
        await setDoc(userDocRef, {
            playHistory: { [songTitle]: increment(1) } 
        }, { merge: true });
    } catch (e) {
        console.error("更新播放次数失败", e);
    }
  }

  // 保存播放进度 (Title, Time, Playlist)
  async function savePlaybackState() {
    if (!currentUser || !currentList[currentIndex]) return;
    const songTitle = currentList[currentIndex].title;
    const currentTime = audio.currentTime;
    const userDocRef = doc(db, "users", currentUser.uid);
    try {
      await setDoc(userDocRef, { 
        lastPlayed: {
          title: songTitle,
          time: currentTime,
          playlist: currentPlaylistKey 
        }
      }, { merge: true }); 
    } catch (e) { console.error("保存进度失败", e); }
  }

  // 当前播放列表状态
  let currentPlaylistKey = 'piano';
  let currentList = allSongsLibrary.filter(s => s.category === 'piano'); 
  let currentIndex = 0;
  let shuffleQueue = []; // 随机播放队列

  // 生成随机数组
  function getShuffledIndices(length) {
    let arr = Array.from({length}, (_, i) => i);
    for (let i = length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  
  let playMode = 0; // 0:列表循环, 1:单曲循环, 2:随机
  const playModes = [
    { icon: ICONS.loopList, name: "列表循环" },
    { icon: ICONS.loopOne, name: "单曲循环" },
    { icon: ICONS.shuffle, name: "随机播放" }
  ];


  /* =========================================================
     🔥 PART 3: DOM 元素获取 & 基础 Audio 初始化
     ========================================================= */
  const audio = new Audio();
  audio.crossOrigin = "anonymous"; 
  audio.preload = "auto";
  audio.playsInline = true; 

  const player = document.getElementById("elysiaPlayer");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const nextBtn = document.getElementById("nextBtn");
  const titleEl = document.getElementById("songTitle");
  const songListEl = document.getElementById("playlist"); 
  const playlistMenuEl = document.getElementById("playlistMenu");
  const modeBtn = document.getElementById("modeBtn");
  const heartBtn = document.getElementById("heartBtn");
  const playlistTitleBtn = document.getElementById("playlistTitleBtn");
  
  const currentCoverEl = document.getElementById("currentCover");
  const backCoverEl = document.getElementById("backCover");

  if (!player || !playPauseBtn) return;

  function initIcons() {
    playPauseBtn.innerHTML = ICONS.play;
    nextBtn.innerHTML = ICONS.next;
    modeBtn.innerHTML = playModes[0].icon;
    heartBtn.innerHTML = ICONS.heart; 
  }
  initIcons();

  // 更新心形图标状态
  function updateHeartStatus() {
      if (!currentList || !currentList[currentIndex]) return;
      const currentTitle = currentList[currentIndex].title;
      if (userFavorites.includes(currentTitle)) {
          heartBtn.classList.add("liked");
      } else {
          heartBtn.classList.remove("liked");
      }
  }

  // 更新封面图 (异步 CSS)
  function updateCover(song) {
      const coverUrl = song.cover || ''; 
      if (currentCoverEl) {
          currentCoverEl.style.backgroundImage = coverUrl ? `url('${coverUrl}')` : '';
      }
      if (backCoverEl) {
          backCoverEl.style.backgroundImage = coverUrl ? `url('${coverUrl}')` : '';
      }
  }

  /* --- 歌词解析逻辑 --- */
  function parseLRC(lrcText) {
      if(!lrcText) return [];
      const lines = lrcText.split('\n');
      const regex = /^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
      const result = [];
      lines.forEach(line => {
          const match = line.match(regex);
          if (match) {
              const min = parseInt(match[1]);
              const sec = parseInt(match[2]);
              const ms = parseInt(match[3].padEnd(3, '0').substring(0, 3));
              const time = min * 60 + sec + ms / 1000;
              const text = match[4].trim();
              if (text) {
                  result.push({ time, text });
              }
          }
      });
      return result;
  }

  // 获取歌词 (Fetch Async)
  async function fetchLyrics(song) {
      currentLyrics = [];
      hasLyrics = false;
      currentLyricIndex = -1;
      
      if (!song.lrc) {
          isLyricsLoading = false;
          updateTitleOrLyric(true);
          return;
      }

      // 1. 查缓存
      const localCacheKey = "lyric_" + song.title; 
      const cachedLrc = localStorage.getItem(localCacheKey);
      if (cachedLrc) {
          console.log(`[Elysia] 命中歌词缓存: ${song.title}`);
          currentLyrics = parseLRC(cachedLrc);
          if (currentLyrics.length > 0) hasLyrics = true;
          isLyricsLoading = false; 
          updateTitleOrLyric(true);
          return;
      }

      // 2. 没缓存，去网络请求
      isLyricsLoading = true;
      updateTitleOrLyric(true); 

      try {
          const response = await fetch(song.lrc);
          if (response.ok) {
              const lrcText = await response.text();
              try { localStorage.setItem(localCacheKey, lrcText); } catch (e) {}
              currentLyrics = parseLRC(lrcText);
              if (currentLyrics.length > 0) hasLyrics = true;
          }
      } catch (e) {
          console.warn(`[Elysia] 歌词加载失败: ${song.title}`, e);
      } finally {
          isLyricsLoading = false;
          updateTitleOrLyric(true); 
      }
  }

  // 更新标题栏文字 (歌词或歌名)
  function updateTitleOrLyric(forceUpdate = false) {
      if (!currentList || !currentList[currentIndex]) return;
      const song = currentList[currentIndex];
      let textToShow = "";
      
      if (audio.paused) {
          textToShow = song.title;
          titleEl.classList.remove("lyric-mode");
      } else if (isLyricsLoading) {
          textToShow = "歌词加载中...";
          titleEl.classList.add("lyric-mode");
      } else if (!hasLyrics) {
          textToShow = song.title; 
          titleEl.classList.remove("lyric-mode");
      } else {
          // 歌词模式
          if (currentLyricIndex === -1 || currentLyricIndex >= currentLyrics.length) {
              textToShow = song.title;
              titleEl.classList.remove("lyric-mode");
          } else {
              textToShow = currentLyrics[currentLyricIndex].text;
              if (!textToShow.trim()) textToShow = song.title; 
              titleEl.classList.add("lyric-mode");
          }
      }

      const currentHTML = titleEl.querySelector('.scroll-inner')?.innerText;
      if (!forceUpdate && currentHTML === textToShow) return;

      // 滚动动画逻辑
      titleEl.innerHTML = `<span class="scroll-inner" style="transform:translateX(0)">${textToShow}</span>`;
      const innerSpan = titleEl.querySelector('.scroll-inner');
      const containerWidth = titleEl.clientWidth;
      const textWidth = innerSpan.scrollWidth;

      if (textWidth > containerWidth) {
          const duration = (textWidth / 50) + 1.5; 
          const offset = containerWidth - textWidth - 20;

          innerSpan.style.setProperty('--scroll-duration', `${duration}s`);
          innerSpan.style.setProperty('--scroll-offset', `${offset}px`);
          
          innerSpan.classList.remove('scrolling');
          void innerSpan.offsetWidth; 
          innerSpan.classList.add('scrolling');
          titleEl.style.textAlign = 'left'; 
      } else {
          innerSpan.classList.remove('scrolling');
          titleEl.style.textAlign = 'left'; 
      }
  }


  /* =========================================================
     🔥 PART 4: 播放控制 (Load, Play, Next, Playlist)
     ========================================================= */
  
  // 核心：加载歌曲
  function loadSong(index, isRestore = false, startTime = 0) {
    if (!currentList || currentList.length === 0) return;
    if (index < 0) index = currentList.length - 1;
    if (index >= currentList.length) index = 0;
    
    currentIndex = index;
    const song = currentList[currentIndex];
    
    currentLyrics = [];
    hasLyrics = false;
    currentLyricIndex = -1;
    
    updateCover(song);
    isLyricsLoading = true;
    updateTitleOrLyric(true); 
    fetchLyrics(song);

    // 恢复播放进度
    if (startTime > 0) {
        audio.currentTime = startTime; 
        const seekFn = () => {
            if(Math.abs(audio.currentTime - startTime) > 1) audio.currentTime = startTime;
        };
        audio.addEventListener('canplay', seekFn, { once: true });
    }

    audio.src = song.src;
    audio.loop = (playMode === 1);
    
    renderSongListDOM(); 
    updateMediaSession(song);
    updateHeartStatus();

    if (!isRestore) savePlaybackState();
  }

  function togglePlay() {
    if (audio.paused) {
      audio.play().catch(e => console.log("Waiting for interaction"));
      playPauseBtn.innerHTML = ICONS.pause;
      playPauseBtn.classList.add("playing"); 
      player.classList.add("playing");
      if(currentCoverEl) currentCoverEl.classList.add("playing");
      updateTitleOrLyric(true); 
    } else {
      audio.pause();
      playPauseBtn.innerHTML = ICONS.play;
      playPauseBtn.classList.remove("playing");
      player.classList.remove("playing");
      if(currentCoverEl) currentCoverEl.classList.remove("playing");
      updateTitleOrLyric(true); 
    }
  }

  function playNext(isAuto = false) {
    if (playMode === 1 && isAuto) { 
      if (audio.paused) audio.play(); 
      return; 
    } 
    let nextIndex;
    if (playMode === 2) { 
      if (shuffleQueue.length === 0) {
        shuffleQueue = getShuffledIndices(currentList.length);
        if (currentList.length > 1 && shuffleQueue[0] === currentIndex) {
             shuffleQueue.push(shuffleQueue.shift());
        }
      }
      nextIndex = shuffleQueue.shift();
    } else { 
      nextIndex = (currentIndex + 1) % currentList.length;
    }
    loadSong(nextIndex);
    audio.play().catch(e => console.warn("Auto-play blocked:", e)); 
    playPauseBtn.innerHTML = ICONS.pause;
    playPauseBtn.classList.add("playing");
    player.classList.add("playing");
    if(currentCoverEl) currentCoverEl.classList.add("playing");
  }

  function toggleMenu(el) {
    if (el.classList.contains("show")) hideMenu(el);
    else {
      el.classList.remove("hide");
      el.classList.add("show");
    }
  }
  // 强力关闭菜单函数
  function hideMenu(el) {
    if (!el) return;
    el.classList.remove("show");
    el.classList.add("hide");
  }

  // 渲染歌曲列表 HTML
  function renderSongListDOM() {
    if (!songListEl) return;
    songListEl.innerHTML = currentList.map((s, i) => {
      const count = userPlayHistory[s.title] || 0;
      let countHtml = (currentPlaylistKey === 'history_rank') ? `<span class="play-count-tag">${count} 次</span>` : '';
      return `
      <div class="playlist-item ${i === currentIndex ? 'active' : ''}" data-index="${i}">
        <span class="song-name">${s.title}</span>
        ${countHtml}
      </div>
    `}).join("");
  }

  // 渲染歌单菜单 HTML
  function renderPlaylistMenu() {
    if (!playlistMenuEl) return;
    playlistMenuEl.innerHTML = playlistsConfig.map(cfg => `
      <div class="playlist-item ${cfg.key === currentPlaylistKey ? 'active' : ''}" data-key="${cfg.key}">
        ${cfg.name}
      </div>
    `).join("");
  }

  // 切换歌单逻辑
  function changePlaylist(key) {
    const config = playlistsConfig.find(c => c.key === key);
    if (!config) return;
    currentPlaylistKey = key;
    playlistTitleBtn.textContent = config.name; 
    
    currentList = allSongsLibrary.filter(config.filter);

    if (key === 'history_rank') {
        currentList.sort((a, b) => {
            return (userPlayHistory[b.title] || 0) - (userPlayHistory[a.title] || 0);
        });
    }

    shuffleQueue = [];
    currentIndex = 0;
    
    if (currentList.length > 0) {
        loadSong(0);
        audio.play().catch(e => {});
        playPauseBtn.innerHTML = ICONS.pause;
        playPauseBtn.classList.add("playing");
        player.classList.add("playing");
        if(currentCoverEl) currentCoverEl.classList.add("playing");
    } else {
        titleEl.textContent = "暂无数据";
        songListEl.innerHTML = "<div style='padding:15px;text-align:center;color:#999'>还没有播放记录哦</div>";
    }
    renderPlaylistMenu();
    renderSongListDOM();
  }
  renderPlaylistMenu();

  /* =========================================================
     🔥 PART 5: 交互逻辑 (长按翻转修复版)
     包含：点击事件、长按翻转、冷却锁 (0.2s)
     ========================================================= */

  // 全局锁：控制是否允许点击（默认允许）
  let isClickAllowed = true; 
  let isDrag = false;
  let pressTimer;

  /* 1. 标题点击事件 (打开歌曲列表) */
  titleEl.addEventListener("click", (e) => {
    e.stopPropagation();
    
    // 冷却期检查：如果刚翻转过，或者在背面，禁止打开
    if (!isClickAllowed) return;
    if (player.classList.contains("flipped")) return; 
    
    hideMenu(playlistMenuEl); 
    toggleMenu(songListEl);
  });

  /* 2. 歌曲列表项点击 */
  songListEl.addEventListener("click", e => {
    const item = e.target.closest(".playlist-item");
    if (item) {
      loadSong(parseInt(item.dataset.index));
      audio.play().catch(e => console.log("Play failed:", e));
      playPauseBtn.innerHTML = ICONS.pause;
      playPauseBtn.classList.add("playing");
      if(currentCoverEl) currentCoverEl.classList.add("playing");
    }
  });

  /* 3. 歌单标题按钮点击 (打开歌单菜单) */
  playlistTitleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isClickAllowed) return;
    if (player.classList.contains("flipped")) return;
    
    hideMenu(songListEl); 
    toggleMenu(playlistMenuEl);
  });

  /* 4. 歌单菜单项点击 */
  if (playlistMenuEl) {
    playlistMenuEl.addEventListener('click', (e) => {
      const item = e.target.closest(".playlist-item");
      if (item) {
        const key = item.dataset.key;
        if (key !== currentPlaylistKey) changePlaylist(key);
        hideMenu(playlistMenuEl);
      }
    });
  }

  /* 5. 模式切换按钮 */
  modeBtn.addEventListener('click', async (e) => {
    e.stopPropagation(); 
    playMode = (playMode + 1) % 3;
    modeBtn.innerHTML = playModes[playMode].icon;
    audio.loop = (playMode === 1);

    if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        try { await setDoc(userDocRef, { playMode: playMode }, { merge: true }); } catch (err) {}
    }
  });

  /* 6. 收藏按钮 */
  heartBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      alert("请先登录才能收藏歌曲哦~");
      const modal = document.getElementById("login-modal-overlay");
      if(modal) modal.classList.add("active");
      return;
    }
    const currentSong = currentList[currentIndex];
    const songTitle = currentSong.title;
    const userDocRef = doc(db, "users", currentUser.uid);
    const isLiked = userFavorites.includes(songTitle);
    
    if (isLiked) heartBtn.classList.remove("liked");
    else heartBtn.classList.add("liked");

    try {
        if (isLiked) await updateDoc(userDocRef, { favorites: arrayRemove(songTitle) });
        else await updateDoc(userDocRef, { favorites: arrayUnion(songTitle) });
    } catch (err) {
        updateHeartStatus(); 
        alert("同步失败，请检查网络");
    }
  });

  /* 7. 点击空白处关闭菜单 */
  document.addEventListener("click", e => {
    const inPlayer = player.contains(e.target);
    const inSongList = songListEl && songListEl.contains(e.target);
    const inPlayListMenu = playlistMenuEl && playlistMenuEl.contains(e.target);
    if (!inPlayer && !inSongList && !inPlayListMenu) {
      hideMenu(songListEl);
      hideMenu(playlistMenuEl);
    }
  });

  /* --- 🔥 核心：长按翻转逻辑 (带 0.2s 缓冲) --- */
  const startPress = (e) => {
    // 忽略按钮点击
    if (e.target.closest('button')) return; 
    
    isDrag = false;
    pressTimer = setTimeout(() => {
      if (!isDrag) {
        // A. 执行翻转
        player.classList.toggle("flipped");
        
        // B. 强制关闭所有菜单
        hideMenu(songListEl);
        hideMenu(playlistMenuEl);

        // C. 上锁：0.2秒内禁止所有点击
        isClickAllowed = false;
        setTimeout(() => {
          isClickAllowed = true;
        }, 200); 
      }
    }, 300); // 长按时间阈值
  };

  const cancelPress = () => clearTimeout(pressTimer);
  const onMove = () => { isDrag = true; clearTimeout(pressTimer); };
  
  player.addEventListener('mousedown', startPress);
  player.addEventListener('touchstart', startPress, { passive: true });
  player.addEventListener('mouseup', cancelPress);
  player.addEventListener('mouseleave', cancelPress);
  player.addEventListener('touchend', cancelPress);
  player.addEventListener('mousemove', onMove);
  player.addEventListener('touchmove', onMove, { passive: true });


  /* =========================================================
     🔥 PART 6: 自动隐藏 UI & Audio 高级事件
     ========================================================= */
  let inactivityTimer;
  function hidePlayerUI() {
    player.style.opacity = '0';
    player.style.transform = 'translate(-50%, 40px)'; 
    player.style.pointerEvents = 'none'; 
    hideMenu(songListEl);
    hideMenu(playlistMenuEl);
  }
  function showPlayerUI() {
    player.style.opacity = '1';
    player.style.transform = 'translate(-50%, 0)'; 
    player.style.pointerEvents = 'auto'; 
    resetTimer();
  }
  function resetTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(hidePlayerUI, 1800000); // 30分钟无操作隐藏
  }
  ['scroll','mousemove','mousedown','touchstart','keydown'].forEach(evt => window.addEventListener(evt, showPlayerUI));

  playPauseBtn.addEventListener("click", togglePlay);
  nextBtn.addEventListener("click", () => playNext(false));
  
  audio.addEventListener("ended", () => {
    if (playMode !== 1) { 
        if (currentList && currentList[currentIndex]) recordPlayHistory(currentList[currentIndex].title);
        playNext(true);
    }
  });

  // MediaSession API 支持 (锁屏控制)
  function updatePositionState() {
    if ('setPositionState' in navigator.mediaSession && !isNaN(audio.duration)) {
      navigator.mediaSession.setPositionState({
        duration: audio.duration,
        playbackRate: audio.playbackRate,
        position: audio.currentTime
      });
    }
  }
  function updateMediaSession(song) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist || "Elysia Player", 
        album: playlistTitleBtn ? playlistTitleBtn.textContent : "Music",
        artwork: [{ src: song.cover || 'assets/banner1.jpg', sizes: "512x512", type: "image/jpeg" }]
      });
      navigator.mediaSession.setActionHandler('play', togglePlay);
      navigator.mediaSession.setActionHandler('pause', togglePlay);
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext(false));
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = currentList.length - 1;
        loadSong(prevIndex);
        audio.play();
        playPauseBtn.innerHTML = ICONS.pause;
        playPauseBtn.classList.add("playing");
        if(currentCoverEl) currentCoverEl.classList.add("playing");
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.fastSeek && 'fastSeek' in audio) audio.fastSeek(details.seekTime);
        else audio.currentTime = details.seekTime;
        updatePositionState();
      });
    }
  }
  audio.addEventListener('loadedmetadata', updatePositionState);
  
  audio.addEventListener('play', () => { 
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing"; 
      updatePositionState(); 
      updateTitleOrLyric(true); 
  });
  
  audio.addEventListener('pause', () => { 
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused"; 
    updatePositionState();
    savePlaybackState();
    updateTitleOrLyric(true); 
  });

  /* timeupdate: 处理进度、歌词滚动、单曲循环计数 */
  let lastTimeForLoop = 0; 

  audio.addEventListener('timeupdate', () => { 
    if (Math.floor(audio.currentTime) % 5 === 0) updatePositionState();
    
    // 歌词滚动
    if (!audio.paused && hasLyrics && currentLyrics.length > 0 && !isLyricsLoading) {
        const currentTime = audio.currentTime;
        let activeIndex = -1;
        for (let i = 0; i < currentLyrics.length; i++) {
            if (currentTime >= currentLyrics[i].time) activeIndex = i;
            else break; 
        }
        if (activeIndex !== currentLyricIndex) {
            currentLyricIndex = activeIndex;
            updateTitleOrLyric(true); 
        }
    }

    // 单曲循环计数检测
    if (playMode === 1 && audio.duration > 0) {
        if (audio.currentTime < lastTimeForLoop && lastTimeForLoop > audio.duration - 1.5) {
             const now = Date.now();
             if (now - lastCountTime > 2000) {
                 if (currentList && currentList[currentIndex]) recordPlayHistory(currentList[currentIndex].title);
                 lastCountTime = now;
             }
        }
    }
    lastTimeForLoop = audio.currentTime; 
    
    // 定时保存进度
    const now = Date.now();
    if (now - lastSaveTime > 10000 && !audio.paused) { 
        savePlaybackState();
        lastSaveTime = now;
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'hidden') savePlaybackState();
  });

  resetTimer();
  if(allSongsLibrary.length > 0) loadSong(0);

  /* =========================================================
     🔥 PART 7: 用户登录 UI 交互逻辑
     处理模态框、登录、登出、用户信息同步
     ========================================================= */
  const navAuthBtn = document.getElementById("nav-auth-btn");
  const navAuthText = document.getElementById("nav-auth-text");
  const navAuthIconSlot = document.getElementById("auth-icon-slot");
  
  const modalOverlay = document.getElementById("login-modal-overlay");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const googleLoginBtn = document.getElementById("google-login-btn");
  const logoutConfirmBtn = document.getElementById("logout-confirm-btn");
  const loginActionsDiv = document.getElementById("login-actions");
  const userInfoPanel = document.getElementById("user-info-panel");
  const emailInput = document.getElementById("email-input");
  const passInput = document.getElementById("pass-input");
  const emailSubmitBtn = document.getElementById("email-submit-btn");
  const errorMsg = document.getElementById("auth-error-msg");

  if(window.checkLoginButtonState) window.checkLoginButtonState();

  if (emailInput && passInput) {
      ['input', 'change', 'keyup', 'paste'].forEach(evt => {
          emailInput.addEventListener(evt, window.checkLoginButtonState);
          passInput.addEventListener(evt, window.checkLoginButtonState);
      });
  }

  // 打开登录框
  if (navAuthBtn) {
    navAuthBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (modalOverlay) modalOverlay.classList.add("active");
      const dropdown = document.getElementById("dropdown");
      if (dropdown && dropdown.classList.contains("show")) dropdown.classList.remove("show");
      
      if (window.turnstile) {
        try { window.turnstile.reset(); } catch(e) {}
      }
      window.isCaptchaVerified = false; 
      if(window.checkLoginButtonState) window.checkLoginButtonState();
    });
  }

  // 关闭登录框
  const closeModal = () => modalOverlay?.classList.remove("active");
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // 邮箱登录/注册
  if (emailSubmitBtn) {
    emailSubmitBtn.addEventListener("click", async () => {
      if(emailSubmitBtn.disabled || !window.isCaptchaVerified) return;

      const email = emailInput.value;
      const pass = passInput.value;
      
      if (!email || !pass) { errorMsg.innerText = "请输入邮箱和密码"; return; }
      if (pass.length < 6) { errorMsg.innerText = "密码至少需要6位"; return; }
      errorMsg.innerText = "处理中...";
      
      try {
        await setPersistence(auth, browserLocalPersistence);
        // 尝试注册
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const defaultName = email.split("@")[0];
        await updateProfile(userCredential.user, {
          displayName: defaultName,
          photoURL: "assets/bannernetwork.png" 
        });
        closeModal(); 
      } catch (error) {
        // 如果邮箱已存在，则尝试登录
        if (error.code === 'auth/email-already-in-use') {
          try {
            await setPersistence(auth, browserLocalPersistence);
            await signInWithEmailAndPassword(auth, email, pass);
            closeModal();
            errorMsg.innerText = "";
          } catch (loginError) {
             errorMsg.innerText = "密码错误或登录失败";
          }
        } else {
          errorMsg.innerText = "错误: " + error.message;
        }
      }
    });
  }

  // Google 登录
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", async () => {
      try {
          await setPersistence(auth, browserLocalPersistence);
          await signInWithPopup(auth, provider);
          closeModal();
      } catch(e) { console.error(e); }
    });
  }

  // 登出
  if (logoutConfirmBtn) {
    logoutConfirmBtn.addEventListener("click", () => {
      signOut(auth).then(() => closeModal());
    });
  }

  // 监听用户登录状态变化
  onAuthStateChanged(auth, (user) => {
    currentUser = user; 
    if (user) {
      // 登录后逻辑
      const displayName = user.displayName || user.email.split("@")[0]; 
      const photoURL = user.photoURL || "assets/bannernetwork.png";  

      if (navAuthText) navAuthText.innerText = displayName;
      if (navAuthIconSlot) navAuthIconSlot.innerHTML = `<img src="${photoURL}" alt="user">`;
      if (loginActionsDiv) loginActionsDiv.style.display = "none";
      if (userInfoPanel) userInfoPanel.style.display = "block";
      
      const modalUserName = document.getElementById("modal-user-name");
      const modalUserAvatar = document.getElementById("modal-user-avatar");
      if (modalUserName) modalUserName.innerText = displayName;
      if (modalUserAvatar) modalUserAvatar.src = photoURL;

      // 从数据库同步数据
      const userDocRef = doc(db, "users", user.uid);
      
      onSnapshot(userDocRef, (docSnap) => {
         if (docSnap.exists()) {
             const data = docSnap.data();
             userFavorites = data.favorites || [];
             userPlayHistory = data.playHistory || {}; 
             
             if (data.playMode !== undefined) {
                 playMode = data.playMode; 
                 modeBtn.innerHTML = playModes[playMode].icon; 
                 audio.loop = (playMode === 1);
             }
             
             // 恢复上次播放状态
             if (!initialRestoreDone && data.lastPlayed && audio.paused && audio.currentTime === 0) {
                 let lastTitle = "";
                 let lastTime = 0;
                 let lastPlaylist = "All songs";

                 if (typeof data.lastPlayed === 'object') {
                     lastTitle = data.lastPlayed.title;
                     lastTime = data.lastPlayed.time || 0;
                     lastPlaylist = data.lastPlayed.playlist || "All songs"; 
                 } else { lastTitle = data.lastPlayed; }

                 const savedPlaylistConfig = playlistsConfig.find(c => c.key === lastPlaylist);
                 const targetConfig = savedPlaylistConfig || playlistsConfig.find(c => c.key === 'All songs') || playlistsConfig[0];

                 if (targetConfig) {
                     currentPlaylistKey = targetConfig.key;
                     currentList = allSongsLibrary.filter(targetConfig.filter);
                     if (currentPlaylistKey === 'history_rank') {
                        currentList.sort((a, b) => (userPlayHistory[b.title] || 0) - (userPlayHistory[a.title] || 0));
                     }

                     if (playlistTitleBtn) playlistTitleBtn.textContent = targetConfig.name;
                     const targetIndex = currentList.findIndex(s => s.title === lastTitle);
                     
                     if (targetIndex !== -1) {
                         loadSong(targetIndex, true, lastTime);
                         renderPlaylistMenu();
                         initialRestoreDone = true;
                     }
                 }
             }

         } else {
             // 新用户初始化数据
             setDoc(userDocRef, { favorites: [], playHistory: {} }, { merge: true });
             userFavorites = [];
             userPlayHistory = {};
         }
         updatePlaylistConfig();
         updateHeartStatus();
         if (currentPlaylistKey === 'history_rank') renderSongListDOM();
      });
    } else {
      // 未登录逻辑
      if (navAuthText) navAuthText.innerText = "登录 / 同步";
      if (navAuthIconSlot) navAuthIconSlot.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`;
      if (loginActionsDiv) loginActionsDiv.style.display = "block";
      if (userInfoPanel) userInfoPanel.style.display = "none";
      userFavorites = [];
      userPlayHistory = {};
      initialRestoreDone = false;
      updatePlaylistConfig();
      updateHeartStatus();
    }
  });

});
