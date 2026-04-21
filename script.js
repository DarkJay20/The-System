// =========================================
// THE SYSTEM - CORE JAVASCRIPT
// =========================================

// --- AUDIO SYSTEM (Web Audio API) ---
const sfx = {
    ctx: null,
    
    init: function() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },
    
    playTone: function(freq, type, duration, vol = 0.05) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    complete: function() {
        this.init();
        this.playTone(880, 'square', 0.1, 0.05); 
        setTimeout(() => this.playTone(1760, 'square', 0.2, 0.05), 100); 
    },

    buy: function() {
        this.init();
        this.playTone(1200, 'sine', 0.1, 0.05);
        setTimeout(() => this.playTone(2000, 'triangle', 0.3, 0.05), 80);
    },

    levelUp: function() {
        this.init();
        const notes = [440, 554, 659, 880]; 
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 'square', 0.4, 0.08), i * 150);
        });
    },

    crit: function() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1500, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.4);
        
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    },

    claim: function() {
        this.init();
        const notes = [1046, 1318, 1567, 2093]; 
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 'sine', 0.3, 0.06), i * 80);
        });
    }
};

window.addEventListener('click', () => sfx.init(), { once: true });


// --- CINEMATIC CANVAS BACKGROUND SYSTEM ---
const canvasFx = {
    canvas: null,
    ctx: null,
    particles: [],
    theme: '',
    width: 0,
    height: 0,
    
    init: function() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'bg-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-3'; 
        this.canvas.style.pointerEvents = 'none';
        document.body.prepend(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.render();
    },
    
    resize: function() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.resetParticles();
    },
    
    setTheme: function(theme) {
        if (this.theme !== theme) {
            this.theme = theme;
            this.resetParticles();
        }
    },
    
    resetParticles: function() {
        this.particles = [];
        let count = 40; 
        
        if (this.theme === 'theme-cyberpunk') count = Math.floor(this.width / 25); 
        if (this.theme === 'theme-red' || this.theme === 'theme-green') count = 60; 
        
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle(i));
        }
    },
    
    createParticle: function(index) {
        if (this.theme === 'theme-cyberpunk') {
            return {
                x: index * 25,
                y: Math.random() * this.height - this.height,
                speed: 3 + Math.random() * 6,
                length: Math.random() * 80 + 40,
                char: String.fromCharCode(0x30A0 + Math.random() * 96) 
            };
        } else if (this.theme === 'theme-red' || this.theme === 'theme-green') {
            return {
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2.5 + 0.5,
                speedY: -(Math.random() * 1.5 + 0.5),
                speedX: (Math.random() - 0.5) * 1.5,
                opacity: Math.random() * 0.8 + 0.2
            };
        } else {
            return {
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.4 + 0.1
            };
        }
    },
    
    render: function() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        const style = getComputedStyle(document.body);
        const primaryColor = style.getPropertyValue('--primary').trim() || '#00f0ff';
        
        this.particles.forEach((p, index) => {
            if (this.theme === 'theme-cyberpunk') {
                this.ctx.fillStyle = primaryColor;
                this.ctx.font = '14px monospace';
                this.ctx.fillText(p.char, p.x, p.y); 
                
                const grad = this.ctx.createLinearGradient(p.x, p.y, p.x, p.y - p.length);
                grad.addColorStop(0, primaryColor);
                grad.addColorStop(1, 'transparent');
                this.ctx.fillStyle = grad;
                this.ctx.globalAlpha = 0.5;
                this.ctx.fillRect(p.x + 4, p.y - p.length, 2, p.length);
                this.ctx.globalAlpha = 1.0;
                
                if (Math.random() < 0.1) p.char = String.fromCharCode(0x30A0 + Math.random() * 96);
                
                p.y += p.speed;
                if (p.y - p.length > this.height) {
                    this.particles[index] = this.createParticle(index);
                    this.particles[index].y = 0;
                }
                
            } else if (this.theme === 'theme-red' || this.theme === 'theme-green') {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = primaryColor;
                this.ctx.globalAlpha = p.opacity;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = primaryColor;
                this.ctx.fill();
                this.ctx.globalAlpha = 1.0;
                this.ctx.shadowBlur = 0; 
                
                p.y += p.speedY;
                p.x += p.speedX;
                
                if (Math.random() < 0.02) p.speedX += (Math.random() - 0.5) * 0.5;
                
                if (p.y < -10) {
                    this.particles[index] = this.createParticle(index);
                    this.particles[index].y = this.height + 10;
                }
                
            } else {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = primaryColor;
                this.ctx.globalAlpha = p.opacity;
                this.ctx.fill();
                this.ctx.globalAlpha = 1.0;
                
                p.x += p.vx;
                p.y += p.vy;
                
                if (p.x < 0 || p.x > this.width) p.vx *= -1;
                if (p.y < 0 || p.y > this.height) p.vy *= -1;
            }
        });
        
        requestAnimationFrame(() => this.render());
    }
};

// --- DEFAULT CONFIGURATION ---
const DefaultSchedule = {
    2: { title: "PULL DAY (Back + Biceps)", exercises: [ { name: "Pull-ups / Assisted", sets: 4, reps: "Max Reps" }, { name: "One-Arm DB Row (12kg)", sets: 4, reps: "10-12" }, { name: "Band Lat Pulldown", sets: 3, reps: "12-15" }, { name: "DB Hammer Curls", sets: 3, reps: "10-12" }, { name: "Band Bicep Curls", sets: 3, reps: "15" }, { name: "Finisher: Dead Hang", sets: 3, reps: "Max Time" } ] },
    4: { title: "PUSH DAY (Shoulders + Triceps)", exercises: [ { name: "Push-Up Board (Chest/Tri)", sets: 4, reps: "12-15" }, { name: "DB Overhead Press", sets: 4, reps: "8-10" }, { name: "Band Lateral Raises", sets: 4, reps: "15" }, { name: "DB Upright Row", sets: 3, reps: "10-12" }, { name: "Tricep Dips", sets: 3, reps: "12-15" }, { name: "Band Tricep Pushdown", sets: 3, reps: "15-20" } ] },
    5: { title: "ARMS + WIDTH FOCUS", exercises: [ { name: "DB Lateral Raises", sets: 5, reps: "12-15" }, { name: "Band Face Pulls", sets: 4, reps: "15" }, { name: "DB Bicep Curls", sets: 4, reps: "10-12" }, { name: "Close-Grip Push-Ups", sets: 4, reps: "10-15" }, { name: "DB Concentration Curls", sets: 3, reps: "10/arm" }, { name: "Overhead Band Ext", sets: 3, reps: "15" } ] },
    6: { title: "BACK + STRENGTH", exercises: [ { name: "Pull-ups (Any Var)", sets: 5, reps: "Max" }, { name: "DB Romanian Deadlift", sets: 4, reps: "10-12" }, { name: "Band Rows", sets: 3, reps: "15" }, { name: "DB Shrugs", sets: 4, reps: "15" }, { name: "Push-Ups (Wide)", sets: 3, reps: "15" }, { name: "Dead Hang", sets: 3, reps: "Scap Pulls" } ] }
};

