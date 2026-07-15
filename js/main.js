/**
 * Smart Piano Game Kiosk Signage Application Engine
 * Precise 1080x1920 fixed UI interaction with custom audio synth and game states.
 */

// Global Game State
const state = {
  isPlaying: false,
  isPaused: false,
  currentSongIdx: 0,
  score: 0,
  combo: 0,
  totalNotes: 0,
  hitNotes: 0,
  accuracy: 100,
  currentTime: 85, // 01:25 remaining
  timerInterval: null,
  activeKeys: new Set(),
  settings: {
    audioVolume: 0.8,
    backingVolume: 0.8,
    soundOn: true,
    midiAssist: false,
    particlesOn: true,
    backingMelodyOn: true
  },
  noteQueue: [],
  fallingNotes: [],
  songNotesHistory: [],
  currentLaneGlows: [false, false, false, false, false, false, false, false],
  currentSongNotesPlayed: 0,
  activeCategoryFilter: 'all'
};

// Piano Keys Frequency Mapping (10 White Keys, 7 Black Keys)
const WHITE_KEYS = [
  { index: 0, name: 'C4', label: '도', freq: 261.63, key: 'a' },
  { index: 1, name: 'D4', label: '레', freq: 293.66, key: 's' },
  { index: 2, name: 'E4', label: '미', freq: 329.63, key: 'd' },
  { index: 3, name: 'F4', label: '파', freq: 349.23, key: 'f' },
  { index: 4, name: 'G4', label: '솔', freq: 392.00, key: 'g' },
  { index: 5, name: 'A4', label: '라', freq: 440.00, key: 'h' },
  { index: 6, name: 'B4', label: '시', freq: 493.88, key: 'j' },
  { index: 7, name: 'C5', label: '도', freq: 523.25, key: 'k' },
  { index: 8, name: 'D5', label: '레', freq: 587.33, key: 'l' },
  { index: 9, name: 'E5', label: '미', freq: 659.25, key: ';' }
];

const BLACK_KEYS = [
  { leftIdx: 0, rightIdx: 1, name: 'C#4', label: '도#', freq: 277.18, key: 'w' },
  { leftIdx: 1, rightIdx: 2, name: 'D#4', label: '레#', freq: 311.13, key: 'e' },
  // Gap between E and F (no black key)
  { leftIdx: 3, rightIdx: 4, name: 'F#4', label: '파#', freq: 369.99, key: 't' },
  { leftIdx: 4, rightIdx: 5, name: 'G#4', label: '솔#', freq: 415.30, key: 'y' },
  { leftIdx: 5, rightIdx: 6, name: 'A#4', label: '라#', freq: 466.16, key: 'u' },
  // Gap between B4 and C5 (no black key)
  { leftIdx: 7, rightIdx: 8, name: 'C#5', label: '도#', freq: 554.37, key: 'o' },
  { leftIdx: 8, rightIdx: 9, name: 'D#5', label: '레#', freq: 622.25, key: 'p' }
];

