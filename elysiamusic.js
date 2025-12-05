/* elysiamusic.js - Logic & Data for Elysia Player (Flip Version) */

document.addEventListener("DOMContentLoaded", () => {
  /* ===== 🎵 歌曲数据源 (All Songs) ===== */
  // 这是完整的歌曲库，不做删减
  const allSongsLibrary = [
    { 
      title: "My Soul, Your Beats!", 
      src: "assets/My Soul, Your Beats! -Piano Arrange Ver.-.mp3", 
      cover: "assets/My Soul, Your Beats! -Piano Arrange Ver.-.jpg" 
    },
    { 
      title: "My Most Precious Treasure", 
      src: "assets/My Most Precious Treasure (From My Most Precious Treasure).mp3", 
      cover: "assets/Key anime piano medley.jpg" 
    },
    { 
      title: "Shiteki de Souseiteki na Tori-tachi e no Shirabe", 
      src: "assets/Shiteki de Souseiteki na Tori-tachi e no Shirabe (Yokunin no Tame no Piano Sanka).mp3", 
      cover: "assets/Shiteki.jpg" 
    },
    { 
      title: "Last regrets, foretting me", 
      src: "assets/Last regrets,foretting me.mp3", 
      cover: "assets/Last regrets, foretting me.jpg" 
    },
    { 
      title: "Megumeru Gensoukyoku", 
      src: "assets/Megumeru Gensoukyoku.mp3", 
      cover: "assets/Megumeru Gensoukyoku.jpg" 
    },
    { 
      title: "Call of Silence", 
      src: "assets/Call of Silence (From Attack on Titian) Piano Cover.mp3", 
      cover: "assets/Call of Silence.jpg" 
    },
    { 
      title: "Only my Railgun OP1 fripSide", 
      src: "assets/Only my Railgun - A Certain Scientific Railgun OP1 [Piano]  fripSide.mp3", 
      cover: "assets/Level5.jpg" 
    },
    { 
      title: "Aoi Tori - The iDOLM", 
      src: "assets/[Pianeet] Aoi Tori - The iDOLM@STER OST - Piano Tutorial  Synthesia.mp3", 
      cover: "assets/Aoi Tori - The iDOLM.jpg" 
    },
    { 
      title: "鬼滅之刃 OPLiSA - 紅蓮華", 
      src: "assets/Gurenge - Demon Slayer OP [Piano].mp3", 
      cover: "assets/Shinobu Kocho.jpg" 
    },
    { 
      title: "Flower Dance - DJ Okawari", 
      src: "assets/Flower Dance - DJ Okawari (Piano Cover by Riyandi Kusuma).mp3", 
      cover: "assets/Flower Dance - DJ Okawari.jpg" 
    },
    { 
      title: "theme of SSS -Piano Arrange ", 
      src: "assets/theme of SSS -Piano Arrange Ver.-.mp3", 
      cover: "assets/theme of SSS.jpg" 
    },
    { 
      title: "My Soul, Your Beats! Classic", 
      src: "assets/My Soul, Your Beats! ~Classic~ Instrumental.mp3", 
      cover: "assets/My Soul, Your Beats! ~Classic~ Instrumental.jpg" 
    },
    { 
      title: "Pachelbel's Canon", 
      src: "assets/Bi.Bi PianoPachelbel's Canon 终于弹了这首 世界上最治愈的钢琴曲卡农.mp3", 
      cover: "assets/banner1.jpg" 
    },
    { 
      title: "Heroism endures in nothingness", 
      src: "assets/英雄主义-在虚无中永存.mp3", 
      cover: "assets/Elysia11.jpg" 
    },
    { 
      title: "诀别书", 
      src: "assets/钢琴演奏诀别书纯音乐精编完整版.mp3", 
      cover: "assets/Elysia11.jpg" 
    },
    { 
      title: "Key anime piano medley", 
      src: "assets/Air (TV), Kanon (2006), Clannad After Story - Key anime piano medley.mp3", 
      cover: "assets/Key anime piano medley.jpg" 
    },
    { 
      title: "Crying for Rain", 
      src: "assets/Crying for Rain (Kawaki wo Ameku) - Domestic na Kanojo OP [Piano]  Minami.mp3", 
      cover: "assets/banner1.jpg" 
    },
    { 
      title: "GIRLS BAND CRY", 
      src: "assets/GIRLS BAND CRY OP - Wrong World - Piano Cover  TOGENASHI TOGEARI.mp3", 
      cover: "assets/GIRLS BAND CRY.jpg" 
    },
    { 
      title: "Hikari no Senritsu", 
      src: "assets/Hikari no Senritsu - Sora no Woto OP Arr. Animenz (2024 Fan Remaster Visualized).mp3", 
      cover: "assets/banner1.jpg" 
    },
    { 
      title: "LEVEL5 -judgelight", 
      src: "assets/LEVEL5 -judgelight- A Certain Scientific Railgun OP2 [Piano].mp3", 
      cover: "assets/banner1.jpg" 
    },
    { 
      title: "Flower Dance Super Trick Version", 
      src: "assets/Flower Dance Super Trick Version (mp3cut.net).mp3", 
      cover: "assets/Flower Dance - DJ Okawari.jpg" 
    },
    { 
      title: "Departures - Guilty Crown ED1", 
      src: "assets/Departures - Guilty Crown ED1 [Piano].mp3", 
      cover: "assets/Elysia11.jpg" 
    },
    { 
      title: "Majo no Tabitabi", 
      src: "assets/Majo no Tabitabi OPLiterature Piano Cover.mp3", 
      cover: "assets/Majo no Tabitabi.jpg" 
    },
    { 
      title: "My Dearest ", 
      src: "assets/My Dearest - Guilty Crown OP [10 Year Anniversary Edition] [Piano].mp3", 
      cover: "assets/Mydearest.jpg" 
    },
    { 
      title: "Ninelie Kabaneri", 
      src: "assets/Ninelie - Kabaneri of the Iron Fortress ED [Piano].mp3", 
      cover: "assets/ninelie.jpg" 
    },
    { 
      title: "One Last Kiss", 
      src: "assets/One Last Kiss - Evangelion_ 3.0  1.0 Theme Song [Piano]  Hikaru Utada.mp3", 
      cover: "assets/one last kiss.jpg" 
    },
    { 
      title: "secret base", 
      src: "assets/secret base - Kimi ga Kureta Mono - AnoHana ED [Piano].mp3", 
      cover: "assets/secret base.jpg" 
    },
    { 
      title: "Blue Bird 2022 ver.", 
      src: "assets/Blue Bird (2022 ver.) - Naruto Shippuuden OP3 [Piano]  Ikimono-gakari.mp3", 
      cover: "assets/banner1.jpg" 
    },
    { 
      title: "Hikaru Nara - Your Lie in Apri", 
      src: "assets/Hikaru Nara - Your Lie in April OP1 [Piano].mp3", 
      cover: "assets/Elysia11.jpg"
    },
    { 
      title: "AKIBA POP the Future - Pianeet", 
      src: "assets/AKIBA POP the Future - Pianeet [Piano Transcription].mp3", 
      cover: "assets/banner1.jpg" 
    },
    { 
      title: "SWORD ART ONLINE", 
      src: "assets/SWORD ART ONLINE PIANO MEDLEY!!! (30,000 Subscribers Special).mp3", 
      cover: "assets/SWORD ART ONLINE.jpg" 
    },
    { 
      title: "Merry Christmas, Mr. Lawrence 1986", 
      src: "assets/merry.mp3", 
      cover: "assets/banner1.jpg" 
    },
    { 
      title: "反方向的钟", 
      src: "assets/反方向的钟.mp3", 
      cover: "assets/Elysia11.jpg" 
    },
    { 
      title: "给我一首歌的时间", 
      src: "assets/给我一首歌的时间 piano ver-.mp3", 
      cover: "assets/banner1.jpg" 
    },
    { 
      title: "晴天", 
      src: "assets/周杰伦晴天 钢琴独奏 Jay ChouBi.Bi Piano.mp3", 
      cover: "assets/banner1.jpg" 
    },
    { 
      title: "溯", 
      src: "assets/su.mp3", 
      cover: "assets/Elysia11.jpg" 
    },
    { 
      title: "潮汐", 
      src: "assets/Natural.mp3", 
      cover: "assets/Elysia11.jpg" 
    },
    { 
      title: "游京", 
      src: "assets/游京 东雪莲.mp3", 
      cover: "assets/游京 东雪莲.jpg" 
    },
    { 
      title: "还是会想你", 
      src: "assets/还是会想你曼波 (mp3cut.net) 2.mp3", 
      cover: "assets/Elysia11.jpg" 
    },
    { 
      title: "Duvert 四季 Merry mixed", 
      src: "assets/mix.mp3", 
      cover: "assets/Elysia11.jpg" 
    }
  ];

  /* ===== 歌单管理系统 ===== */
  // 自动将歌曲分配到不同歌单（基于索引取模，保证每个列表都有歌）
  const playlists = {
    piano: allSongsLibrary, // 钢琴全集
    mon: allSongsLibrary.filter((_, i) => i % 7 === 0), // 月曜日
    tue: allSongsLibrary.filter((_, i) => i % 7 === 1), // 火曜日
    wed: allSongsLibrary.filter((_, i) => i % 7 === 2), // 水曜日
    thu: allSongsLibrary.filter((_, i) => i % 7 === 3), // 木曜日
    fri: allSongsLibrary.filter((_, i) => i % 7 === 4), // 金曜日
    sat: allSongsLibrary.filter((_, i) => i % 7 === 5), // 土曜日
    sun: allSongsLibrary.filter((_, i) => i % 7 === 6), // 日曜日
  };

  /* ===== 状态变量 ===== */
  let currentPlaylistKey = 'piano'; // 默认歌单
  let currentList = playlists[currentPlaylistKey]; // 当前播放列表
  let currentIndex = 0; // 当前歌曲索引
  
  // 播放模式: 0=列表循环, 1=单曲循环, 2=随机播放
  let playMode = 0; 
  const playModes = [
    { icon: "🔁", name: "列表循环" },
    { icon: "🔂", name: "单曲循环" },
    { icon: "🔀", name: "随机播放" }
  ];

  /* ===== 初始化音频 ===== */
  const audio = new Audio();
  audio.preload = "auto";

  /* ===== 获取 DOM 元素 ===== */
  const player = document.getElementById("elysiaPlayer");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const nextBtn = document.getElementById("nextBtn");
  const titleEl = document.getElementById("songTitle");
  const playlistEl = document.getElementById("playlist"); // 弹出式列表
  
  // 背面元素
  const modeBtn = document.getElementById("modeBtn");
  const playlistSelect = document.getElementById("playlistSelect");
  const currentPlaylistText = document.getElementById("currentPlaylistText");

  // 如果找不到播放器核心元素，停止执行
  if (!player || !playPauseBtn) return;


  /* =========================================================
     核心播放控制逻辑
     ========================================================= */

  // 1. 加载歌曲
  function loadSong(index) {
    if (!currentList || currentList.length === 0) return;
    
    // 索引越界保护
    if (index < 0) index = currentList.length - 1;
    if (index >= currentList.length) index = 0;
    
    currentIndex = index;
    const song = currentList[currentIndex];
    
    audio.src = song.src;
    titleEl.textContent = song.title;
    
    // 更新外部 UI
    renderPlaylistDOM(); // 更新弹出的列表内容
    updateMediaSession(song); // 更新系统锁屏信息
  }

  // 2. 播放/暂停切换
  function togglePlay() {
    if (audio.paused) {
      audio.play().catch(e => {
        // 自动播放策略限制处理
        console.log("Autoplay waiting for interaction");
      });
      playPauseBtn.textContent = "⏸";
      player.classList.add("playing");
    } else {
      audio.pause();
      playPauseBtn.textContent = "▶";
      player.classList.remove("playing");
    }
  }

  // 3. 切歌逻辑 (包含播放模式判断)
  function playNext(isAuto = false) {
    let nextIndex;

    // 模式判断
    if (playMode === 1 && isAuto) {
      // 🔂 单曲循环 + 自动结束 -> 重播当前
      audio.currentTime = 0;
      audio.play();
      return;
    } 
    
    if (playMode === 2) {
      // 🔀 随机播放 -> 随机索引
      if (currentList.length > 1) {
        let newIndex = currentIndex;
        while (newIndex === currentIndex) {
          newIndex = Math.floor(Math.random() * currentList.length);
        }
        nextIndex = newIndex;
      } else {
        nextIndex = 0;
      }
    } else {
      // 🔁 列表循环 -> 下一首
      nextIndex = (currentIndex + 1) % currentList.length;
    }

    loadSong(nextIndex);
    
    // 如果是手动切歌，或者之前正在播放，则保持播放状态
    if (!audio.paused || isAuto) {
      audio.play();
      playPauseBtn.textContent = "⏸";
    }
  }


  /* =========================================================
     长按翻转逻辑 (Long Press Flip)
     ========================================================= */
  let pressTimer;
  let isDrag = false;
  const LONG_PRESS_DURATION = 800; // 长按 800ms 触发

  const startPress = (e) => {
    // 忽略按钮点击，只响应播放器空白处
    if (e.target.closest('button') || e.target.closest('select')) return;
    
    isDrag = false;
    pressTimer = setTimeout(() => {
      if (!isDrag) {
        // 切换翻转状态
        player.classList.toggle("flipped");
        
        // 翻转时隐藏弹出的歌曲列表，避免视觉遮挡
        playlistEl.classList.remove("show");
        playlistEl.classList.add("hide");
        
        // 如果翻转到了正面 (移除了 flipped)，确保列表文本正确 (可选)
      }
    }, LONG_PRESS_DURATION);
  };

  const cancelPress = () => clearTimeout(pressTimer);
  const onMove = () => { isDrag = true; clearTimeout(pressTimer); };

  // 兼容鼠标和触摸事件
  player.addEventListener('mousedown', startPress);
  player.addEventListener('touchstart', startPress, { passive: true });
  
  player.addEventListener('mouseup', cancelPress);
  player.addEventListener('mouseleave', cancelPress);
  player.addEventListener('touchend', cancelPress);
  
  player.addEventListener('mousemove', onMove);
  player.addEventListener('touchmove', onMove, { passive: true });


  /* =========================================================
     背面功能逻辑 (Back Side)
     ========================================================= */

  // 1. 播放模式切换 (1个按钮循环 3种模式)
  modeBtn.addEventListener('click', () => {
    playMode = (playMode + 1) % 3;
    modeBtn.textContent = playModes[playMode].icon;
    // 可以在这里加个简单的 Toast 提示，但为了保持无UI修改，直接更新图标
  });

  // 2. 歌单切换
  playlistSelect.addEventListener('change', (e) => {
    const selectedKey = e.target.value;
    const newList = playlists[selectedKey];

    if (newList && newList.length > 0) {
      // 更新数据
      currentPlaylistKey = selectedKey;
      currentList = newList;
      
      // 更新背面显示的文字
      const optionText = e.target.options[e.target.selectedIndex].text;
      currentPlaylistText.textContent = optionText;

      // 重置播放
      currentIndex = 0;
      loadSong(0);
      audio.play();
      playPauseBtn.textContent = "⏸";
    }
  });


  /* =========================================================
     通用 UI 交互
     ========================================================= */

  // 播放按钮
  playPauseBtn.addEventListener("click", togglePlay);

  // 下一首按钮
  nextBtn.addEventListener("click", () => playNext(false));

  // 自动播放结束
  audio.addEventListener("ended", () => playNext(true));

  // 渲染弹出列表
  function renderPlaylistDOM() {
    playlistEl.innerHTML = currentList.map((s, i) => `
      <div class="playlist-item ${i === currentIndex ? 'active' : ''}" data-index="${i}">
        ${s.title}
      </div>
    `).join("");
  }

  // 点击弹出列表切歌
  playlistEl.addEventListener("click", e => {
    const item = e.target.closest(".playlist-item");
    if (item) {
      loadSong(parseInt(item.dataset.index));
      audio.play();
      playPauseBtn.textContent = "⏸";
    }
  });

  // 点击标题显示/隐藏列表 (仅在正面有效)
  titleEl.addEventListener("click", (e) => {
    e.stopPropagation();
    // 如果已经翻转到背面，不响应点击
    if (player.classList.contains("flipped")) return;

    if (playlistEl.classList.contains("show")) {
      playlistEl.classList.remove("show");
      playlistEl.classList.add("hide");
      playlistEl.setAttribute('aria-hidden', 'true');
    } else {
      playlistEl.classList.remove("hide");
      playlistEl.classList.add("show");
      playlistEl.setAttribute('aria-hidden', 'false');
    }
  });

  // 点击空白处关闭列表
  document.addEventListener("click", e => {
    if (!player.contains(e.target) && !playlistEl.contains(e.target)) {
      if (playlistEl.classList.contains("show")) {
        playlistEl.classList.remove("show");
        playlistEl.classList.add("hide");
      }
    }
  });


  /* =========================================================
     自动隐藏播放器 (30秒无操作)
     ========================================================= */
  let inactivityTimer;
  function hidePlayerUI() {
    // 降低透明度并下移
    player.style.opacity = '0';
    player.style.transform = 'translate(-50%, 40px)'; // 保持 X 居中，Y 下移
    player.style.pointerEvents = 'none';
    
    // 如果列表开着，也关掉
    if (playlistEl.classList.contains("show")) {
      playlistEl.classList.remove("show");
      playlistEl.classList.add("hide");
    }
  }

  function showPlayerUI() {
    player.style.opacity = '1';
    // 恢复位置：注意要和 CSS 中的 transform: translateX(-50%) 配合
    // 这里我们重置 translate，依赖 CSS 的默认动画位置，或者显式写出
    player.style.transform = 'translate(-50%, 0)'; 
    player.style.pointerEvents = 'auto';
    resetTimer();
  }

  function resetTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(hidePlayerUI, 30000); // 30秒
  }

  // 监听活动
  ['scroll','mousemove','mousedown','touchstart','keydown'].forEach(evt =>
    window.addEventListener(evt, showPlayerUI)
  );


  /* =========================================================
     Media Session API (锁屏控制)
     ========================================================= */
  function updateMediaSession(song) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: "Elysia Player",
        album: currentPlaylistText.textContent, // 显示当前歌单名
        artwork: [
          { src: song.cover || 'assets/banner1.jpg', sizes: "512x512", type: "image/jpeg" }
        ]
      });

      // 绑定动作
      const actionHandlers = [
        ['play', togglePlay],
        ['pause', togglePlay],
        ['nexttrack', () => playNext(false)],
        ['previoustrack', () => {
          // 上一首
          let prevIndex = currentIndex - 1;
          if (prevIndex < 0) prevIndex = currentList.length - 1;
          loadSong(prevIndex);
          audio.play();
        }],
        ['seekto', (details) => {
          if (details.fastSeek && 'fastSeek' in audio) {
            audio.fastSeek(details.seekTime);
          } else {
            audio.currentTime = details.seekTime;
          }
        }]
      ];

      for (const [action, handler] of actionHandlers) {
        try { navigator.mediaSession.setActionHandler(action, handler); } 
        catch (e) {}
      }
    }
  }

  // 初始化：加载第一首但不自动播放
  resetTimer();
  loadSong(0);
});
