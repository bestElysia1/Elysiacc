/* elysiamusic.js - Final Fixed Version (v5.02) */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, setPersistence, browserLocalPersistence   
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
const db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
const provider = new GoogleAuthProvider();

// Cloudflare
window.isCaptchaVerified = false;
window.checkLoginButtonState = function() {
  const btn = document.getElementById("email-submit-btn");
  if (!btn) return;
  const emailVal = document.getElementById("email-input")?.value.trim();
  const passVal = document.getElementById("pass-input")?.value.trim();
  const isValid = emailVal?.length > 0 && passVal?.length >= 6 && window.isCaptchaVerified;
  btn.disabled = !isValid;
  btn.style.opacity = isValid ? "1" : "0.6";
  btn.style.cursor = isValid ? "pointer" : "not-allowed";
};
window.onTurnstileSuccess = function() { window.isCaptchaVerified = true; window.checkLoginButtonState(); };

document.addEventListener("DOMContentLoaded", () => {
  const allSongsLibrary = window.allSongsLibrary || [];
  
  // State
  let userFavorites = [];
  let userPlayHistory = {}; 
  let currentUser = null;
  let lastSaveTime = 0; 
  let currentLyrics = [], hasLyrics = false, currentLyricIndex = -1;
  let currentPlaylistKey = 'piano';
  let currentList = allSongsLibrary.filter(s => s.category === 'piano');
  let currentIndex = 0;
  let playMode = 0; 
  let shuffleQueue = [];
  let errorCount = 0; // 防止连续切歌死循环

  const audio = new Audio();
  audio.crossOrigin = "anonymous"; audio.preload = "auto"; audio.playsInline = true;

  // UI Refs
  const player = document.getElementById("elysiaPlayer");
  const fsPlayer = document.getElementById("fullscreenPlayer");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const nextBtn = document.getElementById("nextBtn");
  const titleEl = document.getElementById("songTitle");
  const miniCoverBtn = document.getElementById("miniCoverBtn");
  const miniCoverImg = document.getElementById("miniCoverImg");
  const progressBar = document.getElementById("progressBar");

  const fsCloseBtn = document.getElementById("fsCloseBtn");
  const fsCoverImg = document.getElementById("fsCoverImg");
  const fsTitle = document.getElementById("fsTitle");
  const fsArtist = document.getElementById("fsArtist");
  const fsPlayBtn = document.getElementById("fsPlayPauseBtn");
  const fsPrevBtn = document.getElementById("fsPrevBtn");
  const fsNextBtn = document.getElementById("fsNextBtn");
  const fsListBtn = document.getElementById("fsListBtn");
  const fsHeartBtn = document.getElementById("fsHeartBtn");
  const fsModeBtn = document.getElementById("fsModeBtn");
  
  const fsViewCover = document.getElementById("fsViewCover");
  const fsViewLyrics = document.getElementById("fsViewLyrics");
  const fsCoverWrapper = document.getElementById("fsCoverWrapper");
  const lyricsBox = document.getElementById("lyricsBox");
  const fsProgressWrap = document.getElementById("fsProgressWrap");
  const fsProgressBarFill = document.getElementById("fsProgressBarFill");
  const fsTimeCurrent = document.getElementById("fsTimeCurrent");
  const fsTimeTotal = document.getElementById("fsTimeTotal");

  const songListEl = document.getElementById("playlist");
  const playlistMenuEl = document.getElementById("playlistMenu");

  const ICONS = {
    play: `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    mode0: `<svg viewBox="0 0 24 24"><path d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4zm2-2v-4h-2v3H5v-6h2v4h12z"/></svg>`,
    mode1: `<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>`,
    mode2: `<svg viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`
  };
  const modeIcons = [ICONS.mode0, ICONS.mode1, ICONS.mode2];
  let playlistsConfig = [
    { key: "All songs", name: "所有歌曲", filter: (s) => s.category !== 'piano' },
    { key: "history_rank", name: "我的听歌排行", filter: (s) => (userPlayHistory[s.title] || 0) > 0 },
    { key: "piano", name: " ピアノ音楽", filter: (s) => s.category === 'piano' }
  ];

  function initUI() {
    playPauseBtn.innerHTML = ICONS.play; fsPlayBtn.innerHTML = ICONS.play; fsModeBtn.innerHTML = modeIcons[0];
  }
  initUI();

  // 🔥 修复：音频错误自动跳过
  audio.addEventListener('error', (e) => {
      console.warn("Audio Error:", e);
      if (errorCount < 3) { // 最多连续跳过3次，防止死循环
          errorCount++;
          setTimeout(() => playNext(true), 1000);
      } else {
          updateTitleOrLyric("无法播放: 资源失效");
          updatePlayState(false);
          errorCount = 0;
      }
  });

  // === Player Logic ===
  async function loadSong(index, autoPlay = false) {
    if (!currentList.length) return;
    if (index < 0) index = currentList.length - 1;
    if (index >= currentList.length) index = 0;
    
    currentIndex = index;
    const song = currentList[currentIndex];
    const coverUrl = song.cover || 'assets/cover_placeholder.jpg';
    
    // UI
    miniCoverImg.src = coverUrl;
    fsCoverImg.src = coverUrl;
    fsPlayer.style.setProperty('--bg-img', `url(${coverUrl})`);
    fsTitle.innerText = song.title;
    fsArtist.innerText = song.artist || "Unknown";
    
    // Reset
    fsViewLyrics.classList.remove('active');
    fsViewCover.classList.remove('hidden');
    lyricsBox.innerHTML = '<p class="placeholder" style="margin-top:50%">Loading...</p>';
    
    currentLyrics = []; hasLyrics = false; currentLyricIndex = -1;
    updateTitleOrLyric(song.title);
    fetchLyrics(song);

    audio.src = song.src;
    audio.loop = (playMode === 1);
    
    if (autoPlay) {
      try { 
          await audio.play(); 
          updatePlayState(true); 
          errorCount = 0; // 播放成功重置错误计数
      } catch(e) { updatePlayState(false); }
    } else { updatePlayState(false); }
    
    updateHeartStatus();
    updateMediaSession(song);
    recordPlayHistory(song.title);
  }

  function updatePlayState(isPlaying) {
    const icon = isPlaying ? ICONS.pause : ICONS.play;
    playPauseBtn.innerHTML = icon; fsPlayBtn.innerHTML = icon;
    if(isPlaying) { fsPlayBtn.classList.add("playing"); player.classList.add("playing"); }
    else { fsPlayBtn.classList.remove("playing"); player.classList.remove("playing"); }
  }

  function togglePlay() {
    if (audio.paused) { audio.play().catch(e=>{}); updatePlayState(true); }
    else { audio.pause(); updatePlayState(false); }
  }

  function playNext(userTriggered = true) {
    if (playMode === 1 && !userTriggered) return;
    let nextIdx = (currentIndex + 1) % currentList.length;
    if (playMode === 2) nextIdx = Math.floor(Math.random() * currentList.length);
    loadSong(nextIdx, true);
  }

  function playPrev() {
    let prev = currentIndex - 1;
    if (prev < 0) prev = currentList.length - 1;
    loadSong(prev, true);
  }

  // === Lyrics ===
  async function fetchLyrics(song) {
    if(!song.lrc) { renderLyrics([]); return; }
    try {
      const res = await fetch(song.lrc);
      if(res.ok) {
        const text = await res.text();
        parseLRC(text);
        hasLyrics = true;
        renderLyrics(currentLyrics);
      } else renderLyrics([]);
    } catch(e) { renderLyrics([]); }
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
    if (!lyrics || lyrics.length === 0) {
      lyricsBox.innerHTML = '<p class="placeholder" style="margin-top:50%">纯音乐 / 暂无歌词</p>';
      return;
    }
    const fragment = document.createDocumentFragment();
    lyrics.forEach((line, index) => {
      const p = document.createElement("p");
      p.innerText = line.text;
      p.addEventListener("click", () => { audio.currentTime = line.time; updateLyricsHighLight(index); });
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

  // 🔥 修复：底部播放器歌词滚动
  function updateTitleOrLyric(textOverride = null) {
    let text = textOverride || currentList[currentIndex].title;
    
    // 如果正在播放且有歌词，优先显示歌词
    if (!audio.paused && hasLyrics && currentLyricIndex >= 0 && currentLyrics[currentLyricIndex]) {
      text = currentLyrics[currentLyricIndex].text;
    }
    
    titleEl.innerHTML = `<span class="scroll-inner">${text}</span>`;
    const inner = titleEl.querySelector('.scroll-inner');
    
    // 强制重绘以确保 scrollWidth 计算正确
    void inner.offsetWidth; 
    
    if(inner.scrollWidth > titleEl.clientWidth) {
      // 动态设置滚动时长
      const duration = (inner.scrollWidth / 40) + 2;
      inner.style.setProperty('--scroll-duration', `${duration}s`);
      inner.classList.add('scrolling');
    } else {
      inner.classList.remove('scrolling');
    }
  }

  // === Gestures & Events ===
  let startY=0, currentY=0, isDragging=false;
  fsPlayer.addEventListener('touchstart', (e) => {
    if (fsViewLyrics.classList.contains('active') && lyricsBox.scrollTop > 5) return;
    startY = e.touches[0].clientY; isDragging = true; fsPlayer.classList.add('dragging');
  }, {passive:true});
  
  fsPlayer.addEventListener('touchmove', (e) => {
    if(!isDragging) return;
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    if(diff>0) { e.preventDefault(); fsPlayer.style.transform=`translateY(${diff}px)`; fsPlayer.style.opacity=`${1-(diff/window.innerHeight)}`; }
  }, {passive:false});
  
  fsPlayer.addEventListener('touchend', (e) => {
    if(!isDragging) return; isDragging=false; fsPlayer.classList.remove('dragging');
    if((currentY-startY) > 120) closeFullscreen();
    else { fsPlayer.style.transform=''; fsPlayer.style.opacity=''; }
  });

  function openFullscreen() { fsPlayer.classList.add("active"); player.classList.add("ui-hidden"); hideMenu(songListEl); hideMenu(playlistMenuEl); }
  function closeFullscreen() { fsPlayer.classList.remove("active"); player.classList.remove("ui-hidden"); fsPlayer.style.transform=''; fsPlayer.style.opacity=''; }

  miniCoverBtn.addEventListener("click", (e) => { e.stopPropagation(); openFullscreen(); });
  fsCloseBtn.addEventListener("click", closeFullscreen);

  // View Switch
  fsCoverWrapper.addEventListener('click', (e) => {
    e.stopPropagation(); fsViewCover.classList.add('hidden'); fsViewLyrics.classList.add('active');
    if(currentLyricIndex!==-1) updateLyricsHighLight(currentLyricIndex);
  });
  lyricsBox.addEventListener('click', (e) => {
    if(e.target === lyricsBox) { fsViewLyrics.classList.remove('active'); fsViewCover.classList.remove('hidden'); }
  });

  // Controls
  playPauseBtn.addEventListener("click", togglePlay);
  fsPlayBtn.addEventListener("click", togglePlay);
  nextBtn.addEventListener("click", () => playNext(true));
  fsNextBtn.addEventListener("click", () => playNext(true));
  fsPrevBtn.addEventListener("click", playPrev);
  
  fsListBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (playlistMenuEl.classList.contains("show")) hideMenu(playlistMenuEl);
    else {
        playlistMenuEl.classList.remove("hide");
        playlistMenuEl.classList.add("show");
        playlistMenuEl.style.zIndex = "10002"; 
    }
  });

  // Time & Progress
  audio.addEventListener('timeupdate', () => {
    if(!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = pct + "%";
    fsProgressBarFill.style.width = pct + "%";
    
    const fmt = t => `${Math.floor(t/60)}:${Math.floor(t%60).toString().padStart(2,'0')}`;
    fsTimeCurrent.innerText = fmt(audio.currentTime);
    fsTimeTotal.innerText = fmt(audio.duration);

    if(hasLyrics) {
      let idx = -1;
      for(let i=0; i<currentLyrics.length; i++) {
        if(audio.currentTime >= currentLyrics[i].time) idx = i; else break;
      }
      if(idx!==-1 && idx!==currentLyricIndex) {
        currentLyricIndex = idx;
        updateTitleOrLyric();
        if(fsViewLyrics.classList.contains('active')) updateLyricsHighLight(idx);
      }
    }
  });
  
  fsProgressWrap.addEventListener("click", (e) => {
    const rect = fsProgressWrap.getBoundingClientRect();
    if(audio.duration) audio.currentTime = ((e.clientX - rect.left)/rect.width) * audio.duration;
  });
  audio.addEventListener("ended", () => playNext(false));

  fsModeBtn.addEventListener("click", () => {
    playMode = (playMode + 1) % 3;
    fsModeBtn.innerHTML = modeIcons[playMode];
    audio.loop = (playMode === 1);
  });

  fsHeartBtn.addEventListener("click", async () => {
    if(!currentUser) return alert("请先登录");
    const title = currentList[currentIndex].title;
    const ref = doc(db, "users", currentUser.uid);
    if(userFavorites.includes(title)) {
      await updateDoc(ref, { favorites: arrayRemove(title) });
      userFavorites = userFavorites.filter(t => t!==title);
      fsHeartBtn.classList.remove("liked");
    } else {
      await updateDoc(ref, { favorites: arrayUnion(title) });
      userFavorites.push(title);
      fsHeartBtn.classList.add("liked");
    }
  });
  function updateHeartStatus() {
    const title = currentList[currentIndex]?.title;
    if(userFavorites.includes(title)) fsHeartBtn.classList.add("liked"); else fsHeartBtn.classList.remove("liked");
  }

  // Playlist Menu
  function hideMenu(el) { if(el.classList.contains("show")) { el.classList.remove("show"); el.classList.add("hide"); } }
  function toggleMenu(el) { if(el.classList.contains("show")) hideMenu(el); else { el.classList.remove("hide"); el.classList.add("show"); } }
  
  titleEl.addEventListener("click", (e) => { e.stopPropagation(); hideMenu(playlistMenuEl); toggleMenu(songListEl); });
  songListEl.addEventListener("click", (e) => {
      const item = e.target.closest(".playlist-item");
      if(item) loadSong(parseInt(item.dataset.index), true);
  });
  if (playlistMenuEl) {
      playlistMenuEl.addEventListener('click', (e) => {
          const item = e.target.closest(".playlist-item");
          if (item) changePlaylist(item.dataset.key);
      });
  }
  function changePlaylist(key) {
      const config = playlistsConfig.find(c => c.key === key);
      if(!config) return;
      currentPlaylistKey = key; hideMenu(songListEl); hideMenu(playlistMenuEl);
      currentList = allSongsLibrary.filter(config.filter);
      if(key === 'history_rank') currentList.sort((a,b)=>(userPlayHistory[b.title]||0)-(userPlayHistory[a.title]||0));
      currentIndex = 0;
      if(currentList.length>0) loadSong(0, true);
      renderSongListDOM();
  }
  function renderSongListDOM() {
      songListEl.innerHTML = currentList.map((s, i) => `<div class="playlist-item ${i===currentIndex?'active':''}" data-index="${i}"><span class="song-name">${s.title}</span></div>`).join("");
  }
  function renderPlaylistMenu() {
      playlistMenuEl.innerHTML = playlistsConfig.map(cfg => `<div class="playlist-item ${cfg.key===currentPlaylistKey?'active':''}" data-key="${cfg.key}">${cfg.name}</div>`).join("");
  }

  // Helpers
  async function recordPlayHistory(title) {
    if(currentUser) await setDoc(doc(db,"users",currentUser.uid), { playHistory:{[title]:increment(1)} }, {merge:true});
  }
  function updateMediaSession(song) {
    if('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: song.title, artist: song.artist, artwork: [{ src: song.cover || 'assets/cover_placeholder.jpg', sizes: '512x512', type: 'image/jpeg' }]});
      navigator.mediaSession.setActionHandler('play', togglePlay); navigator.mediaSession.setActionHandler('pause', togglePlay);
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext(true)); navigator.mediaSession.setActionHandler('previoustrack', playPrev);
    }
  }

  // Auth
  const navAuthBtn = document.getElementById("nav-auth-btn");
  if(navAuthBtn) navAuthBtn.addEventListener("click", (e) => { e.preventDefault(); document.getElementById("login-modal-overlay").classList.add("active"); });
  document.getElementById("close-modal-btn")?.addEventListener("click", () => document.getElementById("login-modal-overlay").classList.remove("active"));
  
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if(user) {
      const name = user.displayName || user.email.split("@")[0];
      document.getElementById("nav-auth-text").innerText = name;
      document.getElementById("login-actions").style.display = "none";
      document.getElementById("user-info-panel").style.display = "block";
      document.getElementById("modal-user-name").innerText = name;
      onSnapshot(doc(db, "users", user.uid), (snap) => {
        if(snap.exists()) {
          const d = snap.data();
          userFavorites = d.favorites || []; userPlayHistory = d.playHistory || {};
        }
        updateHeartStatus();
      });
    } else {
      document.getElementById("nav-auth-text").innerText = "登录 / 同步";
      document.getElementById("login-actions").style.display = "block";
      document.getElementById("user-info-panel").style.display = "none";
      userFavorites = []; updateHeartStatus();
    }
    renderPlaylistMenu();
  });

  const emailIn = document.getElementById("email-input");
  if(emailIn) emailIn.addEventListener("input", window.checkLoginButtonState);

  // Init
  if(currentList.length > 0) {
      renderPlaylistMenu(); 
      renderSongListDOM();
      loadSong(0, false);
  }
});