// Songs Database
const SONGS = [
  {
    title: '작은 별',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '연습곡',
    totalMeasures: 12,
    notes: [
      // 도도솔솔라라솔
      { keyIdx: 0, onset: 1000, hit: false },
      { keyIdx: 0, onset: 2000, hit: false },
      { keyIdx: 4, onset: 3000, hit: false },
      { keyIdx: 4, onset: 4000, hit: false },
      { keyIdx: 5, onset: 5000, hit: false },
      { keyIdx: 5, onset: 6000, hit: false },
      { keyIdx: 4, onset: 7000, hit: false },
      // 파파미미레레도
      { keyIdx: 3, onset: 9000, hit: false },
      { keyIdx: 3, onset: 10000, hit: false },
      { keyIdx: 2, onset: 11000, hit: false },
      { keyIdx: 2, onset: 12000, hit: false },
      { keyIdx: 1, onset: 13000, hit: false },
      { keyIdx: 1, onset: 14000, hit: false },
      { keyIdx: 0, onset: 15000, hit: false },
      // 솔솔파파미미레
      { keyIdx: 4, onset: 17000, hit: false },
      { keyIdx: 4, onset: 18000, hit: false },
      { keyIdx: 3, onset: 19000, hit: false },
      { keyIdx: 3, onset: 20000, hit: false },
      { keyIdx: 2, onset: 21000, hit: false },
      { keyIdx: 2, onset: 22000, hit: false },
      { keyIdx: 1, onset: 23000, hit: false },
      // 솔솔파파미미레
      { keyIdx: 4, onset: 25000, hit: false },
      { keyIdx: 4, onset: 26000, hit: false },
      { keyIdx: 3, onset: 27000, hit: false },
      { keyIdx: 3, onset: 28000, hit: false },
      { keyIdx: 2, onset: 29000, hit: false },
      { keyIdx: 2, onset: 30000, hit: false },
      { keyIdx: 1, onset: 31000, hit: false },
      // 도도솔솔라라솔
      { keyIdx: 0, onset: 33000, hit: false },
      { keyIdx: 0, onset: 34000, hit: false },
      { keyIdx: 4, onset: 35000, hit: false },
      { keyIdx: 4, onset: 36000, hit: false },
      { keyIdx: 5, onset: 37000, hit: false },
      { keyIdx: 5, onset: 38000, hit: false },
      { keyIdx: 4, onset: 39000, hit: false },
      // 파파미미레레도
      { keyIdx: 3, onset: 41000, hit: false },
      { keyIdx: 3, onset: 42000, hit: false },
      { keyIdx: 2, onset: 43000, hit: false },
      { keyIdx: 2, onset: 44000, hit: false },
      { keyIdx: 1, onset: 45000, hit: false },
      { keyIdx: 1, onset: 46000, hit: false },
      { keyIdx: 0, onset: 47000, hit: false }
    ],
    sheetMusic: [
      { label: '도', activeIdx: [0] },
      { label: '도', activeIdx: [1] },
      { label: '솔', activeIdx: [2] },
      { label: '솔', activeIdx: [3] },
      { label: '라', activeIdx: [4] },
      { label: '라', activeIdx: [5] },
      { label: '솔', activeIdx: [6] },
      { label: '파', activeIdx: [7] },
      { label: '파', activeIdx: [8] },
      { label: '미', activeIdx: [9] },
      { label: '미', activeIdx: [10] },
      { label: '레', activeIdx: [11] },
      { label: '레', activeIdx: [12] },
      { label: '도', activeIdx: [13] },
      { label: '솔', activeIdx: [14] },
      { label: '솔', activeIdx: [15] },
      { label: '파', activeIdx: [16] },
      { label: '파', activeIdx: [17] },
      { label: '미', activeIdx: [18] },
      { label: '미', activeIdx: [19] },
      { label: '레', activeIdx: [20] },
      { label: '솔', activeIdx: [21] },
      { label: '솔', activeIdx: [22] },
      { label: '파', activeIdx: [23] },
      { label: '파', activeIdx: [24] },
      { label: '미', activeIdx: [25] },
      { label: '미', activeIdx: [26] },
      { label: '레', activeIdx: [27] },
      { label: '도', activeIdx: [28] },
      { label: '도', activeIdx: [29] },
      { label: '솔', activeIdx: [30] },
      { label: '솔', activeIdx: [31] },
      { label: '라', activeIdx: [32] },
      { label: '라', activeIdx: [33] },
      { label: '솔', activeIdx: [34] },
      { label: '파', activeIdx: [35] },
      { label: '파', activeIdx: [36] },
      { label: '미', activeIdx: [37] },
      { label: '미', activeIdx: [38] },
      { label: '레', activeIdx: [39] },
      { label: '레', activeIdx: [40] },
      { label: '도', activeIdx: [41] }
    ]
  },
  {
    title: '나비야 나비야',
    stars: '★☆☆☆☆',
    difficultyRaw: 1,
    badge: '기초',
    totalMeasures: 16,
    notes: [
      { keyIdx: 4, onset: 1000, hit: false },
      { keyIdx: 2, onset: 2000, hit: false },
      { keyIdx: 2, onset: 3000, hit: false },
      { keyIdx: 3, onset: 4000, hit: false },
      { keyIdx: 1, onset: 5000, hit: false },
      { keyIdx: 1, onset: 6000, hit: false },
      { keyIdx: 0, onset: 7000, hit: false },
      { keyIdx: 1, onset: 8000, hit: false },
      { keyIdx: 2, onset: 9000, hit: false },
      { keyIdx: 3, onset: 10000, hit: false },
      { keyIdx: 4, onset: 11000, hit: false },
      { keyIdx: 4, onset: 12000, hit: false },
      { keyIdx: 4, onset: 13000, hit: false },
      
      { keyIdx: 4, onset: 15000, hit: false },
      { keyIdx: 2, onset: 16000, hit: false },
      { keyIdx: 2, onset: 17000, hit: false },
      { keyIdx: 2, onset: 18000, hit: false },
      { keyIdx: 3, onset: 19000, hit: false },
      { keyIdx: 1, onset: 20000, hit: false },
      { keyIdx: 1, onset: 21000, hit: false },
      { keyIdx: 1, onset: 22000, hit: false },
      { keyIdx: 0, onset: 23000, hit: false },
      { keyIdx: 2, onset: 24000, hit: false },
      { keyIdx: 4, onset: 25000, hit: false },
      { keyIdx: 4, onset: 26000, hit: false },
      { keyIdx: 2, onset: 27000, hit: false },
      { keyIdx: 2, onset: 28000, hit: false },
      { keyIdx: 2, onset: 29000, hit: false },
      
      { keyIdx: 1, onset: 31000, hit: false },
      { keyIdx: 1, onset: 32000, hit: false },
      { keyIdx: 1, onset: 33000, hit: false },
      { keyIdx: 1, onset: 34000, hit: false },
      { keyIdx: 1, onset: 35000, hit: false },
      { keyIdx: 2, onset: 36000, hit: false },
      { keyIdx: 3, onset: 37000, hit: false },
      { keyIdx: 2, onset: 38000, hit: false },
      { keyIdx: 2, onset: 39000, hit: false },
      { keyIdx: 2, onset: 40000, hit: false },
      { keyIdx: 2, onset: 41000, hit: false },
      { keyIdx: 2, onset: 42000, hit: false },
      { keyIdx: 3, onset: 43000, hit: false },
      { keyIdx: 4, onset: 44000, hit: false },
      
      { keyIdx: 4, onset: 46000, hit: false },
      { keyIdx: 2, onset: 47000, hit: false },
      { keyIdx: 2, onset: 48000, hit: false },
      { keyIdx: 3, onset: 49000, hit: false },
      { keyIdx: 1, onset: 50000, hit: false },
      { keyIdx: 1, onset: 51000, hit: false },
      { keyIdx: 0, onset: 52000, hit: false },
      { keyIdx: 2, onset: 53000, hit: false },
      { keyIdx: 4, onset: 54000, hit: false },
      { keyIdx: 4, onset: 55000, hit: false },
      { keyIdx: 0, onset: 56000, hit: false },
      { keyIdx: 0, onset: 57000, hit: false },
      { keyIdx: 0, onset: 58000, hit: false }
    ],
    sheetMusic: [
      { label: '솔', activeIdx: [0] },
      { label: '미', activeIdx: [1] },
      { label: '미', activeIdx: [2] },
      { label: '파', activeIdx: [3] },
      { label: '레', activeIdx: [4] },
      { label: '레', activeIdx: [5] },
      { label: '도', activeIdx: [6] },
      { label: '레', activeIdx: [7] },
      { label: '미', activeIdx: [8] },
      { label: '파', activeIdx: [9] },
      { label: '솔', activeIdx: [10] },
      { label: '솔', activeIdx: [11] },
      { label: '솔', activeIdx: [12] },
      
      { label: '솔', activeIdx: [13] },
      { label: '미', activeIdx: [14] },
      { label: '미', activeIdx: [15] },
      { label: '미', activeIdx: [16] },
      { label: '파', activeIdx: [17] },
      { label: '레', activeIdx: [18] },
      { label: '레', activeIdx: [19] },
      { label: '레', activeIdx: [20] },
      { label: '도', activeIdx: [21] },
      { label: '미', activeIdx: [22] },
      { label: '솔', activeIdx: [23] },
      { label: '솔', activeIdx: [24] },
      { label: '미', activeIdx: [25] },
      { label: '미', activeIdx: [26] },
      { label: '미', activeIdx: [27] },
      
      { label: '레', activeIdx: [28] },
      { label: '레', activeIdx: [29] },
      { label: '레', activeIdx: [30] },
      { label: '레', activeIdx: [31] },
      { label: '레', activeIdx: [32] },
      { label: '미', activeIdx: [33] },
      { label: '파', activeIdx: [34] },
      { label: '미', activeIdx: [35] },
      { label: '미', activeIdx: [36] },
      { label: '미', activeIdx: [37] },
      { label: '미', activeIdx: [38] },
      { label: '미', activeIdx: [39] },
      { label: '파', activeIdx: [40] },
      { label: '솔', activeIdx: [41] },
      
      { label: '솔', activeIdx: [42] },
      { label: '미', activeIdx: [43] },
      { label: '미', activeIdx: [44] },
      { label: '파', activeIdx: [45] },
      { label: '레', activeIdx: [46] },
      { label: '레', activeIdx: [47] },
      { label: '도', activeIdx: [48] },
      { label: '미', activeIdx: [49] },
      { label: '솔', activeIdx: [50] },
      { label: '솔', activeIdx: [51] },
      { label: '도', activeIdx: [52] },
      { label: '도', activeIdx: [53] },
      { label: '도', activeIdx: [54] }
    ]
  },
  {
    title: '캐논 변주곡',
    stars: '★★★★☆',
    difficultyRaw: 4,
    badge: '연주곡',
    totalMeasures: 18,
    notes: [
      { keyIdx: 7, onset: 1000, hit: false },
      { keyIdx: 4, onset: 2500, hit: false },
      { keyIdx: 5, onset: 4000, hit: false },
      { keyIdx: 2, onset: 5500, hit: false },
      { keyIdx: 3, onset: 7000, hit: false },
      { keyIdx: 0, onset: 8500, hit: false },
      { keyIdx: 3, onset: 10000, hit: false },
      { keyIdx: 4, onset: 11500, hit: false },
      
      { keyIdx: 6, onset: 13000, hit: false },
      { keyIdx: 7, onset: 14500, hit: false },
      { keyIdx: 8, onset: 16000, hit: false },
      { keyIdx: 9, onset: 17500, hit: false },
      { keyIdx: 7, onset: 19000, hit: false },
      { keyIdx: 5, onset: 20500, hit: false },
      { keyIdx: 6, onset: 22000, hit: false },
      { keyIdx: 7, onset: 23500, hit: false },
      
      { keyIdx: 4, onset: 25000, hit: false },
      { keyIdx: 5, onset: 26500, hit: false },
      { keyIdx: 6, onset: 28000, hit: false },
      { keyIdx: 7, onset: 29500, hit: false },
      { keyIdx: 5, onset: 31000, hit: false },
      { keyIdx: 3, onset: 32500, hit: false },
      { keyIdx: 4, onset: 34000, hit: false },
      { keyIdx: 7, onset: 35500, hit: false }
    ],
    sheetMusic: [
      { label: '도', activeIdx: [0] },
      { label: '솔', activeIdx: [1] },
      { label: '라', activeIdx: [2] },
      { label: '미', activeIdx: [3] },
      { label: '파', activeIdx: [4] },
      { label: '도', activeIdx: [5] },
      { label: '파', activeIdx: [6] },
      { label: '솔', activeIdx: [7] },
      { label: '시', activeIdx: [8] },
      { label: '도', activeIdx: [9] },
      { label: '레', activeIdx: [10] },
      { label: '미', activeIdx: [11] },
      { label: '도', activeIdx: [12] },
      { label: '라', activeIdx: [13] },
      { label: '시', activeIdx: [14] },
      { label: '도', activeIdx: [15] },
      { label: '솔', activeIdx: [16] },
      { label: '라', activeIdx: [17] },
      { label: '시', activeIdx: [18] },
      { label: '도', activeIdx: [19] },
      { label: '라', activeIdx: [20] },
      { label: '파', activeIdx: [21] },
      { label: '솔', activeIdx: [22] },
      { label: '도', activeIdx: [23] }
    ]
  },
  {
    title: '환희의 송가 (베토벤)',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '명작 클래식',
    totalMeasures: 12,
    notes: [
      { keyIdx: 2, onset: 1000, hit: false },
      { keyIdx: 2, onset: 2000, hit: false },
      { keyIdx: 3, onset: 3000, hit: false },
      { keyIdx: 4, onset: 4000, hit: false },
      { keyIdx: 4, onset: 5000, hit: false },
      { keyIdx: 3, onset: 6000, hit: false },
      { keyIdx: 2, onset: 7000, hit: false },
      { keyIdx: 1, onset: 8000, hit: false },
      { keyIdx: 0, onset: 9000, hit: false },
      { keyIdx: 0, onset: 10000, hit: false },
      { keyIdx: 1, onset: 11000, hit: false },
      { keyIdx: 2, onset: 12000, hit: false },
      { keyIdx: 2, onset: 13000, hit: false },
      { keyIdx: 1, onset: 14000, hit: false },
      { keyIdx: 1, onset: 15000, hit: false },
      
      { keyIdx: 2, onset: 17000, hit: false },
      { keyIdx: 2, onset: 18000, hit: false },
      { keyIdx: 3, onset: 19000, hit: false },
      { keyIdx: 4, onset: 20000, hit: false },
      { keyIdx: 4, onset: 21000, hit: false },
      { keyIdx: 3, onset: 22000, hit: false },
      { keyIdx: 2, onset: 23000, hit: false },
      { keyIdx: 1, onset: 24000, hit: false },
      { keyIdx: 0, onset: 25000, hit: false },
      { keyIdx: 0, onset: 26000, hit: false },
      { keyIdx: 1, onset: 27000, hit: false },
      { keyIdx: 2, onset: 28000, hit: false },
      { keyIdx: 1, onset: 29000, hit: false },
      { keyIdx: 0, onset: 30000, hit: false },
      { keyIdx: 0, onset: 31000, hit: false }
    ],
    sheetMusic: [
      { label: '미', activeIdx: [0] },
      { label: '미', activeIdx: [1] },
      { label: '파', activeIdx: [2] },
      { label: '솔', activeIdx: [3] },
      { label: '솔', activeIdx: [4] },
      { label: '파', activeIdx: [5] },
      { label: '미', activeIdx: [6] },
      { label: '레', activeIdx: [7] },
      { label: '도', activeIdx: [8] },
      { label: '도', activeIdx: [9] },
      { label: '레', activeIdx: [10] },
      { label: '미', activeIdx: [11] },
      { label: '미', activeIdx: [12] },
      { label: '레', activeIdx: [13] },
      { label: '레', activeIdx: [14] },
      
      { label: '미', activeIdx: [15] },
      { label: '미', activeIdx: [16] },
      { label: '파', activeIdx: [17] },
      { label: '솔', activeIdx: [18] },
      { label: '솔', activeIdx: [19] },
      { label: '파', activeIdx: [20] },
      { label: '미', activeIdx: [21] },
      { label: '레', activeIdx: [22] },
      { label: '도', activeIdx: [23] },
      { label: '도', activeIdx: [24] },
      { label: '레', activeIdx: [25] },
      { label: '미', activeIdx: [26] },
      { label: '레', activeIdx: [27] },
      { label: '도', activeIdx: [28] },
      { label: '도', activeIdx: [29] }
    ]
  },
  {
    title: '비행기',
    stars: '★☆☆☆☆',
    difficultyRaw: 1,
    badge: '기초 동요',
    totalMeasures: 8,
    notes: [
      { keyIdx: 2, onset: 1000, hit: false },
      { keyIdx: 1, onset: 1800, hit: false },
      { keyIdx: 0, onset: 2600, hit: false },
      { keyIdx: 1, onset: 3400, hit: false },
      { keyIdx: 2, onset: 4200, hit: false },
      { keyIdx: 2, onset: 5000, hit: false },
      { keyIdx: 2, onset: 5800, hit: false },
      { keyIdx: 1, onset: 6800, hit: false },
      { keyIdx: 1, onset: 7600, hit: false },
      { keyIdx: 1, onset: 8400, hit: false },
      { keyIdx: 2, onset: 9400, hit: false },
      { keyIdx: 4, onset: 10200, hit: false },
      { keyIdx: 4, onset: 11000, hit: false },
      
      { keyIdx: 2, onset: 12000, hit: false },
      { keyIdx: 1, onset: 12800, hit: false },
      { keyIdx: 0, onset: 13600, hit: false },
      { keyIdx: 1, onset: 14400, hit: false },
      { keyIdx: 2, onset: 15200, hit: false },
      { keyIdx: 2, onset: 16000, hit: false },
      { keyIdx: 2, onset: 16800, hit: false },
      { keyIdx: 1, onset: 17800, hit: false },
      { keyIdx: 1, onset: 18600, hit: false },
      { keyIdx: 2, onset: 19400, hit: false },
      { keyIdx: 1, onset: 20200, hit: false },
      { keyIdx: 0, onset: 21000, hit: false }
    ],
    sheetMusic: [
      { label: '미', activeIdx: [0] },
      { label: '레', activeIdx: [1] },
      { label: '도', activeIdx: [2] },
      { label: '레', activeIdx: [3] },
      { label: '미', activeIdx: [4] },
      { label: '미', activeIdx: [5] },
      { label: '미', activeIdx: [6] },
      { label: '레', activeIdx: [7] },
      { label: '레', activeIdx: [8] },
      { label: '레', activeIdx: [9] },
      { label: '미', activeIdx: [10] },
      { label: '솔', activeIdx: [11] },
      { label: '솔', activeIdx: [12] },
      
      { label: '미', activeIdx: [13] },
      { label: '레', activeIdx: [14] },
      { label: '도', activeIdx: [15] },
      { label: '레', activeIdx: [16] },
      { label: '미', activeIdx: [17] },
      { label: '미', activeIdx: [18] },
      { label: '미', activeIdx: [19] },
      { label: '레', activeIdx: [20] },
      { label: '레', activeIdx: [21] },
      { label: '미', activeIdx: [22] },
      { label: '레', activeIdx: [23] },
      { label: '도', activeIdx: [24] }
    ]
  },
  {
    title: '학교 종이 땡땡땡',
    stars: '★☆☆☆☆',
    difficultyRaw: 1,
    badge: '기초 동요',
    totalMeasures: 8,
    notes: [
      { keyIdx: 4, onset: 1000, hit: false },
      { keyIdx: 4, onset: 1800, hit: false },
      { keyIdx: 5, onset: 2600, hit: false },
      { keyIdx: 5, onset: 3400, hit: false },
      { keyIdx: 4, onset: 4200, hit: false },
      { keyIdx: 4, onset: 5000, hit: false },
      { keyIdx: 2, onset: 5800, hit: false },
      { keyIdx: 4, onset: 6800, hit: false },
      { keyIdx: 4, onset: 7600, hit: false },
      { keyIdx: 2, onset: 8400, hit: false },
      { keyIdx: 2, onset: 9200, hit: false },
      { keyIdx: 1, onset: 10000, hit: false },
      
      { keyIdx: 4, onset: 11800, hit: false },
      { keyIdx: 4, onset: 12600, hit: false },
      { keyIdx: 5, onset: 13400, hit: false },
      { keyIdx: 5, onset: 14200, hit: false },
      { keyIdx: 4, onset: 15000, hit: false },
      { keyIdx: 4, onset: 15800, hit: false },
      { keyIdx: 2, onset: 16600, hit: false },
      { keyIdx: 4, onset: 17600, hit: false },
      { keyIdx: 2, onset: 18400, hit: false },
      { keyIdx: 1, onset: 19200, hit: false },
      { keyIdx: 2, onset: 20000, hit: false },
      { keyIdx: 0, onset: 20800, hit: false }
    ],
    sheetMusic: [
      { label: '솔', activeIdx: [0] },
      { label: '솔', activeIdx: [1] },
      { label: '라', activeIdx: [2] },
      { label: '라', activeIdx: [3] },
      { label: '솔', activeIdx: [4] },
      { label: '솔', activeIdx: [5] },
      { label: '미', activeIdx: [6] },
      { label: '솔', activeIdx: [7] },
      { label: '솔', activeIdx: [8] },
      { label: '미', activeIdx: [9] },
      { label: '미', activeIdx: [10] },
      { label: '레', activeIdx: [11] },
      
      { label: '솔', activeIdx: [12] },
      { label: '솔', activeIdx: [13] },
      { label: '라', activeIdx: [14] },
      { label: '라', activeIdx: [15] },
      { label: '솔', activeIdx: [16] },
      { label: '솔', activeIdx: [17] },
      { label: '미', activeIdx: [18] },
      { label: '솔', activeIdx: [19] },
      { label: '미', activeIdx: [20] },
      { label: '레', activeIdx: [21] },
      { label: '미', activeIdx: [22] },
      { label: '도', activeIdx: [23] }
    ]
  },
  {
    title: '곰 세 마리',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '인기 동요',
    totalMeasures: 12,
    notes: [
      { keyIdx: 0, onset: 1000, hit: false },
      { keyIdx: 0, onset: 1600, hit: false },
      { keyIdx: 0, onset: 2200, hit: false },
      { keyIdx: 0, onset: 2800, hit: false },
      { keyIdx: 0, onset: 3400, hit: false },
      { keyIdx: 2, onset: 4000, hit: false },
      { keyIdx: 4, onset: 4600, hit: false },
      { keyIdx: 4, onset: 5200, hit: false },
      { keyIdx: 2, onset: 5800, hit: false },
      { keyIdx: 0, onset: 6400, hit: false },
      { keyIdx: 4, onset: 7000, hit: false },
      { keyIdx: 4, onset: 7600, hit: false },
      { keyIdx: 2, onset: 8200, hit: false },
      { keyIdx: 4, onset: 8800, hit: false },
      { keyIdx: 4, onset: 9400, hit: false },
      { keyIdx: 2, onset: 10000, hit: false },
      
      // 아빠곰은 뚱뚱해
      { keyIdx: 4, onset: 11200, hit: false },
      { keyIdx: 4, onset: 11800, hit: false },
      { keyIdx: 2, onset: 12400, hit: false },
      { keyIdx: 0, onset: 13000, hit: false },
      { keyIdx: 4, onset: 13600, hit: false },
      { keyIdx: 4, onset: 14200, hit: false },
      { keyIdx: 4, onset: 14800, hit: false },
      // 엄마곰은 날씬해
      { keyIdx: 5, onset: 15800, hit: false },
      { keyIdx: 5, onset: 16400, hit: false },
      { keyIdx: 4, onset: 17000, hit: false },
      { keyIdx: 4, onset: 17600, hit: false },
      { keyIdx: 2, onset: 18200, hit: false },
      { keyIdx: 1, onset: 18800, hit: false },
      { keyIdx: 0, onset: 19400, hit: false },
      // 아기곰은 너무 귀여워
      { keyIdx: 4, onset: 20400, hit: false },
      { keyIdx: 4, onset: 21000, hit: false },
      { keyIdx: 4, onset: 21600, hit: false },
      { keyIdx: 2, onset: 22200, hit: false },
      { keyIdx: 1, onset: 22800, hit: false },
      { keyIdx: 1, onset: 23400, hit: false },
      { keyIdx: 1, onset: 24000, hit: false },
      { keyIdx: 0, onset: 24600, hit: false },
      // 으쓱 으쓱 잘한다
      { keyIdx: 4, onset: 25600, hit: false },
      { keyIdx: 2, onset: 26200, hit: false },
      { keyIdx: 4, onset: 26800, hit: false },
      { keyIdx: 2, onset: 27400, hit: false },
      { keyIdx: 1, onset: 28000, hit: false },
      { keyIdx: 1, onset: 28600, hit: false },
      { keyIdx: 1, onset: 29200, hit: false },
      { keyIdx: 0, onset: 29800, hit: false },
      { keyIdx: 0, onset: 30400, hit: false }
    ],
    sheetMusic: [
      { label: '도', activeIdx: [0] },
      { label: '도', activeIdx: [1] },
      { label: '도', activeIdx: [2] },
      { label: '도', activeIdx: [3] },
      { label: '도', activeIdx: [4] },
      { label: '미', activeIdx: [5] },
      { label: '솔', activeIdx: [6] },
      { label: '솔', activeIdx: [7] },
      { label: '미', activeIdx: [8] },
      { label: '도', activeIdx: [9] },
      { label: '솔', activeIdx: [10] },
      { label: '솔', activeIdx: [11] },
      { label: '미', activeIdx: [12] },
      { label: '솔', activeIdx: [13] },
      { label: '솔', activeIdx: [14] },
      { label: '미', activeIdx: [15] },
      
      { label: '솔', activeIdx: [16] },
      { label: '솔', activeIdx: [17] },
      { label: '미', activeIdx: [18] },
      { label: '도', activeIdx: [19] },
      { label: '솔', activeIdx: [20] },
      { label: '솔', activeIdx: [21] },
      { label: '솔', activeIdx: [22] },
      { label: '라', activeIdx: [23] },
      { label: '라', activeIdx: [24] },
      { label: '솔', activeIdx: [25] },
      { label: '솔', activeIdx: [26] },
      { label: '미', activeIdx: [27] },
      { label: '레', activeIdx: [28] },
      { label: '도', activeIdx: [29] },
      { label: '솔', activeIdx: [30] },
      { label: '솔', activeIdx: [31] },
      { label: '솔', activeIdx: [32] },
      { label: '미', activeIdx: [33] },
      { label: '레', activeIdx: [34] },
      { label: '레', activeIdx: [35] },
      { label: '레', activeIdx: [36] },
      { label: '도', activeIdx: [37] },
      { label: '솔', activeIdx: [38] },
      { label: '미', activeIdx: [39] },
      { label: '솔', activeIdx: [40] },
      { label: '미', activeIdx: [41] },
      { label: '레', activeIdx: [42] },
      { label: '레', activeIdx: [43] },
      { label: '레', activeIdx: [44] },
      { label: '도', activeIdx: [45] },
      { label: '도', activeIdx: [46] }
    ]
  },
  {
    title: '자장가 (브람스)',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '명작 클래식',
    totalMeasures: 4,
    notes: [
      { keyIdx: 2, onset: 1000, hit: false },
      { keyIdx: 2, onset: 1800, hit: false },
      { keyIdx: 4, onset: 2600, hit: false },
      { keyIdx: 2, onset: 3600, hit: false },
      { keyIdx: 2, onset: 4400, hit: false },
      { keyIdx: 4, onset: 5200, hit: false },
      { keyIdx: 2, onset: 6200, hit: false },
      { keyIdx: 4, onset: 7000, hit: false },
      { keyIdx: 7, onset: 7800, hit: false },
      { keyIdx: 6, onset: 8800, hit: false },
      { keyIdx: 5, onset: 9600, hit: false },
      { keyIdx: 5, onset: 10400, hit: false },
      { keyIdx: 4, onset: 11400, hit: false }
    ],
    sheetMusic: [
      { label: '미', activeIdx: [0] },
      { label: '미', activeIdx: [1] },
      { label: '솔', activeIdx: [2] },
      { label: '미', activeIdx: [3] },
      { label: '미', activeIdx: [4] },
      { label: '솔', activeIdx: [5] },
      { label: '미', activeIdx: [6] },
      { label: '솔', activeIdx: [7] },
      { label: '도', activeIdx: [8] },
      { label: '시', activeIdx: [9] },
      { label: '라', activeIdx: [10] },
      { label: '라', activeIdx: [11] },
      { label: '솔', activeIdx: [12] }
    ]
  },
  {
    title: '엘리제를 위하여',
    stars: '★★★★☆',
    difficultyRaw: 4,
    badge: '명작 클래식',
    totalMeasures: 6,
    notes: [
      { keyIdx: 9, onset: 1000, hit: false },
      { keyIdx: 8, onset: 1600, hit: false },
      { keyIdx: 9, onset: 2200, hit: false },
      { keyIdx: 8, onset: 2800, hit: false },
      { keyIdx: 9, onset: 3400, hit: false },
      { keyIdx: 6, onset: 4000, hit: false },
      { keyIdx: 8, onset: 4600, hit: false },
      { keyIdx: 7, onset: 5200, hit: false },
      { keyIdx: 5, onset: 5800, hit: false },
      { keyIdx: 0, onset: 6800, hit: false },
      { keyIdx: 2, onset: 7400, hit: false },
      { keyIdx: 5, onset: 8000, hit: false },
      { keyIdx: 6, onset: 8600, hit: false }
    ],
    sheetMusic: [
      { label: '미', activeIdx: [0] },
      { label: '레', activeIdx: [1] },
      { label: '미', activeIdx: [2] },
      { label: '레', activeIdx: [3] },
      { label: '미', activeIdx: [4] },
      { label: '시', activeIdx: [5] },
      { label: '레', activeIdx: [6] },
      { label: '도', activeIdx: [7] },
      { label: '라', activeIdx: [8] },
      { label: '도', activeIdx: [9] },
      { label: '미', activeIdx: [10] },
      { label: '라', activeIdx: [11] },
      { label: '시', activeIdx: [12] }
    ]
  },
  {
    title: '고향의 봄',
    stars: '★★★☆☆',
    difficultyRaw: 3,
    badge: '민요/가곡',
    totalMeasures: 4,
    notes: [
      { keyIdx: 4, onset: 1000, hit: false },
      { keyIdx: 4, onset: 1800, hit: false },
      { keyIdx: 2, onset: 2600, hit: false },
      { keyIdx: 3, onset: 3400, hit: false },
      { keyIdx: 4, onset: 4200, hit: false },
      { keyIdx: 5, onset: 5000, hit: false },
      { keyIdx: 5, onset: 5800, hit: false },
      { keyIdx: 4, onset: 6600, hit: false },
      { keyIdx: 4, onset: 7600, hit: false },
      { keyIdx: 7, onset: 8400, hit: false },
      { keyIdx: 6, onset: 9200, hit: false },
      { keyIdx: 5, onset: 10000, hit: false },
      { keyIdx: 4, onset: 10800, hit: false }
    ],
    sheetMusic: [
      { label: '솔', activeIdx: [0] },
      { label: '솔', activeIdx: [1] },
      { label: '미', activeIdx: [2] },
      { label: '파', activeIdx: [3] },
      { label: '솔', activeIdx: [4] },
      { label: '라', activeIdx: [5] },
      { label: '라', activeIdx: [6] },
      { label: '솔', activeIdx: [7] },
      { label: '솔', activeIdx: [8] },
      { label: '도', activeIdx: [9] },
      { label: '시', activeIdx: [10] },
      { label: '라', activeIdx: [11] },
      { label: '솔', activeIdx: [12] }
    ]
  },
  {
    title: '아리랑',
    stars: '★★★☆☆',
    difficultyRaw: 3,
    badge: '민요/가곡',
    totalMeasures: 4,
    notes: [
      { keyIdx: 0, onset: 1000, hit: false },
      { keyIdx: 1, onset: 1800, hit: false },
      { keyIdx: 2, onset: 2600, hit: false },
      { keyIdx: 2, onset: 3400, hit: false },
      { keyIdx: 1, onset: 4200, hit: false },
      { keyIdx: 2, onset: 5000, hit: false },
      { keyIdx: 1, onset: 5800, hit: false },
      { keyIdx: 0, onset: 6600, hit: false },
      { keyIdx: 5, onset: 7600, hit: false },
      { keyIdx: 7, onset: 8400, hit: false },
      { keyIdx: 5, onset: 9200, hit: false },
      { keyIdx: 4, onset: 10000, hit: false }
    ],
    sheetMusic: [
      { label: '도', activeIdx: [0] },
      { label: '레', activeIdx: [1] },
      { label: '미', activeIdx: [2] },
      { label: '미', activeIdx: [3] },
      { label: '레', activeIdx: [4] },
      { label: '미', activeIdx: [5] },
      { label: '레', activeIdx: [6] },
      { label: '도', activeIdx: [7] },
      { label: '라', activeIdx: [8] },
      { label: '도', activeIdx: [9] },
      { label: '라', activeIdx: [10] },
      { label: '솔', activeIdx: [11] }
    ]
  },
  {
    title: '도레미 송',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '음악 교과서',
    totalMeasures: 4,
    notes: [
      { keyIdx: 0, onset: 1000, hit: false },
      { keyIdx: 1, onset: 1800, hit: false },
      { keyIdx: 2, onset: 2600, hit: false },
      { keyIdx: 0, onset: 3400, hit: false },
      { keyIdx: 2, onset: 4200, hit: false },
      { keyIdx: 0, onset: 5000, hit: false },
      { keyIdx: 2, onset: 5800, hit: false },
      { keyIdx: 1, onset: 6800, hit: false },
      { keyIdx: 2, onset: 7600, hit: false },
      { keyIdx: 3, onset: 8400, hit: false },
      { keyIdx: 3, onset: 9200, hit: false },
      { keyIdx: 2, onset: 10000, hit: false },
      { keyIdx: 1, onset: 10800, hit: false },
      { keyIdx: 3, onset: 11600, hit: false }
    ],
    sheetMusic: [
      { label: '도', activeIdx: [0] },
      { label: '레', activeIdx: [1] },
      { label: '미', activeIdx: [2] },
      { label: '도', activeIdx: [3] },
      { label: '미', activeIdx: [4] },
      { label: '도', activeIdx: [5] },
      { label: '미', activeIdx: [6] },
      { label: '레', activeIdx: [7] },
      { label: '미', activeIdx: [8] },
      { label: '파', activeIdx: [9] },
      { label: '파', activeIdx: [10] },
      { label: '미', activeIdx: [11] },
      { label: '레', activeIdx: [12] },
      { label: '파', activeIdx: [13] }
    ]
  },
  {
    title: '에델바이스',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '음악 교과서',
    totalMeasures: 4,
    notes: [
      { keyIdx: 2, onset: 1000, hit: false },
      { keyIdx: 4, onset: 2000, hit: false },
      { keyIdx: 8, onset: 3000, hit: false },
      { keyIdx: 7, onset: 4000, hit: false },
      { keyIdx: 4, onset: 5000, hit: false },
      { keyIdx: 3, onset: 6000, hit: false },
      { keyIdx: 2, onset: 7000, hit: false },
      { keyIdx: 2, onset: 8000, hit: false },
      { keyIdx: 2, onset: 9000, hit: false },
      { keyIdx: 3, onset: 10000, hit: false },
      { keyIdx: 4, onset: 11000, hit: false },
      { keyIdx: 5, onset: 12000, hit: false }
    ],
    sheetMusic: [
      { label: '미', activeIdx: [0] },
      { label: '솔', activeIdx: [1] },
      { label: '레', activeIdx: [2] },
      { label: '도', activeIdx: [3] },
      { label: '솔', activeIdx: [4] },
      { label: '파', activeIdx: [5] },
      { label: '미', activeIdx: [6] },
      { label: '미', activeIdx: [7] },
      { label: '미', activeIdx: [8] },
      { label: '파', activeIdx: [9] },
      { label: '솔', activeIdx: [10] },
      { label: '라', activeIdx: [11] }
    ]
  },
  {
    title: '사계 중 "봄" (비발디)',
    stars: '★★★☆☆',
    difficultyRaw: 3,
    badge: '명작 클래식',
    totalMeasures: 4,
    notes: [
      { keyIdx: 7, onset: 1000, hit: false },
      { keyIdx: 9, onset: 1800, hit: false },
      { keyIdx: 9, onset: 2600, hit: false },
      { keyIdx: 9, onset: 3400, hit: false },
      { keyIdx: 8, onset: 4200, hit: false },
      { keyIdx: 7, onset: 5000, hit: false },
      { keyIdx: 4, onset: 5800, hit: false },
      { keyIdx: 4, onset: 6800, hit: false },
      { keyIdx: 8, onset: 7600, hit: false },
      { keyIdx: 9, onset: 8400, hit: false },
      { keyIdx: 9, onset: 9200, hit: false },
      { keyIdx: 9, onset: 10000, hit: false },
      { keyIdx: 8, onset: 10800, hit: false },
      { keyIdx: 7, onset: 11600, hit: false }
    ],
    sheetMusic: [
      { label: '도', activeIdx: [0] },
      { label: '미', activeIdx: [1] },
      { label: '미', activeIdx: [2] },
      { label: '미', activeIdx: [3] },
      { label: '레', activeIdx: [4] },
      { label: '도', activeIdx: [5] },
      { label: '솔', activeIdx: [6] },
      { label: '솔', activeIdx: [7] },
      { label: '레', activeIdx: [8] },
      { label: '미', activeIdx: [9] },
      { label: '미', activeIdx: [10] },
      { label: '미', activeIdx: [11] },
      { label: '레', activeIdx: [12] },
      { label: '도', activeIdx: [13] }
    ]
  },
  {
    title: '즐거운 나의 집',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '음악 교과서',
    totalMeasures: 4,
    notes: [
      { keyIdx: 0, onset: 1000, hit: false },
      { keyIdx: 1, onset: 1800, hit: false },
      { keyIdx: 2, onset: 2600, hit: false },
      { keyIdx: 4, onset: 3400, hit: false },
      { keyIdx: 4, onset: 4200, hit: false },
      { keyIdx: 3, onset: 5000, hit: false },
      { keyIdx: 2, onset: 5800, hit: false },
      { keyIdx: 1, onset: 6600, hit: false },
      { keyIdx: 2, onset: 7400, hit: false },
      { keyIdx: 3, onset: 8200, hit: false },
      { keyIdx: 1, onset: 9000, hit: false },
      { keyIdx: 0, onset: 9800, hit: false }
    ],
    sheetMusic: [
      { label: '도', activeIdx: [0] },
      { label: '레', activeIdx: [1] },
      { label: '미', activeIdx: [2] },
      { label: '솔', activeIdx: [3] },
      { label: '솔', activeIdx: [4] },
      { label: '파', activeIdx: [5] },
      { label: '미', activeIdx: [6] },
      { label: '레', activeIdx: [7] },
      { label: '미', activeIdx: [8] },
      { label: '파', activeIdx: [9] },
      { label: '레', activeIdx: [10] },
      { label: '도', activeIdx: [11] }
    ]
  },
  {
    title: '송어 (슈베르트)',
    stars: '★★★☆☆',
    difficultyRaw: 3,
    badge: '명작 클래식',
    totalMeasures: 4,
    notes: [
      { keyIdx: 0, onset: 1000, hit: false },
      { keyIdx: 2, onset: 1800, hit: false },
      { keyIdx: 4, onset: 2600, hit: false },
      { keyIdx: 7, onset: 3400, hit: false },
      { keyIdx: 8, onset: 4200, hit: false },
      { keyIdx: 9, onset: 5000, hit: false },
      { keyIdx: 7, onset: 5800, hit: false },
      { keyIdx: 8, onset: 6600, hit: false },
      { keyIdx: 8, onset: 7400, hit: false },
      { keyIdx: 7, onset: 8200, hit: false }
    ],
    sheetMusic: [
      { label: '도', activeIdx: [0] },
      { label: '미', activeIdx: [1] },
      { label: '솔', activeIdx: [2] },
      { label: '도', activeIdx: [3] },
      { label: '레', activeIdx: [4] },
      { label: '미', activeIdx: [5] },
      { label: '도', activeIdx: [6] },
      { label: '레', activeIdx: [7] },
      { label: '레', activeIdx: [8] },
      { label: '도', activeIdx: [9] }
    ]
  },
  {
    title: '들장미 (슈베르트)',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '명작 클래식',
    totalMeasures: 4,
    notes: [
      { keyIdx: 4, onset: 1000, hit: false },
      { keyIdx: 5, onset: 1800, hit: false },
      { keyIdx: 4, onset: 2600, hit: false },
      { keyIdx: 2, onset: 3400, hit: false },
      { keyIdx: 0, onset: 4200, hit: false },
      { keyIdx: 1, onset: 5000, hit: false },
      { keyIdx: 2, onset: 5800, hit: false },
      { keyIdx: 2, onset: 6600, hit: false },
      { keyIdx: 1, onset: 7400, hit: false }
    ],
    sheetMusic: [
      { label: '솔', activeIdx: [0] },
      { label: '라', activeIdx: [1] },
      { label: '솔', activeIdx: [2] },
      { label: '미', activeIdx: [3] },
      { label: '도', activeIdx: [4] },
      { label: '레', activeIdx: [5] },
      { label: '미', activeIdx: [6] },
      { label: '미', activeIdx: [7] },
      { label: '레', activeIdx: [8] }
    ]
  },
  {
    title: '사랑의 기쁨',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '명작 클래식',
    totalMeasures: 4,
    notes: [
      { keyIdx: 0, onset: 1000, hit: false },
      { keyIdx: 2, onset: 1800, hit: false },
      { keyIdx: 4, onset: 2600, hit: false },
      { keyIdx: 7, onset: 3400, hit: false },
      { keyIdx: 6, onset: 4200, hit: false },
      { keyIdx: 5, onset: 5000, hit: false },
      { keyIdx: 4, onset: 5800, hit: false },
      { keyIdx: 3, onset: 6600, hit: false },
      { keyIdx: 2, onset: 7400, hit: false },
      { keyIdx: 1, onset: 8200, hit: false },
      { keyIdx: 0, onset: 9000, hit: false }
    ],
    sheetMusic: [
      { label: '도', activeIdx: [0] },
      { label: '미', activeIdx: [1] },
      { label: '솔', activeIdx: [2] },
      { label: '도', activeIdx: [3] },
      { label: '시', activeIdx: [4] },
      { label: '라', activeIdx: [5] },
      { label: '솔', activeIdx: [6] },
      { label: '파', activeIdx: [7] },
      { label: '미', activeIdx: [8] },
      { label: '레', activeIdx: [9] },
      { label: '도', activeIdx: [10] }
    ]
  },
  {
    title: '생일 축하 노래',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '연습곡',
    totalMeasures: 4,
    notes: [
      { keyIdx: 4, onset: 1000, hit: false },
      { keyIdx: 4, onset: 1600, hit: false },
      { keyIdx: 5, onset: 2200, hit: false },
      { keyIdx: 4, onset: 3000, hit: false },
      { keyIdx: 7, onset: 3800, hit: false },
      { keyIdx: 6, onset: 4600, hit: false },
      { keyIdx: 4, onset: 5600, hit: false },
      { keyIdx: 4, onset: 6200, hit: false },
      { keyIdx: 5, onset: 6800, hit: false },
      { keyIdx: 4, onset: 7600, hit: false },
      { keyIdx: 8, onset: 8400, hit: false },
      { keyIdx: 7, onset: 9200, hit: false }
    ],
    sheetMusic: [
      { label: '솔', activeIdx: [0] },
      { label: '솔', activeIdx: [1] },
      { label: '라', activeIdx: [2] },
      { label: '솔', activeIdx: [3] },
      { label: '도', activeIdx: [4] },
      { label: '시', activeIdx: [5] },
      { label: '솔', activeIdx: [6] },
      { label: '솔', activeIdx: [7] },
      { label: '라', activeIdx: [8] },
      { label: '솔', activeIdx: [9] },
      { label: '레', activeIdx: [10] },
      { label: '도', activeIdx: [11] }
    ]
  },
  {
    title: '할아버지의 낡은 시계',
    stars: '★★★☆☆',
    difficultyRaw: 3,
    badge: '인기 가곡',
    totalMeasures: 4,
    notes: [
      { keyIdx: 0, onset: 1000, hit: false },
      { keyIdx: 2, onset: 1800, hit: false },
      { keyIdx: 3, onset: 2600, hit: false },
      { keyIdx: 4, onset: 3400, hit: false },
      { keyIdx: 7, onset: 4200, hit: false },
      { keyIdx: 8, onset: 5000, hit: false },
      { keyIdx: 9, onset: 5800, hit: false },
      { keyIdx: 8, onset: 6600, hit: false },
      { keyIdx: 7, onset: 7400, hit: false },
      { keyIdx: 6, onset: 8200, hit: false },
      { keyIdx: 5, onset: 9000, hit: false },
      { keyIdx: 4, onset: 9800, hit: false }
    ],
    sheetMusic: [
      { label: '도', activeIdx: [0] },
      { label: '미', activeIdx: [1] },
      { label: '파', activeIdx: [2] },
      { label: '솔', activeIdx: [3] },
      { label: '도', activeIdx: [4] },
      { label: '레', activeIdx: [5] },
      { label: '미', activeIdx: [6] },
      { label: '레', activeIdx: [7] },
      { label: '도', activeIdx: [8] },
      { label: '시', activeIdx: [9] },
      { label: '라', activeIdx: [10] },
      { label: '솔', activeIdx: [11] }
    ]
  },
  {
    title: '옹달샘',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '유치 동요',
    totalMeasures: 4,
    notes: [
      { keyIdx: 2, onset: 1000, hit: false },
      { keyIdx: 4, onset: 1800, hit: false },
      { keyIdx: 4, onset: 2600, hit: false },
      { keyIdx: 2, onset: 3400, hit: false },
      { keyIdx: 4, onset: 4200, hit: false },
      { keyIdx: 4, onset: 5000, hit: false },
      { keyIdx: 5, onset: 5800, hit: false },
      { keyIdx: 5, onset: 6600, hit: false },
      { keyIdx: 4, onset: 7400, hit: false },
      { keyIdx: 2, onset: 8200, hit: false },
      { keyIdx: 1, onset: 9000, hit: false },
      { keyIdx: 2, onset: 9800, hit: false },
      { keyIdx: 0, onset: 10600, hit: false }
    ],
    sheetMusic: [
      { label: '미', activeIdx: [0] },
      { label: '솔', activeIdx: [1] },
      { label: '솔', activeIdx: [2] },
      { label: '미', activeIdx: [3] },
      { label: '솔', activeIdx: [4] },
      { label: '솔', activeIdx: [5] },
      { label: '라', activeIdx: [6] },
      { label: '라', activeIdx: [7] },
      { label: '솔', activeIdx: [8] },
      { label: '미', activeIdx: [9] },
      { label: '레', activeIdx: [10] },
      { label: '미', activeIdx: [11] },
      { label: '도', activeIdx: [12] }
    ]
  },
  {
    title: '고요한 밤 거룩한 밤',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '크리스마스',
    totalMeasures: 4,
    notes: [
      { keyIdx: 4, onset: 1000, hit: false },
      { keyIdx: 5, onset: 1800, hit: false },
      { keyIdx: 4, onset: 2600, hit: false },
      { keyIdx: 2, onset: 3400, hit: false },
      { keyIdx: 4, onset: 4200, hit: false },
      { keyIdx: 5, onset: 5000, hit: false },
      { keyIdx: 4, onset: 5800, hit: false },
      { keyIdx: 2, onset: 6600, hit: false },
      { keyIdx: 8, onset: 7600, hit: false },
      { keyIdx: 8, onset: 8400, hit: false },
      { keyIdx: 6, onset: 9200, hit: false },
      { keyIdx: 7, onset: 10000, hit: false },
      { keyIdx: 7, onset: 10800, hit: false },
      { keyIdx: 4, onset: 11600, hit: false }
    ],
    sheetMusic: [
      { label: '솔', activeIdx: [0] },
      { label: '라', activeIdx: [1] },
      { label: '솔', activeIdx: [2] },
      { label: '미', activeIdx: [3] },
      { label: '솔', activeIdx: [4] },
      { label: '라', activeIdx: [5] },
      { label: '솔', activeIdx: [6] },
      { label: '미', activeIdx: [7] },
      { label: '레', activeIdx: [8] },
      { label: '레', activeIdx: [9] },
      { label: '시', activeIdx: [10] },
      { label: '도', activeIdx: [11] },
      { label: '도', activeIdx: [12] },
      { label: '솔', activeIdx: [13] }
    ]
  },
  {
    title: '클레멘타인',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '음악 교과서',
    totalMeasures: 4,
    notes: [
      { keyIdx: 0, onset: 1000, hit: false },
      { keyIdx: 0, onset: 1800, hit: false },
      { keyIdx: 0, onset: 2600, hit: false },
      { keyIdx: 4, onset: 3400, hit: false },
      { keyIdx: 2, onset: 4200, hit: false },
      { keyIdx: 2, onset: 5000, hit: false },
      { keyIdx: 2, onset: 5800, hit: false },
      { keyIdx: 0, onset: 6600, hit: false },
      { keyIdx: 0, onset: 7400, hit: false },
      { keyIdx: 2, onset: 8200, hit: false },
      { keyIdx: 4, onset: 9000, hit: false },
      { keyIdx: 4, onset: 9800, hit: false },
      { keyIdx: 3, onset: 10600, hit: false },
      { keyIdx: 2, onset: 11400, hit: false },
      { keyIdx: 1, onset: 12200, hit: false }
    ],
    sheetMusic: [
      { label: '도', activeIdx: [0] },
      { label: '도', activeIdx: [1] },
      { label: '도', activeIdx: [2] },
      { label: '솔', activeIdx: [3] },
      { label: '미', activeIdx: [4] },
      { label: '미', activeIdx: [5] },
      { label: '미', activeIdx: [6] },
      { label: '도', activeIdx: [7] },
      { label: '도', activeIdx: [8] },
      { label: '미', activeIdx: [9] },
      { label: '솔', activeIdx: [10] },
      { label: '솔', activeIdx: [11] },
      { label: '파', activeIdx: [12] },
      { label: '미', activeIdx: [13] },
      { label: '레', activeIdx: [14] }
    ]
  },
  {
    title: '등대지기',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '음악 교과서',
    totalMeasures: 4,
    notes: [
      { keyIdx: 0, onset: 1000, hit: false },
      { keyIdx: 2, onset: 1800, hit: false },
      { keyIdx: 4, onset: 2600, hit: false },
      { keyIdx: 7, onset: 3400, hit: false },
      { keyIdx: 7, onset: 4200, hit: false },
      { keyIdx: 6, onset: 5000, hit: false },
      { keyIdx: 5, onset: 5800, hit: false },
      { keyIdx: 4, onset: 6600, hit: false },
      { keyIdx: 2, onset: 7400, hit: false },
      { keyIdx: 1, onset: 8200, hit: false },
      { keyIdx: 0, onset: 9000, hit: false },
      { keyIdx: 1, onset: 9800, hit: false },
      { keyIdx: 2, onset: 10600, hit: false }
    ],
    sheetMusic: [
      { label: '도', activeIdx: [0] },
      { label: '미', activeIdx: [1] },
      { label: '솔', activeIdx: [2] },
      { label: '도', activeIdx: [3] },
      { label: '도', activeIdx: [4] },
      { label: '시', activeIdx: [5] },
      { label: '라', activeIdx: [6] },
      { label: '솔', activeIdx: [7] },
      { label: '미', activeIdx: [8] },
      { label: '레', activeIdx: [9] },
      { label: '도', activeIdx: [10] },
      { label: '레', activeIdx: [11] },
      { label: '미', activeIdx: [12] }
    ]
  },
  {
    title: '작별',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '가곡',
    totalMeasures: 4,
    notes: [
      { keyIdx: 0, onset: 1000, hit: false },
      { keyIdx: 1, onset: 1800, hit: false },
      { keyIdx: 0, onset: 2600, hit: false },
      { keyIdx: 2, onset: 3400, hit: false },
      { keyIdx: 1, onset: 4200, hit: false },
      { keyIdx: 0, onset: 5000, hit: false },
      { keyIdx: 1, onset: 5800, hit: false },
      { keyIdx: 2, onset: 6600, hit: false },
      { keyIdx: 4, onset: 7600, hit: false },
      { keyIdx: 5, onset: 8400, hit: false }
    ],
    sheetMusic: [
      { label: '도', activeIdx: [0] },
      { label: '레', activeIdx: [1] },
      { label: '도', activeIdx: [2] },
      { label: '미', activeIdx: [3] },
      { label: '레', activeIdx: [4] },
      { label: '도', activeIdx: [5] },
      { label: '레', activeIdx: [6] },
      { label: '미', activeIdx: [7] },
      { label: '솔', activeIdx: [8] },
      { label: '라', activeIdx: [9] }
    ]
  },
  {
    title: '바둑이 방울',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '기초 동요',
    totalMeasures: 4,
    notes: [
      { keyIdx: 0, onset: 1000, hit: false },
      { keyIdx: 1, onset: 1800, hit: false },
      { keyIdx: 2, onset: 2600, hit: false },
      { keyIdx: 3, onset: 3400, hit: false },
      { keyIdx: 4, onset: 4200, hit: false },
      { keyIdx: 5, onset: 5000, hit: false },
      { keyIdx: 4, onset: 5800, hit: false },
      { keyIdx: 2, onset: 6600, hit: false },
      { keyIdx: 0, onset: 7400, hit: false },
      { keyIdx: 2, onset: 8200, hit: false },
      { keyIdx: 1, onset: 9000, hit: false },
      { keyIdx: 0, onset: 9800, hit: false }
    ],
    sheetMusic: [
      { label: '도', activeIdx: [0] },
      { label: '레', activeIdx: [1] },
      { label: '미', activeIdx: [2] },
      { label: '파', activeIdx: [3] },
      { label: '솔', activeIdx: [4] },
      { label: '라', activeIdx: [5] },
      { label: '솔', activeIdx: [6] },
      { label: '미', activeIdx: [7] },
      { label: '도', activeIdx: [8] },
      { label: '미', activeIdx: [9] },
      { label: '레', activeIdx: [10] },
      { label: '도', activeIdx: [11] }
    ]
  },
  {
    title: '멋쟁이 토마토',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '인기 동요',
    totalMeasures: 4,
    notes: [
      { keyIdx: 0, onset: 1000, hit: false },
      { keyIdx: 2, onset: 1800, hit: false },
      { keyIdx: 4, onset: 2600, hit: false },
      { keyIdx: 4, onset: 3400, hit: false },
      { keyIdx: 3, onset: 4200, hit: false },
      { keyIdx: 3, onset: 5000, hit: false },
      { keyIdx: 2, onset: 5800, hit: false },
      { keyIdx: 1, onset: 6600, hit: false },
      { keyIdx: 1, onset: 7400, hit: false },
      { keyIdx: 0, onset: 8200, hit: false }
    ],
    sheetMusic: [
      { label: '도', activeIdx: [0] },
      { label: '미', activeIdx: [1] },
      { label: '솔', activeIdx: [2] },
      { label: '솔', activeIdx: [3] },
      { label: '파', activeIdx: [4] },
      { label: '파', activeIdx: [5] },
      { label: '미', activeIdx: [6] },
      { label: '레', activeIdx: [7] },
      { label: '레', activeIdx: [8] },
      { label: '도', activeIdx: [9] }
    ]
  },
  {
    title: '섬집 아기',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '가곡 동요',
    totalMeasures: 4,
    notes: [
      { keyIdx: 2, onset: 1000, hit: false },
      { keyIdx: 4, onset: 1800, hit: false },
      { keyIdx: 5, onset: 2600, hit: false },
      { keyIdx: 5, onset: 3400, hit: false },
      { keyIdx: 4, onset: 4200, hit: false },
      { keyIdx: 2, onset: 5000, hit: false },
      { keyIdx: 4, onset: 5800, hit: false },
      { keyIdx: 5, onset: 6600, hit: false },
      { keyIdx: 4, onset: 7400, hit: false },
      { keyIdx: 2, onset: 8200, hit: false },
      { keyIdx: 1, onset: 9000, hit: false }
    ],
    sheetMusic: [
      { label: '미', activeIdx: [0] },
      { label: '솔', activeIdx: [1] },
      { label: '라', activeIdx: [2] },
      { label: '라', activeIdx: [3] },
      { label: '솔', activeIdx: [4] },
      { label: '미', activeIdx: [5] },
      { label: '솔', activeIdx: [6] },
      { label: '라', activeIdx: [7] },
      { label: '솔', activeIdx: [8] },
      { label: '미', activeIdx: [9] },
      { label: '레', activeIdx: [10] }
    ]
  },
  {
    title: '소나무야',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '명작 클래식',
    totalMeasures: 4,
    notes: [
      { keyIdx: 4, onset: 1000, hit: false },
      { keyIdx: 7, onset: 1800, hit: false },
      { keyIdx: 7, onset: 2600, hit: false },
      { keyIdx: 7, onset: 3400, hit: false },
      { keyIdx: 8, onset: 4200, hit: false },
      { keyIdx: 9, onset: 5000, hit: false },
      { keyIdx: 9, onset: 5800, hit: false },
      { keyIdx: 9, onset: 6600, hit: false },
      { keyIdx: 8, onset: 7400, hit: false },
      { keyIdx: 9, onset: 8200, hit: false },
      { keyIdx: 3, onset: 9000, hit: false },
      { keyIdx: 6, onset: 9800, hit: false },
      { keyIdx: 8, onset: 10600, hit: false },
      { keyIdx: 7, onset: 11400, hit: false }
    ],
    sheetMusic: [
      { label: '솔', activeIdx: [0] },
      { label: '도', activeIdx: [1] },
      { label: '도', activeIdx: [2] },
      { label: '도', activeIdx: [3] },
      { label: '레', activeIdx: [4] },
      { label: '미', activeIdx: [5] },
      { label: '미', activeIdx: [6] },
      { label: '미', activeIdx: [7] },
      { label: '레', activeIdx: [8] },
      { label: '미', activeIdx: [9] },
      { label: '파', activeIdx: [10] },
      { label: '시', activeIdx: [11] },
      { label: '레', activeIdx: [12] },
      { label: '도', activeIdx: [13] }
    ]
  },
  {
    title: '신세계로부터 (드보르작)',
    stars: '★★☆☆☆',
    difficultyRaw: 2,
    badge: '명작 클래식',
    totalMeasures: 4,
    notes: [
      { keyIdx: 2, onset: 1000, hit: false },
      { keyIdx: 4, onset: 1800, hit: false },
      { keyIdx: 4, onset: 2600, hit: false },
      { keyIdx: 2, onset: 3400, hit: false },
      { keyIdx: 1, onset: 4200, hit: false },
      { keyIdx: 0, onset: 5000, hit: false },
      { keyIdx: 1, onset: 5800, hit: false },
      { keyIdx: 2, onset: 6600, hit: false },
      { keyIdx: 4, onset: 7400, hit: false },
      { keyIdx: 2, onset: 8200, hit: false },
      { keyIdx: 1, onset: 9000, hit: false }
    ],
    sheetMusic: [
      { label: '미', activeIdx: [0] },
      { label: '솔', activeIdx: [1] },
      { label: '솔', activeIdx: [2] },
      { label: '미', activeIdx: [3] },
      { label: '레', activeIdx: [4] },
      { label: '도', activeIdx: [5] },
      { label: '레', activeIdx: [6] },
      { label: '미', activeIdx: [7] },
      { label: '솔', activeIdx: [8] },
      { label: '미', activeIdx: [9] },
      { label: '레', activeIdx: [10] }
    ]
  }
];

