/* elysiamusic.js - Logic & Data for Elysia Player (SVG Icons & 0.3s Flip) */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     0. SVG 图标定义 (Apple Music Style)
     ========================================================= */
  const ICONS = {
    // 播放 (实心三角形)
    play: `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
    // 暂停 (双竖线)
    pause: `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    // 下一曲
    next: `<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`,
    // 列表循环
    loopList: `<svg viewBox="0 0 24 24"><path d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4zm2-2v-4h-2v3H5v-6h2v4h12z"/></svg>`,
    // 单曲循环
    loopOne: `<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>`,
    // 随机播放
    shuffle: `<svg viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`,
    // 喜欢 (初始形状)
    heart: `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
  };

  /* =========================================================
     1. 🎵 歌曲数据源 (All Songs)
     ========================================================= */
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

  /* =========================================================
     2. 歌单配置与状态管理
     ========================================================= */
  const playlistsConfig = [
    { key: "piano", name: "钢琴曲", filter: (l) => true },
    { key: "mon",   name: "月曜日", filter: (l, i) => i % 7 === 0 },
    { key: "tue",   name: "火曜日", filter: (l, i) => i % 7 === 1 },
    { key: "wed",   name: "水曜日", filter: (l, i) => i % 7 === 2 },
    { key: "thu",   name: "木曜日", filter: (l, i) => i % 7 === 3 },
    { key: "fri",   name: "金曜日", filter: (l, i) => i % 7 === 4 },
    { key: "sat",   name: "土曜日", filter: (l, i) => i % 7 === 5 },
    { key: "sun",   name: "日曜日", filter: (l, i) => i % 7 === 6 },
  ];

  let currentPlaylistKey = 'piano';
  let currentList = allSongsLibrary; 
  let currentIndex = 0;
  
  let playMode = 0; 
  const playModes = [
    { icon: ICONS.loopList, name: "列表循环" },
    { icon: ICONS.loopOne, name: "单曲循环" },
    { icon: ICONS.shuffle, name: "随机播放" }
  ];

  /* =========================================================
     3. DOM 元素初始化
     ========================================================= */
  const audio = new Audio();
  audio.preload = "auto";

  const player = document.getElementById("elysiaPlayer");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const nextBtn = document.getElementById("nextBtn");
  const titleEl = document.getElementById("songTitle");
  
  const songListEl = document.getElementById("playlist"); 
  const playlistMenuEl = document.getElementById("playlistMenu");

  const modeBtn = document.getElementById("modeBtn");
  const heartBtn = document.getElementById("heartBtn");
  const playlistTitleBtn = document.getElementById("playlistTitleBtn");

  if (!player || !playPauseBtn) return;

  // ⚡️ 立即初始化 SVG 图标，替换 HTML 中的空按钮 ⚡️
  function initIcons() {
    playPauseBtn.innerHTML = ICONS.play;
    nextBtn.innerHTML = ICONS.next;
    modeBtn.innerHTML = playModes[0].icon;
    heartBtn.innerHTML = ICONS.heart; 
  }
  initIcons();

  /* =========================================================
     4. 核心播放控制逻辑
     ========================================================= */
  function loadSong(index) {
    if (!currentList || currentList.length === 0) return;
    if (index < 0) index = currentList.length - 1;
    if (index >= currentList.length) index = 0;
    
    currentIndex = index;
    const song = currentList[currentIndex];
    
    audio.src = song.src;
    titleEl.textContent = song.title;
    
    renderSongListDOM(); 
    updateMediaSession(song);
    
    // 重置爱心状态
    heartBtn.classList.remove("liked");
  }

  function togglePlay() {
    if (audio.paused) {
      audio.play().catch(e => console.log("Waiting for interaction"));
      // 切换图标：暂停
      playPauseBtn.innerHTML = ICONS.pause;
      playPauseBtn.classList.add("playing"); // 用于CSS修正对齐
      player.classList.add("playing");
    } else {
      audio.pause();
      // 切换图标：播放
      playPauseBtn.innerHTML = ICONS.play;
      playPauseBtn.classList.remove("playing");
      player.classList.remove("playing");
    }
  }

  function playNext(isAuto = false) {
    let nextIndex;
    if (playMode === 1 && isAuto) { // 单曲循环
      audio.currentTime = 0;
      audio.play();
      return;
    } 
    
    if (playMode === 2) { // 随机播放
      if (currentList.length > 1) {
        let newIndex = currentIndex;
        while (newIndex === currentIndex) {
          newIndex = Math.floor(Math.random() * currentList.length);
        }
        nextIndex = newIndex;
      } else {
        nextIndex = 0;
      }
    } else { // 列表循环
      nextIndex = (currentIndex + 1) % currentList.length;
    }
    loadSong(nextIndex);
    audio.play();
    
    // 确保图标同步为暂停
    playPauseBtn.innerHTML = ICONS.pause;
    playPauseBtn.classList.add("playing");
    player.classList.add("playing");
  }

  /* =========================================================
     5. 列表渲染与交互逻辑
     ========================================================= */
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

  /* --- A. 正面：歌曲列表逻辑 --- */
  function renderSongListDOM() {
    if (!songListEl) return;
    songListEl.innerHTML = currentList.map((s, i) => `
      <div class="playlist-item ${i === currentIndex ? 'active' : ''}" data-index="${i}">
        ${s.title}
      </div>
    `).join("");
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
      audio.play();
      // 同步暂停图标
      playPauseBtn.innerHTML = ICONS.pause;
      playPauseBtn.classList.add("playing");
    }
  });

  /* --- B. 背面：歌单选择逻辑 --- */
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

    currentIndex = 0;
    loadSong(0);
    audio.play();
    
    // 同步暂停图标
    playPauseBtn.innerHTML = ICONS.pause;
    playPauseBtn.classList.add("playing");
    player.classList.add("playing");
    
    renderPlaylistMenu();
    renderSongListDOM();
  }
  renderPlaylistMenu();

  /* --- C. 背面：按钮逻辑 --- */
  modeBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    playMode = (playMode + 1) % 3;
    // 切换 SVG 图标
    modeBtn.innerHTML = playModes[playMode].icon;
  });

  heartBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    heartBtn.classList.toggle("liked");
    // 爱心颜色变红由 CSS .liked 类控制，图标形状保持不变
  });

  /* --- D. 全局点击关闭菜单 --- */
  document.addEventListener("click", e => {
    const inPlayer = player.contains(e.target);
    const inSongList = songListEl && songListEl.contains(e.target);
    const inPlayListMenu = playlistMenuEl && playlistMenuEl.contains(e.target);

    if (!inPlayer && !inSongList && !inPlayListMenu) {
      hideMenu(songListEl);
      hideMenu(playlistMenuEl);
    }
  });

  /* =========================================================
     6. 长按翻转逻辑 (0.3s)
     ========================================================= */
  let pressTimer;
  let isDrag = false;
  const LONG_PRESS_DURATION = 300; 

  const startPress = (e) => {
    // 忽略直接点击按钮的操作，避免翻转
    if (e.target.closest('button')) return;
    
    isDrag = false;
    pressTimer = setTimeout(() => {
      if (!isDrag) {
        player.classList.toggle("flipped");
        hideMenu(songListEl);
        hideMenu(playlistMenuEl);
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
     7. 自动隐藏 UI (Auto Hide)
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
    inactivityTimer = setTimeout(hidePlayerUI, 30000); 
  }

  ['scroll','mousemove','mousedown','touchstart','keydown'].forEach(evt =>
    window.addEventListener(evt, showPlayerUI)
  );

  /* =========================================================
     8. UI 按钮基础绑定
     ========================================================= */
  playPauseBtn.addEventListener("click", togglePlay);
  nextBtn.addEventListener("click", () => playNext(false));
  audio.addEventListener("ended", () => playNext(true));

  /* =========================================================
     9. Media Session API
     ========================================================= */
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
        artist: "Elysia Player",
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
        // 更新图标状态
        playPauseBtn.innerHTML = ICONS.pause;
        playPauseBtn.classList.add("playing");
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.fastSeek && 'fastSeek' in audio) {
          audio.fastSeek(details.seekTime);
        } else {
          audio.currentTime = details.seekTime;
        }
        updatePositionState();
      });
    }
  }

  audio.addEventListener('loadedmetadata', updatePositionState);
  audio.addEventListener('play', () => { if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing"; updatePositionState(); });
  audio.addEventListener('pause', () => { if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused"; updatePositionState(); });
  audio.addEventListener('timeupdate', () => { if (Math.floor(audio.currentTime) % 5 === 0) updatePositionState(); });

  resetTimer();
  loadSong(0);
});
