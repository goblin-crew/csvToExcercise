window.AppUtils = window.AppUtils || (() => {
    function normalize(s) {
        return (s || '').toLowerCase().trim().replace(/\s+/g, ' ');
    }

    function safeEncode(obj) {
        return btoa(encodeURIComponent(JSON.stringify(obj)));
    }

    function safeDecode(str) {
        return JSON.parse(decodeURIComponent(atob(str)));
    }

    function seededRNG(seed) {
        let s = seed >>> 0;
        if (!s) s = Math.floor(Math.random() * 0xffffffff);
        return function () {
            s += 0x6D2B79F5;
            let t = Math.imul(s ^ s >>> 15, 1 | s);
            t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    function seededShuffle(arr, rng) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function parseSeed(str) {
        if (!str || !str.trim()) return Math.floor(Math.random() * 99999);
        const n = parseInt(str);
        if (!isNaN(n)) return n;
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = Math.imul(31, h) + str.charCodeAt(i) | 0;
        }
        return Math.abs(h) % 99999;
    }

    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    return {
        normalize,
        safeEncode,
        safeDecode,
        seededRNG,
        seededShuffle,
        parseSeed,
        shuffle
    };
})();