// --- GAME DATA ---
const GameData = {
    levels: [0, 500, 1500, 3500, 7500, 15000, 25000, 40000, 55000, 75000],
    ranks: ["Weak Vessel", "Initiate", "Trainee", "Fighter", "Shadow Soldier", "Elite", "Hunter", "Shadow Knight", "Commander", "Shadow Master"],
    
    sideQuestsPool: [
        { id: 'sq1', text: "Drink 3 Liters Water", exp: 10 }, { id: 'sq2', text: "Eat 140g Protein", exp: 20 },
        { id: 'sq3', text: "Sleep 7+ Hours", exp: 20 }, { id: 'sq4', text: "Stretch 10 Mins", exp: 10 },
        { id: 'sq5', text: "No Junk Food", exp: 15 }, { id: 'sq6', text: "Read 10 Pages", exp: 10 },
        { id: 'sq7', text: "Meditate 5 Mins", exp: 15 }, { id: 'sq8', text: "Hit 10k Steps", exp: 25 },
        { id: 'sq9', text: "Cold Exposure (Shower)", exp: 20 }, { id: 'sq10', text: "Zero Added Sugar Today", exp: 20 },
        { id: 'sq11', text: "Floss Teeth", exp: 5 }, { id: 'sq12', text: "Journal Thoughts", exp: 10 },
        { id: 'sq13', text: "Morning Sunlight (15m)", exp: 10 }, { id: 'sq14', text: "Cook a Healthy Meal", exp: 15 },
        { id: 'sq15', text: "Digital Detox (1hr prep)", exp: 15 }, { id: 'sq16', text: "Learn a New Concept", exp: 20 },
        { id: 'sq17', text: "Organize Workspace", exp: 15 }, { id: 'sq18', text: "No Liquid Calories", exp: 15 },
        { id: 'sq19', text: "Listen to Edu Podcast", exp: 10 }, { id: 'sq20', text: "Take Daily Vitamins", exp: 5 },
        { id: 'sq21', text: "Deep Breathwork (3m)", exp: 10 }
    ],

    achievements: [
        { id: 'a1', cat: 'PROGRESSION', name: "First Blood", desc: "Complete your first workout.", rarity: 'common', exp: 50, gold: 50, icon: 'fa-droplet', req: (s) => s.totalWorkouts >= 1 },
        { id: 'a2', cat: 'PROGRESSION', name: "Getting Warmed Up", desc: "Finish 3 workouts.", rarity: 'uncommon', exp: 100, gold: 100, icon: 'fa-fire', req: (s) => s.totalWorkouts >= 3 },
        { id: 'a3', cat: 'PROGRESSION', name: "No Turning Back", desc: "Reach Level 5.", rarity: 'rare', exp: 250, gold: 250, icon: 'fa-angles-up', req: (s) => s.level >= 5 },
        { id: 'a4', cat: 'PROGRESSION', name: "Rookie Hunter", desc: "Earn your first 1,000 EXP.", rarity: 'uncommon', exp: 150, gold: 100, icon: 'fa-star', req: (s) => s.exp >= 1000 },
        { id: 'a5', cat: 'PROGRESSION', name: "Gold Collector I", desc: "Accumulate 1,000 Gold overall.", rarity: 'rare', exp: 100, gold: 500, icon: 'fa-coins', req: (s) => s.milestones.totalGoldEarned >= 1000 },
        { id: 'a6', cat: 'STREAK', name: "Unbroken Will", desc: "Achieve a 3-day streak.", rarity: 'uncommon', exp: 150, gold: 100, icon: 'fa-link', req: (s) => s.maxStreak >= 3 },
        { id: 'a7', cat: 'STREAK', name: "Discipline > Motivation", desc: "Achieve a 7-day streak.", rarity: 'rare', exp: 300, gold: 200, icon: 'fa-calendar-check', req: (s) => s.maxStreak >= 7 },
        { id: 'a8', cat: 'STREAK', name: "Iron Routine", desc: "Achieve a 14-day streak.", rarity: 'epic', exp: 500, gold: 500, icon: 'fa-shield-halved', req: (s) => s.maxStreak >= 14 },
        { id: 'a9', cat: 'STREAK', name: "Shadow Discipline", desc: "Achieve a 30-day streak.", rarity: 'legendary', exp: 1500, gold: 1000, icon: 'fa-crown', req: (s) => s.maxStreak >= 30 },
        { id: 'a10', cat: 'STREAK', name: "Streak Guardian", desc: "Save a lost streak using an Elixir.", rarity: 'rare', exp: 200, gold: 100, icon: 'fa-flask', req: (s) => s.milestones.elixirsUsed >= 1 },
        { id: 'a11', cat: 'PERFORMANCE', name: "Beast Mode", desc: "Complete all exercises in a workout.", rarity: 'uncommon', exp: 100, gold: 100, icon: 'fa-dumbbell', req: (s) => s.milestones.fullClearWorkouts >= 1 },
        { id: 'a12', cat: 'PERFORMANCE', name: "Beyond Failure", desc: "Trigger the Pushed Past Failure bonus.", rarity: 'rare', exp: 200, gold: 150, icon: 'fa-skull', req: (s) => s.milestones.failurePushed >= 1 },
        { id: 'a13', cat: 'PERFORMANCE', name: "Perfect Form", desc: "Complete a workout with all 3 bonuses.", rarity: 'epic', exp: 400, gold: 300, icon: 'fa-check-double', req: (s) => s.milestones.hasPerfectRun },
        { id: 'a14', cat: 'PERFORMANCE', name: "Dungeon Conqueror", desc: "Finish 10 workouts.", rarity: 'rare', exp: 300, gold: 200, icon: 'fa-dungeon', req: (s) => s.totalWorkouts >= 10 },
        { id: 'a15', cat: 'PERFORMANCE', name: "Elite Hunter", desc: "Finish 50 workouts.", rarity: 'legendary', exp: 1000, gold: 1000, icon: 'fa-dragon', req: (s) => s.totalWorkouts >= 50 },
        { id: 'a16', cat: 'LIFESTYLE', name: "Balanced Life", desc: "Complete 5 side quests in a single day.", rarity: 'epic', exp: 400, gold: 200, icon: 'fa-scale-balanced', req: (s) => s.milestones.maxSideQuestsInDay >= 5 },
        { id: 'a17', cat: 'LIFESTYLE', name: "Mind & Body", desc: "Complete meditation & workout on the same day.", rarity: 'rare', exp: 250, gold: 150, icon: 'fa-yin-yang', req: (s) => s.milestones.mindAndBody },
        { id: 'a18', cat: 'LIFESTYLE', name: "Hydration King", desc: "Complete the Water quest 10 times.", rarity: 'uncommon', exp: 150, gold: 50, icon: 'fa-glass-water', req: (s) => (s.sqCounts['sq1'] || 0) >= 10 },
        { id: 'a19', cat: 'LIFESTYLE', name: "Scholar Mode", desc: "Complete the Learn Concept quest 10 times.", rarity: 'rare', exp: 300, gold: 100, icon: 'fa-book-open', req: (s) => (s.sqCounts['sq16'] || 0) >= 10 },
        { id: 'a20', cat: 'ECONOMY', name: "Big Spender", desc: "Spend 5,000 gold total.", rarity: 'epic', exp: 500, gold: 0, icon: 'fa-money-bill-wave', req: (s) => s.milestones.totalGoldSpent >= 5000 },
        { id: 'a21', cat: 'ECONOMY', name: "Collector", desc: "Own 5 different types of items.", rarity: 'rare', exp: 250, gold: 250, icon: 'fa-box-open', req: (s) => Object.values(s.inventory).filter(v => v > 0).length >= 5 },
        { id: 'a22', cat: 'ECONOMY', name: "Merchant Mindset", desc: "Buy your first passive item.", rarity: 'uncommon', exp: 100, gold: 100, icon: 'fa-ring', req: (s) => s.unlockedPassives.length >= 1 },
        { id: 'a23', cat: 'SPECIAL', name: "Shadow Monarch", desc: "Reach max rank (Level 10).", rarity: 'legendary', exp: 5000, gold: 5000, icon: 'fa-chess-king', req: (s) => s.level >= 10 },
        { id: 'a24', cat: 'SECRET', name: "System Glitch", desc: "Gain 0 EXP in a workout (Skipped).", rarity: 'epic', exp: 0, gold: 500, icon: 'fa-bug', hidden: true, req: (s) => s.milestones.hasZeroExpRun },
        { id: 'a25', cat: 'BONUS', name: "Hardcore Survivor", desc: "Complete a workout in Hard Mode.", rarity: 'rare', exp: 300, gold: 300, icon: 'fa-fire-flame-curved', req: (s) => s.milestones.hardcoreWorkouts >= 1 },
        { id: 'a26', cat: 'BONUS', name: "Lucky Spin", desc: "Win over 500g in a single Casino bet.", rarity: 'rare', exp: 100, gold: 500, icon: 'fa-dice-d20', req: (s) => s.milestones.casinoBigWin }
    ],

    shopItems: [
        { id: 'elixir', name: "Elixir of Life", desc: "Restore broken streak.", cost: 500, type: 'consumable', svg: `<img src="ElixirofLife.png" alt="Elixir of Life">` },
        { id: 'key', name: "Dungeon Key", desc: "Unlock Rest Day.", cost: 300, type: 'consumable', svg: `<img src="DungeonKey.png" alt="Dungeon Key">` },
        { id: 'stealth', name: "Stealth Stone", desc: "Prevent penalty.", cost: 400, type: 'consumable', svg: `<img src="StealthStone.png" alt="Stealth Stone">` },
        { id: 'xp_boost', name: "XP Booster", desc: "Double XP next workout.", cost: 300, type: 'consumable', svg: `<img src="XPBooster.png" alt="XP Booster">` },
        { id: 'wealth_pot', name: "Wealth Potion", desc: "Double Gold next workout.", cost: 300, type: 'consumable', svg: `<img src="WealthPotion.png" alt="Wealth Potion">` },
        { id: 'instant_clear', name: "Instant Clear", desc: "Auto-complete daily quest.", cost: 1000, type: 'consumable', svg: `<img src="InstantClear.png" alt="Instant Clear">` },
        
        { id: 'ring_greed', name: "Ring of Greed", desc: "+10% Gold (Passive).", cost: 5000, type: 'passive', svg: `<img src="RingofGreed.png" alt="Ring of Greed">` },
        { id: 'scouter', name: "Scouter Lens", desc: "Reveal Exact XP Numbers.", cost: 2000, type: 'passive', svg: `<img src="ScouterLens.png" alt="Scouter Lens">` },

        { id: 'theme_red', name: "Blood Red", desc: "Theme Visual", cost: 1000, type: 'theme', value: 'theme-red', svg: `<img src="BloodyRed.png" alt="Blood Red">` },
        { id: 'theme_green', name: "Toxic Green", desc: "Theme Visual", cost: 1000, type: 'theme', value: 'theme-green', svg: `<img src="ToxicGreen.png" alt="Toxic Green">` },
        { id: 'theme_purple', name: "Amethyst", desc: "Theme Visual", cost: 1000, type: 'theme', value: 'theme-purple', svg: `<img src="Amethyst.png" alt="Shadow Purple">` }
    ],

    themes: [ 
        { id: '', name: "Default Blue" }, 
        { id: 'theme-red', name: "Blood Red" }, 
        { id: 'theme-green', name: "Toxic Green" }, 
        { id: 'theme-purple', name: "Amethyst" }
    ]
};

