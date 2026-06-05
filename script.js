let currentSlide = 0;
let progressInterval;
let isPaused = false;

const slideTime = 5000;

let slides;
let indicators;
let progresses;
let carousel;

/* =========================
   SLIDES DATA
========================= */

const slidesData = [
    {
        type: "image",
        bg: "Photos/img-carousel.jpeg"
    },
    {
        type: "gallery",
        images: [
            "Photos/sadxarmama.jpeg",
            "Photos/gvirabi.jpeg",
            "Photos/neo.jpeg"
        ]
    },
    {
        type: "zona",
        images: [
            "Photos/z.jpeg",
            "Photos/o.jpeg",
            "Photos/n.jpeg",
            "Photos/a.jpeg"
        ]
    }
];

/* =========================
   BUILD SLIDES
========================= */

function buildSlides() {
    carousel = document.querySelector('.carousel');
    carousel.innerHTML = "";

    let finalSlides = [];

    if (window.innerWidth <= 1024) {
        finalSlides = [
            { type: "image", bg: slidesData[0].bg },
            { type: "image", bg: slidesData[1].images[0] },
            { type: "image", bg: slidesData[1].images[1] },
            { type: "image", bg: slidesData[1].images[2] },
            { type: "zona", images: slidesData[2].images }
        ];
    } else {
        finalSlides = slidesData;
    }

    finalSlides.forEach(slide => {
        const div = document.createElement("div");
        div.classList.add("slide");

        if (slide.type === "image") {
            div.style.backgroundImage = `url(${slide.bg})`;
        }

        if (slide.type === "gallery") {
            div.innerHTML = `
                <div class="gallery-images">
                    ${slide.images.map(img => `<img src="${img}">`).join("")}
                </div>
            `;
        }

        if (slide.type === "zona") {
            div.innerHTML = `
                <div class="flex-box">
                    ${slide.images.map(img => `<img src="${img}">`).join("")}
                </div>
            `;
        }

        carousel.appendChild(div);
    });

    initCarousel();
}

/* =========================
   INDICATORS
========================= */

function createIndicators() {
    const container = document.querySelector(".indicators");
    container.innerHTML = "";

    slides.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.classList.add("indicator");

        const progress = document.createElement("div");
        progress.classList.add("progress");

        dot.appendChild(progress);
        dot.onclick = () => goToSlide(i);
        container.appendChild(dot);
    });
}

/* =========================
   INIT
========================= */

function initCarousel() {
    slides = document.querySelectorAll('.slide');

    createIndicators();

    indicators = document.querySelectorAll('.indicator');
    progresses = document.querySelectorAll('.progress');

    currentSlide = 0;

    updateCarousel();
    startProgress();
}

/* =========================
   UPDATE SLIDES
========================= */

function updateCarousel(withTransition = true) {
    slides.forEach((slide, index) => {
        slide.style.transition = withTransition ? 'transform 0.5s ease' : 'none';
        slide.style.transform = `translateX(${(index - currentSlide) * 100}%)`;
    });

    indicators.forEach((ind, index) => {
        ind.classList.remove('active');
        progresses[index].style.width = "0%";

        if (index === currentSlide) {
            ind.classList.add('active');
        }
    });
}

/* =========================
   PROGRESS BAR (SINGLE SOURCE OF TRUTH)
========================= */

let startTime = 0;
let pausedTime = 0;

function startProgress() {
    clearInterval(progressInterval);

    // ვაფიქსირებთ დაწყების დროს პაუზის გათვალისწინებით
    startTime = Date.now() - pausedTime;

    progressInterval = setInterval(() => {
        if (isPaused) return;

        let elapsed = Date.now() - startTime;
        let percent = (elapsed / slideTime) * 100;

        if (percent > 100) percent = 100;

        if (progresses[currentSlide]) {
            progresses[currentSlide].style.width = percent + "%";
        }

        if (percent >= 100) {
            clearInterval(progressInterval);
            pausedTime = 0; // ახალი სლაიდისთვის პროგრესს ვანულებთ
            nextSlide();
        }
    }, 16);
}

/* =========================
   NAVIGATION
========================= */

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    pausedTime = 0;
    updateCarousel();
    startProgress();
}

function goToSlide(i) {
    currentSlide = i;
    pausedTime = 0;
    updateCarousel();
    startProgress();
}

/* =========================
   PAUSE / PLAY BUTTON
========================= */

document.querySelector('.prev').addEventListener('click', () => {
    isPaused = !isPaused;
    const btn = document.querySelector('.prev');

    if (isPaused) {
        // ვიმახსოვრებთ რამდენი მილიწამი იყო გასული დაპაუზებამდე
        pausedTime = Date.now() - startTime;
        clearInterval(progressInterval);
        btn.innerHTML = '<i class="fa-solid fa-play"></i>';
    } else {
        btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        startProgress(); // აგრძელებს იმავე წერტილიდან
    }
});

/* =========================
   DRAG (MOUSE & TOUCH)
========================= */

let startX = 0;
let isDragging = false;
let currentTranslate = 0;

function dragStart(x) {
    isDragging = true;
    startX = x;

    clearInterval(progressInterval);
    slides.forEach(s => s.style.transition = "none");
}