// Helper database list for programmatic songs to generate exactly 100 tracks in total!
const ADDITIONAL_SONGS_META = [
  // 클래식 (Classical Masterpieces) - 20 additional
  { title: '미뉴에트 (바흐)', stars: '★★★☆☆', difficultyRaw: 3, badge: '클래식', melodyType: 'classical-3' },
  { title: '놀람 교향곡 (하이든)', stars: '★★☆☆☆', difficultyRaw: 2, badge: '클래식', melodyType: 'classical-2' },
  { title: '가보트 (고섹)', stars: '★★★☆☆', difficultyRaw: 3, badge: '클래식', melodyType: 'classical-3' },
  { title: '유모레스크 (드보르작)', stars: '★★★★☆', difficultyRaw: 4, badge: '클래식', melodyType: 'classical-4' },
  { title: '백조의 호수 (차이코프스키)', stars: '★★★☆☆', difficultyRaw: 3, badge: '클래식', melodyType: 'classical-3' },
  { title: '사랑의 슬픔 (크라이슬러)', stars: '★★★★☆', difficultyRaw: 4, badge: '클래식', melodyType: 'classical-4' },
  { title: '사랑의 기쁨 (마르티니)', stars: '★★★☆☆', difficultyRaw: 3, badge: '클래식', melodyType: 'classical-3' },
  { title: '즐거운 농부 (슈만)', stars: '★★☆☆☆', difficultyRaw: 2, badge: '클래식', melodyType: 'classical-2' },
  { title: '호두까기 인형 (차이코프스키)', stars: '★★★★☆', difficultyRaw: 4, badge: '클래식', melodyType: 'classical-4' },
  { title: '아베 마리아 (슈베르트)', stars: '★★★☆☆', difficultyRaw: 3, badge: '클래식', melodyType: 'classical-3' },
  { title: '녹턴 (쇼팽)', stars: '★★★★☆', difficultyRaw: 4, badge: '클래식', melodyType: 'classical-4' },
  { title: '카르멘 투우사의 노래 (비제)', stars: '★★★★☆', difficultyRaw: 4, badge: '클래식', melodyType: 'classical-4' },
  { title: '위풍당당 행진곡 (엘가)', stars: '★★★☆☆', difficultyRaw: 3, badge: '클래식', melodyType: 'classical-3' },
  { title: '헝가리 무곡 (브람스)', stars: '★★★★★', difficultyRaw: 5, badge: '클래식', melodyType: 'classical-5' },
  { title: '월광 소나타 (베토벤)', stars: '★★★★☆', difficultyRaw: 4, badge: '클래식', melodyType: 'classical-4' },
  { title: '봄의 소리 왈츠 (요한 스트라우스)', stars: '★★★★☆', difficultyRaw: 4, badge: '클래식', melodyType: 'classical-4' },
  { title: '미뉴에트 (베토벤)', stars: '★★★☆☆', difficultyRaw: 3, badge: '클래식', melodyType: 'classical-3' },
  { title: '라데츠키 행진곡 (스트라우스)', stars: '★★★★☆', difficultyRaw: 4, badge: '클래식', melodyType: 'classical-4' },
  { title: '금혼식 (마리)', stars: '★★★☆☆', difficultyRaw: 3, badge: '클래식', melodyType: 'classical-3' },
  { title: '군대 행진곡 (슈베르트)', stars: '★★★★☆', difficultyRaw: 4, badge: '클래식', melodyType: 'classical-4' },

  // 동요 (Nursery Rhymes & Kids) - 20 additional
  { title: '언덕 위의 집', stars: '★★☆☆☆', difficultyRaw: 2, badge: '동요', melodyType: 'rhyme-2' },
  { title: '여우야 여우야', stars: '★☆☆☆☆', difficultyRaw: 1, badge: '동요', melodyType: 'rhyme-1' },
  { title: '올챙이와 개구리', stars: '★★☆☆☆', difficultyRaw: 2, badge: '동요', melodyType: 'rhyme-2' },
  { title: '머리 어깨 무릎 발', stars: '★☆☆☆☆', difficultyRaw: 1, badge: '동요', melodyType: 'rhyme-1' },
  { title: '산토끼', stars: '★☆☆☆☆', difficultyRaw: 1, badge: '동요', melodyType: 'rhyme-1' },
  { title: '고기잡이', stars: '★★☆☆☆', difficultyRaw: 2, badge: '동요', melodyType: 'rhyme-2' },
  { title: '둥근 해가 떴습니다', stars: '★★☆☆☆', difficultyRaw: 2, badge: '동요', melodyType: 'rhyme-2' },
  { title: '사과 같은 내 얼굴', stars: '★☆☆☆☆', difficultyRaw: 1, badge: '동요', melodyType: 'rhyme-1' },
  { title: '아기 상어', stars: '★★★☆☆', difficultyRaw: 3, badge: '동요', melodyType: 'rhyme-3' },
  { title: '꼬마 눈사람', stars: '★★☆☆☆', difficultyRaw: 2, badge: '동요', melodyType: 'rhyme-2' },
  { title: '기차 타고 갈 때', stars: '★★☆☆☆', difficultyRaw: 2, badge: '동요', melodyType: 'rhyme-2' },
  { title: '바둑이와 고양이', stars: '★☆☆☆☆', difficultyRaw: 1, badge: '동요', melodyType: 'rhyme-1' },
  { title: '엄마 돼지 아기 돼지', stars: '★★☆☆☆', difficultyRaw: 2, badge: '동요', melodyType: 'rhyme-2' },
  { title: '빙고 (BINGO)', stars: '★★★☆☆', difficultyRaw: 3, badge: '동요', melodyType: 'rhyme-3' },
  { title: '도깨비 나라', stars: '★★☆☆☆', difficultyRaw: 2, badge: '동요', melodyType: 'rhyme-2' },
  { title: '뚱보 아저씨', stars: '★★☆☆☆', difficultyRaw: 2, badge: '동요', melodyType: 'rhyme-2' },
  { title: '퐁당퐁당', stars: '★☆☆☆☆', difficultyRaw: 1, badge: '동요', melodyType: 'rhyme-1' },
  { title: '우산', stars: '★★☆☆☆', difficultyRaw: 2, badge: '동요', melodyType: 'rhyme-2' },
  { title: '눈꽃송이', stars: '★★☆☆☆', difficultyRaw: 2, badge: '동요', melodyType: 'rhyme-2' },
  { title: '새싹들 마냥', stars: '★★☆☆☆', difficultyRaw: 2, badge: '동요', melodyType: 'rhyme-2' },

  // 가곡/민요 (Traditional Folk & Art Songs) - 15 additional
  { title: '오빠 생각', stars: '★★☆☆☆', difficultyRaw: 2, badge: '가곡/민요', melodyType: 'folk-2' },
  { title: '반달', stars: '★★☆☆☆', difficultyRaw: 2, badge: '가곡/민요', melodyType: 'folk-2' },
  { title: '오 솔레 미오', stars: '★★★☆☆', difficultyRaw: 3, badge: '가곡/민요', melodyType: 'folk-3' },
  { title: '오 수잔나', stars: '★★☆☆☆', difficultyRaw: 2, badge: '가곡/민요', melodyType: 'folk-2' },
  { title: '목장길 따라', stars: '★★☆☆☆', difficultyRaw: 2, badge: '가곡/민요', melodyType: 'folk-2' },
  { title: '스와니 강', stars: '★★★☆☆', difficultyRaw: 3, badge: '가곡/민요', melodyType: 'folk-3' },
  { title: '켄터키 옛집', stars: '★★★☆☆', difficultyRaw: 3, badge: '가곡/민요', melodyType: 'folk-3' },
  { title: '로렐라이', stars: '★★☆☆☆', difficultyRaw: 2, badge: '가곡/민요', melodyType: 'folk-2' },
  { title: '상록수', stars: '★★★☆☆', difficultyRaw: 3, badge: '가곡/민요', melodyType: 'folk-3' },
  { title: '봄 처녀', stars: '★★★☆☆', difficultyRaw: 3, badge: '가곡/민요', melodyType: 'folk-3' },
  { title: '과수원 길', stars: '★★☆☆☆', difficultyRaw: 2, badge: '가곡/민요', melodyType: 'folk-2' },
  { title: '푸른 잔디', stars: '★★☆☆☆', difficultyRaw: 2, badge: '가곡/민요', melodyType: 'folk-2' },
  { title: '보리밭', stars: '★★★☆☆', difficultyRaw: 3, badge: '가곡/민요', melodyType: 'folk-3' },
  { title: '고향 생각', stars: '★★☆☆☆', difficultyRaw: 2, badge: '가곡/민요', melodyType: 'folk-2' },
  { title: '메기의 추억', stars: '★★☆☆☆', difficultyRaw: 2, badge: '가곡/민요', melodyType: 'folk-2' },

  // 연습곡 (Practice Exercises & Scales) - 15 additional
  { title: '바이엘 1번 연습곡', stars: '★☆☆☆☆', difficultyRaw: 1, badge: '연습곡', melodyType: 'scale-easy' },
  { title: '바이엘 2번 연습곡', stars: '★☆☆☆☆', difficultyRaw: 1, badge: '연습곡', melodyType: 'scale-easy' },
  { title: '하농 1번 손가락 연습', stars: '★★★☆☆', difficultyRaw: 3, badge: '연습곡', melodyType: 'hanon-1' },
  { title: '하농 2번 손가락 연습', stars: '★★★☆☆', difficultyRaw: 3, badge: '연습곡', melodyType: 'hanon-2' },
  { title: '체르니 100번 No.1', stars: '★★★☆☆', difficultyRaw: 3, badge: '연습곡', melodyType: 'czerny-1' },
  { title: '체르니 100번 No.2', stars: '★★★☆☆', difficultyRaw: 3, badge: '연습곡', melodyType: 'czerny-2' },
  { title: '체르니 30번 No.1', stars: '★★★★☆', difficultyRaw: 4, badge: '연습곡', melodyType: 'czerny-3' },
  { title: '기초 도레미파솔 연습', stars: '★☆☆☆☆', difficultyRaw: 1, badge: '연습곡', melodyType: 'scale-updown' },
  { title: '도미솔미 아르페지오 연습', stars: '★★☆☆☆', difficultyRaw: 2, badge: '연습곡', melodyType: 'scale-arp1' },
  { title: '레파라파 마이너 연습', stars: '★★☆☆☆', difficultyRaw: 2, badge: '연습곡', melodyType: 'scale-arp2' },
  { title: '미솔시솔 메이저 연습', stars: '★★☆☆☆', difficultyRaw: 2, badge: '연습곡', melodyType: 'scale-arp3' },
  { title: '솔시레시 3화음 코드연습', stars: '★★☆☆☆', difficultyRaw: 2, badge: '연습곡', melodyType: 'scale-harmonic' },
  { title: '도레도레 상행 트릴연습', stars: '★★★☆☆', difficultyRaw: 3, badge: '연습곡', melodyType: 'trill-1' },
  { title: '레미레미 중급 트릴연습', stars: '★★★☆☆', difficultyRaw: 3, badge: '연습곡', melodyType: 'trill-2' },
  { title: '도시도시 하행 트릴연습', stars: '★★★☆☆', difficultyRaw: 3, badge: '연습곡', melodyType: 'trill-3' }
];