// --- MAIN APPLICATION OBJECT ---
const app = {
    STORAGE_KEY: 'the_system_v13_data', 
    
    currentCasinoCard: 7, 
    casinoMode: 'cards',
    isSpinning: false,
    slotSymbols: ['💎', '🍒', '7️⃣', '🔔', '💀'],

    state: {
        name: "Player",
        bio: "",               
        startDate: null,       
        age: null,
        weight: null,
        height: null,
        hasCompletedOnboarding: false,
        level: 1,
        exp: 0,
        gold: 0, 
        rank: "Weak Vessel",
        stats: { str: 5, agi: 5, vit: 5, end: 5 },
        points: 0,
        lastLogin: null,
        questCompletedDate: null,
        completedSideQuests: [],
        activeSideQuests: [], 
        sqCounts: {},
        claimedAchievements: [],
        hardMode: false,
        streak: 0,
        maxStreak: 0, 
        lastStreakLost: 0, 
        restTimer: 180,
        activeEffects: { dungeonKey: false, stealthStone: false, xpBoost: false, goldBoost: false }, 
        theme: '', 
        unlockedThemes: [''],
        unlockedPassives: [], 
        inventory: { elixir: 0, key: 0, stealth: 0, xp_boost: 0, wealth_pot: 0, instant_clear: 0 }, 
        totalWorkouts: 0,
        history: {}, 
      milestones: { 
            totalGoldEarned: 0, totalGoldSpent: 0, elixirsUsed: 0, fullClearWorkouts: 0, 
            failurePushed: 0, hasPerfectRun: false, hasZeroExpRun: false, maxSideQuestsInDay: 0, 
            mindAndBody: false, hardcoreWorkouts: 0, casinoBigWin: false 
        },
        schedule: JSON.parse(JSON.stringify(DefaultSchedule))
    }, // <--- ADD THIS COMMA HERE

    updateRestTimer: function() {
        this.state.restTimer = parseInt(document.getElementById('setting-rest-timer').value) || 0;
        this.save();
        this.notify("TIMER PROTOCOL UPDATED.");
    },


    init: function() {
        console.log("System initializing...");
        try {
            this.load();
            this.updateVisualStats(); 
            canvasFx.init();
            this.applyTheme();
            this.checkDailyReset();
            this.save();
            this.renderStatus();
            this.renderSideQuests();
            
            setTimeout(() => { 
                this.removeLoader(); 
            }, 1500); 
        } catch (e) {
            console.error("CRITICAL ERROR IN INIT:", e);
            alert("System update applied. Data structure migrated.");
            this.hardReset();
        }
    },

    // --- PROFILE SYSTEM ---
    // --- PROFILE SYSTEM ---
    openProfile: function() {
        document.getElementById('profile-name-display').innerText = this.state.name;
        document.getElementById('profile-rank-display').innerText = this.state.rank;
        document.getElementById('profile-start-date').innerText = this.state.startDate || "UNKNOWN";
        document.getElementById('prof-age').value = this.state.age || '';
        document.getElementById('prof-weight').value = this.state.weight || '';
        document.getElementById('prof-height').value = this.state.height || '';
        document.getElementById('prof-bio').value = this.state.bio || '';
        
        // Populate Titles Dropdown
        const titleSelect = document.getElementById('prof-title-select');
        if (titleSelect) {
            titleSelect.innerHTML = '<option value="">-- No Title --</option>';
            this.state.claimedAchievements.forEach(id => {
                const ach = GameData.achievements.find(a => a.id === id);
                if(ach) {
                    const selected = (this.state.favoriteTitle === ach.name) ? 'selected' : '';
                    titleSelect.innerHTML += `<option value="${ach.name}" ${selected}>${ach.name}</option>`;
                }
            });
        }

        // Set Aesthetic Defaults
        if (document.getElementById('prof-bg-select')) {
            document.getElementById('prof-bg-select').value = this.state.licenseBg || 'bg-shadow';
        }

        this.updateLicensePreview(); // Instantly load data into the visual card
        
        document.getElementById('profile-modal').style.display = 'flex';
    },

    updateLicensePreview: function() {
        // Grab values from inputs
        const age = document.getElementById('prof-age').value;
        const weight = document.getElementById('prof-weight').value;
        const height = document.getElementById('prof-height').value;
        const bio = document.getElementById('prof-bio').value;
        const selectedTitle = document.getElementById('prof-title-select').value;
        const selectedBg = document.getElementById('prof-bg-select').value;

        // Update the visual card elements
        document.getElementById('lic-age').innerText = age ? age : '--';
        document.getElementById('lic-weight').innerText = weight ? weight : '--';
        document.getElementById('lic-height').innerText = height ? height : '--';
        document.getElementById('profile-title-display').innerText = selectedTitle || 'NO TITLE EQUIPPED';

        const card = document.getElementById('hunter-license-card');
        if (card) {
            card.className = `hunter-license ${selectedBg}`;
        }

        // SILENT AUTO-SAVE TO SYSTEM
        this.state.age = age;
        this.state.weight = weight;
        this.state.height = height;
        this.state.bio = bio;
        this.state.favoriteTitle = selectedTitle;
        this.state.licenseBg = selectedBg;
        
        this.save();
    },

    closeProfile: function() {
        document.getElementById('profile-modal').style.display = 'none';
    },
    // (Note: saveProfile function is completely removed because it auto-saves now)
    // --- ONBOARDING (FTUE) ---
    submitOnboarding: function() {
        const nameInput = document.getElementById('onboard-name');
        if (!nameInput) return;
        
        const name = nameInput.value.trim();
        const age = document.getElementById('onboard-age').value;
        const weight = document.getElementById('onboard-weight').value;
        const height = document.getElementById('onboard-height').value;

        if (!name || !age || !weight || !height) {
            this.notify("ALL FIELDS ARE REQUIRED.");
            return;
        }

        this.state.name = name;
        this.state.age = age;
        this.state.weight = weight;
        this.state.height = height;
        this.state.startDate = new Date().toDateString(); 
        
        this.save();
        this.renderStatus();
        sfx.buy(); 

        document.getElementById('onboarding-step-1').classList.add('hidden');
        document.getElementById('onboarding-step-2').classList.remove('hidden');
    },

    finishOnboarding: function() {
        // Hide the tutorial step
        document.getElementById('onboarding-modal').style.display = 'none';
        
        // Open the Mechanics Rules Modal
        const mechModal = document.getElementById('mechanics-modal');
        if(mechModal) {
            mechModal.style.display = 'flex';
            if(window.sfx) sfx.playTone(150, 'sawtooth', 0.6, 0.2); // Play a warning tone
        }
    },

    acknowledgeMechanics: function() {
        // Officially mark the player as onboarded
        this.state.hasCompletedOnboarding = true;
        this.save();
        
        // Hide the rules modal and trigger the level up sound to start the game!
        document.getElementById('mechanics-modal').style.display = 'none';
        sfx.levelUp(); 
    },

    removeLoader: function() {
        const loader = document.getElementById('loading-screen');
        if(loader) {
            loader.classList.add('fade-out');
            setTimeout(() => { 
                loader.style.display = 'none'; 
                
                if (!this.state.hasCompletedOnboarding) {
                    const onboardModal = document.getElementById('onboarding-modal');
                    if (onboardModal) onboardModal.style.display = 'flex';
                }
            }, 500);
        }
    },

    updateAchievementBadge: function() {
        let unclaimedCount = 0;
        GameData.achievements.forEach(a => {
            if (a.req(this.state) && !this.state.claimedAchievements.includes(a.id)) {
                unclaimedCount++;
            }
        });

        const badge = document.getElementById('achievements-badge');
        if (badge) {
            if (unclaimedCount > 0) {
                badge.innerText = unclaimedCount;
                badge.classList.add('active');
            } else {
                badge.classList.remove('active');
            }
        }
    },

    updateVisualStats: function() {
        const root = document.documentElement;
        let agiSpeed = Math.max(0.05, 0.35 - (this.state.stats.agi * 0.003));
        root.style.setProperty('--ui-transition', `${agiSpeed}s`);

        let vitGlow = Math.min(0.8, 0.1 + (this.state.stats.vit * 0.01));
        root.style.setProperty('--vit-glow', vitGlow);
        
        let strShake = Math.min(15, 2 + (this.state.stats.str * 0.15));
        root.style.setProperty('--str-shake', `${strShake}px`);
    },

   checkDailyReset: function() {
        const today = new Date().toDateString();
        
        if(this.state.lastLogin !== today) {
            // 1. Reset Side Quests
            const shuffled = [...GameData.sideQuestsPool].sort(() => 0.5 - Math.random());
            const questCount = Math.floor(Math.random() * 3) + 3; 
            this.state.activeSideQuests = shuffled.slice(0, questCount);
            this.state.completedSideQuests = [];
            
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            // 2. THE PUNISHMENT PROTOCOL (NOW WITH DE-LEVELING)
            if (this.state.lastLogin) {
                const lastDate = new Date(this.state.lastLogin);
                const currDate = new Date(today);
                
              const diffTime = Math.abs(currDate - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let missedDays = diffDays;
                
                if (this.state.questCompletedDate === this.state.lastLogin) {
                    missedDays = diffDays - 1;
                }

                // -> NEW RED GATE LOGIC <-
                if (!this.state.isBossActive) {
                    this.state.daysUntilBoss -= diffDays;
                    if (this.state.daysUntilBoss <= 0) {
                        this.state.isBossActive = true;
                        this.state.daysUntilBoss = 0;
                    }
                }
                
                if (missedDays > 0) {
                    let penalty = missedDays * 100;
                    let bossFailed = false;

                    // If they abandoned a Red Gate!
                    if (this.state.isBossActive) {
                        penalty += 100; // Extra 100 EXP
                        this.state.gold = Math.max(0, this.state.gold - 100);
                        bossFailed = true;
                        this.state.isBossActive = false; // Reset it after failure
                        this.state.daysUntilBoss = 15;
                    }

                    this.state.exp -= penalty;
                    if (this.state.exp < 0) this.state.exp = 0;
                    
                    let deLeveled = false;
                    let statsLost = 0;

                    while (this.state.level > 1 && this.state.exp < GameData.levels[this.state.level - 1]) {
                        this.state.level--;
                        deLeveled = true;
                        this.state.rank = GameData.ranks[this.state.level - 1] || "Weak Vessel";
                        
                        if (this.state.points > 0) {
                            this.state.points--; 
                        } else {
                            const upgradableStats = Object.keys(this.state.stats).filter(s => this.state.stats[s] > 5);
                            if (upgradableStats.length > 0) {
                                const randomStat = upgradableStats[Math.floor(Math.random() * upgradableStats.length)];
                                this.state.stats[randomStat]--;
                                statsLost++;
                            }
                        }
                    }

                    setTimeout(() => {
                        const pModal = document.getElementById('penalty-modal');
                        if (pModal) {
                            document.getElementById('penalty-days').innerText = missedDays;
                            
                            const amtDisplay = document.getElementById('penalty-amount');
                            let demoteTxt = "";
                            
                            if (bossFailed) demoteTxt += `<br><span style="font-size: 0.85rem; color: #ffaa00; display: block; margin-top: 10px; text-shadow: none; letter-spacing: 2px;">RED GATE FAILED (-100 GOLD)</span>`;
                            if (deLeveled) {
                                demoteTxt += `<br><span style="font-size: 0.85rem; color: #ff2a2a; display: block; margin-top: 5px; text-shadow: none; letter-spacing: 2px;">RANK DEMOTED TO LVL ${this.state.level}</span>`;
                                if (statsLost > 0) demoteTxt += `<span style="font-size: 0.75rem; color: #aaa; display: block; margin-top: 5px; text-shadow: none;">${statsLost} STAT POINTS PERMANENTLY LOST</span>`;
                            }
                            
                            amtDisplay.innerHTML = `${penalty}${demoteTxt}`;
                            pModal.style.display = 'flex';
                            if(window.sfx) sfx.playTone(150, 'sawtooth', 0.6, 0.2); 
                        }
                    }, 1800); 
                }
            }
            
            // 3. Streak Break Logic
            if (this.state.lastLogin !== yesterday.toDateString()) {
                if(this.state.streak > 0) {
                    this.state.lastStreakLost = this.state.streak; 
                    
                    if(this.state.activeEffects.stealthStone) {
                        this.notify("STEALTH STONE ACTIVATED. Streak preserved.");
                        this.state.activeEffects.stealthStone = false; 
                    } else {
                        if(this.state.hardMode) {
                            const yesterdayStr = yesterday.toDateString();
                            if(!this.state.history[yesterdayStr]) {
                                this.state.history[yesterdayStr] = 'PENALTY';
                            }
                        }
                        this.state.streak = 0; 
                    }
                }
            }
        }
        this.state.lastLogin = today;
    },

    notify: function(msg) {
        const area = document.getElementById('notification-area');
        if(!area) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = msg;
        area.appendChild(toast);
        
        setTimeout(() => { 
            toast.style.animation = 'fadeOut 0.3s forwards'; 
            setTimeout(() => { toast.remove(); }, 300); 
        }, 3000);
    },

    getNextLevelExp: function() {
        const baseReq = GameData.levels[this.state.level] || 999999;
        const vitBonus = Math.min(0.50, this.state.stats.vit * 0.02);
        const reduction = Math.floor(baseReq * vitBonus);
        return baseReq - reduction;
    },

    navigateTo: function(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');

       document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        
        if(screenId === 'status-screen') document.getElementById('nav-status')?.classList.add('active');
        if(screenId === 'shop-screen' || screenId === 'inventory-screen') { 
            document.getElementById('nav-shop')?.classList.add('active'); 
            if (screenId === 'shop-screen') this.renderShop(); 
        }
        if(screenId === 'achievements-screen') { 
            document.getElementById('nav-achievements')?.classList.add('active'); 
            this.renderAchievements(); 
        }
        if(screenId === 'rank-screen') { 
            document.getElementById('nav-rank')?.classList.add('active'); 
            this.renderRankTree(); 
            this.renderHeatmap(); 
        }
        if(screenId === 'settings-screen') { 
            document.getElementById('nav-settings')?.classList.add('active'); 
            this.renderSettings(); 
        }

        const nav = document.getElementById('main-nav');
        const header = document.getElementById('main-header');
        
        if(screenId === 'dungeon-screen') { 
            if(nav) nav.style.display = 'none'; 
            if(header) header.style.display = 'none'; 
        } else { 
            if(nav) nav.style.display = 'flex'; 
            if(header) header.style.display = 'flex'; 
        }
    },

    // --- ACHIEVEMENTS ---
    renderAchievements: function() {
        const list = document.getElementById('achievements-list');
        if(!list) return;
        list.innerHTML = '';
        
        GameData.achievements.forEach(a => {
            const isUnlocked = a.req(this.state);
            const isClaimed = this.state.claimedAchievements.includes(a.id);
            
            if (a.hidden && !isUnlocked && !isClaimed) return; 

            let cardClass = "locked";
            let actionHtml = `<i class="fa-solid fa-lock" style="color: #555; font-size: 1.5rem;"></i>`;
            
            if (isClaimed) {
                cardClass = "claimed";
                actionHtml = `<div class="claimed-stamp"><i class="fa-solid fa-check-circle"></i> COMPLETED</div>`;
            } else if (isUnlocked) {
                cardClass = "unclaimed";
                actionHtml = `<button class="claim-btn" onclick="app.claimAchievement('${a.id}')">CLAIM</button>`;
            }

            let rarityVar = `var(--rarity-${a.rarity})`;
            let rarityDimVar = `rgba(${this.hexToRgb(this.getRarityHex(a.rarity))}, 0.3)`;

            list.innerHTML += `
                <div class="achieve-card ${cardClass}" style="--card-rarity: ${rarityVar}; --card-rarity-dim: ${rarityDimVar};">
                    <div class="badge-container">
                        <svg viewBox="0 0 100 100" class="badge-svg">
                            <polygon points="50,5 93,25 93,75 50,95 7,75 7,25" class="badge-bg" />
                        </svg>
                        <i class="fa-solid ${a.icon} badge-icon"></i>
                    </div>
                    <div class="achieve-info">
                        <div class="achieve-title">${a.name} <span class="achieve-cat">${a.cat}</span></div>
                        <div class="achieve-desc">${a.desc}</div>
                        <div class="achieve-rewards">
                            ${a.exp > 0 ? `<span class="reward-exp">+${a.exp} XP</span>` : ''}
                            ${a.gold > 0 ? `<span class="reward-gold">+${a.gold} GOLD</span>` : ''}
                        </div>
                    </div>
                    <div class="achieve-action">
                        ${actionHtml}
                    </div>
                </div>
            `;
        });
    },

    claimAchievement: function(id) {
        const achievement = GameData.achievements.find(a => a.id === id);
        if (achievement && !this.state.claimedAchievements.includes(id)) {
            this.state.claimedAchievements.push(id);
            if(achievement.exp > 0) this.addExp(achievement.exp);
            if(achievement.gold > 0) {
                this.state.gold += achievement.gold;
                this.state.milestones.totalGoldEarned += achievement.gold;
                this.updateGoldUI();
            }
            sfx.claim(); 
            this.notify(`REWARD CLAIMED: ${achievement.name}`);
            this.save();
            this.renderAchievements();
            this.renderStatus();
        }
    },

    hexToRgb: function(hex) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) { r = "0x" + hex[1] + hex[1]; g = "0x" + hex[2] + hex[2]; b = "0x" + hex[3] + hex[3]; }
        else if (hex.length === 7) { r = "0x" + hex[1] + hex[2]; g = "0x" + hex[3] + hex[4]; b = "0x" + hex[5] + hex[6]; }
        return `${+r}, ${+g}, ${+b}`;
    },

    getRarityHex: function(rarity) {
        const colors = { common: '#a0aab5', uncommon: '#1eff00', rare: '#00f0ff', epic: '#d500ff', legendary: '#ffaa00' };
        return colors[rarity] || '#ffffff';
    },

    // --- SETTINGS & SCHEDULE BUILDER ---
    renderSettings: function() {

        const timerInput = document.getElementById('setting-rest-timer');
        if(timerInput) timerInput.value = this.state.restTimer;
        document.getElementById('edit-name-input').value = this.state.name;
        
        const themeList = document.getElementById('theme-selector-list');
        if(themeList) {
            themeList.innerHTML = '';
            GameData.themes.forEach(t => {
                const isUnlocked = this.state.unlockedThemes.includes(t.id);
                const isActive = this.state.theme === t.id;
                
                let statusClass = isUnlocked ? "unlocked" : "";
                if(isActive) statusClass += " active";
                
                let clickAttr = isUnlocked ? `onclick="app.selectTheme('${t.id}')"` : "";
                let lockIcon = isUnlocked ? "" : "<i class='fa-solid fa-lock' style='font-size:0.8rem; margin-left:5px;'></i>";
                
                themeList.innerHTML += `<div class="theme-option ${statusClass}" ${clickAttr}>${t.name} ${lockIcon}</div>`;
            });
        }
        
        this.renderScheduleEditor();
    },

    renderScheduleEditor: function() {
        const daySelector = document.getElementById('day-selector');
        const dayKey = daySelector.value;
        const listContainer = document.getElementById('editor-exercise-list');
        const titleInput = document.getElementById('day-title-input');
        
        listContainer.innerHTML = '';
        
        if(!this.state.schedule[dayKey]) {
            this.state.schedule[dayKey] = { title: "Rest Day", exercises: [] };
        }

        const dayData = this.state.schedule[dayKey];
        titleInput.value = dayData.title;

        if(dayData.exercises.length === 0) {
            listContainer.innerHTML = `<div style="padding:10px; color:#666; text-align:center; font-size:0.8rem;">No exercises assigned.</div>`;
        } else {
            dayData.exercises.forEach((ex, index) => {
                listContainer.innerHTML += `
                    <div class="editor-item">
                        <div>
                            <strong>${ex.name}</strong> <span style="color:#888; font-size:0.8rem;">(${ex.sets} x ${ex.reps})</span>
                        </div>
                        <button class="delete-btn" onclick="app.deleteExercise(${index})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
            });
        }
    },

    updateDayTitle: function() {
        const dayKey = document.getElementById('day-selector').value;
        const newTitle = document.getElementById('day-title-input').value;
        if(!this.state.schedule[dayKey]) {
            this.state.schedule[dayKey] = { title: newTitle, exercises: [] };
        }
        this.state.schedule[dayKey].title = newTitle;
        this.save();
    },

    addExercise: function() {
        const dayKey = document.getElementById('day-selector').value;
        const name = document.getElementById('new-ex-name').value;
        const sets = document.getElementById('new-ex-sets').value;
        const reps = document.getElementById('new-ex-reps').value;

        if(!name || !sets || !reps) { 
            this.notify("Please fill all fields."); 
            return; 
        }

        if(!this.state.schedule[dayKey]) {
            this.state.schedule[dayKey] = { title: "Custom Workout", exercises: [] };
        }
        
        this.state.schedule[dayKey].exercises.push({
            name: name,
            sets: parseInt(sets),
            reps: reps
        });

        document.getElementById('new-ex-name').value = '';
        document.getElementById('new-ex-sets').value = '';
        document.getElementById('new-ex-reps').value = '';

        this.save();
        this.renderScheduleEditor();
    },

    deleteExercise: function(index) {
        const dayKey = document.getElementById('day-selector').value;
        if(this.state.schedule[dayKey] && this.state.schedule[dayKey].exercises) {
            this.state.schedule[dayKey].exercises.splice(index, 1);
            this.save();
            this.renderScheduleEditor();
        }
    },

    exportData: function() {
        const dataStr = JSON.stringify(this.state);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const date = new Date().toISOString().slice(0,10);
        const exportFileDefaultName = `TheSystem_Save_${this.state.name}_${date}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.notify("DATA EXPORTED SUCCESSFULLY.");
    },

    importData: function(input) {
        const file = input.files[0];
        if(!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if(data.level !== undefined && data.stats !== undefined) {
                    if(confirm("WARNING: This will overwrite your current progress. Continue?")) {
                        const mergedState = { ...this.state, ...data };
                        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mergedState));
                        alert("DATA RESTORED. SYSTEM REBOOTING...");
                        location.reload();
                    }
                } else { 
                    alert("ERROR: Invalid Save File Format."); 
                }
            } catch(err) { 
                console.error(err); 
                alert("ERROR: Failed to read file."); 
            }
        };
        reader.readAsText(file);
        input.value = ''; 
    },

    // --- UNDERWORLD CASINO ---
    openCasino: function() {
        document.getElementById('casino-modal').style.display = 'flex';
        document.getElementById('casino-balance').innerText = this.state.gold;
        this.switchCasinoGame('cards');
    },

    closeCasino: function() {
        document.getElementById('casino-modal').style.display = 'none';
    },

    switchCasinoGame: function(gameId) {
        if(this.isSpinning) return;
        this.casinoMode = gameId;
        
        document.querySelectorAll('.casino-tab').forEach(t => t.classList.remove('active'));
        document.getElementById('tab-' + gameId).classList.add('active');
        
        document.querySelectorAll('.casino-game-view').forEach(v => v.style.display = 'none');
        document.getElementById('game-' + gameId).style.display = 'block';
        
        document.getElementById('casino-msg').innerText = '';
        
        if(gameId === 'cards') {
            this.generateCard();
        }
    },

    generateCard: function() {
        this.currentCasinoCard = Math.floor(Math.random() * 13) + 1; 
        this.renderCardUI(this.currentCasinoCard);
    },

    renderCardUI: function(val) {
        const display = document.getElementById('casino-card');
        let visual = val;
        
        if(val === 1) visual = 'A';
        if(val === 11) visual = 'J';
        if(val === 12) visual = 'Q';
        if(val === 13) visual = 'K';

        display.classList.remove('card-flip');
        void display.offsetWidth;
        display.classList.add('card-flip');

        setTimeout(() => {
            display.innerText = visual;
            if(Math.random() > 0.5) {
                display.style.color = 'red';
            } else {
                display.style.color = 'black';
            }
        }, 150);
    },

    playCasinoCard: function(guess) {
        let bet = parseInt(document.getElementById('casino-bet').value);
        const msg = document.getElementById('casino-msg');

        if (isNaN(bet) || bet < 50) {
            this.notifyMsg(msg, "MIN BET IS 50G", "var(--danger)");
            return;
        }

        if (this.state.gold < bet) {
            this.notifyMsg(msg, "INSUFFICIENT GOLD", "var(--danger)");
            return;
        }

        this.state.gold -= bet;
        this.state.milestones.totalGoldSpent += bet;
        const nextCard = Math.floor(Math.random() * 13) + 1;
        
        let won = false;
        let tie = false;

        if (nextCard === this.currentCasinoCard) {
            tie = true;
        } else if (guess === 'HIGH' && nextCard > this.currentCasinoCard) {
            won = true;
        } else if (guess === 'LOW' && nextCard < this.currentCasinoCard) {
            won = true;
        }

        setTimeout(() => {
            this.renderCardUI(nextCard);
            this.currentCasinoCard = nextCard; 

            if (tie) {
                this.notifyMsg(msg, "TIE! HOUSE WINS.", "var(--danger)");
            } else if (won) {
                const payout = bet * 2;
                if(payout >= 500) this.state.milestones.casinoBigWin = true;
                this.state.gold += payout;
                this.state.milestones.totalGoldEarned += payout;
                this.notifyMsg(msg, `WIN! +${payout} GOLD`, "var(--success)");
            } else {
                this.notifyMsg(msg, "LOST...", "var(--danger)");
            }

            this.updateGoldUI();
        }, 300); 
    },

    playSlots: function() {
        if(this.isSpinning) return;
        
        const bet = 50; 
        const msg = document.getElementById('casino-msg');

        if (this.state.gold < bet) {
            this.notifyMsg(msg, "INSUFFICIENT GOLD (50G REQ)", "var(--danger)");
            return;
        }

        this.state.gold -= bet;
        this.state.milestones.totalGoldSpent += bet;
        this.updateGoldUI();
        this.isSpinning = true;

        const reels = [
            document.getElementById('slot-1'),
            document.getElementById('slot-2'),
            document.getElementById('slot-3')
        ];

        reels.forEach(r => r.classList.add('slot-spin'));
        this.notifyMsg(msg, "SPINNING...", "var(--primary)");

        setTimeout(() => {
            const results = [
                this.slotSymbols[Math.floor(Math.random() * this.slotSymbols.length)],
                this.slotSymbols[Math.floor(Math.random() * this.slotSymbols.length)],
                this.slotSymbols[Math.floor(Math.random() * this.slotSymbols.length)]
            ];

            reels.forEach((r, i) => {
                r.classList.remove('slot-spin');
                r.innerText = results[i];
            });

            let winnings = 0;
            
            if(results[0] === results[1] && results[1] === results[2]) {
                if(results[0] === '7️⃣') winnings = 1000;
                else winnings = 250;
            } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
                winnings = 25; 
            }
            
            if(winnings > 0) {
                if(winnings >= 500) this.state.milestones.casinoBigWin = true;
                this.state.gold += winnings;
                this.state.milestones.totalGoldEarned += winnings;
                this.notifyMsg(msg, `JACKPOT! +${winnings} GOLD`, "var(--success)");
            } else {
                this.notifyMsg(msg, "NO MATCH...", "var(--danger)");
            }

            this.updateGoldUI();
            this.isSpinning = false;
        }, 1500);
    },

    playShells: function(guessIdx) {
        if(this.isSpinning) return;
        
        let bet = parseInt(document.getElementById('casino-bet').value);
        const msg = document.getElementById('casino-msg');

        if (isNaN(bet) || bet < 50) {
            this.notifyMsg(msg, "Minimum bet is 50 Gold", "var(--danger)");
            return;
        }

        if (this.state.gold < bet) {
            this.notifyMsg(msg, "INSUFFICIENT GOLD", "var(--danger)");
            return;
        }

        this.state.gold -= bet;
        this.state.milestones.totalGoldSpent += bet;
        this.updateGoldUI();
        this.isSpinning = true;
        
        document.querySelectorAll('.shell').forEach(s => {
            s.classList.remove('revealed');
            s.querySelector('.orb').classList.add('hidden');
        });

        const shellsContainer = document.querySelector('.shell-game');
        shellsContainer.classList.add('shell-shuffle');
        this.notifyMsg(msg, "SHUFFLING...", "var(--primary)");

        setTimeout(() => {
            shellsContainer.classList.remove('shell-shuffle');
            
            const winningIdx = Math.floor(Math.random() * 3);
            const winShell = document.getElementById('shell-' + winningIdx);
            winShell.querySelector('.orb').classList.remove('hidden');
            
            document.querySelectorAll('.shell').forEach(s => s.classList.add('revealed'));
            
            if(guessIdx === winningIdx) {
                const payout = bet * 3;
                if(payout >= 500) this.state.milestones.casinoBigWin = true;
                this.state.gold += payout;
                this.state.milestones.totalGoldEarned += payout;
                this.notifyMsg(msg, `FOUND IT! +${payout} GOLD`, "var(--success)");
            } else {
                this.notifyMsg(msg, "WRONG SHELL...", "var(--danger)");
            }
            
            this.updateGoldUI();
            
            setTimeout(() => { 
                document.querySelectorAll('.shell').forEach(s => s.classList.remove('revealed')); 
                this.isSpinning = false; 
            }, 2000);

        }, 1500);
    },

    notifyMsg: function(el, txt, col) {
        el.innerText = txt;
        el.style.color = col;
    },

    updateGoldUI: function() {
        document.getElementById('player-gold').innerText = this.state.gold;
        if(document.getElementById('casino-balance')) {
            document.getElementById('casino-balance').innerText = this.state.gold;
        }
        this.save();
    },

    // --- SHOP & INVENTORY SYSTEM ---
    currentItemId: null,

    renderShop: function() {
        const list = document.getElementById('shop-list');
        list.innerHTML = '';
        
        GameData.shopItems.forEach(item => {
            let statusIndicator = '';

            // Check if items are already owned
            if(item.type === 'theme' && this.state.unlockedThemes.includes(item.value)) { 
                statusIndicator = `<div style="font-size: 0.65rem; color: var(--text-dim); margin-top: 5px; font-family: var(--font-head); font-weight: bold;"><i class="fa-solid fa-check"></i> OWNED</div>`;
            } else if(item.type === 'passive' && this.state.unlockedPassives.includes(item.id)) { 
                statusIndicator = `<div style="font-size: 0.65rem; color: var(--success); margin-top: 5px; font-family: var(--font-head); font-weight: bold;"><i class="fa-solid fa-bolt"></i> ACTIVE</div>`;
            } else {
                statusIndicator = `<div class="shop-price"><svg width="14" height="14" style="vertical-align: middle; transform: translateY(-1px); margin-right: 8px;" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path style="fill:#FFDA44;" d="M256,512C114.842,512,0,397.158,0,256S114.842,0,256,0s256,114.842,256,256S397.158,512,256,512z"></path> <path style="fill:#FFA733;" d="M256,0L256,0v5.565V512l0,0c141.158,0,256-114.842,256-256S397.158,0,256,0z"></path> <path style="fill:#EE8700;" d="M256,439.652c-101.266,0-183.652-82.391-183.652-183.652S154.733,72.348,256,72.348 S439.652,154.739,439.652,256S357.266,439.652,256,439.652z"></path> <path style="fill:#CC7400;" d="M439.652,256c0-101.261-82.386-183.652-183.652-183.652v367.304 C357.266,439.652,439.652,357.261,439.652,256z"></path> <path style="fill:#FFDA44;" d="M263.805,241.239c-17.517-9.261-35.631-18.826-35.631-29.761c0-15.348,12.484-27.826,27.826-27.826 s27.826,12.478,27.826,27.826c0,9.217,7.473,16.696,16.696,16.696s16.696-7.479,16.696-16.696c0-27.956-18.867-51.548-44.522-58.842 v-7.94c0-9.217-7.473-16.696-16.696-16.696s-16.696,7.479-16.696,16.696v7.94c-25.655,7.294-44.522,30.886-44.522,58.842 c0,31.044,29.619,46.707,53.413,59.283c17.517,9.261,35.631,18.826,35.631,29.761c0,15.348-12.484,27.826-27.826,27.826 s-27.826-12.478-27.826-27.826c0-9.217-7.473-16.696-16.696-16.696s-16.696,7.479-16.696,16.696 c0,27.956,18.867,51.548,44.522,58.842v7.94c0,9.217,7.473,16.696,16.696,16.696s16.696-7.479,16.696-16.696v-7.94 c25.655-7.294,44.522-30.886,44.522-58.842C317.217,269.478,287.598,253.815,263.805,241.239z"></path> <g> <path style="fill:#FFA733;" d="M272.696,367.304v-7.94c25.655-7.294,44.522-30.886,44.522-58.842 c0-31.044-29.619-46.707-53.413-59.283c-2.616-1.384-5.226-2.777-7.805-4.176v37.875c14.699,7.976,27.826,16.283,27.826,25.584 c0,15.348-12.484,27.826-27.826,27.826V384C265.223,384,272.696,376.521,272.696,367.304z"></path> <path style="fill:#FFA733;" d="M283.826,211.478c0,9.217,7.473,16.696,16.696,16.696s16.696-7.479,16.696-16.696 c0-27.956-18.867-51.548-44.522-58.842v-7.94c0-9.217-7.473-16.696-16.696-16.696v55.652 C271.342,183.652,283.826,196.13,283.826,211.478z"></path> </g> </g></svg>${item.cost}</div>`;
            }

            // Clean, compact grid item - triggers modal on click
            list.innerHTML += `
                <div class="shop-item" onclick="app.openItemModal('${item.id}')">
                    <div class="shop-icon-container">
                        ${item.svg}
                    </div>
                    <div class="shop-item-name">${item.name}</div>
                    ${statusIndicator}
                </div>
            `;
        });
    },

    openItemModal: function(itemId) {
        this.currentItemId = itemId;
        const item = GameData.shopItems.find(i => i.id === itemId);
        if(!item) return;

        // Populate Modal Details
        document.getElementById('modal-item-icon').innerHTML = item.svg;
        
        // Scale up the SVG for the modal
       const img = document.getElementById('modal-item-icon').querySelector('img, svg');
        if(img) { 
            img.style.width = '100%'; 
            img.style.height = '100%'; 
            img.style.objectFit = 'contain'; /* Forces the modal to respect the PNG's true shape */
        }
        document.getElementById('modal-item-name').innerText = item.name;
        document.getElementById('modal-item-desc').innerText = item.desc;
        
        const qtyContainer = document.getElementById('modal-item-qty-container');
        const qtyInput = document.getElementById('modal-item-qty');
        const buyBtn = document.getElementById('modal-buy-btn');

        let btnText = `CONFIRM PURCHASE`;
        let disabled = false;
        
        qtyInput.value = 1;

        // Show/Hide Quantity Input based on item type
        if(item.type === 'consumable') {
            qtyContainer.style.display = 'block';
        } else {
            qtyContainer.style.display = 'none';
            if(item.type === 'theme' && this.state.unlockedThemes.includes(item.value)) { 
                btnText = "ALREADY OWNED"; 
                disabled = true; 
            } else if(item.type === 'passive' && this.state.unlockedPassives.includes(item.id)) { 
                btnText = "PASSIVE ACTIVE"; 
                disabled = true; 
            }
        }

        // Apply Button States
        buyBtn.innerText = btnText;
        buyBtn.disabled = disabled;
        
        if(disabled) {
            buyBtn.style.background = 'transparent';
            buyBtn.style.borderColor = '#333';
            buyBtn.style.color = '#555';
            document.getElementById('modal-item-price').innerHTML = `<i class="fa-solid fa-check"></i> ACQUIRED`;
            document.getElementById('modal-item-price').style.color = 'var(--text-dim)';
        } else {
            buyBtn.style.background = '';
            buyBtn.style.borderColor = '';
            buyBtn.style.color = '';
            this.updateModalPrice(); 
        }

        document.getElementById('shop-item-modal').style.display = 'flex';
    },

    closeItemModal: function() {
        document.getElementById('shop-item-modal').style.display = 'none';
        this.currentItemId = null;
    },

    updateModalPrice: function() {
        if(!this.currentItemId) return;
        const item = GameData.shopItems.find(i => i.id === this.currentItemId);
        
        let qty = 1;
        if(item.type === 'consumable') {
            qty = parseInt(document.getElementById('modal-item-qty').value) || 1;
            if(qty < 1) qty = 1;
        }
        
        const total = item.cost * qty;
        const priceDisplay = document.getElementById('modal-item-price');
        priceDisplay.innerHTML = `<i class="fa-solid fa-coins"></i> ${total}`;
        
        // Color code red if they can't afford it
        if(this.state.gold < total) {
            priceDisplay.style.color = 'var(--danger)';
            priceDisplay.style.textShadow = '0 0 10px rgba(255, 42, 42, 0.4)';
        } else {
            priceDisplay.style.color = 'var(--gold)';
            priceDisplay.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.4)';
        }
    },

    confirmPurchase: function() {
        if(!this.currentItemId) return;
        const item = GameData.shopItems.find(i => i.id === this.currentItemId);
        let qty = 1;
        
        if(item.type === 'consumable') {
            qty = parseInt(document.getElementById('modal-item-qty').value) || 1;
            if (isNaN(qty) || qty < 1) qty = 1;
        }

        const totalCost = item.cost * qty;

        if(this.state.gold >= totalCost) {
            this.state.gold -= totalCost;
            this.state.milestones.totalGoldSpent += totalCost;
            sfx.buy(); 

            if(item.type === 'theme') {
                this.state.unlockedThemes.push(item.value);
                this.notify(`${item.name} Unlocked!`);
            } else if (item.type === 'passive') {
                this.state.unlockedPassives.push(item.id);
                this.notify(`${item.name} Acquired!`);
            } else {
                if(!this.state.inventory[item.id]) this.state.inventory[item.id] = 0;
                this.state.inventory[item.id] += qty;
                this.notify(`Bought ${qty}x ${item.name}`);
            }

            this.save();
            this.renderStatus(); 
            this.renderShop(); 
            this.closeItemModal(); 
        } else {
            this.notify("INSUFFICIENT GOLD.");
            const modalEl = document.getElementById('shop-item-modal').querySelector('.modal-content');
            modalEl.classList.add('str-shake-active');
            setTimeout(() => modalEl.classList.remove('str-shake-active'), 500);
        }
    },

  openInventory: function() {
        this.renderInventory();
        this.navigateTo('inventory-screen'); // Switches the page instead of opening a modal
    },

    closeInventory: function() {
        this.navigateTo('shop-screen');
    },

    renderInventory: function() {
        const list = document.getElementById('inventory-list');
        if(!list) return;
        list.innerHTML = '';
        
        let hasItems = false;
        
        Object.keys(this.state.inventory).forEach(itemId => {
            const count = this.state.inventory[itemId];
            if (count > 0) {
                hasItems = true;
                const gameItem = GameData.shopItems.find(i => i.id === itemId);
                
                // Extremely strict inline styling to FORCE the PNG to stay exactly 40x40 pixels
                const safeImage = gameItem.svg.replace('<img', '<img style="width: 40px; height: 40px; min-width: 40px; max-width: 40px; object-fit: contain; display: block;"');
                
                list.innerHTML += `
                    <div style="background: rgba(0,0,0,0.5); border: 1px solid rgba(0,240,255,0.2); border-radius: 8px; padding: 15px; display: flex; align-items: center; justify-content: space-between; gap: 15px; box-shadow: inset 0 0 10px rgba(0,0,0,0.3);">
                        
                        ${safeImage}
                        
                        <div style="flex: 1; min-width: 0;">
                            <h4 style="margin: 0 0 5px 0; font-family: var(--font-head); font-size: 1.15rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 1px;">${gameItem.name}</h4>
                            <div style="font-size: 0.8rem; color: var(--text-dim); letter-spacing: 1px;">OWNED: <span style="color: var(--gold); font-weight: bold;">${count}</span></div>
                        </div>
                        
                        <div style="flex-shrink: 0;">
                            <button class="action-btn" style="width: auto; padding: 10px 20px; margin: 0; font-size: 0.9rem;" onclick="app.useItem('${itemId}')">USE</button>
                        </div>
                    </div>
                `;
            }
        });
        
        if(!hasItems) {
            list.innerHTML = `
                <div style="text-align: center; padding: 50px 20px; background: rgba(0,0,0,0.3); border: 1px dashed #333; border-radius: 8px;">
                    <i class="fa-solid fa-spider" style="font-size: 2rem; color: #444; margin-bottom: 10px;"></i>
                    <p style="color: #666; font-family: var(--font-head); letter-spacing: 1px; margin: 0;">INVENTORY IS EMPTY</p>
                </div>
            `;
        }
    },
    useItem: function(itemId) {
        if(this.state.inventory[itemId] > 0) {
            let used = false;
            
            if(itemId === 'elixir') {
                if(this.state.streak === 0 && this.state.lastStreakLost > 0) {
                    this.state.streak = this.state.lastStreakLost;
                    this.state.lastStreakLost = 0;
                    used = true;
                    this.state.milestones.elixirsUsed++; 
                    this.notify("STREAK RESTORED!");
                } else {
                    this.notify("No broken streak to restore.");
                }
            } 
            else if (itemId === 'key') {
                if(!this.state.activeEffects.dungeonKey) {
                    this.state.activeEffects.dungeonKey = true;
                    used = true;
                    this.notify("REST DAY UNLOCKED.");
                } else {
                    this.notify("Effect active.");
                }
            } 
            else if (itemId === 'stealth') {
                if(!this.state.activeEffects.stealthStone) {
                    this.state.activeEffects.stealthStone = true;
                    used = true;
                    this.notify("STEALTH STONE ACTIVE.");
                } else {
                    this.notify("Effect active.");
                }
            }
            else if (itemId === 'xp_boost') {
                if(!this.state.activeEffects.xpBoost) {
                    this.state.activeEffects.xpBoost = true;
                    used = true;
                    this.notify("XP BOOST ACTIVE.");
                } else {
                    this.notify("Effect active.");
                }
            }
            else if (itemId === 'wealth_pot') {
                if(!this.state.activeEffects.goldBoost) {
                    this.state.activeEffects.goldBoost = true;
                    used = true;
                    this.notify("WEALTH BOOST ACTIVE.");
                } else {
                    this.notify("Effect active.");
                }
            }
            else if (itemId === 'instant_clear') {
                if(confirm("Use Ticket to auto-complete today's quest?")) {
                    this.state.inventory[itemId]--; 
                    this.closeInventory();
                    this.finishWorkout(true); 
                    return; 
                }
            }

            if(used) {
                this.state.inventory[itemId]--;
                this.save();
                this.renderInventory();
            }
        }
    },

    // --- SUPPORT / MONETIZATION ---
    openSupport: function() {
        document.getElementById('support-modal').style.display = 'flex';
        const qrContainer = document.getElementById('qr-container');
        if (qrContainer) qrContainer.classList.add('hidden');
    },

    closeSupport: function() {
        document.getElementById('support-modal').style.display = 'none';
    },

    toggleQR: function() {
        const qrContainer = document.getElementById('qr-container');
        if (qrContainer) {
            qrContainer.classList.toggle('hidden');
        }
    },


    // --- WORKOUT LOGIC ---
    finishWorkout: function(isInstant = false) {
    this.closeRestTimer();

        let gainedExp = 0; 
        let historyStatus = 'NORMAL';

        const setChecks = document.querySelectorAll('.set-check:checked');
        const totalSets = document.querySelectorAll('.set-check').length;
        const bForm = document.getElementById('bonus-form')?.checked || false;
        const bProt = document.getElementById('bonus-protein')?.checked || false;
        const bFatig = document.getElementById('bonus-fatigue')?.checked || false;

        if (isInstant) {
            gainedExp = 150; 
            historyStatus = 'PERFECT'; 
            this.notify("INSTANT CLEAR TICKET USED.");
        } else {
            gainedExp += (setChecks.length * 10);
            if(bForm) gainedExp += 20;
            if(bProt) gainedExp += 20;
            if(bFatig) gainedExp += 30;
            if(gainedExp > 300) gainedExp = 300; 

            if (setChecks.length === totalSets && totalSets > 0) this.state.milestones.fullClearWorkouts++;
            if (bFatig) this.state.milestones.failurePushed++;

            if (setChecks.length === totalSets && bForm && bProt && bFatig && totalSets > 0) {
                historyStatus = 'PERFECT';
                this.state.milestones.hasPerfectRun = true;
            }
        }

        if(this.state.activeEffects.xpBoost) {
            gainedExp *= 2;
            this.state.activeEffects.xpBoost = false; 
            this.notify("XP BOOST APPLIED!");
        }

        const critChance = this.state.stats.agi * 2; 
        let isCrit = false;
        
        if (Math.random() * 100 < critChance) {
            gainedExp *= 2;
            isCrit = true;
            this.notify(`CRITICAL WORKOUT! XP Doubled!`);
        }

        if (gainedExp > 0 && !isInstant) {
            if (isCrit) {
                sfx.crit();
            } else {
                sfx.complete();
            }
        }

        let baseGold = 50 + Math.floor(gainedExp / 2);
        const strMultiplier = 1 + (this.state.stats.str * 0.05);
        let finalGold = Math.floor(baseGold * strMultiplier);
        
        finalGold += (this.state.streak * this.state.stats.end * 2);

        if(this.state.activeEffects.goldBoost) {
            finalGold *= 2;
            this.state.activeEffects.goldBoost = false; 
            this.notify("WEALTH POTION APPLIED!");
        }

       if(this.state.unlockedPassives.includes('ring_greed')) {
            finalGold = Math.floor(finalGold * 1.1);
        }

        // ---> NEW: RED GATE CLEAR <---
        if (this.state.isBossActive) {
            if (!isInstant) {
                gainedExp *= 3; // 300% EXP Reward!
                this.notify("RED GATE CLEARED! 3X EXP GAINED!");
            } else {
                this.notify("RED GATE BYPASSED."); // You can't use a cheat ticket to get 3x EXP!
            }
            this.state.isBossActive = false; // Turn the boss off
            this.state.daysUntilBoss = 15;   // Reset the 15 day countdown
        }
        
        const todayStr = new Date().toDateString();
        this.state.history[todayStr] = historyStatus;
        this.state.gold += finalGold;
        this.state.milestones.totalGoldEarned += finalGold;
        
        if(this.state.activeEffects.dungeonKey) {
            this.state.activeEffects.dungeonKey = false;
        }

        if(this.state.hardMode) {
            this.state.milestones.hardcoreWorkouts++;
        }

        if(this.state.completedSideQuests.includes('sq7')) {
            this.state.milestones.mindAndBody = true;
        }

        this.addExp(gainedExp);
        this.state.questCompletedDate = todayStr;
        this.state.totalWorkouts++; 
        this.state.streak++; 
        
        if(this.state.streak > this.state.maxStreak) {
            this.state.maxStreak = this.state.streak;
        }

        if(gainedExp === 0 && !isInstant) this.state.milestones.hasZeroExpRun = true;

        this.save();
        
        if (gainedExp === 0 && !isInstant) {
            this.notify("QUEST SKIPPED. Streak Preserved.");
        } else {
            this.notify(`QUEST COMPLETE.\n+${gainedExp} XP | +${finalGold} GOLD`);
        }
        
        const container = document.getElementById('app-container');
        if (container) {
            container.classList.add('str-shake-active');
            setTimeout(() => {
                container.classList.remove('str-shake-active');
            }, 500);
        }
        
        this.navigateTo('status-screen');
        this.renderStatus(); 
    },