function dragMove(x) {
    if (!isDragging) return;

    currentTranslate = x - startX;

    slides.forEach((slide, i) => {
        slide.style.transform =
            `translateX(calc(${(i - currentSlide) * 100}% + ${currentTranslate}px))`;
    });
}

function dragEnd() {
    if (!isDragging) return;
    isDragging = false;

    if (currentTranslate < -100) currentSlide++;
    if (currentTranslate > 100) currentSlide--;

    if (currentSlide < 0) currentSlide = slides.length - 1;
    if (currentSlide >= slides.length) currentSlide = 0;

    pausedTime = 0; // გათრევის შემდეგ პროგრესი თავიდან იწყება
    updateCarousel(true);

    if (!isPaused) {
        startProgress();
    }
    currentTranslate = 0;
}

/* =========================
   EVENTS
========================= */

window.addEventListener("mousedown", e => dragStart(e.clientX));
window.addEventListener("mousemove", e => dragMove(e.clientX));
window.addEventListener("mouseup", dragEnd);

window.addEventListener("touchstart", e => dragStart(e.touches[0].clientX));
window.addEventListener("touchmove", e => dragMove(e.touches[0].clientX));
window.addEventListener("touchend", dragEnd);

window.addEventListener("resize", buildSlides);

/* =========================
   START
========================= */

buildSlides(); // ეს ფუნქცია შიგნიდან თავად უშვებს იზუალიზაციას და პროგრესს


/* =========================
   VIDEO CONTROLS
========================= */

const video = document.getElementById("bg-video");
const playPauseBtn = document.getElementById("playPauseBtn");
const muteBtn = document.getElementById("muteBtn");

if (playPauseBtn && video) {
    playPauseBtn.addEventListener("click", () => {
        if (video.paused) {
            video.play();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            video.pause();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    });
}

if (muteBtn && video) {
    muteBtn.addEventListener("click", () => {
        video.muted = !video.muted;
        if (video.muted) {
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        } else {
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        }
    });
}


/* =========================
   ROTATING IMAGE + CHANGE
========================= */

const rotatingImage = document.getElementById("rotatingImage");

const rotatingImages = [
    "Photos/icon.png",
    "Photos/icon1.png",
    "Photos/icon2.png",
    "Photos/icon3.png",
    "Photos/icon4.png",
    "Photos/icon5.png",
];

let currentImage = 0;

if (rotatingImage) {
    setInterval(() => {
        currentImage++;
        if (currentImage >= rotatingImages.length) {
            currentImage = 0;
        }

        rotatingImage.style.opacity = "0";

        setTimeout(() => {
            rotatingImage.src = rotatingImages[currentImage];
            rotatingImage.style.opacity = "1";
        }, 300);
    }, 3000);
}

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


/* LANGUAGE SWITCH */
const toggleBtns = document.querySelectorAll(".langToggle");

const translations = {
    en: {
        home: "home",
        gallery: "gallery",
        bio: "bio",
        contact: "contact",
        title: "Zona | Sector",
        subtitle: "A platform for young, independent artists",
        galleryTitle: "ZONA | Gallery",
        footer: "Our collective brings together directors, actors, composers, sound designers, and visual artists. ზონა handles projects of any scale, while also collaborating with private clients to deliver tailor-made production services based on their specific needs.",
        loaderText: "ZONA | SECTOR",
        langToggle: "EN"
    },
    ge: {
        home: "მთავარი",
        gallery: "გალერეა",
        bio: "ბიო",
        contact: "კონტაქტი",
        title: "ზონა | სექტორი",
        subtitle: "ახალგაზრდა დამოუკიდებელი არტისტების პლატფორმა",
        galleryTitle: "ზონა | გალერეა",
        footer: "ჩვენი კოლექტივი აერთიანებს რეჟისორებს, მსახიობებს, კომპოზიტორებს, ხმის დიზაინერებსა და ვიზუალურ არტისტებს. ზონა ახორციელებს ნებისმიერი მასშტაბის პროექტებს და ამავდროულად თანამშრომლობს კერძო კლიენტებთან, რათა მათ კონკრეტულ საჭიროებებსა და მოთხოვნებზე მორგებული საპროდაქშენო მომსახურება შესთავაზოს.",
        loaderText: "ზონა | სექტორი",
        langToggle: "ქა"
    }
};

let currentLang = localStorage.getItem("lang") || "en";

function updateText(lang) {
    // ტექსტების განახლება
    document.querySelectorAll("[data-key]").forEach(el => {
        const key = el.getAttribute("data-key");
        if (translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });

    // ენის ატრიბუტი და ლოკალური შენახვა
    document.documentElement.lang = lang === "ge" ? "ka" : "en";
    localStorage.setItem("lang", lang);

    // ღილაკების ტექსტის განახლება
    toggleBtns.forEach(btn => {
        btn.innerText = lang === "en" ? "EN" : "ქარ";
    });

    currentLang = lang;
}

// Event Listener-ების მიმაგრება ყველა ღილაკზე
toggleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const newLang = currentLang === "en" ? "ge" : "en";
        updateText(newLang);
    });
});

// საწყისი ჩატვირთვა
updateText(currentLang);