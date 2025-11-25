/* elysiamusic.js - Logic & Data for Elysia Player */

document.addEventListener("DOMContentLoaded", () => {
  /* ===== 🎵 歌曲列表数据 ===== */
  const songs = [
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

  /* ===== 初始化变量 ===== */
  let currentSong = 0;
  // 检查歌曲数组是否非空
  if (songs.length === 0) return;

  const audio = new Audio(songs[currentSong].src);
  audio.preload = "auto";

  // 获取 DOM 元素
  const playPauseBtn = document.getElementById("playPauseBtn");
  const nextBtn = document.getElementById("nextBtn");
  const titleEl = document.getElementById("songTitle");
  const player = document.querySelector(".elysia-player");
  const playlist = document.getElementById("playlist");

  // 如果找不到播放器元素，停止执行
  if (!player || !playlist || !playPauseBtn) return;

  /* ======== 播放列表渲染 ======== */
  function renderPlaylist() {
    playlist.innerHTML = songs.map((s, i) => `
      <div class="playlist-item ${i === currentSong ? 'active' : ''}" data-index="${i}">
        ${s.title}
      </div>`).join("");
  }

  /* ======== 更新播放歌曲 ======== */
  function updateSong() {
    const song = songs[currentSong];
    audio.src = song.src;
    titleEl.textContent = song.title;
    audio.play().catch(()=>{
      // 自动播放可能被浏览器阻止，静默处理
    });
    playPauseBtn.textContent = "⏸";
    renderPlaylist();
    updateMediaSession(song);
  }

  /* ======== 按钮事件 ======== */
  playPauseBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      playPauseBtn.textContent = "⏸";
    } else {
      audio.pause();
      playPauseBtn.textContent = "▶";
    }
  });

  nextBtn.addEventListener("click", () => {
    currentSong = (currentSong + 1) % songs.length;
    updateSong();
  });

  /* ======== 状态监听 ======== */
  audio.addEventListener("play", () => player.classList.add("playing"));
  audio.addEventListener("pause", () => player.classList.remove("playing"));

  audio.addEventListener("ended", () => {
    // 自动切歌
    nextBtn.click();
    updateMediaSession(songs[currentSong]); 
  });

  /* ======== 🎧 Media Session API (锁屏控制) ======== */
  function updateMediaSession(song) {
    if (!("mediaSession" in navigator)) return;

    // 1. 设置元数据
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: "Elysia Player",
      album: "Piano Collection",
      artwork: [
        { src: song.cover, sizes: "96x96", type: "image/jpeg" },
        { src: song.cover, sizes: "128x128", type: "image/jpeg" },
        { src: song.cover, sizes: "256x256", type: "image/jpeg" },
        { src: song.cover, sizes: "512x512", type: "image/jpeg" }
      ]
    });

    // 2. 绑定动作
    const actions = [
      ['play', () => { audio.play(); playPauseBtn.textContent = "⏸"; }],
      ['pause', () => { audio.pause(); playPauseBtn.textContent = "▶"; }],
      ['previoustrack', () => { 
          currentSong = (currentSong - 1 + songs.length) % songs.length; 
          updateSong(); 
      }],
      ['nexttrack', () => { 
          currentSong = (currentSong + 1) % songs.length; 
          updateSong(); 
      }],
      ['seekto', (details) => {
          if (details.fastSeek && 'fastSeek' in audio) {
            audio.fastSeek(details.seekTime);
            return;
          }
          audio.currentTime = details.seekTime;
          updatePositionState(); 
      }],
    ];

    for (const [action, handler] of actions) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (error) {
        // 部分浏览器可能不支持某些 action
      }
    }
  }

  // 更新进度条状态
  function updatePositionState() {
    if ('setPositionState' in navigator.mediaSession && !isNaN(audio.duration)) {
      navigator.mediaSession.setPositionState({
        duration: audio.duration,
        playbackRate: audio.playbackRate,
        position: audio.currentTime
      });
    }
  }

  // 同步锁屏状态
  audio.addEventListener("play", () => {
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
    updatePositionState();
  });
  audio.addEventListener("pause", () => {
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
    updatePositionState();
  });
  audio.addEventListener('loadedmetadata', updatePositionState);


  /* ======== 播放列表交互 ======== */
  playlist.addEventListener("click", e => {
    const item = e.target.closest(".playlist-item");
    if (item) {
      currentSong = parseInt(item.dataset.index);
      updateSong();
    }
  });

  // 打开/关闭列表函数
  function openPlaylist() {
    playlist.classList.remove("hide");
    playlist.classList.add("show");
    playlist.setAttribute('aria-hidden', 'false');
  }
  function closePlaylist() {
    playlist.classList.remove("show");
    playlist.classList.add("hide");
    playlist.setAttribute('aria-hidden', 'true');
  }

  // 点击标题切换列表
  titleEl.addEventListener("click", e => {
    e.stopPropagation();
    playlist.classList.contains("show") ? closePlaylist() : openPlaylist();
  });

  // 点击外部关闭列表
  document.addEventListener("click", e => {
    if (!playlist.contains(e.target) && e.target !== titleEl) {
      if (playlist.classList.contains("show")) closePlaylist();
    }
  });

  /* ======== 自动隐藏播放器 (30秒无操作) ======== */
  let inactivityTimer;
  function hidePlayerUI() {
    // 隐藏逻辑：透明度降为0，下移
    player.style.opacity = '0';
    player.style.transform = 'translate(-50%, 40px)';
    player.style.pointerEvents = 'none';
    if (playlist.classList.contains("show")) closePlaylist();
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

  // 监听用户活动
  ['scroll','mousemove','mousedown','touchstart','keydown'].forEach(evt =>
    window.addEventListener(evt, showPlayerUI)
  );

  // 初始化
  resetTimer();
  renderPlaylist();
  updateSong();
});
