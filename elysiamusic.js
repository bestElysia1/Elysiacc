/* elysiamusic.js - Final Ultimate Version
   Features: 
   1. Mini & Fullscreen Sync
   2. Swipe-down Gesture (Physics-like)
   3. Oil Painting Lyrics View
   4. High Performance Background Blur
*/

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

/* =========================================================
   🔥 1. Firebase Configuration
   ========================================================= */
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
   🔥 2. Global Utilities (Auth & Cloudflare)
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
   🔥 3. Main Player Logic
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  
  const allSongsLibrary = window.allSongsLibrary || [];
  if (!allSongsLibrary.length) console.warn("[Elysia] No songs loaded.");

  // --- State Variables ---
  let userFavorites = [];
  let userPlayHistory = {}; 
  let currentUser = null;
  let lastSaveTime = 0; 
  
  // Lyrics State
  let currentLyrics = []; 
  let hasLyrics = false; 
  let currentLyricIndex = -1;

  // Playback State
  let currentPlaylistKey = 'piano';
  let currentList = allSongsLibrary.filter(s => s.category === 'piano');
  let currentIndex = 0;
  let playMode = 0; // 0:List, 1:One, 2:Shuffle
  let shuffleQueue = [];

  // --- Audio Setup ---
  const audio = new Audio();
  audio.crossOrigin = "anonymous";
  audio.preload = "auto";
  audio.playsInline = true;

  // --- DOM Elements ---
  const player = document.getElementById("elysiaPlayer");
  const fsPlayer = document.getElementById("fullscreenPlayer");
  
  // Mini Player
  const playPauseBtn = document.getElementById("playPauseBtn");
  const nextBtn = document.getElementById("nextBtn");
  const titleEl = document.getElementById("songTitle");
  const miniCoverBtn = document.getElementById("miniCoverBtn");
  const miniCoverImg = document.getElementById("miniCoverImg");
  const progressBar = document.getElementById("progressBar");

  // Fullscreen Elements
  const fsCloseBtn = document.getElementById("fsCloseBtn");
  const fsCoverImg = document.getElementById("fsCoverImg");
  const fsTitle = document.getElementById("fsTitle");
  const fsArtist = document.getElementById("fsArtist");
  const fsPlayBtn = document.getElementById("fsPlayPauseBtn");
  const fsPrevBtn = document.getElementById("fsPrevBtn");
  const fsNextBtn = document.getElementById("fsNextBtn");
  const fsListBtn = document.getElementById("fsListBtn"); // New Playlist Button
  
  const fsProgressWrap = document.getElementById("fsProgressWrap");
  const fsProgressBarFill = document.getElementById("fsProgressBarFill");
  const fsTimeCurrent = document.getElementById("fsTimeCurrent");
  const fsTimeTotal = document.getElementById("fsTimeTotal");
  const fsModeBtn = document.getElementById("fsModeBtn");

  // Lyrics & View Elements
  const fsViewCover = document.getElementById("fsViewCover");
  const fsViewLyrics = document.getElementById("fsViewLyrics");
  const fsCoverWrapper = document.getElementById("fsCoverWrapper");
  const lyricsBox = document.getElementById("lyricsBox");

  // Menus
  const songListEl = document.getElementById("playlist");
  const playlistMenuEl = document.getElementById("playlistMenu");

  // --- Icons ---
  const ICONS = {
    play: `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    next: `<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`,
    mode0: `<svg viewBox="0 0 24 24"><path d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4zm2-2v-4h-2v3H5v-6h2v4h12z"/></svg>`,
    mode1: `<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>`,
    mode2: `<svg viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`
  };
  const modeIcons = [ICONS.mode0, ICONS.mode1, ICONS.mode2];

  // Playlist Configuration
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

  // Initialize UI
  function initUI() {
    playPauseBtn.innerHTML = ICONS.play;
    nextBtn.innerHTML = ICONS.next;
    fsPlayBtn.innerHTML = ICONS.play;
    fsModeBtn.innerHTML = modeIcons[0];
  }
  initUI();

  // =========================================================
  // 🔥 Core Playback Logic
  // =========================================================

  async function loadSong(index, autoPlay = false) {
    if (!currentList.length) return;
    if (index < 0) index = currentList.length - 1;
    if (index >= currentList.length) index = 0;
    
    currentIndex = index;
    const song = currentList[currentIndex];
    
    // 1. Sync Images & Background
    const coverUrl = song.cover || 'assets/cover_placeholder.jpg';
    miniCoverImg.src = coverUrl;
    fsCoverImg.src = coverUrl;
    // Update CSS Variable for high-performance blur
    fsPlayer.style.setProperty('--bg-img', `url(${coverUrl})`);
    
    // 2. Sync Text
    fsTitle.innerText = song.title;
    fsArtist.innerText = song.artist || "Unknown";
    
    // 3. Reset Lyrics & View
    currentLyrics = []; 
    hasLyrics = false; 
    currentLyricIndex = -1;
    
    // 每次切歌重置为封面视图
    fsViewLyrics.classList.remove('active');
    fsViewCover.classList.remove('hidden');
    // 清空旧歌词
    lyricsBox.innerHTML = '<p class="placeholder" style="margin-top:50%">Loading...</p>';
    
    updateTitleOrLyric(song.title);
    fetchLyrics(song);

    // 4. Audio Setup
    audio.src = song.src;
    audio.loop = (playMode === 1); 
    
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
    
    // 5. Metadata & History
    updateMediaSession(song);
    recordPlayHistory(song.title);
  }

  function updatePlayState(isPlaying) {
    const icon = isPlaying ? ICONS.pause : ICONS.play;
    playPauseBtn.innerHTML = icon;
    fsPlayBtn.innerHTML = icon;
    
    if(isPlaying) {
      fsPlayBtn.classList.add("playing");
      player.classList.add("playing"); // For mini cover rotation
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
    if (playMode === 1 && !userTriggered) return; 
    
    let nextIdx;
    if (playMode === 2) { // Shuffle
      if (shuffleQueue.length === 0) {
          shuffleQueue = Array.from({length: currentList.length}, (_, i) => i);
          for (let i = shuffleQueue.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffleQueue[i], shuffleQueue[j]] = [shuffleQueue[j], shuffleQueue[i]];
          }
      }
      nextIdx = shuffleQueue.pop();
    } else {
      nextIdx = (currentIndex + 1) % currentList.length;
    }
    loadSong(nextIdx, true);
  }

  function playPrev() {
    let prev = currentIndex - 1;
    if (prev < 0) prev = currentList.length - 1;
    loadSong(prev, true);
  }

  // =========================================================
  // 🔥 Lyrics Engine (Oil Painting Style)
  // =========================================================
  async function fetchLyrics(song) {
    if(!song.lrc) {
        renderLyrics([]);
        return;
    }
    try {
      const res = await fetch(song.lrc);
      if(res.ok) {
        const text = await res.text();
        parseLRC(text);
        hasLyrics = true;
        renderLyrics(currentLyrics); // Render immediately
      } else {
        renderLyrics([]);
      }
    } catch(e) {
        renderLyrics([]);
    }
  }

  function parseLRC(text) {
    const lines = text.split('\n');
    const regex = /^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
    lines.forEach(line => {
      const match = line.match(regex);
      if(match) {
        const time = parseInt(match[1])*60 + parseInt(match[2]) + parseInt(match[3].substring(0,3).padEnd(3,'0'))/1000;
        const txt = match[4].trim();
        if(txt) currentLyrics.push({time, text: txt});
      }
    });
  }

  function renderLyrics(lyrics) {
    lyricsBox.innerHTML = "";
    if (lyrics.length === 0) {
      lyricsBox.innerHTML = '<p class="placeholder" style="margin-top:50%">纯音乐 / 暂无歌词</p>';
      return;
    }
    
    const fragment = document.createDocumentFragment();
    lyrics.forEach((line, index) => {
      const p = document.createElement("p");
      p.innerText = line.text;
      // Click line to seek
      p.addEventListener("click", () => {
         audio.currentTime = line.time;
         updateLyricsHighLight(index);
      });
      fragment.appendChild(p);
    });
    lyricsBox.appendChild(fragment);
  }

  function updateLyricsHighLight(index) {
    const allPs = lyricsBox.querySelectorAll('p');
    const activeP = lyricsBox.querySelector('.active');
    if (activeP) activeP.classList.remove('active');

    if (index >= 0 && index < allPs.length) {
      const target = allPs[index];
      target.classList.add('active');
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // Mini Player Marquee
  function updateTitleOrLyric(textOverride = null) {
    let text = textOverride || currentList[currentIndex].title;
    
    if (!audio.paused && hasLyrics && currentLyricIndex >= 0 && currentLyrics[currentLyricIndex]) {
      text = currentLyrics[currentLyricIndex].text;
    }
    
    titleEl.innerHTML = `<span class="scroll-inner">${text}</span>`;
    const inner = titleEl.querySelector('.scroll-inner');
    if(inner.scrollWidth > titleEl.clientWidth) {
      const duration = (inner.scrollWidth / 40) + 2; 
      inner.style.setProperty('--scroll-duration', `${duration}s`);
      inner.classList.add('scrolling');
    } else {
      inner.classList.remove('scrolling');
    }
  }

  // =========================================================
  // 🔥 Gestures & Interactions
  // =========================================================

  // 1. Swipe Down to Close (Physics-like)
  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  fsPlayer.addEventListener('touchstart', (e) => {
    // 防止在歌词滚动时误触下滑关闭
    if (fsViewLyrics.classList.contains('active') && lyricsBox.scrollTop > 5) return;
    
    startY = e.touches[0].clientY;
    isDragging = true;
    fsPlayer.classList.add('dragging'); // Disable transition for instant follow
  }, { passive: true });

  fsPlayer.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    if (diff > 0) { // Only swipe down
      e.preventDefault();
      fsPlayer.style.transform = `translateY(${diff}px)`; // 1:1 follow
      // Fade out slightly
      fsPlayer.style.opacity = `${1 - (diff / window.innerHeight)}`;
    }
  }, { passive: false });

  fsPlayer.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    fsPlayer.classList.remove('dragging');

    const diff = currentY - startY;
    if (diff > 120) { // Threshold to close
       closeFullscreen();
    } else {
       // Revert
       fsPlayer.style.transform = '';
       fsPlayer.style.opacity = '';
    }
    startY = 0;
    currentY = 0;
  });

  // 2. Open/Close Logic
  function openFullscreen() {
      fsPlayer.classList.add("active");
      player.classList.add("ui-hidden"); // Hide mini player
      hideMenu(songListEl);
      hideMenu(playlistMenuEl);
  }

  function closeFullscreen() {
      fsPlayer.classList.remove("active");
      player.classList.remove("ui-hidden"); // Show mini player
      // Clean up styles left by drag
      fsPlayer.style.transform = '';
      fsPlayer.style.opacity = '';
  }

  miniCoverBtn.addEventListener("click", (e) => { e.stopPropagation(); openFullscreen(); });
  fsCloseBtn.addEventListener("click", closeFullscreen);

  // 3. View Switch (Cover <-> Lyrics)
  fsCoverWrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      fsViewCover.classList.add('hidden');
      fsViewLyrics.classList.add('active');
      if(currentLyricIndex !== -1) updateLyricsHighLight(currentLyricIndex);
  });

  lyricsBox.addEventListener('click', (e) => {
      // Tap background to return to cover
      if(e.target === lyricsBox) {
          fsViewLyrics.classList.remove('active');
          fsViewCover.classList.remove('hidden');
      }
  });

  // 4. Controls Events
  playPauseBtn.addEventListener("click", togglePlay);
  fsPlayBtn.addEventListener("click", togglePlay);
  
  nextBtn.addEventListener("click", () => playNext(true));
  fsNextBtn.addEventListener("click", () => playNext(true));
  fsPrevBtn.addEventListener("click", playPrev);

  // 5. Playlist Menu Button (Fullscreen)
  if (fsListBtn) {
      fsListBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          // Toggle playlist menu
          if (playlistMenuEl.classList.contains("show")) {
              hideMenu(playlistMenuEl);
          } else {
              playlistMenuEl.classList.remove("hide");
              playlistMenuEl.classList.add("show");
              playlistMenuEl.style.zIndex = "10001"; // Ensure it's above fullscreen
          }
      });
  }

  // 6. Progress & Time Update
  audio.addEventListener('timeupdate', () => {
    if(!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    
    progressBar.style.width = pct + "%";
    fsProgressBarFill.style.width = pct + "%";
    
    const fmt = t => {
      const m = Math.floor(t/60);
      const s = Math.floor(t%60).toString().padStart(2,'0');
      return `${m}:${s}`;
    };
    fsTimeCurrent.innerText = fmt(audio.currentTime);
    fsTimeTotal.innerText = fmt(audio.duration);

    // Sync Lyrics Logic
    if(hasLyrics) {
      let idx = -1;
      for(let i=0; i<currentLyrics.length; i++) {
        if(audio.currentTime >= currentLyrics[i].time) idx = i;
        else break;
      }
      if(idx !== -1 && idx !== currentLyricIndex) {
        currentLyricIndex = idx;
        updateTitleOrLyric(); // Update mini player marquee
        if(fsViewLyrics.classList.contains('active')) {
            updateLyricsHighLight(idx);
        }
      }
    }
    
    if(Date.now() - lastSaveTime > 10000 && currentUser) {
        savePlaybackState();
        lastSaveTime = Date.now();
    }
  });

  // Drag Progress
  fsProgressWrap.addEventListener("click", (e) => {
    const rect = fsProgressWrap.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if(audio.duration) audio.currentTime = pos * audio.duration;
  });

  audio.addEventListener("ended", () => playNext(false));

  // 7. Mode Switch
  fsModeBtn.addEventListener("click", () => {
    playMode = (playMode + 1) % 3;
    fsModeBtn.innerHTML = modeIcons[playMode];
    audio.loop = (playMode === 1);
    if(currentUser) setDoc(doc(db, "users", currentUser.uid), { playMode }, { merge: true });
  });

  // =========================================================
  // 🔥 Menus & Playlists
  // =========================================================
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

  // Mini player Title Click -> Show Playlist
  titleEl.addEventListener("click", (e) => {
    e.stopPropagation();
    hideMenu(playlistMenuEl);
    toggleMenu(songListEl);
  });
  
  // Playlist Item Click
  songListEl.addEventListener("click", (e) => {
      const item = e.target.closest(".playlist-item");
      if(item) {
          loadSong(parseInt(item.dataset.index), true);
      }
  });
  
  // Playlist Menu Item Click
  if (playlistMenuEl) {
      playlistMenuEl.addEventListener('click', (e) => {
          const item = e.target.closest(".playlist-item");
          if (item) changePlaylist(item.dataset.key);
      });
  }

  function changePlaylist(key) {
      const config = playlistsConfig.find(c => c.key === key);
      if (!config) return;
      currentPlaylistKey = key;
      hideMenu(songListEl);
      hideMenu(playlistMenuEl);

      currentList = allSongsLibrary.filter(config.filter);
      if (key === 'history_rank') {
          currentList.sort((a, b) => (userPlayHistory[b.title] || 0) - (userPlayHistory[a.title] || 0));
      }

      currentIndex = 0;
      if (currentList.length > 0) {
          loadSong(0, true);
      } else {
          titleEl.innerHTML = "无数据";
      }
      renderSongListDOM();
  }

  function renderSongListDOM() {
      songListEl.innerHTML = currentList.map((s, i) => {
        return `
        <div class="playlist-item ${i === currentIndex ? 'active' : ''}" data-index="${i}">
          <span class="song-name">${s.title}</span>
        </div>
      `}).join("");
  }
  
  function renderPlaylistMenu() {
      playlistMenuEl.innerHTML = playlistsConfig.map(cfg => `
        <div class="playlist-item ${cfg.key === currentPlaylistKey ? 'active' : ''}" data-key="${cfg.key}">
          ${cfg.name}
        </div>
      `).join("");
  }

  // =========================================================
  // 🔥 Auth & Init
  // =========================================================
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

  // Auth Listeners
  const navAuthBtn = document.getElementById("nav-auth-btn");
  const modalOverlay = document.getElementById("login-modal-overlay");
  const closeModalBtn = document.getElementById("close-modal-btn");
  
  if(navAuthBtn) navAuthBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modalOverlay.classList.add("active");
      try { window.turnstile.reset(); } catch(e){}
  });
  if(closeModalBtn) closeModalBtn.addEventListener("click", () => modalOverlay.classList.remove("active"));

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
              await updateProfile(auth.currentUser, { displayName: email.split("@")[0], photoURL: "assets/bannernetwork.png" });
              modalOverlay.classList.remove("active");
          } catch(e) {
              if(e.code === 'auth/email-already-in-use') {
                  try {
                      await signInWithEmailAndPassword(auth, email, pass);
                      modalOverlay.classList.remove("active");
                  } catch(e2) { errEl.innerText = "登录失败"; }
              } else { errEl.innerText = e.message; }
          }
      });
  }
  
  document.getElementById("google-login-btn")?.addEventListener("click", async () => {
      try { await signInWithPopup(auth, provider); modalOverlay.classList.remove("active"); } catch(e){}
  });
  
  document.getElementById("logout-confirm-btn")?.addEventListener("click", () => {
      signOut(auth).then(() => modalOverlay.classList.remove("active"));
  });

  // State Change
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if(user) {
      const name = user.displayName || user.email.split("@")[0];
      const pic = user.photoURL || "assets/bannernetwork.png";
      document.getElementById("nav-auth-text").innerText = name;
      document.getElementById("auth-icon-slot").innerHTML = `<img src="${pic}" style="width:100%;height:100%;border-radius:50%">`;
      document.getElementById("login-actions").style.display = "none";
      document.getElementById("user-info-panel").style.display = "block";
      document.getElementById("modal-user-name").innerText = name;
      document.getElementById("modal-user-avatar").src = pic;

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
        } else {
          setDoc(doc(db, "users", user.uid), { favorites: [], playHistory: {} }, { merge: true });
        }
      });
    } else {
      document.getElementById("nav-auth-text").innerText = "登录 / 同步";
      document.getElementById("login-actions").style.display = "block";
      document.getElementById("user-info-panel").style.display = "none";
      userFavorites = [];
    }
    renderPlaylistMenu(); // Refresh menu with user state
  });

  const emailIn = document.getElementById("email-input");
  const passIn = document.getElementById("pass-input");
  if(emailIn) emailIn.addEventListener("input", window.checkLoginButtonState);
  if(passIn) passIn.addEventListener("input", window.checkLoginButtonState);

  // Start
  renderPlaylistMenu();
  renderSongListDOM();
  if(currentList.length > 0) loadSong(0, false);
});