// Helper to expand songs programmatically
function initializeFullSongsDatabase() {
  const labelsMap = ['도', '레', '미', '파', '솔', '라', '시', '도', '레', '미'];
  
  ADDITIONAL_SONGS_META.forEach((meta) => {
    const notes = [];
    let basePitches = [];
    
    const scaleMap = {
      'scale-easy': [0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4],
      'scale-updown': [0, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5, 4, 3, 2, 1, 0],
      'scale-arp1': [0, 2, 4, 2, 0, 2, 4, 7, 7, 4, 2, 4, 0],
      'scale-arp2': [1, 3, 5, 3, 1, 3, 5, 8, 8, 5, 3, 5, 1],
      'scale-arp3': [2, 4, 6, 4, 2, 4, 6, 9, 9, 6, 4, 6, 2],
      'scale-harmonic': [4, 6, 8, 6, 4, 6, 8, 7, 5, 3, 1, 3, 0],
      'hanon-1': [0, 2, 3, 4, 5, 4, 3, 2, 1, 3, 4, 5, 6, 5, 4, 3, 2],
      'hanon-2': [1, 3, 4, 5, 6, 5, 4, 3, 2, 4, 5, 6, 7, 6, 5, 4, 3],
      'czerny-1': [0, 2, 4, 0, 2, 4, 7, 5, 4, 2, 4, 2, 0, 2, 0],
      'czerny-2': [2, 4, 7, 4, 2, 4, 7, 9, 7, 4, 2, 4, 2, 1, 0],
      'czerny-3': [0, 2, 4, 7, 9, 7, 4, 2, 0, 2, 4, 7, 9, 7, 0],
      'trill-1': [0, 1, 0, 1, 0, 1, 2, 3, 2, 3, 2, 3, 4, 5, 4, 5, 4],
      'trill-2': [1, 2, 1, 2, 1, 2, 3, 4, 3, 4, 3, 4, 5, 6, 5, 6, 5],
      'trill-3': [7, 6, 7, 6, 7, 6, 5, 4, 5, 4, 5, 4, 3, 2, 3, 2, 3]
    };
    
    if (scaleMap[meta.melodyType]) {
      basePitches = scaleMap[meta.melodyType];
    } else if (meta.melodyType.startsWith('classical')) {
      const offset = meta.difficultyRaw;
      basePitches = [2, 4, 7, 6, 5, 4, 2, 1, 0, 2, 4, 7, 6, 5, 4, 2, 0].map(v => Math.min(9, Math.max(0, v + (offset % 3) - 1)));
    } else if (meta.melodyType.startsWith('rhyme')) {
      const seed = meta.title.length;
      basePitches = [4, 2, 2, 3, 1, 1, 0, 2, 4, 4, 2, 2, 0].map(v => Math.min(9, Math.max(0, v + (seed % 3) - 1)));
    } else if (meta.melodyType.startsWith('folk')) {
      const seed = meta.title.length;
      basePitches = [0, 2, 3, 4, 6, 5, 4, 2, 0, 2, 4, 2, 0].map(v => Math.min(9, Math.max(0, v + (seed % 2))));
    } else {
      basePitches = [0, 2, 4, 5, 7, 6, 5, 4, 3, 2, 1, 0];
    }
    
    // 1. Expand the motif to a full-length 4-section song of ~50-65 notes
    const fullPitches = [];
    
    // Verse A
    fullPitches.push(...basePitches);
    
    // Verse B (slightly varied at the ending)
    const verse2 = basePitches.map((p, idx) => {
      if (idx >= basePitches.length - 4) {
        return Math.min(9, Math.max(0, p + 1));
      }
      return p;
    });
    fullPitches.push(...verse2);
    
    // Chorus (beautiful register transpose soaring high)
    const chorus = basePitches.map((p) => {
      return Math.min(9, Math.max(0, p + 2));
    });
    fullPitches.push(...chorus);
    
    // Outro (resolves gracefully on root '도' / key index 0)
    const outro = basePitches.map((p, idx) => {
      if (idx === basePitches.length - 1) return 0; // tonic resolution!
      if (idx === basePitches.length - 2) return 1; // leading note
      return p;
    });
    fullPitches.push(...outro);
    
    // 2. Assign precise speed and tempo (ms per note step) matching human speed
    let stepDuration = 800; // default moderate speed
    
    const fastTitles = ["헝가리 무곡", "카르멘", "라데츠키", "하농", "체르니", "트릴", "아기 상어", "올챙이", "꼬마 눈사람", "도깨비", "뚱보", "우산", "산토끼", "머리 어깨"];
    const slowTitles = ["아베 마리아", "녹턴", "반달", "오빠 생각", "월광", "로렐라이", "메기", "고향", "보리밭"];
    
    if (fastTitles.some(t => meta.title.includes(t))) {
      stepDuration = 520; // Fast Bouncing tempo (~115 BPM)
    } else if (slowTitles.some(t => meta.title.includes(t))) {
      stepDuration = 1250; // Slow classical tempo (~48 BPM)
    } else if (meta.badge === '연습곡') {
      stepDuration = 620; // Practice drills are agile
    } else if (meta.difficultyRaw >= 4) {
      stepDuration = 580; // Harder pieces are brisker
    }
    
    let currTime = 1000;
    fullPitches.forEach((p) => {
      notes.push({ keyIdx: p, onset: currTime, hit: false });
      currTime += stepDuration;
    });
    
    const sheetMusic = notes.map((note, sIdx) => {
      const label = labelsMap[note.keyIdx % 10] || '도';
      return { label: label, activeIdx: [sIdx] };
    });
    
    SONGS.push({
      title: meta.title,
      stars: meta.stars,
      difficultyRaw: meta.difficultyRaw,
      badge: meta.badge,
      totalMeasures: Math.ceil(notes.length / 4) + 1,
      notes: notes,
      sheetMusic: sheetMusic
    });
  });
  
  // 3. Make hardcoded songs also have energetic, authentic tempos
  // '작은 별' (index 0): 750ms step (around 80 BPM piano flow)
  if (SONGS[0] && SONGS[0].notes) {
    SONGS[0].notes.forEach(note => {
      note.onset = note.onset * 0.75;
    });
  }
  // '나비야 나비야' (index 1): 700ms step (around 85 BPM children tempo)
  if (SONGS[1] && SONGS[1].notes) {
    SONGS[1].notes.forEach(note => {
      note.onset = note.onset * 0.7;
    });
  }
}

