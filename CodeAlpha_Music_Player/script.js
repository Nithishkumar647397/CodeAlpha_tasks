// SUNAssist Aurora Player - Modern JS Music Player
(function () {
    "use strict";

    // ===== PLAYLIST DATA =====
    // Make sure files in /audio and /covers match these names
    const playlists = {
        // LOVE playlist
        love: [
            {
                title: "Kanmoodi Thirakumbothu",
                artist: "Sachien • Devi Sri Prasad",
                album: "Love Classics",
                year: "2005",
                src: "audio/kanmoodi.mp3",
                cover: "covers/kanmoodi.png",
            },
            {
                title: "Eppadi Vandhaayo",
                artist: "Aaromaley",
                album: "Love Vibes",
                year: "2025",
                src: "audio/eppadi.mp3",
                cover: "covers/eppadi.png",
            },
            {
                title: "Melliname",
                artist: "Harish",
                album: " One Side Love Vibes",
                year: "2001",
                src: "audio/yaro_en.mp3",
                cover: "covers/image.png", // note the space in filename
            },
        ],

        // VIBE playlist
        vibe: [
            {
                title: "Ravana Mavane",
                artist: "Vijay Vibe",
                album: "Mass Vibe",
                year: "2024",
                src: "audio/ravana_mavane.mp3",
                cover: "covers/ravana_mavane.png",
            },
            {
                title: "Oru Per Varalaru",
                artist: "Vijay Vibe",
                album: "Mass Vibe",
                year: "2024",
                src: "audio/oru_per_varalaru.mp3",
                cover: "covers/oru_per_varalaru.png",
            },
        ],

        // DRIVE / Motivation
        drive: [
            {
                title: "Vidamuyarchi",
                artist: "Ajith • Motivation",
                album: "Drive Mode",
                year: "2024",
                src: "audio/vidamuyarchi.mp3",
                cover: "covers/vidamuyarchi.png",
            },
        ],
    };

    let activeListKey = "love";
    let currentIndex = 0;
    let isPlaying = false;
    let isSeeking = false;

    // ===== DOM ELEMENTS =====
    const audio = document.getElementById("audio");
    const coverImage = document.getElementById("coverImage");

    const titleEl = document.getElementById("trackTitle");
    const artistEl = document.getElementById("trackArtist");
    const albumEl = document.getElementById("trackAlbum");
    const playlistNameEl = document.getElementById("playlistName");
    const indexLabelEl = document.getElementById("trackIndexLabel");
    const statusTextEl = document.getElementById("statusText");

    const progressBar = document.getElementById("progressBar");
    const progressFill = document.getElementById("progressFill");
    const currentTimeEl = document.getElementById("currentTime");
    const durationEl = document.getElementById("duration");

    const playPauseBtn = document.getElementById("playPauseBtn");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    const volumeSlider = document.getElementById("volumeSlider");
    const volIcon = document.getElementById("volIcon");

    const autoplayToggle = document.getElementById("autoplayToggle");
    const playlistEl = document.getElementById("playlist");
    const playlistTabs = document.querySelectorAll(".playlist-tab");

    // ===== HELPERS =====
    function getActivePlaylist() {
        return playlists[activeListKey] || [];
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ===== LOAD TRACK =====
    function loadTrack(index) {
        const list = getActivePlaylist();
        const track = list[index];
        if (!track) return;

        currentIndex = index;

        audio.src = track.src;
        coverImage.src = track.cover;

        titleEl.textContent = track.title;
        artistEl.textContent = track.artist;
        albumEl.textContent = `${track.album} • ${track.year}`;

        playlistNameEl.textContent = capitalize(activeListKey);
        indexLabelEl.textContent = `${index + 1} / ${list.length}`;

        progressBar.value = 0;
        progressFill.style.width = "0%";
        currentTimeEl.textContent = "0:00";
        durationEl.textContent = "0:00";
        statusTextEl.textContent = "Ready";

        updatePlaylistActive();
    }

    // ===== PLAY / PAUSE =====
    function playTrack() {
        if (!audio.src) return;
        audio.play().catch((err) => {
            console.error("Audio play error:", err);
        });
        isPlaying = true;
        playPauseBtn.textContent = "⏸";
        playPauseBtn.title = "Pause";
        statusTextEl.textContent = "Playing";
    }

    function pauseTrack() {
        audio.pause();
        isPlaying = false;
        playPauseBtn.textContent = "▶";
        playPauseBtn.title = "Play";
        statusTextEl.textContent = "Paused";
    }

    function togglePlayPause() {
        if (isPlaying) pauseTrack();
        else playTrack();
    }

    // ===== NEXT / PREVIOUS =====
    function nextTrack() {
        const list = getActivePlaylist();
        if (list.length === 0) return;
        currentIndex = (currentIndex + 1) % list.length;
        loadTrack(currentIndex);
        if (isPlaying || autoplayToggle.checked) playTrack();
    }

    function prevTrack() {
        const list = getActivePlaylist();
        if (list.length === 0) return;
        currentIndex = (currentIndex - 1 + list.length) % list.length;
        loadTrack(currentIndex);
        if (isPlaying || autoplayToggle.checked) playTrack();
    }

    // ===== TIME / PROGRESS =====
    function formatTime(sec) {
        if (!sec || isNaN(sec)) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60)
            .toString()
            .padStart(2, "0");
        return `${m}:${s}`;
    }

    function updateProgress() {
        if (!audio.duration || isSeeking) return;
        const percent = (audio.currentTime / audio.duration) * 100;
        progressBar.value = percent;
        progressFill.style.width = `${percent}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        durationEl.textContent = formatTime(audio.duration);
    }

    function seekFromRange() {
        if (!audio.duration) return;
        const value = progressBar.value;
        const seekTime = (value / 100) * audio.duration;
        audio.currentTime = seekTime;
        progressFill.style.width = `${value}%`;
    }

    // ===== VOLUME =====
    function setVolume() {
        const v = parseFloat(volumeSlider.value);
        audio.volume = v;
        if (v === 0) volIcon.textContent = "🔇";
        else if (v < 0.4) volIcon.textContent = "🔈";
        else if (v < 0.8) volIcon.textContent = "🔉";
        else volIcon.textContent = "🔊";
    }

    // ===== PLAYLIST RENDERING =====
    function renderPlaylist() {
        const list = getActivePlaylist();
        playlistEl.innerHTML = "";

        list.forEach((track, index) => {
            const li = document.createElement("li");
            li.className = "playlist-item";
            li.dataset.index = index;

            const titleDiv = document.createElement("div");
            titleDiv.className = "playlist-title";
            titleDiv.textContent = track.title;

            const artistDiv = document.createElement("div");
            artistDiv.className = "playlist-artist";
            artistDiv.textContent = track.artist;

            li.appendChild(titleDiv);
            li.appendChild(artistDiv);

            li.addEventListener("click", () => {
                loadTrack(index);
                playTrack();
            });

            playlistEl.appendChild(li);
        });

        updatePlaylistActive();
    }

    function updatePlaylistActive() {
        const items = playlistEl.querySelectorAll(".playlist-item");
        items.forEach((item) => {
            const idx = parseInt(item.dataset.index, 10);
            item.classList.toggle("active", idx === currentIndex);
        });
    }

    // ===== TABS =====
    playlistTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const listKey = tab.dataset.list;
            if (!listKey || !playlists[listKey]) return;

            playlistTabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");

            activeListKey = listKey;
            currentIndex = 0;
            renderPlaylist();
            loadTrack(0);
            if (isPlaying) playTrack();
        });
    });

    // ===== EVENT LISTENERS =====
    playPauseBtn.addEventListener("click", togglePlayPause);
    prevBtn.addEventListener("click", prevTrack);
    nextBtn.addEventListener("click", nextTrack);

    progressBar.addEventListener("input", () => {
        isSeeking = true;
    });

    progressBar.addEventListener("change", () => {
        seekFromRange();
        isSeeking = false;
    });

    volumeSlider.addEventListener("input", setVolume);

    audio.addEventListener("timeupdate", updateProgress);

    audio.addEventListener("loadedmetadata", () => {
        durationEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("ended", () => {
        if (autoplayToggle.checked) {
            nextTrack();
        } else {
            pauseTrack();
            audio.currentTime = 0;
            updateProgress();
        }
    });

    // Keyboard shortcuts
    window.addEventListener("keydown", (e) => {
        if (e.target.tagName === "INPUT") return;
        switch (e.key) {
            case " ":
                e.preventDefault();
                togglePlayPause();
                break;
            case "ArrowRight":
                nextTrack();
                break;
            case "ArrowLeft":
                prevTrack();
                break;
        }
    });

    // ===== INIT =====
    function init() {
        renderPlaylist();
        loadTrack(0);
        audio.volume = volumeSlider.value;
        setVolume();
        pauseTrack();
    }

    init();
})();