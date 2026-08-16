/**
 * KOMRON — SUNNAT TO‘YI BESPOKE LUXURY DIGITAL INVITATION
 * Core JavaScript Logic: Particles, Cover Opening, Audio, Countdown, Calendar, RSVP, VIP Modal & Confetti
 */

// Always force scroll restoration to manual and reset to top on load/refresh
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;

window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
});

window.addEventListener('load', () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
});

document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);
    initGoldParticles();
    initIntroScreen();
    initAmbientAudio();
    initCountdown();
    initCalendarActions();
    initCopyAddress();
    initPhoneMask();
    initRsvpForm();
    initScrollObserver();
    initBackToTop();
});

/* --------------------------------------------------------------------------
   01. FLOATING GOLD DUST PARTICLES (CANVAS)
   -------------------------------------------------------------------------- */
function initGoldParticles() {
    const canvas = document.getElementById('gold-particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particleCount = Math.min(35, Math.floor(width / 30));
    const particles = [];
    let animationFrame = 0;
    let lastTime = performance.now();

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.5 + 0.5,
            speedY: Math.random() * 0.3 + 0.1,
            speedX: (Math.random() - 0.5) * 0.2,
            alpha: Math.random() * 0.5 + 0.2,
            twinkleSpeed: Math.random() * 0.02 + 0.005
        });
    }

    function render() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            
            p.y -= p.speedY;
            p.x += p.speedX;
            p.alpha += Math.sin(Date.now() * p.twinkleSpeed) * 0.01;
            const currentAlpha = Math.max(0.1, Math.min(0.65, p.alpha));

            if (p.y < -10) {
                p.y = height + 10;
                p.x = Math.random() * width;
            }
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 169, 126, ${currentAlpha})`;
            ctx.fill();
        }

        animationFrame = requestAnimationFrame(render);
    }

    function resumeParticles() {
        if (!document.hidden && !animationFrame) {
            lastTime = performance.now();
            animationFrame = requestAnimationFrame(render);
        }
    }

    document.addEventListener('visibilitychange', resumeParticles, { passive: true });
    resumeParticles();
}

/* --------------------------------------------------------------------------
   02. CINEMATIC OPENING ARCH COVER SCREEN
   -------------------------------------------------------------------------- */
function initIntroScreen() {
    const introOverlay = document.getElementById('intro-overlay');
    const btnOpen = document.getElementById('btn-open-invitation');

    if (!introOverlay || !btnOpen) return;

    let isOpening = false;

    function openInvitation(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (isOpening || introOverlay.classList.contains('is-dismissed')) return;
        isOpening = true;

        // Keep the page at the very top while the cover closes.
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        introOverlay.classList.add('is-dismissed');
        document.body.classList.remove('is-intro-active');

        const firstScene = document.getElementById('taklif-section');
        if (firstScene) firstScene.classList.add('scene-in-view');

        // Audio must never be able to block the opening animation.
        try {
            if (typeof window.playAmbientAudio === 'function') {
                window.playAmbientAudio();
            }
        } catch (error) {
            console.warn('Ambient audio could not start:', error);
        }

        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        });

        window.setTimeout(() => {
            introOverlay.setAttribute('hidden', '');
            isOpening = false;
        }, 1200);
    }

    // Direct click + pointer fallback for desktop/mobile browsers.
    btnOpen.addEventListener('click', openInvitation);
    btnOpen.addEventListener('pointerup', (e) => {
        if (e.pointerType !== 'mouse') openInvitation(e);
    }, { passive: false });

    // Extra delegation fallback: works even if another layer accidentally
    // captures the button event.
    introOverlay.addEventListener('click', (e) => {
        if (e.target.closest('#btn-open-invitation')) {
            openInvitation(e);
        }
    });

    // Subtle luxury desktop parallax.
    if (window.matchMedia('(pointer: fine)').matches) {
        const portalBg = introOverlay.querySelector('.portal-bg-img');
        const lanterns = introOverlay.querySelectorAll('.hanging-lantern');
        const composition = introOverlay.querySelector('.cover-center-composition');

        let parallaxFrame = 0;
        let mouseX = 0;
        let mouseY = 0;

        introOverlay.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (parallaxFrame) return;
            parallaxFrame = requestAnimationFrame(() => {
                parallaxFrame = 0;

                const xNorm = (mouseX / window.innerWidth - 0.5) * 2;
                const yNorm = (mouseY / window.innerHeight - 0.5) * 2;

                if (portalBg) portalBg.style.transform = `translate3d(${xNorm * 2}px, ${yNorm * 2}px, 0)`;
                lanterns.forEach(l => l.style.transform = `translate3d(${xNorm * 4}px, ${yNorm * 3}px, 0)`);
                if (composition) composition.style.transform = `translate3d(${xNorm * 1.5}px, ${yNorm * 1.5}px, 0)`;
            });
        }, { passive: true });
    }
}

/* --------------------------------------------------------------------------
   03. PROCEDURAL ORIENTAL AMBIENT AUDIO SYNTHESIZER
   -------------------------------------------------------------------------- */
function initAmbientAudio() {
    const audioBtn = document.getElementById('btn-audio-toggle');
    const audio = document.getElementById('wedding-music');

    if (!audioBtn || !audio) return;

    let isPlaying = false;
    audio.volume = 0.30;

    window.playAmbientAudio = async function () {
        try {
            await audio.play();
            isPlaying = true;
            audioBtn.classList.add('is-playing');
            audioBtn.setAttribute('aria-pressed', 'true');
        } catch (error) {
            console.warn('Music could not start:', error);
        }
    };

    window.pauseAmbientAudio = function () {
        audio.pause();
        isPlaying = false;
        audioBtn.classList.remove('is-playing');
        audioBtn.setAttribute('aria-pressed', 'false');
    };

    audioBtn.addEventListener('click', async () => {
        if (isPlaying) {
            window.pauseAmbientAudio();
        } else {
            await window.playAmbientAudio();
        }
    });
}

/* --------------------------------------------------------------------------
   04. COUNTDOWN TIMER (8-SENTYABR 2026, 07:00 / 08:00)
   -------------------------------------------------------------------------- */
function initCountdown() {
    const daysEl = document.getElementById('countdown-days');
    const hoursEl = document.getElementById('countdown-hours');
    const minutesEl = document.getElementById('countdown-minutes');
    const secondsEl = document.getElementById('countdown-seconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    // Target Event Date: September 8, 2026 07:00:00 (Tashkent Time UTC+5)
    const targetDate = new Date('2026-09-08T07:00:00+05:00').getTime();

    let countdownInterval;

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            clearInterval(countdownInterval);
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

/* --------------------------------------------------------------------------
   05. CALENDAR ACTIONS
   -------------------------------------------------------------------------- */
function initCalendarActions() {
    const calendarBtn = document.getElementById('add-calendar-btn');
    if (!calendarBtn) return;

    calendarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const title = "Komronning Sunnat To‘yi";
        const description = "Azizlar! Sizlarni farzandimiz Komronning Sunnat to‘yi tantanasiga lutfan taklif etamiz! Oq saroy to‘yxonasi, Gurumsaray, Namangan.";
        const location = "Oq saroy to‘yxonasi, Gurumsaray, Namangan";
        const startDate = "20260908T020000Z";
        const endDate = "20260908T180000Z";

        const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
        
        window.open(googleCalUrl, '_blank');
        showToast("Tadbir taqvimingizga qo‘shilmoqda... 📅");
    });
}

/* --------------------------------------------------------------------------
   07. COPY ADDRESS WITH TOAST
   -------------------------------------------------------------------------- */
function initCopyAddress() {
    const copyBtn = document.getElementById('copy-address-btn');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const addressText = "Oq saroy to‘yxonasi, Gurumsaray, Namangan";

        if (navigator.clipboard) {
            navigator.clipboard.writeText(addressText).then(() => {
                showToast("Manzil nusxalandi! 📋");
            }).catch(() => {
                fallbackCopy(addressText);
            });
        } else {
            fallbackCopy(addressText);
        }
    });

    function fallbackCopy(text) {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try {
            document.execCommand('copy');
            showToast("Manzil nusxalandi! 📋");
        } catch (err) {
            showToast("Nusxa olish imkoni bo‘lmadi");
        }
        document.body.removeChild(ta);
    }
}

/* --------------------------------------------------------------------------
   08. TOAST NOTIFICATION UTILITY
   -------------------------------------------------------------------------- */
function showToast(message) {
    let toast = document.getElementById('global-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'global-toast';
        toast.className = 'toast-msg';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}

/* --------------------------------------------------------------------------
   09. PHONE NUMBER AUTO-MASK (+998)
   -------------------------------------------------------------------------- */
function initPhoneMask() {
    const phoneInput = document.getElementById('rsvp-phone');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', (e) => {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})/);
        if (!x[2]) {
            e.target.value = x[1] ? `+${x[1]}` : '+998';
        } else {
            e.target.value = `+998 (${x[2]}` + (x[3] ? `) ${x[3]}` : '') + (x[4] ? `-${x[4]}` : '') + (x[5] ? `-${x[5]}` : '');
        }
    });

    phoneInput.addEventListener('focus', () => {
        if (!phoneInput.value.trim()) {
            phoneInput.value = '+998 ';
        }
    });
}

/* --------------------------------------------------------------------------
   10. RSVP FORM SUBMISSION, VIP MODAL & TELEGRAM SHARING
   -------------------------------------------------------------------------- */
function initRsvpForm() {
    const rsvpForm = document.getElementById('rsvp-form');
    const vipModal = document.getElementById('vip-modal');
    const vipCloseBtn = document.getElementById('vip-modal-close');
    const vipGuestNameEl = document.getElementById('vip-card-name');
    const vipStatusEl = document.getElementById('vip-card-status');
    const vipTelegramBtn = document.getElementById('vip-telegram-btn');
    const phoneInput = document.getElementById('rsvp-phone');

    // Restore saved RSVP if exists
    const savedRsvp = localStorage.getItem('sunnat_rsvp_komron');
    if (savedRsvp) {
        try {
            const data = JSON.parse(savedRsvp);
            const nameInput = document.getElementById('rsvp-name');
            if (nameInput) nameInput.value = data.name || '';
            if (phoneInput) phoneInput.value = data.phone || '';
        } catch (e) {}
    }

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('rsvp-name').value.trim();
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const attendance = document.querySelector('input[name="attendance"]:checked')?.value || 'Boraman';
            const guestCount = document.querySelector('input[name="guest_count"]:checked')?.value || '1';
            const wishes = document.getElementById('rsvp-wishes')?.value.trim() || '';

            if (!name) {
                showToast("Iltimos, ismingizni kiriting ✍️");
                return;
            }

            // Save to localStorage
            const rsvpData = { name, phone, attendance, guestCount, wishes, timestamp: new Date().toISOString() };
            localStorage.setItem('sunnat_rsvp_komron', JSON.stringify(rsvpData));

            // Launch Confetti
            launchGoldenConfetti();

            // Show VIP Modal
            if (vipModal && vipGuestNameEl && vipStatusEl) {
                vipGuestNameEl.textContent = name;
                vipStatusEl.innerHTML = attendance === 'Boraman' 
                    ? `✨ Tashrifingiz tasdiqlandi (${guestCount} kishi)`
                    : `🕊️ Hurmat bilan qabul qilindi`;

                // Setup Telegram Share
                if (vipTelegramBtn) {
                    const liveUrl = window.location.href;
                    const text = encodeURIComponent(
                        `🌟 SUNNAT TO‘YI TAKLIFNOMASI — KOMRON\n\n` +
                        `👤 Mehmon: ${name}\n` +
                        `📞 Telefon: ${phone}\n` +
                        `✅ Tashrif: ${attendance === 'Boraman' ? "Albatta boramiz (" + guestCount + " kishi)" : "Afsuski, bora olmaymiz"}\n` +
                        (wishes ? `💌 Ezgu tilaklar: ${wishes}\n` : '') +
                        `\n📍 Manzil: Oq saroy to‘yxonasi, Gurumsaray, Namangan • 8-Sentabr, 2026\n` +
                        `✨ Katta rahmat!`
                    );
                    vipTelegramBtn.href = `https://t.me/share/url?url=${encodeURIComponent(liveUrl)}&text=${text}`;
                }

                vipModal.removeAttribute('hidden');
                requestAnimationFrame(() => {
                    vipModal.classList.add('active');
                });
                document.body.style.overflow = 'hidden';
            }

            showToast("Tashakkur! Tashrifingiz tasdiqlandi ✨");
        });
    }

    if (vipCloseBtn && vipModal) {
        vipCloseBtn.addEventListener('click', () => {
            vipModal.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                if (!vipModal.classList.contains('active')) {
                    vipModal.setAttribute('hidden', '');
                }
            }, 400);
        });
    }
}