// Automatically expand every single song in the SONGS database to a magnificent full length 4-part arrangement
function extendAllSongsToFullLength() {
  const labelsMap = ['도', '레', '미', '파', '솔', '라', '시', '도', '레', '미'];
  
  SONGS.forEach(song => {
    // We want to make sure EVERY single song is a full-length composition rather than a short snippet
    if (song.notes && song.notes.length > 0 && song.notes.length < 100) {
      const originalNotes = JSON.parse(JSON.stringify(song.notes));
      const originalSheet = JSON.parse(JSON.stringify(song.sheetMusic || []));
      const count = originalNotes.length;
      
      // Calculate average note offset step duration / stride
      let stepGap = 1000;
      if (count > 1) {
        let sum = 0;
        for (let i = 1; i < count; i++) {
          sum += (originalNotes[i].onset - originalNotes[i - 1].onset);
        }
        stepGap = sum / (count - 1);
        if (stepGap <= 0) stepGap = 800;
      }
      
      // Duration of a single copy repetition pattern
      const cycleTime = originalNotes[count - 1].onset + stepGap;
      
      const finalNotes = [...originalNotes];
      const finalSheet = [...originalSheet];
      
      // Create detailed structural movements (Verse A - Verse B [Varied] - Chorus [Transposed] - Outro [Cadence resolution])
      
      // Part 2: Verse B (subtle ending adjustments)
      for (let i = 0; i < count; i++) {
        const item = originalNotes[i];
        let kIdx = item.keyIdx;
        
        // Vary the last ending notes of Verse B
        if (i === count - 1) kIdx = Math.min(9, Math.max(0, kIdx + (kIdx % 2 === 0 ? 1 : -1)));
        if (i === count - 2) kIdx = Math.min(9, Math.max(0, kIdx + (kIdx % 2 === 0 ? -1 : 1)));
        
        const newOnset = item.onset + cycleTime;
        finalNotes.push({ keyIdx: kIdx, onset: newOnset, hit: false });
        
        const label = labelsMap[kIdx % labelsMap.length] || '도';
        finalSheet.push({ label: label, activeIdx: [finalNotes.length - 1] });
      }
      
      // Part 3: Chorus (melodic registers transposed higher +2 for emotional climax)
      for (let i = 0; i < count; i++) {
        const item = originalNotes[i];
        const kIdx = Math.min(9, Math.max(0, item.keyIdx + 2));
        const newOnset = item.onset + cycleTime * 2;
        finalNotes.push({ keyIdx: kIdx, onset: newOnset, hit: false });
        
        const label = labelsMap[kIdx % labelsMap.length] || '도';
        finalSheet.push({ label: label, activeIdx: [finalNotes.length - 1] });
      }
      
      // Part 4: Outro (gracefully resolving melody to the root tonic C / '도' / key index 0)
      for (let i = 0; i < count; i++) {
        const item = originalNotes[i];
        let kIdx = item.keyIdx;
        
        // Graceful authentic tonic resolution
        if (i === count - 1) {
          kIdx = 0; // tonic
        } else if (i === count - 2) {
          kIdx = 1; // leading note
        }
        
        const newOnset = item.onset + cycleTime * 3;
        finalNotes.push({ keyIdx: kIdx, onset: newOnset, hit: false });
        
        const label = labelsMap[kIdx % labelsMap.length] || '도';
        finalSheet.push({ label: label, activeIdx: [finalNotes.length - 1] });
      }
      
      song.notes = finalNotes;
      song.sheetMusic = finalSheet;
      song.totalMeasures = Math.ceil(finalNotes.length / 4) + 1;
    }
  });
}

// Expand database on script evaluation
initializeFullSongsDatabase();
extendAllSongsToFullLength();

// Map any song custom badge to primary filter categories
function getPrimaryCategory(song) {
  const badge = song.badge;
  if (!badge) return '연습곡';
  if (badge === '클래식' || badge.includes('클래식') || badge.includes('연주곡')) {
    return '클래식';
  }
  if (badge === '동요' || badge.includes('동요') || badge === '기초') {
    return '동요';
  }
  if (badge === '가곡/민요' || badge.includes('민요') || badge.includes('가곡') || badge === '크리스마스' || badge.includes('교과서')) {
    return '가곡/민요';
  }
  return '연습곡';
}


