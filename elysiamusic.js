/* elysiamusic.js - Unified UI Logic */

document.addEventListener("DOMContentLoaded", () => {
  /* ===== 🎹 数据源 ===== */
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

  /* ===== 📂 歌单分类定义 ===== */
  // 这里定义每个歌单的名字、ID和图标
  const categories = [
    { id: 'piano', name: '钢琴曲', icon: '🎹' },
    { id: 'mon', name: '月曜日', icon: '🌙' },
    { id: 'tue', name: '火曜日', icon: '🔥' },
    { id: 'wed', name: '水曜日', icon: '💧' },
    { id: 'thu', name: '木曜日', icon: '🌲' },
    { id: 'fri', name: '金曜日', icon: '💰' },
    { id: 'sat', name: '土曜日', icon: '🪐' },
    { id: 'sun', name: '日曜日', icon: '☀️' }
  ];

  // 生成实际歌单数据
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

  let currentPlaylistKey = 'piano';
  let currentList = playlists[currentPlaylistKey];
  let currentIndex = 0;
  let playMode = 0; // 0=List, 1=Single, 2=Random
  const playModes = [ { icon: "🔁" }, { icon: "🔂" }, { icon: "🔀" } ];

  /* ===== DOM 元素 ===== */
  const audio = new Audio();
  audio.preload = "auto";
  const player = document.getElementById("elysiaPlayer");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const nextBtn = document.getElementById("nextBtn");
  const titleEl = document.getElementById("songTitle");
  
  // 关键元素：复用的列表容器
  const playlistEl = document.getElementById("playlist"); 
  
  // 背面元素
  const modeBtn = document.getElementById("modeBtn");
  const playlistSelectorBtn = document.getElementById("playlistSelectorBtn"); // 新的胶囊按钮
  const currentPlaylistText = document.getElementById("currentPlaylistText");

  if (!player || !playPauseBtn) return;

  /* =========================================================
     📃 列表渲染逻辑 (核心：一份 UI，两种内容)
     ========================================================= */
  
  // 1. 渲染当前歌曲列表
  function renderSongList() {
    playlistEl.innerHTML = currentList.map((s, i) => `
      <div class="playlist-item ${i === currentIndex ? 'active' : ''}" 
           data-type="song" 
           data-index="${i}">
        ${s.title}
      </div>
    `).join("");
  }

  // 2. 渲染歌单分类列表 (UI完全一致)
  function renderCategoryList() {
    playlistEl.innerHTML = categories.map(cat => `
      <div class="playlist-item ${cat.id === currentPlaylistKey ? 'active' : ''}" 
           data-type="category" 
           data-id="${cat.id}"
           data-name="${cat.name}"
           data-icon="${cat.icon}">
        <span style="margin-right:8px; opacity:0.9;">${cat.icon}</span> ${cat.name}
      </div>
    `).join("");
  }

  /* =========================================================
     🎮 交互控制
     ========================================================= */

  function toggleList(type) {
    const isShow = playlistEl.classList.contains("show");
    
    // 如果已经显示，且点击的是同一个类型，则关闭
    if (isShow && playlistEl.dataset.currentType === type) {
      playlistEl.classList.remove("show");
      playlistEl.classList.add("hide");
      return;
    }

    // 渲染对应内容
    if (type === 'song') {
      renderSongList();
    } else {
      renderCategoryList();
    }
    
    // 标记当前列表类型
    playlistEl.dataset.currentType = type;

    // 显示列表 (重置动画)
    playlistEl.classList.remove("hide");
    // 强制重绘以触发动画
    void playlistEl.offsetWidth; 
    playlistEl.classList.add("show");
  }

  // 点击正面标题 -> 显示歌曲
  titleEl.addEventListener("click", (e) => {
    e.stopPropagation();
    if (player.classList.contains("flipped")) return; // 翻转时正面不可点
    toggleList('song');
  });

  // 点击背面胶囊 -> 显示分类
  playlistSelectorBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleList('category');
  });

  // 统一列表点击代理
  playlistEl.addEventListener("click", e => {
    const item = e.target.closest(".playlist-item");
    if (!item) return;

    const type = item.dataset.type;

    // 🅰️ 点击了具体的歌曲
    if (type === 'song') {
      loadSong(parseInt(item.dataset.index));
      audio.play();
      playPauseBtn.textContent = "⏸";
      
      // 更新高亮
      renderSongList(); 
    } 
    // 🅱️ 点击了分类 (切换歌单)
    else if (type === 'category') {
      const newKey = item.dataset.id;
      const newName = item.dataset.name;
      const newIcon = item.dataset.icon;

      // 切换数据
      currentPlaylistKey = newKey;
      currentList = playlists[newKey];
      
      // 更新背面胶囊文字
      currentPlaylistText.textContent = `${newIcon} ${newName}`;
      
      // 重置播放
      currentIndex = 0;
      loadSong(0);
      audio.play();
      playPauseBtn.textContent = "⏸";
      player.classList.add("playing");

      // 更新高亮 (视觉反馈)
      renderCategoryList(); 
      
      // 可选：切完歌单后自动关闭列表
      setTimeout(() => {
        playlistEl.classList.remove("show");
        playlistEl.classList.add("hide");
      }, 300);
    }
  });

  /* =========================================================
     🎵 播放器核心功能 (保持不变)
     ========================================================= */

  function loadSong(index) {
    if (!currentList || currentList.length === 0) return;
    if (index < 0) index = currentList.length - 1;
    if (index >= currentList.length) index = 0;
    
    currentIndex = index;
    const song = currentList[currentIndex];
    
    audio.src = song.src;
    titleEl.textContent = song.title;
    
    // 如果当前开着歌曲列表，需要同步高亮
    if (playlistEl.classList.contains("show") && playlistEl.dataset.currentType === 'song') {
      renderSongList();
    }
    updateMediaSession(song);
  }

  function togglePlay() {
    if (audio.paused) {
      audio.play();
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
    if (playMode === 1 && isAuto) {
      audio.currentTime = 0;
      audio.play();
      return;
    } 
    if (playMode === 2) {
      nextIndex = Math.floor(Math.random() * currentList.length);
    } else {
      nextIndex = (currentIndex + 1) % currentList.length;
    }
    loadSong(nextIndex);
    audio.play();
    playPauseBtn.textContent = "⏸";
    player.classList.add("playing");
  }

  /* =========================================================
     📱 其他交互 (长按翻转、锁屏等)
     ========================================================= */
  
  // 模式切换
  modeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playMode = (playMode + 1) % 3;
    modeBtn.textContent = playModes[playMode].icon;
  });

  // 播放控制
  playPauseBtn.addEventListener("click", togglePlay);
  nextBtn.addEventListener("click", () => playNext(false));
  audio.addEventListener("ended", () => playNext(true));

  // 长按翻转
  let pressTimer; let isDrag = false;
  const startPress = (e) => {
    if (e.target.closest('button') || e.target.closest('.playlist-selector-wrapper')) return;
    isDrag = false;
    pressTimer = setTimeout(() => {
      if (!isDrag) {
        player.classList.toggle("flipped");
        playlistEl.classList.remove("show");
        playlistEl.classList.add("hide");
      }
    }, 500);
  };
  const cancelPress = () => clearTimeout(pressTimer);
  const onMove = () => { isDrag = true; clearTimeout(pressTimer); };
  
  player.addEventListener('mousedown', startPress);
  player.addEventListener('touchstart', startPress, {passive:true});
  player.addEventListener('mouseup', cancelPress);
  player.addEventListener('mouseleave', cancelPress);
  player.addEventListener('touchend', cancelPress);
  player.addEventListener('mousemove', onMove);
  player.addEventListener('touchmove', onMove, {passive:true});

  // 点击外部关闭列表
  document.addEventListener("click", e => {
    if (!player.contains(e.target) && !playlistEl.contains(e.target)) {
      if (playlistEl.classList.contains("show")) {
        playlistEl.classList.remove("show");
        playlistEl.classList.add("hide");
      }
    }
  });

  // 锁屏控制 & 进度条修复
  function updateMediaSession(song) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: "Elysia Player",
        album: currentPlaylistText.textContent,
        artwork: [{ src: song.cover || 'assets/banner1.jpg', sizes: "512x512", type: "image/jpeg" }]
      });
      navigator.mediaSession.setActionHandler('play', togglePlay);
      navigator.mediaSession.setActionHandler('pause', togglePlay);
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext(false));
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        loadSong(currentIndex - 1); audio.play();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.fastSeek && 'fastSeek' in audio) audio.fastSeek(details.seekTime);
        else audio.currentTime = details.seekTime;
        updatePositionState();
      });
    }
  }

  function updatePositionState() {
    if ('setPositionState' in navigator.mediaSession && !isNaN(audio.duration)) {
      navigator.mediaSession.setPositionState({
        duration: audio.duration,
        playbackRate: audio.playbackRate,
        position: audio.currentTime
      });
    }
  }
  audio.addEventListener('loadedmetadata', updatePositionState);
  audio.addEventListener('timeupdate', () => { if(Math.floor(audio.currentTime)%5===0) updatePositionState(); });

  // 启动
  loadSong(0);
});