/* --------------------------------------------------------------------------
   11. GOLDEN CONFETTI GENERATOR
   -------------------------------------------------------------------------- */
function launchGoldenConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#C8A97E', '#FFDC8A', '#F5EEDC', '#9D7D43', '#7A5826', '#FFFFFF'];
    const particleCount = 75;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 160,
            y: canvas.height / 2,
            w: Math.random() * 8 + 4,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 14,
            vy: (Math.random() - 1.2) * 16,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            opacity: 1,
            gravity: 0.35
        });
    }

    let animationFrame;
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let aliveCount = 0;

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rotation += p.rotationSpeed;
            p.opacity -= 0.009;

            if (p.opacity > 0 && p.y < canvas.height + 50) {
                aliveCount++;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = Math.max(0, p.opacity);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            }
        });

        if (aliveCount > 0) {
            animationFrame = requestAnimationFrame(render);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cancelAnimationFrame(animationFrame);
        }
    }

    render();
}

/* --------------------------------------------------------------------------
   12. SCENE SCROLL OBSERVER
   -------------------------------------------------------------------------- */
function initScrollObserver() {
    const scenes = document.querySelectorAll('.scene');
    if (!scenes.length) return;

    if (!('IntersectionObserver' in window)) {
        scenes.forEach((sc) => sc.classList.add('scene-in-view'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scene-in-view');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px 100px 0px'
    });

    scenes.forEach((sc) => observer.observe(sc));
}

/* --------------------------------------------------------------------------
   13. BACK TO TOP
   -------------------------------------------------------------------------- */
function initBackToTop() {
    const btnToTop = document.getElementById('btn-to-top');
    if (!btnToTop) return;

    btnToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