// Custom Low Latency Polyphonic Audio Synthesizer (Realistic physical-modeling style)
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function playSyntheticPianoNote(frequency) {
  if (!state.settings.soundOn) return;
  
  try {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const now = audioCtx.currentTime;
    
    // Core fundamental note (Sine + Triangle to simulate warm wooden string cabinet resonance)
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const fundamentalGain = audioCtx.createGain();
    
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(frequency, now);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(frequency * 2, now); // Second harmonic adds beautiful brightness
    
    // Quick volume strike (attack) then long organic decay
    fundamentalGain.gain.setValueAtTime(0, now);
    fundamentalGain.gain.linearRampToValueAtTime(state.settings.audioVolume * 0.7, now + 0.01); 
    // Exponential long decay mimicking thick steel piano strings fading naturally
    fundamentalGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    
    // Short high-frequency strike transient (creates the tactile hammer key-strike click)
    const attackStrikeOsc = audioCtx.createOscillator();
    const strikeGain = audioCtx.createGain();
    attackStrikeOsc.type = 'triangle';
    attackStrikeOsc.frequency.setValueAtTime(frequency * 5, now); // High resonant harmonic
    strikeGain.gain.setValueAtTime(state.settings.audioVolume * 0.4, now);
    strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06); // decays instantly
    
    // High damping filter to isolate click frequency
    const strokeFilter = audioCtx.createBiquadFilter();
    strokeFilter.type = 'highpass';
    strokeFilter.frequency.setValueAtTime(600, now);
    
    // Wire up nodes
    attackStrikeOsc.connect(strokeFilter);
    strokeFilter.connect(strikeGain);
    strikeGain.connect(audioCtx.destination);
    
    osc1.connect(fundamentalGain);
    osc2.connect(fundamentalGain);
    fundamentalGain.connect(audioCtx.destination);
    
    // Play with small relative trigger offsets
    osc1.start(now);
    osc2.start(now);
    attackStrikeOsc.start(now);
    
    osc1.stop(now + 1.5);
    osc2.stop(now + 1.5);
    attackStrikeOsc.stop(now + 0.1);
    
  } catch (error) {
    console.error("Web Audio API failed to synthesize piano tone:", error);
  }
}

// Custom high-fidelity physical acoustic piano synthesizer for elegant piano backing tracks
function playSyntheticAccompanimentNote(frequency, keyIdx = 0) {
  if (!state.settings.soundOn) return;
  
  try {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const now = audioCtx.currentTime;
    // Set a very rich and amplified base volume to accommodate the user's feedback
    const baseVolume = (state.settings.backingVolume !== undefined ? state.settings.backingVolume : 0.8) * 1.8;
    
    // Exact pure, bell-like piano note formula modeled from interactive keyboard keys
    const playClearPianoPureTone = (freq, vol, decayTime) => {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const fundamentalGain = audioCtx.createGain();
      
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, now); // Second harmonic adds bright metallic shine
      
      fundamentalGain.gain.setValueAtTime(0, now);
      fundamentalGain.gain.linearRampToValueAtTime(vol * 0.75, now + 0.012); 
      fundamentalGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);
      
      // Crisp mechanical high-frequency transient hammer strike highpass click
      const attackStrikeOsc = audioCtx.createOscillator();
      const strikeGain = audioCtx.createGain();
      attackStrikeOsc.type = 'triangle';
      attackStrikeOsc.frequency.setValueAtTime(freq * 5, now);
      strikeGain.gain.setValueAtTime(vol * 0.45, now);
      strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      
      const strokeFilter = audioCtx.createBiquadFilter();
      strokeFilter.type = 'highpass';
      strokeFilter.frequency.setValueAtTime(600, now);
      
      attackStrikeOsc.connect(strokeFilter);
      strokeFilter.connect(strikeGain);
      strikeGain.connect(audioCtx.destination);
      
      osc1.connect(fundamentalGain);
      osc2.connect(fundamentalGain);
      fundamentalGain.connect(audioCtx.destination);
      
      osc1.start(now);
      osc2.start(now);
      attackStrikeOsc.start(now);
      
      osc1.stop(now + decayTime + 0.1);
      osc2.stop(now + decayTime + 0.1);
      attackStrikeOsc.stop(now + 0.1);
    };

    // 1. Right-Hand melodic guide piano voice - Identical to standard keys, highly clear & bright!
    playClearPianoPureTone(frequency, baseVolume * 1.6, 1.4);
    
    // 2. Play beautiful shimmering accompaniment dyad in middle-high register (pure, no low organ mud)
    const baseStep = keyIdx % 10;
    let chordSteps = [0, 2]; // Sweet diatonic third interval
    if (baseStep === 1) chordSteps = [1, 3];
    if (baseStep === 2) chordSteps = [2, 4];
    if (baseStep === 3) chordSteps = [3, 5];
    if (baseStep === 4) chordSteps = [4, 6];
    if (baseStep === 5) chordSteps = [5, 7];
    if (baseStep === 6) chordSteps = [4, 7];
    if (baseStep === 7) chordSteps = [0, 3];
    if (baseStep === 8) chordSteps = [1, 4];
    if (baseStep === 9) chordSteps = [2, 5];
    
    chordSteps.forEach((step) => {
      const chordFreq = WHITE_KEYS[step % WHITE_KEYS.length].freq;
      // Play middle-high register keys for sparkling clean background resonance
      playClearPianoPureTone(chordFreq, baseVolume * 0.45, 1.2);
    });
    
    // 3. Clean left-hand single bass trace (1 octave down, low volume to prevent rumbling)
    playClearPianoPureTone(frequency * 0.5, baseVolume * 0.6, 1.6);
    
  } catch (error) {
    console.warn("Acoustic piano accompaniment playback failed:", error);
  }
}

// Dom Elements Scaler to preserve perfect pixel 1080x1920 kiosk viewport
function resizeKioskViewport() {
  const appElement = document.getElementById('signage-app');
  if (!appElement) return;
  
  const targetWidth = 1080;
  const targetHeight = 1920;
  const scale = Math.min(window.innerWidth / targetWidth, window.innerHeight / targetHeight);
  
  appElement.style.setProperty('--scale-factor', scale);
}

// Get dynamic container width dynamically to align piano keys and lanes responsively
function getKeyboardWidth() {
  const lanesWrapper = document.getElementById('board-lanes');
  if (lanesWrapper && lanesWrapper.clientWidth > 0) {
    return lanesWrapper.clientWidth;
  }
  const keyboard = document.getElementById('piano-keyboard');
  if (keyboard && keyboard.clientWidth > 0) {
    return keyboard.clientWidth;
  }
  return 1032; // Fallback
}

// Update custom mascot animation state helper mapping playing status
function updateMascotAnimationState() {
  const mascotCard = document.getElementById('card-mascot');
  if (mascotCard) {
    if (state.isPlaying) {
      mascotCard.classList.add('is-playing');
    } else {
      mascotCard.classList.remove('is-playing');
    }
  }
}

// Render dynamic GUI components
function renderPianoKeyboard() {
  const keyboard = document.getElementById('piano-keyboard');
  if (!keyboard) return;
  
  keyboard.innerHTML = '';
  
  // Render White Keys
  WHITE_KEYS.forEach((keySpec, i) => {
    const keyBtn = document.createElement('div');
    keyBtn.className = 'piano-white-key';
    keyBtn.id = `white-key-${i}`;
    keyBtn.dataset.index = i;
    keyBtn.dataset.type = 'white';
    
    const label = document.createElement('span');
    label.className = 'piano-white-key-label';
    label.innerText = keySpec.label;
    
    const sparkle = document.createElement('div');
    sparkle.className = 'key-sparkle';
    
    // Add additional beautiful star sparkle structures matching the illustration image
    const sparkleContainer = document.createElement('div');
    sparkleContainer.className = 'key-sparkles-container';
    for (let j = 0; j < 4; j++) {
      const star = document.createElement('span');
      star.className = `key-glow-star star-${j + 1}`;
      star.innerText = '✦';
      sparkleContainer.appendChild(star);
    }
    
    keyBtn.appendChild(label);
    keyBtn.appendChild(sparkle);
    keyBtn.appendChild(sparkleContainer);
    keyboard.appendChild(keyBtn);
    
    // Web touch handles
    keyBtn.addEventListener('mousedown', (e) => onKeyTrigger(keySpec.freq, 'white', i, e));
    keyBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      onKeyTrigger(keySpec.freq, 'white', i, e);
    });
  });
  
  // Render Black Keys with precise structural overlaps
  BLACK_KEYS.forEach((blackSpec, i) => {
    const blackBtn = document.createElement('div');
    blackBtn.className = 'piano-keyboard-black';
    blackBtn.id = `black-key-${i}`;
    blackBtn.dataset.leftidx = blackSpec.leftIdx;
    blackBtn.dataset.rightidx = blackSpec.rightIdx;
    blackBtn.dataset.type = 'black';
    
    // Position floating black key mathematically centered over the division line
    const keyboardWidth = getKeyboardWidth(); // Content width of the keyboard
    const keyWidth = keyboardWidth / WHITE_KEYS.length;
    const blackKeyWidth = Math.round(keyWidth * 0.58);
    const keyOffset = (blackSpec.leftIdx + 1) * keyWidth - (blackKeyWidth / 2);
    
    blackBtn.style.width = `${blackKeyWidth}px`;
    blackBtn.style.left = `${keyOffset}px`;
    keyboard.appendChild(blackBtn);
    
    blackBtn.addEventListener('mousedown', (e) => onKeyTrigger(blackSpec.freq, 'black', i, e));
    blackBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      onKeyTrigger(blackSpec.freq, 'black', i, e);
    });
  });
}

// Draw static backgrounds lanes inside Board Visualizer
function renderBoardLanes() {
  const lanesWrapper = document.getElementById('board-lanes');
  if (!lanesWrapper) return;
  
  lanesWrapper.innerHTML = '';
  
  const laneCount = WHITE_KEYS.length;
  const laneWidth = getKeyboardWidth() / laneCount;
  
  // Add lane borders and translucent columns
  for (let i = 0; i < laneCount; i++) {
    const border = document.createElement('div');
    border.className = 'board-lane-border';
    border.style.left = `${i * laneWidth}px`;
    lanesWrapper.appendChild(border);
    
    const glowCol = document.createElement('div');
    glowCol.className = 'board-hit-glow-lane';
    glowCol.id = `glow-lane-${i}`;
    glowCol.style.left = `${i * laneWidth}px`;
    glowCol.style.width = `${laneWidth}px`;
    lanesWrapper.appendChild(glowCol);
  }
  
  // Static bottom boundary hit bar
  const boundaryBar = document.createElement('div');
  boundaryBar.className = 'board-hit-line';
  lanesWrapper.appendChild(boundaryBar);
}

// Show colorful interactive feedback texts (Perfect/Great vs Miss) dynamically centered on lanes
function showHitTextFeedback(laneIdx, text, type) {
  const lanesWrapper = document.getElementById('board-lanes');
  if (!lanesWrapper) return;
  
  const feedbackDom = document.createElement('div');
  feedbackDom.className = `hit-feedback-bubble ${type}`;
  
  // High fidelity arched text feedback decoration with sparkles
  if (type === 'correct') {
    feedbackDom.innerHTML = `
      <div class="feedback-sparkles-wrap">
        <span class="fb-star left">✦</span>
        <span class="fb-text">${text}</span>
        <span class="fb-star right">✦</span>
      </div>
      <div class="feedback-dust">✧ ✦ ✧</div>
    `;
  } else {
    feedbackDom.innerHTML = `
      <div class="feedback-sparkles-wrap">
        <span class="fb-text">${text}</span>
      </div>
    `;
  }
  
  const laneCount = WHITE_KEYS.length;
  const laneWidth = getKeyboardWidth() / laneCount;
  const bubbleWidth = 160; // Wider capsule box for pristine spacing
  const leftX = laneIdx * laneWidth + (laneWidth - bubbleWidth) / 2;
  
  feedbackDom.style.left = `${leftX}px`;
  feedbackDom.style.bottom = `50px`; // floats from above keys upwards
  feedbackDom.style.width = `${bubbleWidth}px`;
  
  lanesWrapper.appendChild(feedbackDom);
  
  // Transition fade float animation
  requestAnimationFrame(() => {
    feedbackDom.style.transform = `translateY(-95px) scale(1.28)`;
    feedbackDom.style.opacity = `0`;
  });
  
  // Clean up
  setTimeout(() => {
    feedbackDom.remove();
  }, 650);
}

// Calculate song duration dynamically based on last note onset
function getSongDuration(song) {
  if (!song.notes || song.notes.length === 0) return 60;
  const lastOnset = song.notes[song.notes.length - 1].onset;
  return Math.ceil((lastOnset + 2500) / 1000); // add 2.5s cushion for fall and fade out
}

// Generate list of songs in overlay selector
function renderSongSelector() {
  const songListDom = document.getElementById('song-selector-list');
  if (!songListDom) return;
  
  songListDom.innerHTML = '';
  
  SONGS.forEach((song, idx) => {
    // Category selection filtering
    if (state.activeCategoryFilter !== 'all') {
      const primaryCat = getPrimaryCategory(song);
      if (primaryCat !== state.activeCategoryFilter) {
        return; // skip if doesn't match active filter
      }
    }

    const item = document.createElement('div');
    item.className = `song-selector-item ${state.currentSongIdx === idx ? 'active' : ''}`;
    item.dataset.idx = idx;
    
    const leftPart = document.createElement('div');
    leftPart.className = 'song-selector-item-left';
    
    const title = document.createElement('div');
    title.className = 'song-selector-item-title';
    title.innerText = song.title;
    
    // Calculate song duration dynamically based on last note onset helper
    const durationSeconds = getSongDuration(song);
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    
    const meta = document.createElement('div');
    meta.className = 'song-selector-item-meta';
    meta.innerHTML = `<span>난이도 ${song.stars} (${durationStr})</span>`;
    
    leftPart.appendChild(title);
    leftPart.appendChild(meta);
    item.appendChild(leftPart);
    
    if (state.currentSongIdx === idx) {
      const badge = document.createElement('span');
      badge.className = 'song-selector-active-badge';
      badge.innerText = '선택됨';
      item.appendChild(badge);
    }
    
    songListDom.appendChild(item);
    
    item.addEventListener('click', () => {
      selectActiveSong(idx);
      closeOverlay('dialog-songs');
    });
  });
}

// Trigger a visual key stroke highlight and play sound
function onKeyTrigger(frequency, type, index, event) {
  playSyntheticPianoNote(frequency);
  
  // Trigger animation keys
  let keyDom;
  if (type === 'white') {
    keyDom = document.getElementById(`white-key-${index}`);
    
    let hitResult = 'none';
    if (state.isPlaying) {
      hitResult = detectGameNoteHit(index); // Returns 'correct' or 'wrong'
    }
    
    triggerLaneGlow(index, hitResult);
    
    if (keyDom) {
      // Clear legacy transition feedback to allow immediate re-triggering
      keyDom.classList.remove('hit-correct', 'hit-wrong', 'active');
      
      if (hitResult === 'correct') {
        keyDom.classList.add('hit-correct');
        setTimeout(() => keyDom.classList.remove('hit-correct'), 200);
      } else if (hitResult === 'wrong') {
        keyDom.classList.add('hit-wrong');
        setTimeout(() => keyDom.classList.remove('hit-wrong'), 200);
        showHitTextFeedback(index, 'FAIL!', 'wrong');
      } else {
        keyDom.classList.add('active');
        setTimeout(() => keyDom.classList.remove('active'), 200);
      }
    }
  } else {
    keyDom = document.getElementById(`black-key-${index}`);
    if (keyDom) {
      keyDom.classList.remove('active');
      keyDom.classList.add('active');
      setTimeout(() => keyDom.classList.remove('active'), 150);
    }
  }
}

// Game Loop System (Frame-level coordination)
let animationFrameId = null;
let lastFrameTime = 0;
let songElapsedTime = 0; // ms

function startGameEngine() {
  if (state.isPlaying) return;
  
  // Initialize and resume AudioContext immediately under direct user interactive click gesture
  try {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  } catch (error) {
    console.warn("Failed to automatically activate Web Audio Context standard on start gesture:", error);
  }
  
  const wasPaused = state.isPaused;
  state.isPlaying = true;
  updateMascotAnimationState();
  state.isPaused = false;
  
  const activeSong = SONGS[state.currentSongIdx];
  
  if (!wasPaused) {
    state.currentSongNotesPlayed = 0;
    songElapsedTime = 0;
    state.score = 0;
    state.combo = 0;
    state.hitNotes = 0;
    state.accuracy = 100;
    
    // Clone active playlist notes
    state.totalNotes = activeSong.notes.length;
    state.noteQueue = activeSong.notes.map((note, index) => ({ ...note, hit: false, originalIndex: index }));
    state.songNotesHistory = new Array(activeSong.notes.length).fill('pending');
    state.currentSectionIdx = 0;
    renderStaveSheet(activeSong, 0);
    
    // Clear dynamic tiles from DOM instantly
    const lanesWrapper = document.getElementById('board-lanes');
    if (lanesWrapper) {
      const tiles = lanesWrapper.querySelectorAll('.falling-note-tile');
      tiles.forEach(tile => tile.remove());
    }
    state.fallingNotes = [];
    
    // Backing track notes queue for automatic playback
    state.backingQueue = activeSong.notes.map((note, index) => ({ ...note, played: false }));
    
    // Set the play timer to match the exact duration displayed in the song selector
    const timerSeconds = getSongDuration(activeSong);
    resetTimer(timerSeconds);
  } else {
    // Standard resume flow: Keep fallingNotes intact and just resume the timer
    resumeTimer();
  }
  
  const miniPauseBtn = document.getElementById('pause-btn-top');
  if (miniPauseBtn) {
    miniPauseBtn.innerHTML = '<i data-lucide="pause"></i><span>정지하기</span>';
    miniPauseBtn.classList.add('playing');
    lucide.createIcons();
  }
  
  document.getElementById('cta-cover').classList.remove('show');
  
  lastFrameTime = performance.now();
  animationFrameId = requestAnimationFrame(gameTick);
}

