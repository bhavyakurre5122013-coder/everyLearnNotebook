(function(ns){
    "use strict";

    function normalizeText(value, options = {}) {
        let text = String(value ?? "");
        if (!options.caseSensitive) text = text.toLowerCase();
        return text.replace(/\r\n/g, "\n").trim();
    }

    function tokenize(value) {
        return String(value ?? "")
            .match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9]+|[^\sA-Za-zÀ-ÖØ-öø-ÿ0-9]/gu) || [];
    }

    function levenshtein(a, b) {
        const rows = a.length + 1;
        const cols = b.length + 1;
        const dp = Array.from({ length: rows }, () => Array(cols).fill(0));
        for (let i = 0; i < rows; i++) dp[i][0] = i;
        for (let j = 0; j < cols; j++) dp[0][j] = j;
        for (let i = 1; i < rows; i++) {
            for (let j = 1; j < cols; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + cost
                );
            }
        }
        return dp[a.length][b.length];
    }

    function similarity(a, b) {
        const left = String(a ?? "").trim().toLowerCase();
        const right = String(b ?? "").trim().toLowerCase();
        if (!left && !right) return 1;
        if (!left || !right) return 0;
        const distance = levenshtein(left, right);
        return Math.max(0, 1 - distance / Math.max(left.length, right.length));
    }

    function splitPoints(value) {
        const source = String(value ?? "").trim();
        if (!source) return [];
        const pieces = source
            .split(/\n+|(?:^|\s)(?:\d+|[a-zA-Z])\s*[.)]\s+|\s*[•●▪◦]\s+|\s*;\s+/g)
            .map(item => item.trim())
            .filter(Boolean);
        if (pieces.length > 1) return pieces;
        const sentenceParts = source
            .split(/(?<=[.!?।])\s+/u)
            .map(item => item.trim())
            .filter(Boolean);
        return sentenceParts.length > 1 ? sentenceParts : [source];
    }

    function compareTokens(expected, received, options) {
        const e = tokenize(normalizeText(expected, options));
        const a = tokenize(normalizeText(received, options));
        const rows = Array.from({ length: e.length + 1 }, () => Array(a.length + 1).fill(0));
        for (let i = 1; i <= e.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                rows[i][j] = e[i - 1] === a[j - 1]
                    ? rows[i - 1][j - 1] + 1
                    : Math.max(rows[i - 1][j], rows[i][j - 1]);
            }
        }

        const matched = new Set();
        let i = e.length;
        let j = a.length;
        while (i > 0 && j > 0) {
            if (e[i - 1] === a[j - 1]) {
                matched.add(`${i - 1}:${j - 1}`);
                i--; j--;
            } else if (rows[i - 1][j] >= rows[i][j - 1]) {
                i--;
            } else {
                j--;
            }
        }

        const expectedFlags = e.map((token, index) => {
            const found = [...matched].some(key => Number(key.split(":")[0]) === index);
            return { token, status: found ? "correct" : "missing" };
        });

        const receivedFlags = a.map((token, index) => {
            const found = [...matched].some(key => Number(key.split(":")[1]) === index);
            return { token, status: found ? "correct" : "extra" };
        });

        const punctuationErrors = [];
        if (options.punctuationStrict) {
            const expectedPunctuation = e.filter(token => /[^\p{L}\p{N}]/u.test(token));
            const receivedPunctuation = a.filter(token => /[^\p{L}\p{N}]/u.test(token));
            const count = Math.max(expectedPunctuation.length, receivedPunctuation.length);
            for (let index = 0; index < count; index++) {
                if (expectedPunctuation[index] !== receivedPunctuation[index]) {
                    punctuationErrors.push({
                        expected: expectedPunctuation[index] || "",
                        received: receivedPunctuation[index] || ""
                    });
                }
            }
        }

        const spellingErrors = [];
        if (options.spellingStrict) {
            for (const item of expectedFlags) {
                if (item.status !== "correct" && /\p{L}/u.test(item.token)) {
                    const candidate = receivedFlags
                        .filter(part => part.status === "extra" && /\p{L}/u.test(part.token))
                        .sort((x, y) => similarity(item.token, y.token) - similarity(item.token, x.token))[0];
                    if (candidate && similarity(item.token, candidate.token) >= 0.55) {
                        spellingErrors.push({ expected: item.token, received: candidate.token });
                    }
                }
            }
        }

        const missingCount = expectedFlags.filter(item => item.status === "missing").length;
        const extraCount = receivedFlags.filter(item => item.status === "extra").length;
        const contentScore = e.length ? Math.max(0, (e.length - missingCount) / e.length) : (a.length ? 0 : 1);
        const punctuationPenalty = punctuationErrors.length ? Math.min(0.25, punctuationErrors.length / Math.max(1, e.length)) : 0;
        const spellingPenalty = spellingErrors.length ? Math.min(0.35, spellingErrors.length / Math.max(1, e.length)) : 0;
        const score = Math.max(0, Math.min(1, contentScore - punctuationPenalty - spellingPenalty));

        return {
            score,
            correct: score >= 0.999 && missingCount === 0 && extraCount === 0 && punctuationErrors.length === 0 && spellingErrors.length === 0,
            missing: expectedFlags.filter(item => item.status === "missing").map(item => item.token),
            extra: receivedFlags.filter(item => item.status === "extra").map(item => item.token),
            spellingErrors,
            punctuationErrors,
            expectedTokens: expectedFlags,
            receivedTokens: receivedFlags
        };
    }

    function compareText(expected, received, config = {}) {
        const options = {
            caseSensitive: Boolean(config.caseSensitive),
            punctuationStrict: config.punctuationStrict !== false,
            spellingStrict: config.spellingStrict !== false
        };

        const rawExpected = String(expected ?? "").trim();
        const rawReceived = String(received ?? "").trim();
        if (!rawExpected && !rawReceived) return {
            score: 1,
            correct: true,
            missing: [], extra: [], spellingErrors: [], punctuationErrors: [],
            expectedTokens: [], receivedTokens: [], points: []
        };

        const pointMode = config.pointBased !== false;
        const partialMode = config.partialCredit !== false;
        const expectedPoints = pointMode ? splitPoints(rawExpected) : [rawExpected];
        const receivedPoints = pointMode ? splitPoints(rawReceived) : [rawReceived];
        const pointResults = expectedPoints.map(expectedPoint => {
            let best = { score: 0, index: -1 };
            receivedPoints.forEach((receivedPoint, index) => {
                const candidate = compareTokens(expectedPoint, receivedPoint, options);
                if (candidate.score > best.score) best = { score: candidate.score, index };
            });
            return {
                expected: expectedPoint,
                matchedAnswer: best.index >= 0 ? receivedPoints[best.index] : "",
                score: best.score,
                correct: best.score >= 0.999,
                index: best.index
            };
        });

        const base = compareTokens(rawExpected, rawReceived, options);
        const pointScore = expectedPoints.length
            ? pointResults.reduce((sum, item) => sum + item.score, 0) / expectedPoints.length
            : base.score;
        const score = partialMode ? Math.max(base.score, pointScore) : base.score;

        return {
            ...base,
            score,
            correct: score >= 0.999 && base.correct,
            points: pointResults
        };
    }

    function compareChoice(question, answer) {
        const correctIds = (question.options || []).filter(option => option.correct).map(option => option.id).sort();
        const received = [...(answer.values || [])].sort();
        const correctCount = received.filter(value => correctIds.includes(value)).length;
        const extraCount = received.filter(value => !correctIds.includes(value)).length;
        const matched = new Set(received);
        const missingCount = correctIds.filter(value => !matched.has(value)).length;
        const total = Math.max(correctIds.length, received.length, 1);
        const score = Math.max(0, Math.min(1, (correctCount - extraCount) / total));
        return { score, correct: score === 1 && missingCount === 0 && extraCount === 0, missing: missingCount, extra: extraCount, points: [] };
    }

    function compareFill(question, answer, config) {
        const expected = question.answerData?.blanks || [];
        const received = answer.values || [];
        const count = Math.max(expected.length, received.length, 1);
        const points = expected.map((value, index) => {
            const result = compareText(value, received[index] || "", { ...config, pointBased: false });
            return { expected: value, matchedAnswer: received[index] || "", score: result.score, correct: result.correct, index };
        });
        return {
            score: points.reduce((sum, item) => sum + item.score, 0) / count,
            correct: points.length === expected.length && points.every(item => item.correct) && received.length === expected.length,
            missing: Math.max(0, expected.length - received.length),
            extra: Math.max(0, received.length - expected.length),
            spellingErrors: points.flatMap(item => item.correct ? [] : compareText(item.expected, item.matchedAnswer, { ...config, pointBased: false }).spellingErrors),
            punctuationErrors: points.flatMap(item => item.correct ? [] : compareText(item.expected, item.matchedAnswer, { ...config, pointBased: false }).punctuationErrors),
            points
        };
    }

    function compareTrueFalse(question, answer) {
        const expected = String(question.answer ?? "").trim().toLowerCase();
        const received = String(answer.value ?? "").trim().toLowerCase();
        return { score: expected === received ? 1 : 0, correct: expected === received, missing: expected === received ? [] : [expected], extra: expected === received ? [] : [received], points: [] };
    }

    function checkQuestion(question, answer, settings = {}, overrides = {}) {
        const global = settings?.checkingSystem || {};
        const config = {
            spellingStrict: global.spellingStrict !== false,
            punctuationStrict: global.punctuationStrict !== false,
            partialCredit: global.partialCredit !== false,
            pointBased: global.pointBased !== false,
            caseSensitive: Boolean(global.caseSensitive),
            ...question.checking,
            ...overrides
        };

        if (["text", "difference"].includes(question.type)) {
            return compareText(question.answer, answer.text, config);
        }
        if (question.type === "trueFalse") return compareTrueFalse(question, answer);
        if (["singleCorrect", "multipleCorrect"].includes(question.type)) return compareChoice(question, answer);
        if (question.type === "fill") return compareFill(question, answer, config);
        if (question.type === "caseBased") {
            const details = question.caseQuestions.map(sub => {
                const result = compareText(sub.answer, answer.values?.[sub.id] || "", config);
                return { ...result, expected: sub.answer, matchedAnswer: answer.values?.[sub.id] || "" };
            });
            const score = details.length ? details.reduce((sum, item) => sum + item.score, 0) / details.length : 0;
            return { score, correct: score >= 0.999 && details.every(item => item.correct), missing: [], extra: [], points: details };
        }
        if (question.type === "ordering") {
            const expected = question.orderItems.map(item => item.id);
            const received = answer.values || [];
            const total = Math.max(expected.length, received.length, 1);
            const correctCount = expected.filter((id, index) => received[index] === id).length;
            const score = correctCount / total;
            return { score, correct: score === 1 && expected.length === received.length, missing: [], extra: [], points: [] };
        }
        return { score: 0, correct: false, missing: [], extra: [], points: [] };
    }

    function scoreForQuestion(question, result) {
        const marks = Math.max(0, Number(question.marks) || 1);
        return Number((marks * Math.max(0, Math.min(1, result.score))).toFixed(2));
    }

    ns.checkQuestion = checkQuestion;
    ns.scoreForQuestion = scoreForQuestion;
})(window.everyLearn);