// --- REST TIMER SYSTEM ---
    timerInterval: null,
    currentTimer: 0,
    
    triggerRestTimer: function(checkbox) {
        if (checkbox.checked) {
            // Find the specific exercise card
            const card = checkbox.closest('.mission-card');
            if (card) {
                const totalChecks = card.querySelectorAll('.set-check').length;
                const completedChecks = card.querySelectorAll('.set-check:checked').length;
                
                // If ALL sets for this specific exercise are checked off
                if (totalChecks > 0 && totalChecks === completedChecks) {
                    card.classList.add('completed-objective'); 
                    
                    if (this.state.restTimer > 0) {
                        this.startRestTimer(this.state.restTimer);
                    }
                }
            }
        }
    },

    startRestTimer: function(seconds) {
        if(this.timerInterval) clearInterval(this.timerInterval);
        this.currentTimer = seconds;
        
        const overlay = document.getElementById('rest-timer-overlay');
        overlay.classList.remove('hidden');
        this.updateTimerDisplay(); // This is what crashed without the function below!
        
        // SYSTEM LOCK: Disable all checkboxes so the player is forced to rest
        document.querySelectorAll('.set-check').forEach(cb => cb.disabled = true);
        
        this.timerInterval = setInterval(() => {
            this.currentTimer--;
            if(this.currentTimer <= 0) {
                this.closeRestTimer();
                sfx.playTone(880, 'square', 0.4, 0.1); 
                this.notify("REST COMPLETE. RESUME MISSION.");
            } else {
                this.updateTimerDisplay();
            }
        }, 1000);
    },

    modifyTimer: function(sec) {
        this.currentTimer += sec;
        this.updateTimerDisplay();
    },

    updateTimerDisplay: function() {
        const display = document.getElementById('rest-timer-display');
        if(!display) return;
        const mins = Math.floor(this.currentTimer / 60).toString().padStart(2, '0');
        const secs = (this.currentTimer % 60).toString().padStart(2, '0');
        display.innerText = `${mins}:${secs}`;
    },

    closeRestTimer: function() {
        if(this.timerInterval) clearInterval(this.timerInterval);
        const overlay = document.getElementById('rest-timer-overlay');
        if(overlay) overlay.classList.add('hidden');
        
        // SYSTEM UNLOCK: Re-enable the checkboxes
        document.querySelectorAll('.set-check').forEach(cb => cb.disabled = false);
    },
    // --- VISUALIZATION (HEATMAP) ---
    renderHeatmap: function() {
        const grid = document.getElementById('system-heatmap');
        if(!grid) return;
        grid.innerHTML = '';
        
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - 365);

        for (let i = 0; i <= 365; i++) {
            const current = new Date(startDate);
            current.setDate(startDate.getDate() + i);
            const dateStr = current.toDateString();
            
            let statusClass = 'c-grey';
            if (this.state.history && this.state.history[dateStr]) {
                const type = this.state.history[dateStr];
                if (type === 'PERFECT') statusClass = 'c-purple';
                else if (type === 'NORMAL') statusClass = 'c-blue';
                else if (type === 'PENALTY') statusClass = 'c-red';
            }

            const cell = document.createElement('div');
            cell.className = `heat-cell ${statusClass}`;
            cell.title = dateStr;
            grid.appendChild(cell);
        }
        
        setTimeout(() => {
            const scrollContainer = document.querySelector('.heatmap-scroll');
            if(scrollContainer) {
                scrollContainer.scrollLeft = scrollContainer.scrollWidth;
            }
        }, 100);
    },

    // --- STATUS RENDER ---
    renderStatus: function() {
        document.getElementById('player-name').innerText = this.state.name;
        document.getElementById('main-rank-display').innerText = this.state.rank;
        
        // ---> NEW: DYNAMIC CHARACTER EVOLUTION <---
        const avatarImg = document.getElementById('instructor-avatar');
        if (avatarImg) {
            // This takes a rank like "Shadow Soldier", removes the space, and adds ".png"
            const fileName = this.state.rank.replace(/\s+/g, '') + '.png';
            avatarImg.src = fileName;
        }
        
        const oldLevelDisplay = document.getElementById('player-level');
        if (oldLevelDisplay) oldLevelDisplay.innerText = this.state.level;
        if(document.getElementById('rank-level-display')) {
            document.getElementById('rank-level-display').innerText = this.state.level;
        }
        document.getElementById('player-gold').innerText = this.state.gold;
    
        
        document.getElementById('stat-str').innerText = this.state.stats.str;
        document.getElementById('stat-agi').innerText = this.state.stats.agi;
        document.getElementById('stat-vit').innerText = this.state.stats.vit;
        document.getElementById('stat-end').innerText = this.state.stats.end;
        
        const hmToggle = document.getElementById('hard-mode-toggle');
        if(hmToggle) hmToggle.checked = this.state.hardMode;
        
        const hmBadge = document.getElementById('hard-mode-badge');
        const mainCard = document.getElementById('status-screen').querySelector('.card');
        if(this.state.hardMode) {
            if(hmBadge) hmBadge.classList.remove('hidden');
            if(mainCard) mainCard.classList.add('hard-mode-active');
        } else {
            if(hmBadge) hmBadge.classList.add('hidden');
            if(mainCard) mainCard.classList.remove('hard-mode-active');
        }

        const ptsDisplay = document.getElementById('points-display');
        const statBtns = document.querySelectorAll('.stat-btn');
        if (this.state.points > 0) {
            if(ptsDisplay) { 
                ptsDisplay.innerText = `PTS: ${this.state.points}`; 
                ptsDisplay.classList.remove('hidden'); 
            }
            statBtns.forEach(b => b.classList.remove('hidden'));
        } else {
            if(ptsDisplay) ptsDisplay.classList.add('hidden');
            statBtns.forEach(b => b.classList.add('hidden'));
        }

        const currentLevelBase = GameData.levels[this.state.level - 1] || 0;
        const nextLevelReq = this.getNextLevelExp();
        const expInThisLevel = this.state.exp - currentLevelBase;
        const expNeeded = nextLevelReq - currentLevelBase;
        let percentage = 0;
        
        if(expNeeded > 0) {
            percentage = Math.min(100, Math.max(0, (expInThisLevel / expNeeded) * 100));
        }
        
        document.getElementById('exp-bar').style.width = percentage + "%";
        
        if(this.state.unlockedPassives.includes('scouter')) {
            document.getElementById('exp-val').innerText = `${this.state.exp} / ${nextLevelReq}`;
        } else {
            document.getElementById('exp-val').innerText = `${Math.floor(percentage)}%`;
        }

        const quest = this.getDailyQuestStatus();
        const questCard = document.getElementById('quest-card-container');
        const actionBtn = document.getElementById('quest-action-btn');
        const questInd = document.getElementById('quest-indicator');
        
        document.getElementById('daily-quest-title').innerText = quest.title;
        document.getElementById('daily-quest-desc').innerText = quest.desc;
        document.getElementById('quest-status-text').innerText = quest.status;
        
        questCard.classList.remove('locked', 'complete');
        
        // NEW: Allow REST_ACTIVE to display the button
        // Ensure we remove 'boss-mode' so normal quests don't glow red
        questCard.classList.remove('locked', 'complete', 'boss-mode');
        
        if (quest.status === "BOSS") {
            questCard.classList.add('boss-mode'); // Triggers portal CSS & Red Icon
            
            document.getElementById('quest-status-text').innerText = "DANGER - BOSS";
            document.getElementById('quest-status-text').style.color = "var(--danger)";
            
            actionBtn.innerText = "ENTER RED GATE"; 
            actionBtn.style.display = "block"; 
            actionBtn.style.borderColor = "var(--danger)";
            actionBtn.style.color = "var(--danger)";
            
            questInd.style.display = "inline-block";
            
        } else if (quest.status === "ACTIVE" || quest.status === "REST_ACTIVE") {
            document.getElementById('quest-status-text').style.color = "var(--success)";
            actionBtn.style.borderColor = "";
            actionBtn.style.color = "";

            actionBtn.innerText = "ACCEPT QUEST"; 
            actionBtn.style.display = "block"; 
            questInd.style.display = "inline-block";
        } else if (quest.status === "DONE") {
            questCard.classList.add('complete'); 
            actionBtn.style.display = "none"; 
            questInd.style.display = "none";
        } else { 
            questCard.classList.add('locked'); 
            actionBtn.style.display = "none"; 
            questInd.style.display = "none";
        }
    },

    applyTheme: function() {
        document.body.className = this.state.theme || '';
        if (window.canvasFx) {
            canvasFx.setTheme(this.state.theme || '');
        }
    },

    // --- RPG BASICS ---
    addExp: function(amount) {
        this.state.exp += amount;
        const nextLevelExp = this.getNextLevelExp();
        
        if (this.state.exp >= nextLevelExp && this.state.level < 10) {
            this.levelUp();
        }
        
        this.save();
        this.renderStatus();
    },

    levelUp: function() {
        sfx.levelUp(); 
        this.state.level++;
        this.state.points++; 
        this.state.rank = GameData.ranks[this.state.level - 1] || "Shadow Master";
        
        document.getElementById('old-level').innerText = this.state.level - 1;
        document.getElementById('new-level').innerText = this.state.level;
        document.getElementById('level-up-modal').style.display = 'flex';
    },

    addStat: function(stat) {
        if(this.state.points > 0) {
            this.state.stats[stat]++;
            this.state.points--;
            this.updateVisualStats(); 
            this.save();
            this.renderStatus();
        }
    },

    selectTheme: function(themeId) {
        this.state.theme = themeId;
        this.applyTheme();
        this.save();
        this.renderSettings();
    },

    completeSideQuest: function(id, exp, checkbox) {
        if(checkbox.checked) {
            this.state.completedSideQuests.push(id);
            if(!this.state.sqCounts[id]) this.state.sqCounts[id] = 0;
            this.state.sqCounts[id]++; 
            
            if(this.state.completedSideQuests.length > this.state.milestones.maxSideQuestsInDay) {
                this.state.milestones.maxSideQuestsInDay = this.state.completedSideQuests.length;
            }

            this.addExp(exp);
            checkbox.parentElement.classList.add('completed');
            checkbox.disabled = true;
            this.save();
        }
    },

    renderSideQuests: function() {
        const list = document.getElementById('side-quest-list');
        if(!list) return;
        
        list.innerHTML = '';
        
        const questsToRender = this.state.activeSideQuests && this.state.activeSideQuests.length > 0 
                                ? this.state.activeSideQuests 
                                : GameData.sideQuestsPool.slice(0, 3);
        
        questsToRender.forEach(sq => {
            const isDone = this.state.completedSideQuests.includes(sq.id);
            list.innerHTML += `
                <div class="side-quest-item ${isDone ? 'completed' : ''}">
                    <span>${sq.text} <small style="color:var(--primary)">+${sq.exp} XP</small></span>
                    <input type="checkbox" class="sq-checkbox" 
                        onchange="app.completeSideQuest('${sq.id}', ${sq.exp}, this)" 
                        ${isDone ? 'checked disabled' : ''}>
                </div>
            `;
        });
    },

    getDailyQuestStatus: function() {
        const today = new Date();
        const dayIndex = today.getDay(); 
        const dateString = today.toDateString();

        if (this.state.questCompletedDate === dateString) {
            return { 
                status: "DONE", 
                title: "QUEST COMPLETED", 
                desc: "Rest and recover for the next battle." 
            };
        }

        if (!this.state.schedule[dayIndex]) {
            if (this.state.activeEffects.dungeonKey) {
                return { 
                    status: "ACTIVE", 
                    title: "EXTRA DUNGEON", 
                    desc: "Key Used. Extra Training Available.", 
                    data: { 
                        title: "EXTRA DUNGEON", 
                        exercises: [
                            {name: "Push Ups", sets: 3, reps: "Failure"}, 
                            {name: "Squats", sets: 3, reps: "20"}, 
                            {name: "Plank", sets: 3, reps: "45s"}, 
                            {name: "Burpees", sets: 3, reps: "10"}
                        ] 
                    } 
                };
            }
            return { 
                status: "REST_ACTIVE", 
                title: "REST DAY", 
                desc: "Recovery protocols active. Claim your rest EXP." 
            };
        }

        const questData = this.state.schedule[dayIndex];
        
        // REST DAY BYPASS
        if (!questData) {
            if (this.state.activeEffects.dungeonKey) {
                return { status: "ACTIVE", title: "EXTRA DUNGEON", desc: "Key Used.", data: { title: "EXTRA DUNGEON", exercises: [{name: "Push Ups", sets: 3, reps: "Failure"}, {name: "Squats", sets: 3, reps: "20"}, {name: "Plank", sets: 3, reps: "45s"}, {name: "Burpees", sets: 3, reps: "10"}] } };
            }
            return { status: "REST_ACTIVE", title: "REST DAY", desc: "Recovery protocols active." };
        }

       // RED GATE GENERATOR
        if (this.state.isBossActive && questData) {
            let bossData = JSON.parse(JSON.stringify(questData));
            bossData.title = "RED GATE: " + questData.title;
            
            bossData.exercises.forEach(ex => {
                ex.sets = Math.ceil(ex.sets * 1.15); // +15% Total Sets
            });
            
            return { 
                status: "BOSS", 
                title: "RED GATE DETECTED", 
                desc: "Massive threat detected. Workload increased by 15%. 3x EXP Reward.", 
                data: bossData 
            };
        }

        return { 
            status: "ACTIVE", 
            title: questData.title, 
            desc: "Objectives Available. Prepare for entry.", 
            data: questData 
        };
    },

    handleQuestClick: function() {
        const quest = this.getDailyQuestStatus();
        // --> ADDED || quest.status === "BOSS" TO ALLOW ENTRY <--
        if (quest.status === "ACTIVE" || quest.status === "BOSS") {
            this.startWorkout(quest.data);
        } else if (quest.status === "REST_ACTIVE") {
            this.claimRestDay(); 
        }
    },

    claimRestDay: function() {
        let gainedExp = 50; // Base EXP for proper recovery
        const todayStr = new Date().toDateString();
        
        // Mark as a normal clear in the history log
        this.state.history[todayStr] = 'NORMAL';
        
        // Check for XP Boost potion
        if(this.state.activeEffects.xpBoost) {
            gainedExp *= 2;
            this.state.activeEffects.xpBoost = false; 
            this.notify("XP BOOST APPLIED!");
        }
        
        this.addExp(gainedExp);
        this.state.questCompletedDate = todayStr;
        this.state.streak++; 
        
        if(this.state.streak > this.state.maxStreak) {
            this.state.maxStreak = this.state.streak;
        }

        this.save();
        
        sfx.complete(); 
        this.notify(`RECOVERY COMPLETE.\n+${gainedExp} EXP GAINED.`);
        
        // Add a slight UI screen shake for impact
        const container = document.getElementById('app-container');
        if (container) {
            container.classList.add('str-shake-active');
            setTimeout(() => {
                container.classList.remove('str-shake-active');
            }, 500);
        }
        
        this.renderStatus(); 
    },  

    startWorkout: function(questData) {
        const list = document.getElementById('exercise-list');
        const isBoss = questData.title.startsWith("RED GATE");
        
        // Dungeon Header Overrides
        const headerBox = document.getElementById('dungeon-subtitle').parentElement;
        const headerBar = headerBox.querySelector('div');
        const headerTitle = headerBox.querySelector('h2');
        
        if (isBoss) {
            headerBox.style.borderColor = "var(--danger)";
            headerBox.style.background = "rgba(255, 42, 42, 0.05)";
            headerBox.style.boxShadow = "inset 0 0 20px rgba(255, 42, 42, 0.1)";
            headerBar.style.background = "var(--danger)";
            headerTitle.style.color = "var(--danger)";
            headerTitle.innerHTML = `<i class="fa-solid fa-skull"></i> RED GATE ACTIVE`;
            document.getElementById('dungeon-subtitle').style.color = "#ffaa00";
        } else {
            // Restore Normal UI
            headerBox.style.borderColor = "var(--primary)";
            headerBox.style.background = "rgba(0, 240, 255, 0.05)";
            headerBox.style.boxShadow = "none";
            headerBar.style.background = "var(--primary)";
            headerTitle.style.color = "var(--primary)";
            headerTitle.innerHTML = `<i class="fa-solid fa-crosshairs"></i> ACTIVE MISSION`;
            document.getElementById('dungeon-subtitle').style.color = "#fff";
        }

        document.getElementById('dungeon-subtitle').innerText = questData.title.toUpperCase();
        list.innerHTML = '';
        
        questData.exercises.forEach((ex) => {
            let setsHtml = '';
            for(let s = 0; s < ex.sets; s++) { 
                setsHtml += `<input type="checkbox" class="set-check" data-exp="10" onchange="app.triggerRestTimer(this)">`; 
            }
            
            // Swap to blood red UI for boss fights
            const cardClass = isBoss ? "mission-card red-gate-card" : "mission-card";
            const badgeColor = isBoss ? "var(--danger)" : "var(--primary)";
            const badgeBg = isBoss ? "rgba(255, 42, 42, 0.1)" : "rgba(0, 240, 255, 0.1)";

            list.innerHTML += `
                <div class="${cardClass}">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 12px;">
                        <strong style="font-family: var(--font-head); font-size: 1.2rem; color: #fff; letter-spacing: 1px;">${ex.name.toUpperCase()}</strong>
                        <span style="color:${badgeColor}; font-family: var(--font-head); font-weight: bold; background: ${badgeBg}; padding: 3px 8px; border-radius: 4px; box-shadow: 0 0 10px ${badgeBg};">${ex.sets} x ${ex.reps}</span>
                    </div>
                    <div class="set-row" style="justify-content: flex-start; gap: 12px;">${setsHtml}</div>
                </div>
            `;
        });
        
        this.navigateTo('dungeon-screen');
    },
    updateName: function() { 
        const newName = document.getElementById('edit-name-input').value; 
        if(newName.trim() !== "") { 
            this.state.name = newName; 
            this.save(); 
            this.renderStatus(); // Instantly update UI
            this.notify("IDENTITY UPDATED."); 
        } 
    },
    
    saveSchedule: function() { 
        try { 
            const raw = document.getElementById('schedule-editor').value; 
            this.state.schedule = JSON.parse(raw); 
            this.save(); 
            this.notify("SAVED."); 
        } catch(e) { 
            this.notify("INVALID JSON."); 
        } 
    },
    
    resetSchedule: function() { 
        if(confirm("RESET?")) { 
            this.state.schedule = JSON.parse(JSON.stringify(DefaultSchedule)); 
            this.renderSettings(); 
            this.save(); 
        } 
    },
    
    hardReset: function() { 
        if(confirm("WIPE DATA?")) { 
            localStorage.removeItem(this.STORAGE_KEY); 
            location.reload(); 
        } 
    },
    
    closeModal: function() { 
        document.getElementById('level-up-modal').style.display = 'none'; 
    },
    
    toggleHardMode: function() { 
        this.state.hardMode = document.getElementById('hard-mode-toggle').checked; 
        this.save(); 
        this.renderStatus(); 
    },
    
    renderRankTree: function() { 
        const list = document.getElementById('rank-list'); 
        if(!list) return; 
        
        list.innerHTML = ''; 
        
        GameData.ranks.forEach((rank, index) => { 
            const li = document.createElement('li'); 
            li.innerHTML = `<span>LVL ${index+1}</span> <span>${rank}</span>`; 
            if(index + 1 === this.state.level) li.classList.add('current'); 
            list.appendChild(li); 
        }); 
    },

    save: function() { 
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state)); 
        this.updateAchievementBadge(); 
    },
    
    load: function() {
        let data = localStorage.getItem(this.STORAGE_KEY);
        
        if(!data) data = localStorage.getItem('the_system_v12_data'); 
        if(!data) data = localStorage.getItem('the_system_v11_data'); 
        
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.state = { ...this.state, ...parsed };
                
                // Ensure new state properties exist
                if (!this.state.startDate) this.state.startDate = new Date().toDateString();

                if (this.state.hasCompletedOnboarding === undefined) {
                    this.state.hasCompletedOnboarding = this.state.totalWorkouts > 0; 
                }
                if(!this.state.history) this.state.history = {};
                if(!this.state.activeEffects) this.state.activeEffects = { dungeonKey: false, stealthStone: false, xpBoost: false, goldBoost: false };
                if(this.state.gold === undefined) this.state.gold = 0;
                if(!this.state.theme) this.state.theme = '';
                if(!this.state.unlockedThemes) this.state.unlockedThemes = [''];
                if(!this.state.unlockedPassives) this.state.unlockedPassives = [];
                if(!this.state.inventory) this.state.inventory = { elixir: 0, key: 0, stealth: 0, xp_boost: 0, wealth_pot: 0, instant_clear: 0 };
                if(this.state.inventory.instant_clear === undefined) this.state.inventory.instant_clear = 0;
                if(!this.state.schedule) this.state.schedule = JSON.parse(JSON.stringify(DefaultSchedule));
                
                if(!this.state.activeSideQuests) this.state.activeSideQuests = [];
                if(!this.state.claimedAchievements) this.state.claimedAchievements = [];
                if(!this.state.sqCounts) this.state.sqCounts = {};
                if(this.state.restTimer === undefined) this.state.restTimer = 180;

                // NEW: Boss Trackers
                if(this.state.daysUntilBoss === undefined) this.state.daysUntilBoss = 15;
                if(this.state.isBossActive === undefined) this.state.isBossActive = false;
                
                if(!this.state.milestones) {
                    this.state.milestones = {
                        totalGoldEarned: this.state.gold || 0, totalGoldSpent: 0, elixirsUsed: 0, fullClearWorkouts: 0, 
                        failurePushed: 0, hasPerfectRun: false, hasZeroExpRun: false, maxSideQuestsInDay: 0, 
                        mindAndBody: false, hardcoreWorkouts: 0, casinoBigWin: false 
                    };
                } else {
                    if(!this.state.milestones.totalGoldEarned) this.state.milestones.totalGoldEarned = this.state.gold;
                    if(!this.state.milestones.totalGoldSpent) this.state.milestones.totalGoldSpent = 0;
                    if(!this.state.milestones.elixirsUsed) this.state.milestones.elixirsUsed = 0;
                    if(!this.state.milestones.fullClearWorkouts) this.state.milestones.fullClearWorkouts = 0;
                }
                
            } catch(e) { 
                console.error("Data Parse Error", e); 
            }
        }
    }
};

window.onload = function() { 
    app.init(); 
};