function pauseGameEngine() {
  if (!state.isPlaying) return;
  
  state.isPlaying = false;
  updateMascotAnimationState();
  state.isPaused = true;
  cancelAnimationFrame(animationFrameId);
  clearInterval(state.timerInterval);
  
  const miniPauseBtn = document.getElementById('pause-btn-top');
  if (miniPauseBtn) {
    miniPauseBtn.innerHTML = '<i data-lucide="play"></i><span>이어하기</span>';
    miniPauseBtn.classList.remove('playing');
    lucide.createIcons();
  }
}

function resetGameEngine() {
  clearConfetti();
  state.isPlaying = false;
  updateMascotAnimationState();
  state.isPaused = false;
  cancelAnimationFrame(animationFrameId);
  clearInterval(state.timerInterval);
  
  state.score = 0;
  state.combo = 0;
  state.hitNotes = 0;
  state.accuracy = 100;
  
  const activeSong = SONGS[state.currentSongIdx];
  if (activeSong) {
    state.currentTime = getSongDuration(activeSong);
    state.songNotesHistory = new Array(activeSong.notes.length).fill('pending');
    renderStaveSheet(activeSong, 0);
  } else {
    state.currentTime = 60;
    state.songNotesHistory = [];
  }
  updateTimerUI();
  
  state.fallingNotes = [];
  
  state.currentSectionIdx = 0;
  
  const lanesWrapper = document.getElementById('board-lanes');
  if (lanesWrapper) {
    // Clear dynamic tiles
    const tiles = lanesWrapper.querySelectorAll('.falling-note-tile');
    tiles.forEach(tile => tile.remove());
  }
  
  updateScoreboardUI();
  
  const miniPauseBtn = document.getElementById('pause-btn-top');
  if (miniPauseBtn) {
    miniPauseBtn.innerHTML = '<i data-lucide="play"></i><span>시작하기</span>';
    miniPauseBtn.classList.remove('playing');
    lucide.createIcons();
  }
  document.getElementById('cta-cover').classList.remove('show');
}

// Primary 60FPS Game loop tick helper
function gameTick(now) {
  if (!state.isPlaying) return;
  
  const deltaTime = now - lastFrameTime;
  lastFrameTime = now;
  songElapsedTime += deltaTime;
  
  // Play backing accompaniment melody automatically (노래와 같이 나오도록 설정)
  if (state.backingQueue && state.settings.backingMelodyOn) {
    state.backingQueue.forEach(bgNote => {
      if (!bgNote.played && songElapsedTime >= bgNote.onset) {
        bgNote.played = true;
        const keyIdx = bgNote.keyIdx % WHITE_KEYS.length;
        const freq = WHITE_KEYS[keyIdx].freq;
        playSyntheticAccompanimentNote(freq, keyIdx);
      }
    });
  }
  
  // Spawn notes based on timeline progression
  const spawnThreshold = 2500; // spawn notes 2.5s before they hit target line
  const loopQueue = [...state.noteQueue];
  for (let i = 0; i < loopQueue.length; i++) {
    const note = loopQueue[i];
    if (songElapsedTime >= note.onset - spawnThreshold) {
      // Move from spawn queue to active falling layout
      state.fallingNotes.push({
        laneIdx: note.keyIdx % WHITE_KEYS.length,
        onset: note.onset,
        originalIndex: note.originalIndex,
        y: -100, // starts offscreen high offset
        hit: false,
        domId: `tile-${Date.now()}-${i}`
      });
      state.noteQueue.splice(state.noteQueue.indexOf(note), 1);
    }
  }
  
  // Progress existing falling tiles
  const visualizerHeight = 430;
  const targetLineY = visualizerHeight - 48; // Target hit line Y position
  const fallingSpeed = (targetLineY + 100) / spawnThreshold; // px/ms
  
  const lanesWrapper = document.getElementById('board-lanes');
  
  const tilesToRemove = [];
  
  state.fallingNotes.forEach(tile => {
    // Clean up hit notes immediately to prevent leaks or accumulation
    if (tile.hit) {
      tilesToRemove.push(tile);
      return;
    }
    
    // Calculate precise line position based on elapsed timeline matching onset
    const delay = tile.onset - songElapsedTime;
    tile.y = targetLineY - delay * fallingSpeed;
    
    // Draw or move the visual DOM block representing the tile
    let tileDom = document.getElementById(tile.domId);
    if (!tileDom) {
      tileDom = document.createElement('div');
      tileDom.className = 'falling-note-tile';
      tileDom.id = tile.domId;
      tileDom.innerText = WHITE_KEYS[tile.laneIdx].label;
      lanesWrapper.appendChild(tileDom);
    }
    
    // Position it lane-wise (centring the dynamic pill capsule inside wide lane)
    const laneWidth = getKeyboardWidth() / WHITE_KEYS.length;
    const tileWidth = Math.round(laneWidth * 0.72);
    const offset = (laneWidth - tileWidth) / 2;
    tileDom.style.width = `${tileWidth}px`;
    tileDom.style.left = `${tile.laneIdx * laneWidth + offset}px`;
    tileDom.style.top = `${tile.y}px`;
    
    // Check Auto-Assist MIDI demo mode
    if (state.settings.midiAssist && delay <= 0 && !tile.hit) {
      tile.hit = true;
      triggerLaneGlow(tile.laneIdx, 'correct');
      playSyntheticPianoNote(WHITE_KEYS[tile.laneIdx].freq);
      
      // Visual key animation
      const keyDom = document.getElementById(`white-key-${tile.laneIdx}`);
      if (keyDom) {
        keyDom.classList.remove('hit-correct', 'hit-wrong', 'active');
        keyDom.classList.add('hit-correct');
        setTimeout(() => keyDom.classList.remove('hit-correct'), 250);
      }
      
      if (tileDom) {
        tileDom.classList.add('completed');
        setTimeout(() => tileDom.remove(), 100);
      }
      
      handleHitSuccess(tile.laneIdx, tile.originalIndex);
      tilesToRemove.push(tile);
    }
    
    // Auto-fail notes passing below standard threshold unchecked
    if (tile.y > visualizerHeight + 50 && !tile.hit) {
      if (tileDom) tileDom.remove();
      handleHitFailure(tile.originalIndex);
      triggerMissFeedback(tile.laneIdx);
      tilesToRemove.push(tile);
    }
  });
  
  // Clean up removed tiles from state safely 
  if (tilesToRemove.length > 0) {
    state.fallingNotes = state.fallingNotes.filter(t => !tilesToRemove.includes(t));
  }
  
  // Real-time Karaoke sweep & notes state progression
  updateKaraokeProgress();
  
  // End track if song is empty are all notes were cleared
  const activeSong = SONGS[state.currentSongIdx];
  if (state.noteQueue.length === 0 && state.fallingNotes.length === 0 && state.isPlaying) {
    completeSongTrack();
    return;
  }
  
  animationFrameId = requestAnimationFrame(gameTick);
}

// User-triggered key matches falling note checks
function detectGameNoteHit(laneIdx) {
  if (!state.isPlaying) return 'none';
  
  const perfectThresholdMs = 180; // ±180ms margins of error
  let perfectHitMade = false;
  
  for (let i = 0; i < state.fallingNotes.length; i++) {
    const tile = state.fallingNotes[i];
    if (tile.laneIdx === laneIdx && !tile.hit) {
      const delay = Math.abs(tile.onset - songElapsedTime);
      if (delay < perfectThresholdMs) {
        // Successful strike! Eliminate node instantly
        tile.hit = true;
        perfectHitMade = true;
        
        const tileDom = document.getElementById(tile.domId);
        if (tileDom) {
          tileDom.classList.add('completed');
          setTimeout(() => tileDom.remove(), 100);
        }
        
        state.fallingNotes.splice(i, 1);
        handleHitSuccess(laneIdx, tile.originalIndex);
        break;
      }
    }
  }
  
  if (perfectHitMade) {
    return 'correct';
  } else {
    // If the play pressed a key in an empty space or mismatches
    return 'wrong';
  }
}

// Trigger lane flashing animation
function triggerLaneGlow(laneIdx, status = 'none') {
  const glowDom = document.getElementById(`glow-lane-${laneIdx}`);
  if (glowDom) {
    // Clean status classes
    glowDom.classList.remove('active', 'correct', 'wrong');
    if (status === 'correct') {
      glowDom.classList.add('correct');
    } else if (status === 'wrong') {
      glowDom.classList.add('wrong');
    }
    
    glowDom.classList.add('active');
    setTimeout(() => {
      glowDom.classList.remove('active', 'correct', 'wrong');
    }, 180);
  }
}

// Missed feedback on falling past boundary
function triggerMissFeedback(laneIdx) {
  // Flash lane red
  triggerLaneGlow(laneIdx, 'wrong');
  showHitTextFeedback(laneIdx, 'FAIL!', 'wrong');
  
  // Flash physical white key red briefly to highlight mismatch
  const keyDom = document.getElementById(`white-key-${laneIdx}`);
  if (keyDom) {
    keyDom.classList.remove('hit-wrong', 'hit-correct', 'active');
    keyDom.classList.add('hit-wrong');
    setTimeout(() => keyDom.classList.remove('hit-wrong'), 250);
  }
}

// Perfect hits handles
function handleHitSuccess(laneIdx, noteIdx) {
  state.hitNotes++;
  state.combo++;
  state.score += 150 + state.combo * 10;
  
  showHitTextFeedback(laneIdx, 'PERFECT!', 'correct');
  
  if (noteIdx !== undefined && noteIdx !== null) {
    state.songNotesHistory[noteIdx] = 'correct';
  }
  
  // Recalculate precision percentage
  state.accuracy = Math.round((state.hitNotes / (state.currentSongNotesPlayed + 1)) * 100);
  state.currentSongNotesPlayed++;
  
  updateScoreboardUI();
  triggerPerfectSparkBadge();
}

function handleHitFailure(noteIdx) {
  state.combo = 0;
  state.currentSongNotesPlayed++;
  state.accuracy = Math.round((state.hitNotes / state.currentSongNotesPlayed) * 100);
  
  if (noteIdx !== undefined && noteIdx !== null) {
    state.songNotesHistory[noteIdx] = 'wrong';
  }
  
  updateScoreboardUI();
}

function updateScoreboardUI() {
  // Update stats labels
  const accuracyTextEls = document.querySelectorAll('.stat-val-text');
  if (accuracyTextEls[0]) accuracyTextEls[0].innerText = `${state.accuracy}%`;
  
  // Update big central circle ring percentage text
  const ringTextEl = document.querySelector('.ring-text');
  if (ringTextEl) {
    ringTextEl.innerText = `${state.accuracy}%`;
  }
  
  // SVG circular ring
  const circleEl = document.getElementById('accuracy-svg-ring');
  if (circleEl) {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (state.accuracy / 100) * circumference;
    circleEl.style.strokeDashoffset = strokeDashoffset;
  }
  
  // Progress measurements (based on total notes played/processed so far)
  const activeSong = SONGS[state.currentSongIdx];
  const maxNotes = activeSong.notes.length;
  const currentMeasure = Math.min(
    activeSong.totalMeasures,
    Math.ceil((state.currentSongNotesPlayed / maxNotes) * activeSong.totalMeasures) || 0
  );
  
  const measureTextEl = document.getElementById('measure-progress-text');
  if (measureTextEl) {
    measureTextEl.innerHTML = `${currentMeasure}/${activeSong.totalMeasures} <span>마디</span>`;
  }
  
  const fillBarEl = document.getElementById('measure-fill-bar');
  if (fillBarEl) {
    const percent = Math.min(100, (state.currentSongNotesPlayed / maxNotes) * 100);
    fillBarEl.style.width = `${percent}%`;
  }
}

function updateKaraokeProgress() {
  if (!state.isPlaying) return;
  const activeSong = SONGS[state.currentSongIdx];
  const notesCount = activeSong.notes.length;
  if (notesCount === 0) return;
  
  // 1. Find current active note based on nearest onset midpoint
  let activeNoteIdx = 0;
  for (let i = 0; i < notesCount; i++) {
    if (i === notesCount - 1) {
      activeNoteIdx = i;
      break;
    }
    const currentOnset = activeSong.notes[i].onset;
    const nextOnset = activeSong.notes[i+1].onset;
    const midpoint = (currentOnset + nextOnset) / 2;
    if (songElapsedTime < midpoint) {
      activeNoteIdx = i;
      break;
    }
  }
  
  // 2. Check and handle dynamic paging (8 notes per phrase/section)
  const notesPerSection = 8;
  const sectionIdx = Math.floor(activeNoteIdx / notesPerSection);
  if (state.currentSectionIdx !== sectionIdx) {
    state.currentSectionIdx = sectionIdx;
    renderStaveSheet(activeSong, sectionIdx);
  }
  
  // 3. Mark notes as 'correct', 'wrong', or 'active' (pending)
  const columns = document.querySelectorAll('.sheet-note-column');
  const sweepBar = document.getElementById('score-sweep-line');
  
  columns.forEach((colEl, idx) => {
    const originalIdx = (state.currentSectionIdx || 0) * notesPerSection + idx;
    
    const head = colEl.querySelector('.sheet-note-head');
    const nameLabel = colEl.querySelector('.sheet-note-name');
    
    if (head) {
      head.classList.remove('active', 'correct', 'wrong');
      const noteStatus = state.songNotesHistory[originalIdx];
      if (noteStatus === 'correct') {
        head.classList.add('correct');
      } else if (noteStatus === 'wrong') {
        head.classList.add('wrong');
      }
    }
    
    if (nameLabel) {
      nameLabel.classList.remove('active');
    }
    
    // Highlight upcoming or current playhead node
    if (originalIdx === activeNoteIdx) {
      if (head) {
        head.classList.add('active');
      }
      if (nameLabel) {
        nameLabel.classList.add('active');
      }
      
      // Pivot sweep bar exactly to the active column's horizontal center
      if (sweepBar) {
        const wrapperLeft = 110;
        const pos = wrapperLeft + colEl.offsetLeft + colEl.offsetWidth / 2 - 2;
        sweepBar.style.left = `${pos}px`;
      }
    }
  });
}

function highlightActiveScoreNote(noteCounter) {
  // Deprecated, updated in real-time by updateKaraokeProgress
}

function triggerPerfectSparkBadge() {
  const badge = document.getElementById('perfect-badge-effect');
  if (!badge) return;
  
  // Pick random position within Lanes Board
  const randomX = Math.floor(Math.random() * 400) + 100;
  const randomY = Math.floor(Math.random() * 100) + 120;
  
  badge.style.left = `${randomX}px`;
  badge.style.top = `${randomY}px`;
  
  badge.classList.remove('show');
  void badge.offsetWidth; // forces reflow reset
  badge.classList.add('show');
}

// Count Tracker Remaining timer loop
function resetTimer(seconds) {
  clearInterval(state.timerInterval);
  state.currentTime = seconds;
  updateTimerUI();
  
  state.timerInterval = setInterval(() => {
    if (state.isPlaying) {
      state.currentTime--;
      updateTimerUI();
      
      if (state.currentTime <= 0) {
        completeSongTrack();
      }
    }
  }, 1000);
}

function resumeTimer() {
  clearInterval(state.timerInterval);
  updateTimerUI();
  
  state.timerInterval = setInterval(() => {
    if (state.isPlaying) {
      state.currentTime--;
      updateTimerUI();
      
      if (state.currentTime <= 0) {
        completeSongTrack();
      }
    }
  }, 1000);
}

function updateTimerUI() {
  const timerDigitsDom = document.getElementById('timer-digits');
  if (!timerDigitsDom) return;
  
  const minutes = Math.floor(state.currentTime / 60);
  const seconds = state.currentTime % 60;
  
  const mm = minutes < 10 ? `0${minutes}` : minutes;
  const ss = seconds < 10 ? `0${seconds}` : seconds;
  timerDigitsDom.innerText = `${mm}:${ss}`;
}

// Complete play process with success bottom cover sheet
function completeSongTrack() {
  state.isPlaying = false;
  updateMascotAnimationState();
  cancelAnimationFrame(animationFrameId);
  clearInterval(state.timerInterval);
  
  // Reveal bottom cover modal containing the majestic 240px CTA wrapper
  const ctaCover = document.getElementById('cta-cover');
  if (ctaCover) {
    ctaCover.classList.add('show');
  }
  
  // Trigger beautiful color paper burst explosion
  spawnConfetti();
  
  // Update alert status
  const scoreAlert = document.getElementById('completed-score-alert');
  if (scoreAlert) {
    scoreAlert.innerHTML = `
      <div class="alert-text-container">
        <div class="alert-row-top">
          <i data-lucide="trophy"></i> 완주 달성 성공!
        </div>
        <div class="alert-row-bottom">
          정확도 ${state.accuracy}% • ${state.score}점
        </div>
      </div>
    `;
    lucide.createIcons();
  }
}

