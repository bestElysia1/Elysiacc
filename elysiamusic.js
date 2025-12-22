/* elysiamusic.js - Final Ultimate Version (Fixed: Direction, Speed, No Progress) */

/* =========================================================
   🔥 PART 1: Firebase 初始化 & 配置
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

// 引入 Firestore 初始化模块
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

// 初始化 Firestore 并开启离线持久化
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
console.log("[Firebase] Firestore 离线持久化已启用 (新版 API)");

const provider = new GoogleAuthProvider();


/* =========================================================
   🔥 PART 1.5: Cloudflare 全局逻辑
   ========================================================= */
window.isCaptchaVerified = false;

window.checkLoginButtonState = function() {
  const btn = document.getElementById("email-submit-btn");
  const emailInput = document.getElementById("email-input");
  const passInput = document.getElementById("pass-input");
  const errorMsg = document.getElementById("auth-error-msg");

  if (!btn || !emailInput || !passInput) return;

  const emailVal = emailInput.value.trim();
  const passVal = passInput.value.trim();
  
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

window.onTurnstileSuccess = function(token) {
  console.log("[Turnstile] 验证成功");
  window.isCaptchaVerified = true;
  const err = document.getElementById("auth-error-msg");
  if (err) err.innerText = "";
  window.checkLoginButtonState();
};

window.onTurnstileExpired = function() {
  console.log("[Turnstile] 验证过期");
  window.isCaptchaVerified = false;
  window.checkLoginButtonState();
};


/* =========================================================
   🔥 PART 2: 播放器核心逻辑 & DOM交互
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  
  const allSongsLibrary = window.allSongsLibrary || [];

  if (!window.allSongsLibrary) {
      console.error("严重错误：未找到歌单数据！请检查 song.js 是否在 elysiamusic.js 之前加载。");
  }

  let userFavorites = [];
  let userPlayHistory = {}; 
  let currentUser = null;
  let lastSaveTime = 0; 
  let initialRestoreDone = false; 

  /* --- 🎵 歌词相关变量 --- */
  let currentLyrics = [];     
  let hasLyrics = false;      
  let isLyricsLoading = false; 
  let currentLyricIndex = -1; 
  let lastCountTime = 0;

  /* ... SVG ICONS ... */
  const ICONS = {
    play: `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    next: `<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`,
    loopList: `<svg viewBox="0 0 24 24"><path d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4zm2-2v-4h-2v3H5v-6h2v4h12z"/></svg>`,
    loopOne: `<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>`,
    shuffle: `<svg viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`,
    heart: `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
  };

  /* 2. 歌单配置与状态管理 */
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
                changePlaylist('All songs');
            }
        }
    }
    renderPlaylistMenu();
  }

  // 记录播放历史
  async function recordPlayHistory(songTitle) {
    if (!currentUser) return; 
    const currentCount = userPlayHistory[songTitle] || 0;
    userPlayHistory[songTitle] = currentCount + 1;
    console.log(`播放计数增加: ${songTitle} -> ${userPlayHistory[songTitle]}`); 

    if (currentPlaylistKey === 'history_rank') {
        renderSongListDOM(); 
    }

    const userDocRef = doc(db, "users", currentUser.uid);
    try {
        await setDoc(userDocRef, {
            playHistory: {
                [songTitle]: increment(1)
            } 
        }, { merge: true });
    } catch (e) {
        console.error("更新播放次数失败", e);
    }
  }

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
    } catch (e) {
      console.error("保存进度失败", e);
    }
  }

  let currentPlaylistKey = 'piano';
  let currentList = allSongsLibrary.filter(s => s.category === 'piano'); 
  let currentIndex = 0;
  let shuffleQueue = []; 

  function getShuffledIndices(length) {
    let arr = Array.from({length}, (_, i) => i);
    for (let i = length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  
  let playMode = 0; 
  const playModes = [
    { icon: ICONS.loopList, name: "列表循环" },
    { icon: ICONS.loopOne, name: "单曲循环" },
    { icon: ICONS.shuffle, name: "随机播放" }
  ];

  /* =========================================================
     3. DOM 元素初始化 & 播放控制
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
  
  // 🔥 封面元素获取
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

  function updateHeartStatus() {
      if (!currentList || !currentList[currentIndex]) return;
      const currentTitle = currentList[currentIndex].title;
      if (userFavorites.includes(currentTitle)) {
          heartBtn.classList.add("liked");
      } else {
          heartBtn.classList.remove("liked");
      }
  }

  /* --- 🎵 封面更新逻辑 --- */
  function updateCover(song) {
      const coverUrl = song.cover || ''; 
      
      // 更新正面封面
      if (currentCoverEl) {
          if (coverUrl) {
              currentCoverEl.style.backgroundImage = `url('${coverUrl}')`;
          } else {
              currentCoverEl.style.backgroundImage = ''; // CSS 会显示 ♪
          }
      }
      
      // 更新背面封面
      if (backCoverEl) {
          if (coverUrl) {
              backCoverEl.style.backgroundImage = `url('${coverUrl}')`;
          } else {
              backCoverEl.style.backgroundImage = '';
          }
      }
  }

  /* --- 🎵 歌词解析函数 --- */
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

  async function fetchLyrics(song) {
      currentLyrics = [];
      hasLyrics = false;
      currentLyricIndex = -1;
      
      if (!song.lrc) {
          isLyricsLoading = false;
          updateTitleOrLyric(true);
          return;
      }

      const localCacheKey = "lyric_" + song.title; 
      const cachedLrc = localStorage.getItem(localCacheKey);

      if (cachedLrc) {
          console.log(`[Elysia] 命中本地歌词缓存: ${song.title}`);
          currentLyrics = parseLRC(cachedLrc);
          if (currentLyrics.length > 0) hasLyrics = true;
          isLyricsLoading = false; 
          updateTitleOrLyric(true);
          return;
      }

      isLyricsLoading = true;
      updateTitleOrLyric(true); 

      try {
          const response = await fetch(song.lrc);
          if (response.ok) {
              const lrcText = await response.text();
              try {
                  localStorage.setItem(localCacheKey, lrcText);
              } catch (storageErr) {
                  console.warn("歌词缓存失败(可能是空间已满):", storageErr);
              }
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

  /* --- 🎵 核心逻辑：更新标题/歌词 (🔥修复方向向左 & 提升速度) --- */
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
      if (!forceUpdate && currentHTML === textToShow) {
          return; 
      }

      // 重置 DOM 以强制动画从头开始
      titleEl.innerHTML = `<span class="scroll-inner" style="transform:translateX(0)">${textToShow}</span>`;
      
      const innerSpan = titleEl.querySelector('.scroll-inner');
      const containerWidth = titleEl.clientWidth;
      const textWidth = innerSpan.scrollWidth;

      // 只有溢出时才滚动
      if (textWidth > containerWidth) {
          const overflow = textWidth - containerWidth;
          
          // 🔥 修复方向：容器宽 - 文字宽 - 20px (确保负数，强制左滚)
          const offset = containerWidth - textWidth - 20; 
          
          // 🔥 修复速度：恒定速度算法 (每秒60px)，最短2秒
          const duration = Math.max(2, overflow / 50); 
          
          innerSpan.style.setProperty('--scroll-duration', `${duration}s`);
          innerSpan.style.setProperty('--scroll-offset', `${offset}px`);
          
          // 强制重绘 (Reflow)
          void innerSpan.offsetWidth; 
          
          innerSpan.classList.add('scrolling');
          titleEl.style.textAlign = 'left'; 
      } else {
          innerSpan.classList.remove('scrolling');
          titleEl.style.textAlign = 'left'; 
      }
  }

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
    updateTitleOrLyric(true); // 切歌强制刷新

    fetchLyrics(song);

    if (startTime > 0) {
        audio.currentTime = startTime; 
        const seekFn = () => {
            if(Math.abs(audio.currentTime - startTime) > 1) {
                audio.currentTime = startTime;
            }
        };
        audio.addEventListener('canplay', seekFn, { once: true });
    }

    audio.src = song.src;

    if (playMode === 1) {
        audio.loop = true;
    } else {
        audio.loop = false;
    }
    
    renderSongListDOM(); 
    updateMediaSession(song);
    updateHeartStatus();

    if (!isRestore) {
        savePlaybackState();
    }
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
    let nextIndex;
    
    if (playMode === 1 && isAuto) { 
      if (audio.paused) audio.play(); 
      return; 
    } 

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
    if (el.classList.contains("show")) {
      hideMenu(el);
    } else {
      el.classList.remove("hide");
      el.classList.add("show");
    }
  }
  function hideMenu(el) {
    if (el && el.classList.contains("show")) {
        el.classList.remove("show");
        el.classList.add("hide");
    }
  }

  function renderSongListDOM() {
    if (!songListEl) return;
    songListEl.innerHTML = currentList.map((s, i) => {
      const count = userPlayHistory[s.title] || 0;
      let countHtml = '';
      if (currentPlaylistKey === 'history_rank') {
        countHtml = `<span class="play-count-tag">${count} 次</span>`;
      }
      return `
      <div class="playlist-item ${i === currentIndex ? 'active' : ''}" data-index="${i}">
        <span class="song-name">${s.title}</span>
        ${countHtml}
      </div>
    `}).join("");
  }

  titleEl.addEventListener("click", (e) => {
    e.stopPropagation();
    if (player.classList.contains("flipped")) return; 
    hideMenu(playlistMenuEl); 
    toggleMenu(songListEl);
  });

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

  function renderPlaylistMenu() {
    if (!playlistMenuEl) return;
    playlistMenuEl.innerHTML = playlistsConfig.map(cfg => `
      <div class="playlist-item ${cfg.key === currentPlaylistKey ? 'active' : ''}" data-key="${cfg.key}">
        ${cfg.name}
      </div>
    `).join("");
  }

  playlistTitleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideMenu(songListEl); 
    toggleMenu(playlistMenuEl);
  });

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

  function changePlaylist(key) {
    const config = playlistsConfig.find(c => c.key === key);
    if (!config) return;
    currentPlaylistKey = key;
    playlistTitleBtn.textContent = config.name; 
    
    currentList = allSongsLibrary.filter(config.filter);

    if (key === 'history_rank') {
        currentList.sort((a, b) => {
            const countA = userPlayHistory[a.title] || 0;
            const countB = userPlayHistory[b.title] || 0;
            return countB - countA;
        });
    }

    shuffleQueue = [];
    currentIndex = 0;
    
    if (currentList.length > 0) {
        loadSong(0);
        audio.play().catch(e => console.warn("Autoplay blocked:", e));
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

  modeBtn.addEventListener('click', async (e) => {
    e.stopPropagation(); 
    playMode = (playMode + 1) % 3;
    modeBtn.innerHTML = playModes[playMode].icon;

    if (playMode === 1) {
        audio.loop = true;
    } else {
        audio.loop = false;
    }

    if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        try {
            await setDoc(userDocRef, { playMode: playMode }, { merge: true });
        } catch (err) {
            console.error("保存播放模式失败", err);
        }
    }
  });

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
        console.error("操作失败", err);
        updateHeartStatus(); 
        alert("网络开小差了，同步失败");
    }
  });

  document.addEventListener("click", e => {
    const inPlayer = player.contains(e.target);
    const inSongList = songListEl && songListEl.contains(e.target);
    const inPlayListMenu = playlistMenuEl && playlistMenuEl.contains(e.target);
    if (!inPlayer && !inSongList && !inPlayListMenu) {
      hideMenu(songListEl);
      hideMenu(playlistMenuEl);
    }
  });

  let isDrag = false;
  let pressTimer;
  const startPress = (e) => {
    if (e.target.closest('button')) return; 
    isDrag = false;
    pressTimer = setTimeout(() => {
      if (!isDrag) {
        player.classList.toggle("flipped");
        hideMenu(songListEl);
        hideMenu(playlistMenuEl);
      }
    }, 300);
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
    inactivityTimer = setTimeout(hidePlayerUI, 1800000); 
  }
  ['scroll','mousemove','mousedown','touchstart','keydown'].forEach(evt => window.addEventListener(evt, showPlayerUI));

  playPauseBtn.addEventListener("click", togglePlay);
  nextBtn.addEventListener("click", () => playNext(false));
  
  audio.addEventListener("ended", () => {
    if (playMode !== 1) { 
        if (currentList && currentList[currentIndex]) {
            recordPlayHistory(currentList[currentIndex].title);
        }
        playNext(true);
    }
  });

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

  /* --- 🔥 timeupdate 监听器 (无进度条版) --- */
  let lastTimeForLoop = 0; 

  audio.addEventListener('timeupdate', () => { 
    if (Math.floor(audio.currentTime) % 5 === 0) updatePositionState();
    
    // --- 歌词逻辑 ---
    if (!audio.paused && hasLyrics && currentLyrics.length > 0 && !isLyricsLoading) {
        const currentTime = audio.currentTime;
        let activeIndex = -1;
        
        for (let i = 0; i < currentLyrics.length; i++) {
            if (currentTime >= currentLyrics[i].time) {
                activeIndex = i;
            } else {
                break; 
            }
        }

        // 仅当歌词改变时触发 DOM 更新 (防抖 + 重置动画)
        if (activeIndex !== currentLyricIndex) {
            currentLyricIndex = activeIndex;
            updateTitleOrLyric(true); 
        }
    }

    // 单曲循环计数
    if (playMode === 1 && audio.duration > 0) {
        if (audio.currentTime < lastTimeForLoop && lastTimeForLoop > audio.duration - 1.5) {
             const now = Date.now();
             if (now - lastCountTime > 2000) {
                 console.log("检测到单曲循环：播放次数 +1");
                 if (currentList && currentList[currentIndex]) {
                     recordPlayHistory(currentList[currentIndex].title);
                 }
                 lastCountTime = now;
             }
        }
    }
    lastTimeForLoop = audio.currentTime; 
    
    // 进度保存
    const now = Date.now();
    if (now - lastSaveTime > 10000 && !audio.paused) { 
        savePlaybackState();
        lastSaveTime = now;
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'hidden') {
        savePlaybackState();
    }
  });

  resetTimer();
  
  if(allSongsLibrary.length > 0) loadSong(0);

  /* =========================================================
     🔥 PART 3: 登录 & UI 交互
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

  if (navAuthBtn) {
    navAuthBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (modalOverlay) modalOverlay.classList.add("active");
      const dropdown = document.getElementById("dropdown");
      if (dropdown && dropdown.classList.contains("show")) dropdown.classList.remove("show");
      
      if (window.turnstile) {
        try { window.turnstile.reset(); } 
        catch(e) { /* Fallback */ }
      }
      window.isCaptchaVerified = false; 
      if(window.checkLoginButtonState) window.checkLoginButtonState();
    });
  }

  const closeModal = () => modalOverlay?.classList.remove("active");
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

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
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const defaultName = email.split("@")[0];
        await updateProfile(userCredential.user, {
          displayName: defaultName,
          photoURL: "assets/bannernetwork.png" 
        });
        closeModal(); 
      } catch (error) {
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

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", async () => {
      try {
          await setPersistence(auth, browserLocalPersistence);
          await signInWithPopup(auth, provider);
          closeModal();
      } catch(e) {
          console.error(e);
      }
    });
  }

  if (logoutConfirmBtn) {
    logoutConfirmBtn.addEventListener("click", () => {
      signOut(auth).then(() => closeModal());
    });
  }

  onAuthStateChanged(auth, (user) => {
    currentUser = user; 
    if (user) {
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

      const userDocRef = doc(db, "users", user.uid);
      
      onSnapshot(userDocRef, (docSnap) => {
         if (docSnap.exists()) {
             const data = docSnap.data();
             userFavorites = data.favorites || [];
             userPlayHistory = data.playHistory || {}; 
             
             if (data.playMode !== undefined) {
                 playMode = data.playMode; 
                 modeBtn.innerHTML = playModes[playMode].icon; 
                 
                 if (playMode === 1) {
                     audio.loop = true;
                 } else {
                     audio.loop = false;
                 }
             }
             
             if (!initialRestoreDone && data.lastPlayed && audio.paused && audio.currentTime === 0) {
                 let lastTitle = "";
                 let lastTime = 0;
                 let lastPlaylist = "All songs";

                 if (typeof data.lastPlayed === 'object') {
                     lastTitle = data.lastPlayed.title;
                     lastTime = data.lastPlayed.time || 0;
                     lastPlaylist = data.lastPlayed.playlist || "All songs"; 
                 } else {
                     lastTitle = data.lastPlayed;
                 }

                 const savedPlaylistConfig = playlistsConfig.find(c => c.key === lastPlaylist);
                 const targetConfig = savedPlaylistConfig || playlistsConfig.find(c => c.key === 'All songs') || playlistsConfig[0];

                 if (targetConfig) {
                     currentPlaylistKey = targetConfig.key;
                     currentList = allSongsLibrary.filter(targetConfig.filter);
                     
                     if (currentPlaylistKey === 'history_rank') {
                        currentList.sort((a, b) => {
                            const countA = userPlayHistory[a.title] || 0;
                            const countB = userPlayHistory[b.title] || 0;
                            return countB - countA;
                        });
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
             setDoc(userDocRef, { favorites: [], playHistory: {} }, { merge: true });
             userFavorites = [];
             userPlayHistory = {};
         }
         updatePlaylistConfig();
         updateHeartStatus();
         if (currentPlaylistKey === 'history_rank') {
            renderSongListDOM();
         }
      });
    } else {
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
