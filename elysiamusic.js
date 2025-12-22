/* elysiamusic.js - Ultimate Version: Mini & Fullscreen Sync */

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

// Firestore 离线持久化
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
console.log("[Firebase] Firestore Ready");

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
    if (errorMsg && errorMsg.innerText === "请输入邮箱和密码") errorMsg.innerText = "";
  } else {
    btn.disabled = true;
    btn.style.opacity = "0.6";
    btn.style.cursor = "not-allowed";
  }
};

window.onTurnstileSuccess = function(token) {
  window.isCaptchaVerified = true;
  const err = document.getElementById("auth-error-msg");
  if (err) err.innerText = "";
  window.checkLoginButtonState();
};

window.onTurnstileExpired = function() {
  window.isCaptchaVerified = false;
  window.checkLoginButtonState();
};

/* =========================================================
   🔥 PART 2: 播放器核心逻辑
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  
  const allSongsLibrary = window.allSongsLibrary || [];
  if (!window.allSongsLibrary) console.error("Missing song.js data!");

  // 用户数据
  let userFavorites = [];
  let userPlayHistory = {}; 
  let currentUser = null;
  let lastSaveTime = 0; 
  let initialRestoreDone = false; 

  // 歌词数据
  let currentLyrics = [];     
  let hasLyrics = false;      
  let isLyricsLoading = false; 
  let currentLyricIndex = -1; 
  let lastCountTime = 0;

  /* SVG ICONS */
  const ICONS = {
    play: `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    next: `<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`,
    loopList: `<svg viewBox="0 0 24 24"><path d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4zm2-2v-4h-2v3H5v-6h2v4h12z"/></svg>`,
    loopOne: `<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>`,
    shuffle: `<svg viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`,
    heart: `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
  };

  /* 歌单配置 */
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

  /* 状态变量 */
  let currentPlaylistKey = 'piano';
  let currentList = allSongsLibrary.filter(s => s.category === 'piano'); 
  let currentIndex = 0;
  let shuffleQueue = []; 
  let playMode = 0; 
  const playModes = [
    { icon: ICONS.loopList, name: "列表循环" },
    { icon: ICONS.loopOne, name: "单曲循环" },
    { icon: ICONS.shuffle, name: "随机播放" }
  ];

  /* 播放历史记录 */
  async function recordPlayHistory(songTitle) {
    if (!currentUser) return; 
    userPlayHistory[songTitle] = (userPlayHistory[songTitle] || 0) + 1;
    if (currentPlaylistKey === 'history_rank') renderSongListDOM(); 

    const userDocRef = doc(db, "users", currentUser.uid);
    try {
        await setDoc(userDocRef, { playHistory: { [songTitle]: increment(1) } }, { merge: true });
    } catch (e) { console.error(e); }
  }

  async function savePlaybackState() {
    if (!currentUser || !currentList[currentIndex]) return;
    try {
      await setDoc(doc(db, "users", currentUser.uid), { 
        lastPlayed: {
          title: currentList[currentIndex].title,
          time: audio.currentTime,
          playlist: currentPlaylistKey 
        }
      }, { merge: true }); 
    } catch (e) {}
  }

  /* 混淆算法 */
  function getShuffledIndices(length) {
    let arr = Array.from({length}, (_, i) => i);
    for (let i = length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  
  /* DOM Elements */
  const audio = new Audio();
  audio.crossOrigin = "anonymous"; 
  audio.preload = "auto";
  audio.playsInline = true; 

  const player = document.getElementById("elysiaPlayer");
  
  // Mini Player Elements
  const playPauseBtn = document.getElementById("playPauseBtn");
  const nextBtn = document.getElementById("nextBtn");
  const titleEl = document.getElementById("songTitle");
  const miniCoverBtn = document.getElementById("miniCoverBtn");
  const miniCoverImg = document.getElementById("miniCoverImg");
  const playlistTitleBtn = document.getElementById("playlistTitleBtn");
  const progressBar = document.getElementById("progressBar");

  // Fullscreen Elements
  const fsPlayer = document.getElementById("fullscreenPlayer");
  const fsCloseBtn = document.getElementById("fsCloseBtn");
  const fsCoverImg = document.getElementById("fsCoverImg");
  const fsBg = document.getElementById("fsBg");
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

  // Menus
  const songListEl = document.getElementById("playlist"); 
  const playlistMenuEl = document.getElementById("playlistMenu");

  /* Init */
  function initIcons() {
    playPauseBtn.innerHTML = ICONS.play;
    nextBtn.innerHTML = ICONS.next;
    
    // Fullscreen icons
    fsPlayBtn.innerHTML = ICONS.play;
    fsHeartBtn.innerHTML = ICONS.heart;
    fsModeBtn.innerHTML = playModes[0].icon;
  }
  initIcons();

  /* Update Hearts (Sync Both) */
  function updateHeartStatus() {
      if (!currentList || !currentList[currentIndex]) return;
      const currentTitle = currentList[currentIndex].title;
      const isLiked = userFavorites.includes(currentTitle);
      
      // Mini
      if(isLiked) { /* heartBtn handled by external logic mostly, but we can style if needed */ }
      
      // Fullscreen
      if(isLiked) fsHeartBtn.classList.add("liked");
      else fsHeartBtn.classList.remove("liked");
  }

  /* Lyric Logic */
  function parseLRC(lrcText) {
      if(!lrcText) return [];
      const lines = lrcText.split('\n');
      const regex = /^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
      const result = [];
      lines.forEach(line => {
          const match = line.match(regex);
          if (match) {
              const time = parseInt(match[1]) * 60 + parseInt(match[2]) + parseInt(match[3].substring(0,3).padEnd(3,'0')) / 1000;
              const text = match[4].trim();
              if (text) result.push({ time, text });
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
          updateTitleOrLyric();
          return;
      }
      const localCacheKey = "lyric_" + song.title; 
      const cachedLrc = localStorage.getItem(localCacheKey);
      if (cachedLrc) {
          currentLyrics = parseLRC(cachedLrc);
          if (currentLyrics.length > 0) hasLyrics = true;
          isLyricsLoading = false; 
          updateTitleOrLyric();
          return;
      }
      isLyricsLoading = true;
      updateTitleOrLyric(); 
      try {
          const response = await fetch(song.lrc);
          if (response.ok) {
              const lrcText = await response.text();
              try { localStorage.setItem(localCacheKey, lrcText); } catch(e){}
              currentLyrics = parseLRC(lrcText);
              if (currentLyrics.length > 0) hasLyrics = true;
          }
      } catch (e) {} finally {
          isLyricsLoading = false;
          updateTitleOrLyric(); 
      }
  }

  /* Title / Lyric Marquee Logic */
  function updateTitleOrLyric() {
      if (!currentList || !currentList[currentIndex]) return;
      const song = currentList[currentIndex];
      let textToShow = song.title;
      
      // 只有在播放且有歌词时才切歌词，否则显示标题
      if (!audio.paused && hasLyrics && currentLyricIndex >= 0 && currentLyricIndex < currentLyrics.length) {
          textToShow = currentLyrics[currentLyricIndex].text;
      } else if (isLyricsLoading) {
          textToShow = "歌词加载中...";
      }

      titleEl.innerHTML = `<span class="scroll-inner">${textToShow}</span>`;
      const innerSpan = titleEl.querySelector('.scroll-inner');
      const containerWidth = titleEl.clientWidth;
      const textWidth = innerSpan.scrollWidth;

      if (textWidth > containerWidth) {
          const duration = (textWidth / 40) + 2; 
          innerSpan.style.setProperty('--scroll-duration', `${duration}s`);
          innerSpan.classList.add('scrolling');
      } else {
          innerSpan.classList.remove('scrolling');
      }
  }

  /* Load Song */
  function loadSong(index, isRestore = false, startTime = 0) {
    if (!currentList || currentList.length === 0) return;
    if (index < 0) index = currentList.length - 1;
    if (index >= currentList.length) index = 0;
    
    currentIndex = index;
    const song = currentList[currentIndex];
    
    // Reset Lyric
    currentLyrics = []; hasLyrics = false; currentLyricIndex = -1;
    isLyricsLoading = true;
    updateTitleOrLyric(); 
    fetchLyrics(song);

    // Audio Source
    audio.src = song.src;
    if (startTime > 0) {
        audio.currentTime = startTime; 
        audio.addEventListener('canplay', () => {
             if(Math.abs(audio.currentTime - startTime) > 1) audio.currentTime = startTime;
        }, { once: true });
    }
    audio.loop = (playMode === 1);

    // === Sync UI ===
    // Mini
    miniCoverImg.src = song.cover || 'assets/cover_placeholder.jpg';
    // Fullscreen
    fsCoverImg.src = song.cover || 'assets/cover_placeholder.jpg';
    fsBg.style.backgroundImage = `url(${song.cover || 'assets/cover_placeholder.jpg'})`;
    fsTitle.innerText = song.title;
    fsArtist.innerText = song.artist || "Unknown Artist";

    renderSongListDOM(); 
    updateMediaSession(song);
    updateHeartStatus();
    if (!isRestore) savePlaybackState();
  }

  /* Play Controls */
  function togglePlay() {
    if (audio.paused) {
      audio.play().catch(e => console.log("Waiting for user interaction"));
      // Sync Icons
      playPauseBtn.innerHTML = ICONS.pause;
      fsPlayBtn.innerHTML = ICONS.pause;
      fsPlayBtn.classList.add("playing");
      
      player.classList.add("playing");
      updateTitleOrLyric(); 
    } else {
      audio.pause();
      // Sync Icons
      playPauseBtn.innerHTML = ICONS.play;
      fsPlayBtn.innerHTML = ICONS.play;
      fsPlayBtn.classList.remove("playing");
      
      player.classList.remove("playing");
      updateTitleOrLyric(); 
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
        if (currentList.length > 1 && shuffleQueue[0] === currentIndex) shuffleQueue.push(shuffleQueue.shift());
      }
      nextIndex = shuffleQueue.shift();
    } else { 
      nextIndex = (currentIndex + 1) % currentList.length;
    }
    loadSong(nextIndex);
    audio.play().catch(e => {}); 
    
    // Sync UI State
    playPauseBtn.innerHTML = ICONS.pause;
    fsPlayBtn.innerHTML = ICONS.pause;
    fsPlayBtn.classList.add("playing");
    player.classList.add("playing");
  }

  /* Menus Toggle */
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

  /* --- Event Listeners --- */
  
  // 1. Mini Player Interactions
  titleEl.addEventListener("click", (e) => {
    e.stopPropagation();
    hideMenu(playlistMenuEl); 
    toggleMenu(songListEl);
  });
  
  playlistTitleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideMenu(songListEl); 
    toggleMenu(playlistMenuEl);
  });

  // 2. Playlists
  songListEl.addEventListener("click", e => {
    const item = e.target.closest(".playlist-item");
    if (item) {
      loadSong(parseInt(item.dataset.index));
      audio.play();
      playPauseBtn.innerHTML = ICONS.pause;
      fsPlayBtn.innerHTML = ICONS.pause;
      fsPlayBtn.classList.add("playing");
      player.classList.add("playing");
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

  if (playlistMenuEl) {
    playlistMenuEl.addEventListener('click', (e) => {
      const item = e.target.closest(".playlist-item");
      if (item) changePlaylist(item.dataset.key);
    });
  }

  function updatePlaylistConfig() {
     /* (Logic to inject "My Favorites" into playlistConfig dynamically) */
     const favIndex = playlistsConfig.findIndex(p => p.key === "my_favorites");
     const myFavPlaylist = { key: "my_favorites", name: "私の好きな音乐", filter: (s) => userFavorites.includes(s.title) };
     if (currentUser && userFavorites.length > 0) {
        if (favIndex === -1) playlistsConfig.splice(1, 0, myFavPlaylist);
        else playlistsConfig[favIndex] = myFavPlaylist;
     } else {
        if (favIndex !== -1) {
            playlistsConfig.splice(favIndex, 1);
            if (currentPlaylistKey === 'my_favorites') changePlaylist('All songs');
        }
     }
     renderPlaylistMenu();
  }

  function changePlaylist(key) {
    const config = playlistsConfig.find(c => c.key === key);
    if (!config) return;
    currentPlaylistKey = key;
    // Hide menus
    hideMenu(songListEl);
    hideMenu(playlistMenuEl);

    currentList = allSongsLibrary.filter(config.filter);
    if (key === 'history_rank') {
        currentList.sort((a, b) => (userPlayHistory[b.title] || 0) - (userPlayHistory[a.title] || 0));
    }

    shuffleQueue = [];
    currentIndex = 0;
    if (currentList.length > 0) {
        loadSong(0);
        audio.play().catch(e => {});
        playPauseBtn.innerHTML = ICONS.pause;
        fsPlayBtn.innerHTML = ICONS.pause;
        fsPlayBtn.classList.add("playing");
        player.classList.add("playing");
    } else {
        titleEl.textContent = "暂无数据";
    }
    renderPlaylistMenu();
    renderSongListDOM();
  }

  /* =========================================
     🔥 FULLSCREEN INTERACTIONS
     ========================================= */
  // Open
  miniCoverBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fsPlayer.classList.add("active");
    hideMenu(songListEl);
    hideMenu(playlistMenuEl);
  });
  // Close
  fsCloseBtn.addEventListener("click", () => fsPlayer.classList.remove("active"));
  
  // Fullscreen Buttons
  fsPlayBtn.addEventListener("click", togglePlay);
  fsNextBtn.addEventListener("click", () => playNext(false));
  fsPrevBtn.addEventListener("click", () => {
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = currentList.length - 1;
      loadSong(prevIndex);
      audio.play();
      // Sync
      playPauseBtn.innerHTML = ICONS.pause;
      fsPlayBtn.innerHTML = ICONS.pause;
      fsPlayBtn.classList.add("playing");
  });
  
  // Progress Bar Seek
  fsProgressWrap.addEventListener("click", (e) => {
      const rect = fsProgressWrap.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      if (audio.duration) {
          audio.currentTime = (clickX / width) * audio.duration;
      }
  });

  // Mode Switch
  fsModeBtn.addEventListener('click', async () => {
      playMode = (playMode + 1) % 3;
      fsModeBtn.innerHTML = playModes[playMode].icon;
      audio.loop = (playMode === 1);
      // Save
      if (currentUser) {
          try { await setDoc(doc(db, "users", currentUser.uid), { playMode }, { merge: true }); } catch(e){}
      }
  });

  // Heart (Sync Logic)
  fsHeartBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!currentUser) {
          alert("请先登录~");
          document.getElementById("login-modal-overlay")?.classList.add("active");
          return;
      }
      const songTitle = currentList[currentIndex].title;
      const userDocRef = doc(db, "users", currentUser.uid);
      const isLiked = userFavorites.includes(songTitle);

      // Optimistic UI update
      if (isLiked) {
          fsHeartBtn.classList.remove("liked");
          try { await updateDoc(userDocRef, { favorites: arrayRemove(songTitle) }); } catch(e){ fsHeartBtn.classList.add("liked"); }
      } else {
          fsHeartBtn.classList.add("liked");
          try { await updateDoc(userDocRef, { favorites: arrayUnion(songTitle) }); } catch(e){ fsHeartBtn.classList.remove("liked"); }
      }
  });

  /* Audio Events */
  audio.addEventListener("ended", () => {
    if (playMode !== 1) { 
        if (currentList && currentList[currentIndex]) recordPlayHistory(currentList[currentIndex].title);
        playNext(true);
    }
  });

  audio.addEventListener('timeupdate', () => {
    // 1. Mini Progress
    if (progressBar && audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${percent}%`;
    }

    // 2. Fullscreen Progress & Time
    if (fsProgressBarFill && audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        fsProgressBarFill.style.width = `${percent}%`;
        
        const formatTime = (t) => {
             const m = Math.floor(t / 60);
             const s = Math.floor(t % 60).toString().padStart(2, '0');
             return `${m}:${s}`;
        };
        fsTimeCurrent.innerText = formatTime(audio.currentTime);
        fsTimeTotal.innerText = formatTime(audio.duration);
    }

    // 3. Lyric Sync
    if (!audio.paused && hasLyrics && !isLyricsLoading) {
        let activeIndex = -1;
        for (let i = 0; i < currentLyrics.length; i++) {
            if (audio.currentTime >= currentLyrics[i].time) activeIndex = i;
            else break; 
        }
        if (activeIndex !== currentLyricIndex) {
            currentLyricIndex = activeIndex;
            updateTitleOrLyric();
        }
    }

    // 4. Single Loop Count
    if (playMode === 1 && audio.duration > 0) {
        const now = Date.now();
        if (audio.currentTime < 2 && (now - lastCountTime > 5000) && audio.duration > 10) {
             // 简单的判断：如果时间很小且距离上次记录很久，说明刚才 loop 了
             // (更严谨的方案是用 ended 事件配合 loop=false 手动 seek，但这里为了保持原生loop属性做的折中)
        }
    }

    // 5. Save State
    const now = Date.now();
    if (now - lastSaveTime > 15000 && !audio.paused) { 
        savePlaybackState();
        lastSaveTime = now;
    }

    if('setPositionState' in navigator.mediaSession) {
         navigator.mediaSession.setPositionState({
             duration: audio.duration || 0,
             playbackRate: audio.playbackRate,
             position: audio.currentTime
         });
    }
  });

  function updateMediaSession(song) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist || "Elysia Player", 
        artwork: [{ src: song.cover || 'assets/cover_placeholder.jpg', sizes: "512x512", type: "image/jpeg" }]
      });
      navigator.mediaSession.setActionHandler('play', togglePlay);
      navigator.mediaSession.setActionHandler('pause', togglePlay);
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext(false));
      navigator.mediaSession.setActionHandler('previoustrack', () => {
          let prev = currentIndex - 1; 
          if(prev < 0) prev = currentList.length-1; 
          loadSong(prev); 
          audio.play();
      });
    }
  }

  // Hide UI on long inactivity
  let inactivityTimer;
  function hidePlayerUI() { player.classList.add('ui-hidden'); hideMenu(songListEl); hideMenu(playlistMenuEl); }
  function showPlayerUI() { player.classList.remove('ui-hidden'); resetTimer(); }
  function resetTimer() { clearTimeout(inactivityTimer); inactivityTimer = setTimeout(hidePlayerUI, 3000000); } // 很久才隐藏
  ['mousemove','touchstart','click'].forEach(evt => window.addEventListener(evt, showPlayerUI));
  resetTimer();

  // Mini Player Buttons
  playPauseBtn.addEventListener("click", togglePlay);
  nextBtn.addEventListener("click", () => playNext(false));
  
  /* =========================================
     🔥 PART 3: Auth & Init Logic
     ========================================= */
  
  // Auth Listeners
  const navAuthBtn = document.getElementById("nav-auth-btn");
  const modalOverlay = document.getElementById("login-modal-overlay");
  const closeBtn = document.getElementById("close-modal-btn");
  
  if (navAuthBtn) navAuthBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modalOverlay.classList.add("active");
      try { window.turnstile.reset(); } catch(e){}
  });
  if (closeBtn) closeBtn.addEventListener("click", () => modalOverlay.classList.remove("active"));
  
  // Login Logic
  const emailSubmitBtn = document.getElementById("email-submit-btn");
  if (emailSubmitBtn) {
    emailSubmitBtn.addEventListener("click", async () => {
        if(emailSubmitBtn.disabled || !window.isCaptchaVerified) return;
        const email = document.getElementById("email-input").value;
        const pass = document.getElementById("pass-input").value;
        try {
            await setPersistence(auth, browserLocalPersistence);
            await createUserWithEmailAndPassword(auth, email, pass);
            await updateProfile(auth.currentUser, { displayName: email.split("@")[0], photoURL: "assets/bannernetwork.png" });
            modalOverlay.classList.remove("active");
        } catch (e) {
            if (e.code === 'auth/email-already-in-use') {
                try {
                    await signInWithEmailAndPassword(auth, email, pass);
                    modalOverlay.classList.remove("active");
                } catch (e2) { document.getElementById("auth-error-msg").innerText = "登录失败"; }
            } else { document.getElementById("auth-error-msg").innerText = e.message; }
        }
    });
  }

  const googleLoginBtn = document.getElementById("google-login-btn");
  if(googleLoginBtn) {
      googleLoginBtn.addEventListener("click", async () => {
          try { await signInWithPopup(auth, provider); modalOverlay.classList.remove("active"); } catch(e){}
      });
  }

  document.getElementById("logout-confirm-btn")?.addEventListener("click", () => signOut(auth).then(()=>modalOverlay.classList.remove("active")));

  // Auth State Observer
  onAuthStateChanged(auth, (user) => {
    currentUser = user; 
    const navAuthText = document.getElementById("nav-auth-text");
    const navIcon = document.getElementById("auth-icon-slot");
    const loginDiv = document.getElementById("login-actions");
    const infoDiv = document.getElementById("user-info-panel");

    if (user) {
      const name = user.displayName || user.email.split("@")[0];
      const pic = user.photoURL || "assets/bannernetwork.png";
      if(navAuthText) navAuthText.innerText = name;
      if(navIcon) navIcon.innerHTML = `<img src="${pic}" style="width:100%;height:100%;border-radius:50%">`;
      if(loginDiv) loginDiv.style.display = "none";
      if(infoDiv) infoDiv.style.display = "block";
      document.getElementById("modal-user-name").innerText = name;
      document.getElementById("modal-user-avatar").src = pic;

      // Load Data
      const userRef = doc(db, "users", user.uid);
      onSnapshot(userRef, (snap) => {
         if (snap.exists()) {
             const data = snap.data();
             userFavorites = data.favorites || [];
             userPlayHistory = data.playHistory || {};
             if(data.playMode !== undefined) {
                 playMode = data.playMode;
                 fsModeBtn.innerHTML = playModes[playMode].icon;
                 audio.loop = (playMode === 1);
             }
             // Restore Last Played
             if (!initialRestoreDone && data.lastPlayed && audio.paused) {
                 const lp = data.lastPlayed;
                 const savedTitle = lp.title || lp; // compat
                 const savedConfig = playlistsConfig.find(c => c.key === (lp.playlist || "All songs")) || playlistsConfig[0];
                 
                 changePlaylist(savedConfig.key);
                 
                 const tIdx = currentList.findIndex(s => s.title === savedTitle);
                 if (tIdx !== -1) {
                     loadSong(tIdx, true, lp.time || 0);
                     initialRestoreDone = true;
                 }
             }
         } else {
             setDoc(userRef, { favorites: [], playHistory: {} }, { merge: true });
         }
         updatePlaylistConfig();
         updateHeartStatus();
      });

    } else {
      // Logged out
      if(navAuthText) navAuthText.innerText = "登录 / 同步";
      if(navIcon) navIcon.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`;
      if(loginDiv) loginDiv.style.display = "block";
      if(infoDiv) infoDiv.style.display = "none";
      userFavorites = [];
      userPlayHistory = {};
      updatePlaylistConfig();
      updateHeartStatus();
    }
  });

  // Inputs Check
  const emailIn = document.getElementById("email-input");
  const passIn = document.getElementById("pass-input");
  if(emailIn && passIn) {
      ['input','change'].forEach(ev => {
          emailIn.addEventListener(ev, window.checkLoginButtonState);
          passIn.addEventListener(ev, window.checkLoginButtonState);
      });
  }

  // Start
  if(allSongsLibrary.length > 0) loadSong(0);

});
