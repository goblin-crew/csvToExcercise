window.AppSession = window.AppSession || (() => {
    const state = {
        words: [],
        index: 0
    };

    function setWords(words) {
        state.words = Array.isArray(words) ? words.slice() : [];
        state.index = 0;
    }

    function current() {
        return state.words[state.index] || null;
    }

    function advance() {
        if (state.index < state.words.length) {
            state.index += 1;
        }
        return current();
    }

    function getCompletedCount(checked) {
        return Math.min(state.index + (checked ? 1 : 0), state.words.length);
    }

    function isFinished() {
        return state.index >= state.words.length;
    }

    return {
        state,
        setWords,
        current,
        advance,
        getCompletedCount,
        isFinished
    };
})();