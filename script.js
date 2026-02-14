(function() {
    'use strict';
    
    // DOM Elements
    const elements = {
        proposal: document.getElementById('proposalSection'),
        success: document.getElementById('successSection'),
        yesBtn: document.getElementById('yesBtn'),
        noBtn: document.getElementById('noBtn'),
        container: document.getElementById('container')
    };

    // Audio Context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Sound Functions
    const resumeAudio = async () => {
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
    };

    const playChime = async () => {
        await resumeAudio();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    };

    const playWhoosh = async () => {
        await resumeAudio();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    };

    // Haptic Feedback
    const vibrate = (duration = 50) => {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    };

    // State
    let heartInterval = null;
    let backgroundHeartInterval = null;
    let noIndex = 0;
    const noTexts = ["No 🙈", "Not yet!", "Maybe?", "Think again!"];

    // Utility Functions
    const createHeart = () => {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerHTML = ['❤️', '💕', '💖', '💗', '💓'][Math.floor(Math.random() * 5)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (Math.random() * 2 + 1.5) + 'rem';
        document.body.appendChild(heart);
        
        setTimeout(() => heart.remove(), 2900);
    };

    const startHeartShower = () => {
        if (heartInterval) clearInterval(heartInterval);
        for (let i = 0; i < 15; i++) {
            setTimeout(createHeart, i * 100);
        }
        heartInterval = setInterval(createHeart, 300);
    };

    const stopHeartShower = () => {
        if (heartInterval) {
            clearInterval(heartInterval);
            heartInterval = null;
        }
    };

    const showSuccess = () => {
        // Switch views
        elements.proposal.style.display = 'none';
        elements.success.style.display = 'block';
        
        // Stop background hearts
        if (backgroundHeartInterval) {
            clearInterval(backgroundHeartInterval);
            backgroundHeartInterval = null;
        }
        
        // Celebration effects
        startHeartShower();
        
        // Add bounce animation to container
        elements.container.style.animation = 'slideUp 0.5s';
        
        // Confetti effect (simulated with hearts)
        setTimeout(() => {
            for (let i = 0; i < 5; i++) {
                setTimeout(createHeart, i * 50);
            }
        }, 300);
    };

    const moveButton = (btn, intensity = 150) => {
        const maxX = intensity;
        const maxY = intensity;
        const randomX = - (Math.random() * maxX); // Always move left, away from yes button
        const randomY = (Math.random() * maxY * 2) - maxY;
        
        btn.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomX * 0.1}deg)`;
        btn.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    };

    const resetButtonPosition = (btn) => {
        btn.style.transform = 'translate(0, 0) rotate(0deg)';
        btn.style.transition = 'all 0.3s ease';
        elements.noBtn.textContent = "No 🙈";
        noIndex = 0;
    };

    // Event Handlers
    const handleNoButtonHover = (e) => {
        e.preventDefault();
        vibrate(50);
        playWhoosh();
        noIndex = (noIndex + 1) % noTexts.length;
        elements.noBtn.textContent = noTexts[noIndex];
        moveButton(elements.noBtn, 120);
    };

    const handleYesClick = () => {
        vibrate(100);
        playChime();
        confetti();
        showSuccess();
        resetButtonPosition(elements.noBtn);
    };

    const handleNoClick = (e) => {
        e.preventDefault();
        vibrate(50);
        playWhoosh();
        moveButton(elements.noBtn, 200);
        
        // Bonus: make yes button grow when no is clicked
        elements.yesBtn.style.transform = 'scale(1.1)';
        setTimeout(() => {
            elements.yesBtn.style.transform = 'scale(1)';
        }, 200);
    };

    const handleTouchMove = (e) => {
        if (e.target === elements.noBtn) {
            e.preventDefault();
            moveButton(elements.noBtn, 150);
        }
    };

    // Initialize Event Listeners
    const initEventListeners = () => {
        // Background hearts
        backgroundHeartInterval = setInterval(createHeart, 5000);
        
        // No button events
        elements.noBtn.addEventListener('mouseover', handleNoButtonHover);
        elements.noBtn.addEventListener('touchstart', handleNoButtonHover);
        elements.noBtn.addEventListener('click', handleNoClick);

        // Yes button event
        elements.yesBtn.addEventListener('click', handleYesClick);

        // Global touch prevention
        document.addEventListener('touchmove', handleTouchMove, { passive: false });

        // Reset no button position when mouse leaves container
        elements.container.addEventListener('mouseleave', () => {
            resetButtonPosition(elements.noBtn);
        });
    };

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        stopHeartShower();
    });

    // Start the magic
    initEventListeners();
            document.getElementById('loading').style.display = 'none';
})();