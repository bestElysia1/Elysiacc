/* elysiamusic.js - Logic & Data for Elysia Player (Refactored Back Face) */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     1. 🎵 歌曲数据源 (All Songs - 完整保留)
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
  
  // 歌单配置表：定义key, 显示名称, 和过滤规则
  const playlistsConfig = [
    { key: "piano", name: "🎹 钢琴曲", filter: (l) => true }, // 全部展示
    { key: "mon",   name: "🌙 月曜日", filter: (l, i) => i % 7 === 0 },
    { key: "tue",   name: "🔥 火曜日", filter: (l, i) => i % 7 === 1 },
    { key: "wed",   name: "💧 水曜日", filter: (l, i) => i % 7 === 2 },
    { key: "thu",   name: "🌲 木曜日", filter: (l, i) => i % 7 === 3 },
    { key: "fri",   name: "💰 金曜日", filter: (l, i) => i % 7 === 4 },
    { key: "sat",   name: "🪐 土曜日", filter: (l, i) => i % 7 === 5 },
    { key: "sun",   name: "☀️ 日曜日", filter: (l, i) => i % 7 === 6 },
  ];

  // 核心状态变量
  let currentPlaylistKey = 'piano';
  let currentList = allSongsLibrary; // 默认加载全部
  let currentIndex = 0;
  
  // 播放模式: 0=列表循环, 1=单曲循环, 2=随机播放
  let playMode = 0; 
  const playModes = [
    { icon: "🔁", name: "列表循环" },
    { icon: "🔂", name: "单曲循环" },
    { icon: "🔀", name: "随机播放" }
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
  
  // 列表容器
  const songListEl = document.getElementById("playlist");     // 正面：歌曲列表
  const playlistMenuEl = document.getElementById("playlistMenu"); // 背面：歌单选择列表 (需在HTML添加此ID)

  // 背面控件
  const modeBtn = document.getElementById("modeBtn");
  const heartBtn = document.getElementById("heartBtn");
  const playlistTitleBtn = document.getElementById("playlistTitleBtn"); // 点击切换歌单

  // 如果基础元素不存在，停止执行
  if (!player || !playPauseBtn) return;

  /* =========================================================
     4. 核心播放控制逻辑
     ========================================================= */

  function loadSong(index) {
    if (!currentList || currentList.length === 0) return;
    
    // 索引越界保护
    if (index < 0) index = currentList.length - 1;
    if (index >= currentList.length) index = 0;
    
    currentIndex = index;
    const song = currentList[currentIndex];
    
    audio.src = song.src;
    titleEl.textContent = song.title;
    
    renderSongListDOM();  // 更新歌曲列表高亮
    updateMediaSession(song); // 更新系统媒体中心
    
    // 切换歌曲时，重置爱心状态 (模拟效果)
    heartBtn.classList.remove("liked");
    heartBtn.textContent = "🤍";
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

  function playNext(isAuto = false) {
    let nextIndex;

    // 模式 1: 单曲循环
    if (playMode === 1 && isAuto) {
      audio.currentTime = 0;
      audio.play();
      return;
    } 
    
    // 模式 2: 随机播放
    if (playMode === 2) {
      if (currentList.length > 1) {
        let newIndex = currentIndex;
        // 简单的随机算法，避免随到同一首
        while (newIndex === currentIndex) {
          newIndex = Math.floor(Math.random() * currentList.length);
        }
        nextIndex = newIndex;
      } else {
        nextIndex = 0;
      }
    } 
    // 模式 0: 列表循环 (默认)
    else {
      nextIndex = (currentIndex + 1) % currentList.length;
    }

    loadSong(nextIndex);
    audio.play();
    playPauseBtn.textContent = "⏸";
    player.classList.add("playing");
  }

  /* =========================================================
     5. 列表渲染与交互逻辑 (核心改动)
     ========================================================= */

  // 通用菜单显示/隐藏辅助函数
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

  // 点击标题打开歌曲列表
  titleEl.addEventListener("click", (e) => {
    e.stopPropagation();
    if (player.classList.contains("flipped")) return; // 背面时不响应
    
    hideMenu(playlistMenuEl); // 确保另一个菜单关闭
    toggleMenu(songListEl);
  });

  // 点击列表切歌
  songListEl.addEventListener("click", e => {
    const item = e.target.closest(".playlist-item");
    if (item) {
      loadSong(parseInt(item.dataset.index));
      audio.play();
      playPauseBtn.textContent = "⏸";
      // 这里不自动关闭列表，方便连续切歌
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

  // 点击背面歌单标题 -> 打开歌单选择菜单
  playlistTitleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideMenu(songListEl); // 确保歌曲列表关闭
    toggleMenu(playlistMenuEl);
  });

  // 点击歌单项 -> 切换歌单
  if (playlistMenuEl) {
    playlistMenuEl.addEventListener('click', (e) => {
      const item = e.target.closest(".playlist-item");
      if (item) {
        const key = item.dataset.key;
        if (key !== currentPlaylistKey) {
          changePlaylist(key);
        }
        hideMenu(playlistMenuEl); // 选完后关闭菜单
      }
    });
  }

  function changePlaylist(key) {
    const config = playlistsConfig.find(c => c.key === key);
    if (!config) return;

    currentPlaylistKey = key;
    playlistTitleBtn.textContent = config.name; // 更新背面标题
    
    // 重新生成当前播放列表数据
    currentList = allSongsLibrary.filter(config.filter);

    // 重置并播放第一首
    currentIndex = 0;
    loadSong(0);
    audio.play();
    playPauseBtn.textContent = "⏸";
    player.classList.add("playing");
    
    // 更新两个列表的高亮状态
    renderPlaylistMenu();
    renderSongListDOM();
  }

  // 初始化渲染一次歌单菜单
  renderPlaylistMenu();

  /* --- C. 背面：按钮逻辑 --- */

  // 模式切换
  modeBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    playMode = (playMode + 1) % 3;
    modeBtn.textContent = playModes[playMode].icon;
  });

  // 喜欢按钮
  heartBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    heartBtn.classList.toggle("liked");
    if (heartBtn.classList.contains("liked")) {
        heartBtn.textContent = "❤️";
    } else {
        heartBtn.textContent = "🤍";
    }
  });

  /* --- D. 全局点击关闭菜单 --- */
  document.addEventListener("click", e => {
    // 如果点击区域不在播放器、歌曲列表、歌单菜单内，则关闭浮窗
    const inPlayer = player.contains(e.target);
    const inSongList = songListEl && songListEl.contains(e.target);
    const inPlayListMenu = playlistMenuEl && playlistMenuEl.contains(e.target);

    if (!inPlayer && !inSongList && !inPlayListMenu) {
      hideMenu(songListEl);
      hideMenu(playlistMenuEl);
    }
  });

  /* =========================================================
     6. 长按翻转逻辑 (3D Flip)
     ========================================================= */
  let pressTimer;
  let isDrag = false;
  const LONG_PRESS_DURATION = 500;

  const startPress = (e) => {
    // 忽略按钮和可点击文本的触发
    if (e.target.closest('button') || e.target.closest('.clickable')) return;
    
    isDrag = false;
    pressTimer = setTimeout(() => {
      if (!isDrag) {
        player.classList.toggle("flipped");
        // 翻转时隐藏所有列表
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
    inactivityTimer = setTimeout(hidePlayerUI, 30000); // 30秒无操作隐藏
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
     9. Media Session API (锁屏控制优化)
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
        // 将专辑名设置为当前歌单名称
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
      });

      // 允许锁屏进度条拖动
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

  // 进度条状态同步
  audio.addEventListener('loadedmetadata', updatePositionState);
  
  audio.addEventListener('play', () => {
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
    updatePositionState();
  });
  
  audio.addEventListener('pause', () => {
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
    updatePositionState();
  });
  
  audio.addEventListener('timeupdate', () => {
    // 简单的节流，防止过于频繁调用 (每5秒同步一次即可)
    if (Math.floor(audio.currentTime) % 5 === 0) {
      updatePositionState();
    }
  });

  /* =========================================================
     10. 启动播放器
     ========================================================= */
  resetTimer();
  loadSong(0);
});
