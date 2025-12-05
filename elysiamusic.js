/* elysiamusic.js - Logic & Data for Elysia Player (Fixed Seek Logic) */

document.addEventListener("DOMContentLoaded", () => {
  /* ===== 🎵 歌曲数据源 (All Songs) ===== */
  const allSongsLibrary = [
    { title: "My Soul, Your Beats!", src: "assets/My Soul, Your Beats! -Piano Arrange Ver.-.mp3", cover: "assets/My Soul, Your Beats! -Piano Arrange Ver.-.jpg" },
    { title: "My Most Precious Treasure", src: "assets/My Most Precious Treasure (From My Most Precious Treasure).mp3", cover: "assets/Key anime piano medley.jpg" },
    { title: "Shiteki de Souseiteki na Tori-tachi e no Shirabe", src: "assets/Shiteki de Souseiteki na Tori-tachi e no Shirabe (Yokunin no Tame no Piano Sanka).mp3", cover: "assets/Shiteki.jpg" },
    { title: "Last regrets, foretting me", src: "assets/Last regrets,foretting me.mp3", cover: "assets/Last regrets, foretting me.jpg" },
    { title: "Megumeru Gensoukyoku", src: "assets/Megumeru Gensoukyoku.mp3", cover: "assets/Megumeru Gensoukyoku.jpg" },
    { title: "Call of Silence", src: "assets/Call of Silence (From Attack on Titian) Piano Cover.mp3", cover: "assets/Call of Silence.jpg" },
    { title: "Only my Railgun OP1 fripSide", src: "assets/Only my Railgun - A Certain Scientific Railgun OP1 [Piano]  fripSide.mp3", cover: "assets/Level5.jpg" },
    { title: "Aoi Tori - The iDOLM", src: "assets/[Pianeet] Aoi Tori - The iDOLM@STER OST - Piano Tutorial  Synthesia.mp3", cover: "assets/Aoi Tori - The iDOLM.jpg" },
    { title: "鬼滅之刃 OPLiSA - 紅蓮華", src: "assets/Gurenge - Demon Slayer OP [Piano].mp3", cover: "assets/Shinobu Kocho.jpg" },
    { title: "Flower Dance - DJ Okawari", src: "assets/Flower Dance - DJ Okawari (Piano Cover by Riyandi Kusuma).mp3", cover: "assets/Flower Dance - DJ Okawari.jpg" },
    { title: "theme of SSS -Piano Arrange ", src: "assets/theme of SSS -Piano Arrange Ver.-.mp3", cover: "assets/theme of SSS.jpg" },
    { title: "My Soul, Your Beats! Classic", src: "assets/My Soul, Your Beats! ~Classic~ Instrumental.mp3", cover: "assets/My Soul, Your Beats! ~Classic~ Instrumental.jpg" },
    { title: "Pachelbel's Canon", src: "assets/Bi.Bi PianoPachelbel's Canon 终于弹了这首 世界上最治愈的钢琴曲卡农.mp3", cover: "assets/banner1.jpg" },
    { title: "Heroism endures in nothingness", src: "assets/英雄主义-在虚无中永存.mp3", cover: "assets/Elysia11.jpg" },
    { title: "诀别书", src: "assets/钢琴演奏诀别书纯音乐精编完整版.mp3", cover: "assets/Elysia11.jpg" },
    { title: "Key anime piano medley", src: "assets/Air (TV), Kanon (2006), Clannad After Story - Key anime piano medley.mp3", cover: "assets/Key anime piano medley.jpg" },
    { title: "Crying for Rain", src: "assets/Crying for Rain (Kawaki wo Ameku) - Domestic na Kanojo OP [Piano]  Minami.mp3", cover: "assets/banner1.jpg" },
    { title: "GIRLS BAND CRY", src: "assets/GIRLS BAND CRY OP - Wrong World - Piano Cover  TOGENASHI TOGEARI.mp3", cover: "assets/GIRLS BAND CRY.jpg" },
    { title: "Hikari no Senritsu", src: "assets/Hikari no Senritsu - Sora no Woto OP Arr. Animenz (2024 Fan Remaster Visualized).mp3", cover: "assets/banner1.jpg" },
    { title: "LEVEL5 -judgelight", src: "assets/LEVEL5 -judgelight- A Certain Scientific Railgun OP2 [Piano].mp3", cover: "assets/banner1.jpg" },
    { title: "Flower Dance Super Trick Version", src: "assets/Flower Dance Super Trick Version (mp3cut.net).mp3", cover: "assets/Flower Dance - DJ Okawari.jpg" },
    { title: "Departures - Guilty Crown ED1", src: "assets/Departures - Guilty Crown ED1 [Piano].mp3", cover: "assets/Elysia11.jpg" },
    { title: "Majo no Tabitabi", src: "assets/Majo no Tabitabi OPLiterature Piano Cover.mp3", cover: "assets/Majo no Tabitabi.jpg" },
    { title: "My Dearest ", src: "assets/My Dearest - Guilty Crown OP [10 Year Anniversary Edition] [Piano].mp3", cover: "assets/Mydearest.jpg" },
    { title: "Ninelie Kabaneri", src: "assets/Ninelie - Kabaneri of the Iron Fortress ED [Piano].mp3", cover: "assets/ninelie.jpg" },
    { title: "One Last Kiss", src: "assets/One Last Kiss - Evangelion_ 3.0  1.0 Theme Song [Piano]  Hikaru Utada.mp3", cover: "assets/one last kiss.jpg" },
    { title: "secret base", src: "assets/secret base - Kimi ga Kureta Mono - AnoHana ED [Piano].mp3", cover: "assets/secret base.jpg" },
    { title: "Blue Bird 2022 ver.", src: "assets/Blue Bird (2022 ver.) - Naruto Shippuuden OP3 [Piano]  Ikimono-gakari.mp3", cover: "assets/banner1.jpg" },
    { title: "Hikaru Nara - Your Lie in Apri", src: "assets/Hikaru Nara - Your Lie in April OP1 [Piano].mp3", cover: "assets/Elysia11.jpg"},
    { title: "AKIBA POP the Future - Pianeet", src: "assets/AKIBA POP the Future - Pianeet [Piano Transcription].mp3", cover: "assets/banner1.jpg" },
    { title: "SWORD ART ONLINE", src: "assets/SWORD ART ONLINE PIANO MEDLEY!!! (30,000 Subscribers Special).mp3", cover: "assets/SWORD ART ONLINE.jpg" },
    { title: "Merry Christmas, Mr. Lawrence 1986", src: "assets/merry.mp3", cover: "assets/banner1.jpg" },
    { title: "反方向的钟", src: "assets/反方向的钟.mp3", cover: "assets/Elysia11.jpg" },
    { title: "给我一首歌的时间", src: "assets/给我一首歌的时间 piano ver-.mp3", cover: "assets/banner1.jpg" },
    { title: "晴天", src: "assets/周杰伦晴天 钢琴独奏 Jay ChouBi.Bi Piano.mp3", cover: "assets/banner1.jpg" },
    { title: "溯", src: "assets/su.mp3", cover: "assets/Elysia11.jpg" },
    { title: "潮汐", src: "assets/Natural.mp3", cover: "assets/Elysia11.jpg" },
    { title: "游京", src: "assets/游京 东雪莲.mp3", cover: "assets/游京 东雪莲.jpg" },
    { title: "还是会想你", src: "assets/还是会想你曼波 (mp3cut.net) 2.mp3", cover: "assets/Elysia11.jpg" },
    { title: "Duvert 四季 Merry mixed", src: "assets/mix.mp3", cover: "assets/Elysia11.jpg" }
  ];

  /* ===== 歌单管理系统 ===== */
  const playlists = {
    piano: allSongsLibrary, 
    mon: allSongsLibrary.filter((_, i) => i % 7 === 0),
    tue: allSongsLibrary.filter((_, i) => i % 7 === 1),
    wed: allSongsLibrary.filter((_, i) => i % 7 === 2),
    thu: allSongsLibrary.filter((_, i) => i % 7 === 3),
    fri: allSongsLibrary.filter((_, i) => i % 7 === 4),
    sat: allSongsLibrary.filter((_, i) => i % 7 === 5),
    sun: allSongsLibrary.filter((_, i) => i % 7 === 6),
  };

  /* ===== 状态变量 ===== */
  let currentPlaylistKey = 'piano';
  let currentList = playlists[currentPlaylistKey];
  let currentIndex = 0;
  
  // 0=列表循环, 1=单曲循环, 2=随机播放
  let playMode = 0; 
  const playModes = [
    { icon: "🔁", name: "列表循环" },
    { icon: "🔂", name: "单曲循环" },
    { icon: "🔀", name: "随机播放" }
  ];

  /* ===== 初始化 ===== */
  const audio = new Audio();
  audio.preload = "auto";

  const player = document.getElementById("elysiaPlayer");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const nextBtn = document.getElementById("nextBtn");
  const titleEl = document.getElementById("songTitle");
  const playlistEl = document.getElementById("playlist");
  
  const modeBtn = document.getElementById("modeBtn");
  const playlistSelect = document.getElementById("playlistSelect");
  const currentPlaylistText = document.getElementById("currentPlaylistText");

  if (!player || !playPauseBtn) return;

  /* =========================================================
     核心播放控制逻辑
     ========================================================= */

  function loadSong(index) {
    if (!currentList || currentList.length === 0) return;
    
    // 索引循环保护
    if (index < 0) index = currentList.length - 1;
    if (index >= currentList.length) index = 0;
    
    currentIndex = index;
    const song = currentList[currentIndex];
    
    audio.src = song.src;
    titleEl.textContent = song.title;
    
    renderPlaylistDOM(); 
    // 重置并更新 MediaSession
    updateMediaSession(song);
  }

  function togglePlay() {
    if (audio.paused) {
      audio.play().catch(e => console.log("Waiting for interaction"));
      playPauseBtn.textContent = "⏸";
      player.classList.add("playing");
    } else {
      audio.pause();
      playPauseBtn.textContent = "▶";
      player.classList.remove("playing");
    }
  }

  // 切歌核心逻辑
  function playNext(isAuto = false) {
    let nextIndex;

    // 模式 1: 单曲循环 (🔂)
    if (playMode === 1 && isAuto) {
      audio.currentTime = 0;
      audio.play();
      return;
    } 
    
    // 模式 2: 随机播放 (🔀)
    if (playMode === 2) {
      if (currentList.length > 1) {
        let newIndex = currentIndex;
        while (newIndex === currentIndex) {
          newIndex = Math.floor(Math.random() * currentList.length);
        }
        nextIndex = newIndex;
      } else {
        nextIndex = 0;
      }
    } 
    // 模式 0: 列表循环 (🔁)
    else {
      nextIndex = (currentIndex + 1) % currentList.length;
    }

    loadSong(nextIndex);
    audio.play();
    playPauseBtn.textContent = "⏸";
    player.classList.add("playing");
  }

  /* =========================================================
     长按翻转逻辑
     ========================================================= */
  let pressTimer;
  let isDrag = false;
  const LONG_PRESS_DURATION = 500;

  const startPress = (e) => {
    // 忽略按钮点击
    if (e.target.closest('button') || e.target.closest('select')) return;
    
    isDrag = false;
    pressTimer = setTimeout(() => {
      if (!isDrag) {
        player.classList.toggle("flipped");
        // 翻转时隐藏列表
        playlistEl.classList.remove("show");
        playlistEl.classList.add("hide");
      }
    }, LONG_PRESS_DURATION);
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
     背面功能逻辑
     ========================================================= */

  // 1. 模式切换
  modeBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    playMode = (playMode + 1) % 3;
    modeBtn.textContent = playModes[playMode].icon;
  });

  // 2. 歌单切换
  playlistSelect.addEventListener('change', (e) => {
    e.stopPropagation(); 
    const selectedKey = e.target.value;
    const newList = playlists[selectedKey];

    if (newList && newList.length > 0) {
      currentPlaylistKey = selectedKey;
      currentList = newList;
      
      const optionText = e.target.options[e.target.selectedIndex].text;
      currentPlaylistText.textContent = optionText;

      currentIndex = 0;
      loadSong(0);
      audio.play();
      playPauseBtn.textContent = "⏸";
      player.classList.add("playing");
    }
  });

  // 阻止 select 点击时的冒泡
  playlistSelect.addEventListener('click', (e) => e.stopPropagation());


  /* =========================================================
     UI 交互与初始化
     ========================================================= */

  playPauseBtn.addEventListener("click", togglePlay);
  nextBtn.addEventListener("click", () => playNext(false));
  audio.addEventListener("ended", () => playNext(true));

  function renderPlaylistDOM() {
    playlistEl.innerHTML = currentList.map((s, i) => `
      <div class="playlist-item ${i === currentIndex ? 'active' : ''}" data-index="${i}">
        ${s.title}
      </div>
    `).join("");
  }

  playlistEl.addEventListener("click", e => {
    const item = e.target.closest(".playlist-item");
    if (item) {
      loadSong(parseInt(item.dataset.index));
      audio.play();
      playPauseBtn.textContent = "⏸";
    }
  });

  // 列表显示控制
  titleEl.addEventListener("click", (e) => {
    e.stopPropagation();
    if (player.classList.contains("flipped")) return; 

    if (playlistEl.classList.contains("show")) {
      playlistEl.classList.remove("show");
      playlistEl.classList.add("hide");
    } else {
      playlistEl.classList.remove("hide");
      playlistEl.classList.add("show");
    }
  });

  document.addEventListener("click", e => {
    if (!player.contains(e.target) && !playlistEl.contains(e.target)) {
      if (playlistEl.classList.contains("show")) {
        playlistEl.classList.remove("show");
        playlistEl.classList.add("hide");
      }
    }
  });

  // 自动隐藏逻辑
  let inactivityTimer;
  function hidePlayerUI() {
    player.style.opacity = '0';
    player.style.transform = 'translate(-50%, 40px)'; 
    player.style.pointerEvents = 'none'; 
    if (playlistEl.classList.contains("show")) {
      playlistEl.classList.remove("show");
      playlistEl.classList.add("hide");
    }
  }

  function showPlayerUI() {
    player.style.opacity = '1';
    player.style.transform = 'translate(-50%, 0)'; 
    player.style.pointerEvents = 'auto'; 
    resetTimer();
  }

  function resetTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(hidePlayerUI, 30000);
  }

  ['scroll','mousemove','mousedown','touchstart','keydown'].forEach(evt =>
    window.addEventListener(evt, showPlayerUI)
  );


  /* =========================================================
     🎧 Media Session API (锁屏控制 + 修复进度条拖动)
     ========================================================= */

  // 关键修复：更新位置状态给浏览器
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
      // 1. 设置元数据
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: "Elysia Player",
        album: currentPlaylistText.textContent,
        artwork: [{ src: song.cover || 'assets/banner1.jpg', sizes: "512x512", type: "image/jpeg" }]
      });

      // 2. 基础控制 Action
      navigator.mediaSession.setActionHandler('play', togglePlay);
      navigator.mediaSession.setActionHandler('pause', togglePlay);
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext(false));
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = currentList.length - 1;
        loadSong(prevIndex);
        audio.play();
      });

      // 3. 【关键修复】添加 seekto 处理器，允许锁屏拖动
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.fastSeek && 'fastSeek' in audio) {
          audio.fastSeek(details.seekTime);
        } else {
          audio.currentTime = details.seekTime;
        }
        updatePositionState(); // 拖动后立即更新UI
      });
    }
  }

  // 4. 【关键修复】事件监听，保持进度条同步
  audio.addEventListener('loadedmetadata', updatePositionState);
  
  audio.addEventListener('play', () => {
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
    updatePositionState();
  });
  
  audio.addEventListener('pause', () => {
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
    updatePositionState();
  });

  // timeupdate 可以让进度条走动更平滑，但为了性能通常不需要过于频繁
  // 浏览器通常会自动推算，但更新一下更稳妥
  audio.addEventListener('timeupdate', () => {
    // 简单的节流，防止过于频繁调用 (每秒同步一次即可)
    if (Math.floor(audio.currentTime) % 5 === 0) {
      updatePositionState();
    }
  });


  // 启动
  resetTimer();
  loadSong(0);
});