// Initialize active selection song
function selectActiveSong(idx) {
  state.currentSongIdx = idx;
  const activeSong = SONGS[idx];
  
  // Update header content info
  const badgeEl = document.querySelector('.practice-badge');
  if (badgeEl) badgeEl.innerText = activeSong.badge;
  
  const titleEl = document.querySelector('.song-title');
  if (titleEl) titleEl.innerText = activeSong.title;
  
  const starsWrapperEl = document.querySelector('.difficulty-stars');
  if (starsWrapperEl) {
    starsWrapperEl.innerHTML = '';
    const starsCount = activeSong.difficultyRaw;
    for (let s = 1; s <= 5; s++) {
      const star = document.createElement('span');
      if (s <= starsCount) {
        star.innerText = '★';
      } else {
        star.className = 'difficulty-star-gray';
        star.innerText = '★';
      }
      starsWrapperEl.appendChild(star);
    }
  }
  
  // Redraw stave sheet music notes will be triggered inside resetGameEngine()
  resetGameEngine();
}

// Render stave score notes manually with section-based paging (highly-optimized with DocumentFragment)
function renderStaveSheet(song, sectionIdx = 0) {
  const wrapper = document.getElementById('sheet-notes-wrapper');
  if (!wrapper) return;
  
  const notesPerSection = 8;
  const notesToShow = song.sheetMusic || [];
  const startIdx = sectionIdx * notesPerSection;
  const endIdx = startIdx + notesPerSection;
  const slicedNotes = notesToShow.slice(startIdx, endIdx);
  
  const totalSections = Math.ceil(notesToShow.length / notesPerSection) || 1;
  const pageIndicator = document.getElementById('staff-page-indicator');
  if (pageIndicator) {
    pageIndicator.innerText = `${sectionIdx + 1} / ${totalSections} 단`;
  }
  
  const fragment = document.createDocumentFragment();
  
  slicedNotes.forEach((noteItem, idx) => {
    const originalIdx = startIdx + idx;
    const col = document.createElement('div');
    col.className = 'sheet-note-column';
    col.style.opacity = '1';
    col.style.transform = 'none';
    
    if (noteItem.label !== '|' && noteItem.label !== '-') {
      const inner = document.createElement('div');
      inner.className = 'sheet-note-inner';
      
      const head = document.createElement('div');
      
      const noteStatus = state.songNotesHistory[originalIdx];
      let statusClass = '';
      if (noteStatus === 'correct') {
        statusClass = 'correct';
      } else if (noteStatus === 'wrong') {
        statusClass = 'wrong';
      }
      
      head.className = `sheet-note-head ${statusClass}`;
      
      const offsetMap = {
        '도': 15,
        '레': 9,
        '미': 3,
        '파': -3,
        '솔': -9,
        '라': -15,
        '시': -21,
        '-': 0
      };
      const offset = offsetMap[noteItem.label] || 0;
      inner.style.transform = `translateY(${offset}px)`;
      
      const stem = document.createElement('div');
      stem.className = 'sheet-note-stem up';
      
      inner.appendChild(stem);
      inner.appendChild(head);
      col.appendChild(inner);
    }
    
    const name = document.createElement('div');
    name.className = `sheet-note-name`;
    name.innerText = noteItem.label;
    
    col.appendChild(name);
    fragment.appendChild(col);
  });
  
  wrapper.innerHTML = '';
  wrapper.appendChild(fragment);
  
  // Reset Playhead line offset instantly
  const sweepBar = document.getElementById('score-sweep-line');
  if (sweepBar) {
    const columns = wrapper.querySelectorAll('.sheet-note-column');
    if (columns.length > 0) {
      const firstCol = columns[0];
      const wrapperLeft = 110;
      const pos = wrapperLeft + firstCol.offsetLeft + firstCol.offsetWidth / 2 - 2;
      sweepBar.style.left = `${pos}px`;
    } else {
      sweepBar.style.left = `110px`;
    }
  }
}

// Dialog management triggers
function openOverlay(dialogId) {
  const overlay = document.getElementById(dialogId);
  if (overlay) {
    overlay.classList.add('active');
  }
  const backdrop = document.getElementById('dialog-backdrop');
  if (backdrop) {
    backdrop.classList.add('active');
  }
}

function closeOverlay(dialogId) {
  const overlay = document.getElementById(dialogId);
  if (overlay) {
    overlay.classList.remove('active');
  }
  const activeDialogs = document.querySelectorAll('.overlay-dialog.active');
  if (activeDialogs.length === 0) {
    const backdrop = document.getElementById('dialog-backdrop');
    if (backdrop) {
      backdrop.classList.remove('active');
    }
  }
}

// Keyboard shortcuts for physically tactile piano playing feel
function setupKeyboardHook() {
  document.addEventListener('keydown', (e) => {
    // Ignore key repeat triggers to prevent audio spam
    if (e.repeat) return;
    
    const pressedKey = e.key.toLowerCase();
    
    // Check White Keys
    const matchingWhite = WHITE_KEYS.find(k => k.key === pressedKey);
    if (matchingWhite) {
      onKeyTrigger(matchingWhite.freq, 'white', matchingWhite.index, e);
    }
    
    // Check Black Keys
    const matchingBlack = BLACK_KEYS.find(k => k.key === pressedKey);
    if (matchingBlack) {
      onKeyTrigger(matchingBlack.freq, 'black', BLACK_KEYS.indexOf(matchingBlack), e);
    }
  });
}

// Complete application binding sequence
function initApplication() {
  // Size signage cleanly on boot
  resizeKioskViewport();
  window.addEventListener('resize', () => {
    resizeKioskViewport();
    renderBoardLanes();
    renderPianoKeyboard();
  });
  
  // Render views
  renderPianoKeyboard();
  renderBoardLanes();
  renderSongSelector();
  
  // Load default song
  selectActiveSong(0);
  
  // Configure static actions
  const startBtn = document.getElementById('start-btn-main');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      openOverlay('dialog-songs');
    });
  }
  
  const miniPauseBtn = document.getElementById('pause-btn-top');
  if (miniPauseBtn) {
    miniPauseBtn.addEventListener('click', () => {
      if (state.isPlaying) {
        pauseGameEngine();
      } else {
        startGameEngine();
      }
    });
  }
  
  // Header options buttons bindings
  const optMusicBtn = document.getElementById('header-btn-music');
  if (optMusicBtn) {
    optMusicBtn.addEventListener('click', () => openOverlay('dialog-songs'));
  }
  
  const optSettingsBtn = document.getElementById('header-btn-settings');
  if (optSettingsBtn) {
    optSettingsBtn.addEventListener('click', () => {
      try {
        window.top.location.href = 'https://claix-toolkit-xzrp.vercel.app/';
      } catch (e) {
        window.location.href = 'https://claix-toolkit-xzrp.vercel.app/';
      }
      // Fallback in case redirection is delayed
      window.location.href = 'https://claix-toolkit-xzrp.vercel.app/';
    });
  }
  
  // Dialog closures bindings
  const closeSongs = document.getElementById('close-dialog-songs');
  if (closeSongs) closeSongs.addEventListener('click', () => closeOverlay('dialog-songs'));
  
  const closeSettings = document.getElementById('close-dialog-settings');
  if (closeSettings) closeSettings.addEventListener('click', () => closeOverlay('dialog-settings'));
  
  // Bind category tabs click actions
  const tabs = document.querySelectorAll('.category-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.activeCategoryFilter = tab.dataset.category;
      renderSongSelector();
    });
  });
  
  // Bottom CTA Actions
  const btnCtaNext = document.getElementById('cta-btn-next');
  if (btnCtaNext) {
    btnCtaNext.addEventListener('click', () => {
      // Advance to next song index wrapping neatly
      const nextIdx = (state.currentSongIdx + 1) % SONGS.length;
      selectActiveSong(nextIdx);
    });
  }
  
  const btnCtaRetry = document.getElementById('cta-btn-retry');
  if (btnCtaRetry) {
    btnCtaRetry.addEventListener('click', () => {
      selectActiveSong(state.currentSongIdx);
      startGameEngine();
    });
  }
  
  // Option toggles bindings
  const assistanceToggle = document.getElementById('toggle-midi-assist');
  if (assistanceToggle) {
    assistanceToggle.checked = state.settings.midiAssist;
    assistanceToggle.addEventListener('change', (e) => {
      state.settings.midiAssist = e.target.checked;
    });
  }
  
  const soundToggle = document.getElementById('toggle-sound');
  if (soundToggle) {
    soundToggle.checked = state.settings.soundOn;
    soundToggle.addEventListener('change', (e) => {
      state.settings.soundOn = e.target.checked;
    });
  }

  const backingToggle = document.getElementById('toggle-backing-melody');
  if (backingToggle) {
    backingToggle.checked = state.settings.backingMelodyOn;
    backingToggle.addEventListener('change', (e) => {
      state.settings.backingMelodyOn = e.target.checked;
    });
  }

  const backingVolumeRange = document.getElementById('backing-volume-range');
  const backingVolumePercent = document.getElementById('backing-volume-percent');
  if (backingVolumeRange) {
    backingVolumeRange.value = Math.round(state.settings.backingVolume * 100);
    if (backingVolumePercent) {
      backingVolumePercent.innerText = `${backingVolumeRange.value}%`;
    }
    backingVolumeRange.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.settings.backingVolume = val / 100;
      if (backingVolumePercent) {
        backingVolumePercent.innerText = `${val}%`;
      }
    });
  }

  // Backdrop click closes any active overlay dialogs
  const backdrop = document.getElementById('dialog-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeOverlay('dialog-songs');
      closeOverlay('dialog-settings');
    });
  }
  
  const backBtn = document.getElementById('header-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      alert('피아노 연주 세션을 종료하고 메인 대기화면으로 돌아갑니다.');
    });
  }
  
  setupKeyboardHook();
  
  // Render system Lucide icons properly
  lucide.createIcons();
}

// Interactive Flower Petal & Blossom Burst Simulation Engine (꽃가루)
let confettiParticles = [];
let confettiAnimationId = null;
let confettiTimeoutId = null;

function spawnConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Stretch canvas overlay based on container boundary and support Retina High-DPI for absolute clarity!
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const viewWidth = rect.width;
  const viewHeight = rect.height;
  
  canvas.width = viewWidth * dpr;
  canvas.height = viewHeight * dpr;
  ctx.scale(dpr, dpr);
  
  confettiParticles = [];
  
  // High contrast vibrant celebratory color palette
  const palette = [
    '#FF3366', '#FF007F', '#FF4081', '#FF1744', // Hot neon pink cherry cherry blossoms
    '#FFA500', '#FF5500', '#FF8C00',             // Vibrant gold and orange pop fires
    '#FFF000', '#FFD700', '#FFFF33',             // High luminosity star glow yellows
    '#E040FB', '#D500F9', '#8A2BE2',             // Electric purples and magentas
    '#00E5FF', '#00FFCC', '#00E676'              // Sparking cyan and lime green confetti
  ];
  
  const shapesList = ['petal', 'tear', 'leaf', 'spark'];
  
  // Helper to push a particle
  function addParticle(x, y, vx, vy, color, shape) {
    confettiParticles.push({
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      size: Math.random() * 11 + 8, // Rich visible size
      color: color,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 12 - 6,
      opacity: 1.0,
      shape: shape,
      swing: Math.random() * Math.PI,
      swingSpeed: Math.random() * 0.08 + 0.03
    });
  }
  
  // 1. First Wave: Powerful Left and Right diagonal bursts
  const primaryCount = 90;
  for (let i = 0; i < primaryCount; i++) {
    // Left launcher
    const lColor = palette[Math.floor(Math.random() * palette.length)];
    const lShape = shapesList[Math.floor(Math.random() * shapesList.length)];
    const lVx = Math.random() * 15 + 8; // Powerful fast arc
    const lVy = -(Math.random() * 22 + 14);
    addParticle(0, viewHeight - 20, lVx, lVy, lColor, lShape);
    
    // Right launcher
    const rColor = palette[Math.floor(Math.random() * palette.length)];
    const rShape = shapesList[Math.floor(Math.random() * shapesList.length)];
    const rVx = -(Math.random() * 15 + 8);
    const rVy = -(Math.random() * 22 + 14);
    addParticle(viewWidth, viewHeight - 20, rVx, rVy, rColor, rShape);
  }
  
  // Clear any existing delayed burst timeouts
  if (confettiTimeoutId) clearTimeout(confettiTimeoutId);
  
  // 2. Second Wave (350ms later) for dynamic fireworks popping effect!
  confettiTimeoutId = setTimeout(() => {
    if (!state.isPlaying) {
      const secCount = 60;
      for (let i = 0; i < secCount; i++) {
        // Left-center popping launcher
        const lColor = palette[Math.floor(Math.random() * palette.length)];
        const lShape = shapesList[Math.floor(Math.random() * shapesList.length)];
        const lVx = Math.random() * 11 + 5;
        const lVy = -(Math.random() * 18 + 12);
        addParticle(viewWidth * 0.15, viewHeight - 20, lVx, lVy, lColor, lShape);
        
        // Right-center popping launcher
        const rColor = palette[Math.floor(Math.random() * palette.length)];
        const rShape = shapesList[Math.floor(Math.random() * shapesList.length)];
        const rVx = -(Math.random() * 11 + 5);
        const rVy = -(Math.random() * 18 + 12);
        addParticle(viewWidth * 0.85, viewHeight - 20, rVx, rVy, rColor, rShape);
      }
    }
  }, 350);
  
  cancelAnimationFrame(confettiAnimationId);
  
  function updateFrame() {
    ctx.clearRect(0, 0, viewWidth, viewHeight);
    let anyActive = false;
    
    confettiParticles.forEach(p => {
      if (p.opacity <= 0) return;
      anyActive = true;
      
      // Physics calculations (gravity + wind resistance check)
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // Airy gravity weight for floating beautifully
      p.vx *= 0.982; // Deceleration damping
      p.vy *= 0.982;
      
      // Romantic fluttering swing motion
      p.swing += p.swingSpeed;
      p.x += Math.sin(p.swing) * 1.1;
      
      // Update rotation
      p.rotation += p.rotationSpeed;
      
      // Decay opacity slowly as they begin falling
      if (p.vy > 0) {
        p.opacity -= 0.0055;
      }
      p.opacity = Math.max(0, p.opacity);
      
      // Draw shape with gorgeous high-contrast white border and ambient shadow
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.globalAlpha = p.opacity;
      
      // Super deep multi-dimensional shadow to pop from dark keys background
      ctx.shadowColor = 'rgba(0, 0, 0, 0.48)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = p.color;
      
      // Bright crisp thick white outline
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.0;
      
      if (p.shape === 'petal') {
        // Cherry blossom petal with exquisite notch
        ctx.beginPath();
        ctx.moveTo(0, p.size * 0.45);
        ctx.bezierCurveTo(-p.size * 0.85, -p.size * 0.35, -p.size * 0.45, -p.size * 1.25, 0, -p.size * 0.65);
        ctx.bezierCurveTo(p.size * 0.45, -p.size * 1.25, p.size * 0.85, -p.size * 0.35, 0, p.size * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (p.shape === 'tear') {
        // Smooth teardrop rose/camellia petal
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.5, p.size * 0.7, p.size * 0.7, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.7, p.size * 0.7, -p.size * 0.7, -p.size * 0.5, 0, -p.size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (p.shape === 'leaf') {
        // Oval golden willow leaf
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 1.3);
        ctx.quadraticCurveTo(p.size * 0.6, 0, 0, p.size * 1.3);
        ctx.quadraticCurveTo(-p.size * 0.6, 0, 0, -p.size * 1.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (p.shape === 'spark') {
        // Sparking five-point shiny golden star
        ctx.beginPath();
        const rot = Math.PI / 2 * 3;
        const spikes = 5;
        const step = Math.PI / spikes;
        let cx = 0, cy = 0;
        let x = cx, y = cy;
        const outerRadius = p.size;
        const innerRadius = p.size * 0.4;
        
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
          x = cx + Math.cos(rot + i * 2 * step) * outerRadius;
          y = cy + Math.sin(rot + i * 2 * step) * outerRadius;
          ctx.lineTo(x, y);
          x = cx + Math.cos(rot + i * 2 * step + step) * innerRadius;
          y = cy + Math.sin(rot + i * 2 * step + step) * innerRadius;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      
      ctx.restore();
    });
    
    if (anyActive) {
      confettiAnimationId = requestAnimationFrame(updateFrame);
    }
  }
  
  updateFrame();
}

function clearConfetti() {
  cancelAnimationFrame(confettiAnimationId);
  if (confettiTimeoutId) clearTimeout(confettiTimeoutId);
  const canvas = document.getElementById('confetti-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  confettiParticles = [];
}

// Trigger initialization on content load
document.addEventListener('DOMContentLoaded', initApplication);
