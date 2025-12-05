document.addEventListener("DOMContentLoaded", () => {
  
  /* ===== 🎵 歌单数据中心 ===== */
  // 原始歌曲库 (用来分配，实际使用中你可以根据需要精确分类)
  const allSongsLibrary = [
    { title: "My Soul, Your Beats!", src: "assets/My Soul, Your Beats! -Piano Arrange Ver.-.mp3", cover: "assets/My Soul, Your Beats! -Piano Arrange Ver.-.jpg" },
    { title: "My Most Precious Treasure", src: "assets/My Most Precious Treasure (From My Most Precious Treasure).mp3", cover: "assets/Key anime piano medley.jpg" },
    { title: "Flower Dance - DJ Okawari", src: "assets/Flower Dance - DJ Okawari (Piano Cover by Riyandi Kusuma).mp3", cover: "assets/Flower Dance - DJ Okawari.jpg" },
    { title: "Gurenge - Demon Slayer", src: "assets/Gurenge - Demon Slayer OP [Piano].mp3", cover: "assets/Shinobu Kocho.jpg" },
    { title: "Call of Silence", src: "assets/Call of Silence (From Attack on Titian) Piano Cover.mp3", cover: "assets/Call of Silence.jpg" },
    { title: "One Last Kiss", src: "assets/One Last Kiss - Evangelion_ 3.0  1.0 Theme Song [Piano]  Hikaru Utada.mp3", cover: "assets/one last kiss.jpg" },
    { title: "Merry Christmas, Mr. Lawrence", src: "assets/merry.mp3", cover: "assets/banner1.jpg" },
    { title: "晴天 - Jay Chou", src: "assets/周杰伦晴天 钢琴独奏 Jay ChouBi.Bi Piano.mp3", cover: "assets/banner1.jpg" },
    { title: "反方向的钟", src: "assets/反方向的钟.mp3", cover: "assets/Elysia11.jpg" },
    // ... (你可以把所有之前的歌曲都加进来)
  ];

  // 定义8个歌单 (Japanese Days + Piano)
  // 为了演示，我简单地对所有歌曲取模分配，你可以手动填入具体的歌曲对象
  const playlists = {
    piano: allSongsLibrary, // 钢琴曲包含所有
    mon: allSongsLibrary.filter((_, i) => i % 7 === 0), // 月曜日
    tue: allSongsLibrary.filter((_, i) => i % 7 === 1), // 火曜日
    wed: allSongsLibrary.filter((_, i) => i % 7 === 2), // 水曜日
    thu: allSongsLibrary.filter((_, i) => i % 7 === 3), // 木曜日
    fri: allSongsLibrary.filter((_, i) => i % 7 === 4), // 金曜日
    sat: allSongsLibrary.filter((_, i) => i % 7 === 5), // 土曜日
    sun: allSongsLibrary.filter((_, i) => i % 7 === 6), // 日曜日
  };

  /* ===== 状态变量 ===== */
  let currentPlaylistKey = 'piano'; // 当前歌单ID
  let currentList = playlists[currentPlaylistKey]; // 当前播放列表
  let currentIndex = 0; // 当前歌曲索引
  
  // 播放模式: 0=列表循环(Loop), 1=单曲循环(One), 2=随机播放(Shuffle)
  let playMode = 0; 
  const playModes = [
    { icon: "🔁", name: "列表循环" },
    { icon: "🔂", name: "单曲循环" },
    { icon: "🔀", name: "随机播放" }
  ];

  const audio = new Audio();
  audio.preload = "auto";

  /* ===== DOM 元素 ===== */
  const playerContainer = document.getElementById("elysiaPlayer");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const nextBtn = document.getElementById("nextBtn");
  const titleEl = document.getElementById("songTitle");
  const playlistEl = document.getElementById("playlist");
  
  // 新增元素
  const modeBtn = document.getElementById("modeBtn");
  const playlistSelect = document.getElementById("playlistSelect");
  const currentPlaylistNameEl = document.getElementById("currentPlaylistName");
  const flipBackBtn = document.getElementById("flipBackBtn");

  if (!playerContainer) return;

  /* ===== 核心逻辑：加载歌曲 ===== */
  function loadSong(index) {
    if (currentList.length === 0) return;
    
    // 边界检查
    if (index < 0) index = currentList.length - 1;
    if (index >= currentList.length) index = 0;
    
    currentIndex = index;
    const song = currentList[currentIndex];
    
    audio.src = song.src;
    titleEl.textContent = song.title;
    
    renderPlaylistDOM();
    updateMediaSession(song);
    updateModeButtonUI();
  }

  function togglePlay() {
    if (audio.paused) {
      audio.play().catch(e => console.log("Auto-play prevented"));
      playPauseBtn.textContent = "⏸";
      playerContainer.classList.add("playing");
    } else {
      audio.pause();
      playPauseBtn.textContent = "▶";
      playerContainer.classList.remove("playing");
    }
  }

  /* ===== 核心逻辑：下一首 (包含模式判断) ===== */
  function playNext(isAuto = false) {
    let nextIndex;

    if (playMode === 1 && isAuto) {
      // 单曲循环且是自动播放结束时 -> 重播当前
      audio.currentTime = 0;
      audio.play();
      return;
    } 
    
    if (playMode === 2) {
      // 随机播放
      let newIndex = currentIndex;
      // 简单的防止重复随机
      if (currentList.length > 1) {
        while (newIndex === currentIndex) {
          newIndex = Math.floor(Math.random() * currentList.length);
        }
      }
      nextIndex = newIndex;
    } else {
      // 列表循环 (默认)
      nextIndex = (currentIndex + 1) % currentList.length;
    }

    loadSong(nextIndex);
    if (!audio.paused || isAuto) {
      audio.play();
      playPauseBtn.textContent = "⏸";
    }
  }

  /* ===== 长按翻转逻辑 ===== */
  let longPressTimer;
  const LONG_PRESS_DURATION = 800; // 长按触发时间 (毫秒)
  let isDragging = false; // 防止拖动时触发

  // 触摸/鼠标按下
  const startPress = (e) => {
    // 如果点的是具体的按钮，不触发翻转
    if (e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('.playlist-selector')) return;
    
    isDragging = false;
    longPressTimer = setTimeout(() => {
      if (!isDragging) {
        playerContainer.classList.add("flipped");
        // 如果播放列表开着，翻转时关掉它
        playlistEl.classList.remove("show");
        playlistEl.classList.add("hide");
      }
    }, LONG_PRESS_DURATION);
  };

  // 触摸/鼠标松开或移出
  const cancelPress = () => {
    clearTimeout(longPressTimer);
  };

  const onMove = () => {
    isDragging = true;
    clearTimeout(longPressTimer);
  };

  // 绑定事件 (兼容移动端和PC)
  playerContainer.addEventListener('mousedown', startPress);
  playerContainer.addEventListener('touchstart', startPress, {passive: true});
  
  playerContainer.addEventListener('mouseup', cancelPress);
  playerContainer.addEventListener('mouseleave', cancelPress);
  playerContainer.addEventListener('touchend', cancelPress);
  
  playerContainer.addEventListener('mousemove', onMove);
  playerContainer.addEventListener('touchmove', onMove, {passive: true});

  // 翻转回来
  flipBackBtn.addEventListener('click', () => {
    playerContainer.classList.remove("flipped");
  });

  /* ===== 功能：切换播放模式 ===== */
  modeBtn.addEventListener('click', () => {
    playMode = (playMode + 1) % 3;
    updateModeButtonUI();
    
    // 显示临时的提示文字
    const originalText = modeBtn.textContent;
    // 这里可以加个Toast提示，这里简单处理
    console.log("Mode switched to: " + playModes[playMode].name);
  });

  function updateModeButtonUI() {
    modeBtn.textContent = playModes[playMode].icon;
  }

  /* ===== 功能：切换歌单 ===== */
  playlistSelect.addEventListener('change', (e) => {
    const newKey = e.target.value;
    if (playlists[newKey] && playlists[newKey].length > 0) {
      currentPlaylistKey = newKey;
      currentList = playlists[newKey];
      
      // 更新UI显示
      const selectedOptionText = e.target.options[e.target.selectedIndex].text;
      currentPlaylistNameEl.textContent = selectedOptionText;

      // 重置播放
      loadSong(0);
      audio.play();
      playPauseBtn.textContent = "⏸";
    } else {
      alert("该歌单暂无歌曲");
      // 回退选择
      playlistSelect.value = currentPlaylistKey;
    }
  });

  /* ===== 渲染播放列表 UI ===== */
  function renderPlaylistDOM() {
    playlistEl.innerHTML = currentList.map((s, i) => `
      <div class="playlist-item ${i === currentIndex ? 'active' : ''}" data-index="${i}">
        ${s.title}
      </div>`).join("");
  }

  /* ===== 事件监听整合 ===== */
  playPauseBtn.addEventListener("click", togglePlay);
  nextBtn.addEventListener("click", () => playNext(false));
  audio.addEventListener("ended", () => playNext(true));

  // 播放列表点击切歌
  playlistEl.addEventListener("click", e => {
    const item = e.target.closest(".playlist-item");
    if (item) {
      const idx = parseInt(item.dataset.index);
      loadSong(idx);
      audio.play();
      playPauseBtn.textContent = "⏸";
    }
  });

  // 歌名点击显示/隐藏列表
  titleEl.addEventListener("click", (e) => {
    e.stopPropagation();
    if (playlistEl.classList.contains("show")) {
      playlistEl.classList.remove("show");
      playlistEl.classList.add("hide");
    } else {
      // 只有在正面时才能打开列表
      if (!playerContainer.classList.contains("flipped")) {
        playlistEl.classList.remove("hide");
        playlistEl.classList.add("show");
      }
    }
  });

  /* ===== Media Session API (锁屏控制) ===== */
  function updateMediaSession(song) {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: "Elysia Player",
      album: currentPlaylistNameEl.textContent,
      artwork: [{ src: song.cover || 'assets/banner1.jpg', sizes: "512x512", type: "image/jpeg" }]
    });
    
    navigator.mediaSession.setActionHandler('play', togglePlay);
    navigator.mediaSession.setActionHandler('pause', togglePlay);
    navigator.mediaSession.setActionHandler('nexttrack', () => playNext(false));
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      // 上一首逻辑 (简单处理：列表循环模式下倒退)
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = currentList.length - 1;
      loadSong(prevIndex);
      audio.play();
    });
  }

  /* ===== 初始化 ===== */
  // 加载第一首但不播放
  loadSong(0);
});
