document.addEventListener("DOMContentLoaded", () => {
  /* ===== 🎵 歌曲数据源 (All Songs) ===== */
  // 这里存放你所有的歌曲数据
  const allSongs = [
    { title: "My Soul, Your Beats!", src: "assets/My Soul, Your Beats! -Piano Arrange Ver.-.mp3", cover: "assets/My Soul, Your Beats! -Piano Arrange Ver.-.jpg" },
    { title: "My Most Precious Treasure", src: "assets/My Most Precious Treasure (From My Most Precious Treasure).mp3", cover: "assets/Key anime piano medley.jpg" },
    { title: "Flower Dance - DJ Okawari", src: "assets/Flower Dance - DJ Okawari (Piano Cover by Riyandi Kusuma).mp3", cover: "assets/Flower Dance - DJ Okawari.jpg" },
    { title: "One Last Kiss", src: "assets/One Last Kiss - Evangelion_ 3.0  1.0 Theme Song [Piano]  Hikaru Utada.mp3", cover: "assets/one last kiss.jpg" },
    { title: "Merry Christmas, Mr. Lawrence", src: "assets/merry.mp3", cover: "assets/banner1.jpg" },
    { title: "反方向的钟", src: "assets/反方向的钟.mp3", cover: "assets/Elysia11.jpg" },
    // ... 你可以继续把原本的所有歌曲都放这里
  ];

  /* ===== 歌单定义 (根据需求分类) ===== */
  // 这里演示逻辑：把 allSongs 分配给不同歌单。你可以手动指定。
  const playlists = {
    piano: allSongs, // 钢琴曲 (默认全集)
    mon: allSongs.filter((_, i) => i % 7 === 0),
    tue: allSongs.filter((_, i) => i % 7 === 1),
    wed: allSongs.filter((_, i) => i % 7 === 2),
    thu: allSongs.filter((_, i) => i % 7 === 3),
    fri: allSongs.filter((_, i) => i % 7 === 4), // 金曜日
    sat: allSongs.filter((_, i) => i % 7 === 5),
    sun: allSongs.filter((_, i) => i % 7 === 6),
  };

  /* ===== 状态管理 ===== */
  let currentPlaylistKey = 'piano';
  let currentList = playlists[currentPlaylistKey];
  let currentIndex = 0;
  
  // 模式: 0=列表循环, 1=单曲循环, 2=随机
  let playMode = 0; 
  const playModes = [
    { icon: "🔁", label: "循环" }, 
    { icon: "🔂", label: "单曲" }, 
    { icon: "🔀", label: "随机" }
  ];

  /* ===== DOM 获取 ===== */
  const audio = new Audio();
  audio.preload = "auto";
  
  const player = document.getElementById("elysiaPlayer");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const nextBtn = document.getElementById("nextBtn");
  const titleEl = document.getElementById("songTitle");
  const playlistEl = document.getElementById("playlist"); // 弹出的列表DOM
  
  // 背面元素
  const modeBtn = document.getElementById("modeBtn");
  const flipBackBtn = document.getElementById("flipBackBtn");
  const playlistSelect = document.getElementById("playlistSelect");
  const currentPlaylistText = document.getElementById("currentPlaylistText");

  if(!player) return;

  /* ===== 核心播放逻辑 ===== */
  function loadSong(index) {
    if (!currentList || currentList.length === 0) return;
    
    // 索引修正
    if (index < 0) index = currentList.length - 1;
    if (index >= currentList.length) index = 0;
    
    currentIndex = index;
    const song = currentList[currentIndex];
    
    audio.src = song.src;
    titleEl.textContent = song.title;
    
    renderPlaylistDOM();
    updateMediaSession(song);
  }

  function togglePlay() {
    if (audio.paused) {
      audio.play().catch(()=>{});
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
    
    if (isAuto && playMode === 1) {
      // 单曲循环且自动结束 -> 重播
      audio.currentTime = 0;
      audio.play();
      return;
    }

    if (playMode === 2) {
      // 随机
      let newIndex = currentIndex;
      if (currentList.length > 1) {
        while(newIndex === currentIndex) {
          newIndex = Math.floor(Math.random() * currentList.length);
        }
      }
      nextIndex = newIndex;
    } else {
      // 列表循环
      nextIndex = (currentIndex + 1) % currentList.length;
    }
    
    loadSong(nextIndex);
    if (!audio.paused || isAuto) {
      audio.play();
      playPauseBtn.textContent = "⏸";
    }
  }

  /* ===== 长按翻转逻辑 (Long Press) ===== */
  let pressTimer;
  let isDrag = false;

  const startPress = (e) => {
    // 如果点的是按钮，不触发翻转
    if(e.target.closest('button') || e.target.closest('select')) return;
    
    isDrag = false;
    pressTimer = setTimeout(() => {
      if(!isDrag) {
        // 触发翻转
        player.classList.add("flipped");
        // 如果原本列表打开了，就关掉
        playlistEl.classList.remove("show");
        playlistEl.classList.add("hide");
      }
    }, 600); // 600ms 长按时间
  };

  const cancelPress = () => clearTimeout(pressTimer);
  const onMove = () => { isDrag = true; clearTimeout(pressTimer); };

  // 绑定触摸和鼠标事件
  player.addEventListener('mousedown', startPress);
  player.addEventListener('touchstart', startPress, {passive:true});
  
  player.addEventListener('mouseup', cancelPress);
  player.addEventListener('mouseleave', cancelPress);
  player.addEventListener('touchend', cancelPress);
  
  player.addEventListener('mousemove', onMove);
  player.addEventListener('touchmove', onMove, {passive:true});

  /* ===== 背面功能交互 ===== */
  // 1. 翻转回来
  flipBackBtn.addEventListener('click', () => {
    player.classList.remove("flipped");
  });

  // 2. 切换模式
  modeBtn.addEventListener('click', () => {
    playMode = (playMode + 1) % 3;
    modeBtn.textContent = playModes[playMode].icon;
  });

  // 3. 切换歌单
  playlistSelect.addEventListener('change', (e) => {
    const key = e.target.value;
    const newList = playlists[key];
    
    if(newList && newList.length > 0) {
      currentPlaylistKey = key;
      currentList = newList;
      // 更新显示文本
      currentPlaylistText.textContent = e.target.options[e.target.selectedIndex].text;
      
      // 切歌
      loadSong(0);
      audio.play();
      playPauseBtn.textContent = "⏸";
    }
  });

  /* ===== 列表渲染 ===== */
  function renderPlaylistDOM() {
    playlistEl.innerHTML = currentList.map((s, i) => `
      <div class="playlist-item ${i === currentIndex ? 'active' : ''}" data-index="${i}">
        ${s.title}
      </div>
    `).join("");
  }

  /* ===== 原有事件绑定 ===== */
  playPauseBtn.addEventListener("click", togglePlay);
  nextBtn.addEventListener("click", () => playNext(false));
  audio.addEventListener("ended", () => playNext(true));

  // 列表点击
  playlistEl.addEventListener("click", e => {
    const item = e.target.closest(".playlist-item");
    if(item) {
      loadSong(parseInt(item.dataset.index));
      audio.play();
      playPauseBtn.textContent = "⏸";
    }
  });

  // 点击标题显示列表 (仅在正面有效)
  titleEl.addEventListener("click", (e) => {
    e.stopPropagation();
    if(player.classList.contains("flipped")) return; // 翻转时不显示
    
    if(playlistEl.classList.contains("show")) {
      playlistEl.classList.remove("show");
      playlistEl.classList.add("hide");
    } else {
      playlistEl.classList.remove("hide");
      playlistEl.classList.add("show");
    }
  });

  // 点击空白关闭列表
  document.addEventListener("click", e => {
    if(!player.contains(e.target) && !playlistEl.contains(e.target)) {
      playlistEl.classList.remove("show");
      playlistEl.classList.add("hide");
    }
  });

  /* ===== Media Session ===== */
  function updateMediaSession(song) {
    if('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: "Elysia Player",
        album: currentPlaylistText.textContent,
        artwork: [{ src: song.cover, sizes: "512x512", type: "image/jpeg" }]
      });
      navigator.mediaSession.setActionHandler('play', togglePlay);
      navigator.mediaSession.setActionHandler('pause', togglePlay);
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext(false));
      navigator.mediaSession.setActionHandler('previoustrack', () => {
         let prev = currentIndex - 1;
         if(prev < 0) prev = currentList.length - 1;
         loadSong(prev);
         audio.play();
      });
    }
  }

  // 初始化
  loadSong(0);
});
