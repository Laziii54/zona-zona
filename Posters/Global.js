document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const loader = document.getElementById("loader");
        loader.classList.add("hidden");
        setTimeout(() => loader.remove(), 800);
    }, 2000);
    setTimeout(() => document.getElementById("heroBg").classList.add("loaded"), 100);
});

const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");
if (burger && mobileMenu) {
    burger.addEventListener("click", () => {
        burger.classList.toggle("open");
        mobileMenu.classList.toggle("open");
    });
    mobileMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            burger.classList.remove("open");
            mobileMenu.classList.remove("open");
        });
    });
}

const watchBtn = document.getElementById("watchBtn");
const filmModal = document.getElementById("filmModal");
const closeModal = document.getElementById("closeModal");
const ytFrame = document.getElementById("ytFrame");

const YOUTUBE_ID = "dQw4w9WgXcQ"; // replace with real Im Not Neo video ID

watchBtn.addEventListener("click", () => {
    ytFrame.src = `https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0`;
    filmModal.classList.add("open");
    document.body.style.overflow = "hidden";
});

function closeFilmModal() {
    filmModal.classList.remove("open");
    ytFrame.src = "";
    document.body.style.overflow = "";
}

closeModal.addEventListener("click", closeFilmModal);
filmModal.addEventListener("click", (e) => { if (e.target === filmModal) closeFilmModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeFilmModal(); });

// ==================== CUSTOM VIDEO PLAYER ====================
const vpWrap = document.getElementById("vpWrap");
const vpVideo = document.getElementById("vpVideo");
const vpOverlay = document.getElementById("vpOverlay");
const vpPlayBtn = document.getElementById("vpPlayBtn");
const vpPlayIcon = document.getElementById("vpPlayIcon");
const vpFill = document.getElementById("vpFill");
const vpProgress = document.getElementById("vpProgress");
const vpTime = document.getElementById("vpTime");
const vpMuteBtn = document.getElementById("vpMuteBtn");
const vpMuteIcon = document.getElementById("vpMuteIcon");
const vpFsBtn = document.getElementById("vpFsBtn");
const vpFsIcon = document.getElementById("vpFsIcon");

function fmtTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
}

function vpTogglePlay() {
    if (vpVideo.paused) {
        vpVideo.play();
        vpPlayIcon.className = "fa-solid fa-pause";
        vpOverlay.classList.remove("visible");
        vpWrap.classList.remove("paused");
    } else {
        vpVideo.pause();
        vpPlayIcon.className = "fa-solid fa-play";
        vpOverlay.classList.add("visible");
        vpWrap.classList.add("paused");
    }
}

vpPlayBtn.addEventListener("click", vpTogglePlay);
vpVideo.addEventListener("click", vpTogglePlay);

vpVideo.addEventListener("timeupdate", () => {
    if (!vpVideo.duration) return;
    const pct = (vpVideo.currentTime / vpVideo.duration) * 100;
    vpFill.style.width = pct + "%";
    vpTime.textContent = fmtTime(vpVideo.currentTime);
});

vpProgress.addEventListener("click", (e) => {
    const rect = vpProgress.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    vpVideo.currentTime = pct * vpVideo.duration;
});

// mute — starts muted, toggle unmute
vpVideo.muted = true;
vpMuteIcon.className = "fa-solid fa-volume-xmark";

vpMuteBtn.addEventListener("click", () => {
    vpVideo.muted = !vpVideo.muted;
    vpMuteIcon.className = vpVideo.muted
        ? "fa-solid fa-volume-xmark"
        : "fa-solid fa-volume-high";
});

// fullscreen
vpFsBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        vpWrap.requestFullscreen();
        vpFsIcon.className = "fa-solid fa-compress";
    } else {
        document.exitFullscreen();
        vpFsIcon.className = "fa-solid fa-expand";
    }
});

document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
        vpFsIcon.className = "fa-solid fa-expand";
    }
});

// ==================== LIGHTBOX ====================
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbClose = document.getElementById("lbClose");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");
const lbCounter = document.getElementById("lbCounter");
const stillImgs = Array.from(document.querySelectorAll(".stills-grid img"));
let lbIndex = 0;

function openLightbox(i) {
    lbIndex = i;
    lbImg.src = stillImgs[i].src;
    lbCounter.textContent = `${i + 1} / ${stillImgs.length}`;
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
}

function lbStep(dir) {
    lbIndex = (lbIndex + dir + stillImgs.length) % stillImgs.length;
    lbImg.style.opacity = "0";
    setTimeout(() => {
        lbImg.src = stillImgs[lbIndex].src;
        lbCounter.textContent = `${lbIndex + 1} / ${stillImgs.length}`;
        lbImg.style.opacity = "1";
    }, 150);
}

stillImgs.forEach((img, i) => {
    img.style.cursor = "pointer";
    img.addEventListener("click", () => openLightbox(i));
});

lbClose.addEventListener("click", closeLightbox);
lbPrev.addEventListener("click", () => lbStep(-1));
lbNext.addEventListener("click", () => lbStep(1));
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") lbStep(-1);
    if (e.key === "ArrowRight") lbStep(1);
});