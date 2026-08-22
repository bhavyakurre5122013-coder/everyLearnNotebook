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

    function normalizeAnswerValues(answer) {
        return Array.isArray(answer?.values) ? answer.values.filter(value => value !== null && value !== undefined).map(String) : [];
    }

    function resultStatus(score, correct, answered, partialCredit = true) {
        if (!answered) return "unanswered";
        if (correct) return "correct";
        if (partialCredit && score > 0) return "partial";
        return "incorrect";
    }

    function compareChoice(question, answer, config = {}) {
        const correctIds = (question.options || []).filter(option => option.correct).map(option => String(option.id));
        const received = [...new Set(normalizeAnswerValues(answer))];
        const receivedSet = new Set(received);
        const correctSet = new Set(correctIds);
        const correctCount = received.filter(value => correctSet.has(value)).length;
        const extraCount = received.filter(value => !correctSet.has(value)).length;
        const missingCount = correctIds.filter(value => !receivedSet.has(value)).length;
        const total = Math.max(correctIds.length, received.length, 1);
        const rawScore = (correctCount - extraCount) / total;
        const score = config.partialCredit === false && (missingCount > 0 || extraCount > 0)
            ? 0
            : Math.max(0, Math.min(1, rawScore));
        const correct = correctIds.length > 0 && missingCount === 0 && extraCount === 0 && received.length === correctIds.length;
        return {
            score,
            correct,
            status: resultStatus(score, correct, received.length > 0, config.partialCredit !== false),
            missing: correctIds.filter(value => !receivedSet.has(value)),
            extra: received.filter(value => !correctSet.has(value)),
            points: []
        };
    }

    function compareFill(question, answer, config) {
        const expected = Array.isArray(question.answerData?.blanks) ? question.answerData.blanks : [];
        const received = normalizeAnswerValues(answer);
        const answered = received.some(value => value.trim() !== "");
        const count = Math.max(expected.length, received.length, 1);
        const points = expected.map((value, index) => {
            const expectedValue = String(value ?? "").trim();
            const receivedValue = String(received[index] ?? "");
            const answeredValue = receivedValue.trim();
            if (!expectedValue) {
                return { expected: value, matchedAnswer: receivedValue, score: 0, correct: false, index, status: answeredValue ? "incorrect" : "unanswered" };
            }
            const result = compareText(expectedValue, receivedValue, { ...config, pointBased: false });
            return { expected: value, matchedAnswer: receivedValue, score: result.score, correct: result.correct, index, status: resultStatus(result.score, result.correct, answeredValue !== "", config.partialCredit !== false) };
        });
        const score = expected.length ? Math.max(0, Math.min(1, points.reduce((sum, item) => sum + item.score, 0) / Math.max(expected.length, 1))) : 0;
        const correct = expected.length > 0 && received.length === expected.length && points.every(item => item.correct);
        return {
            score: config.partialCredit === false && !correct ? 0 : score,
            correct,
            status: resultStatus(config.partialCredit === false && !correct ? 0 : score, correct, answered, config.partialCredit !== false),
            missing: Math.max(0, expected.length - received.length),
            extra: Math.max(0, received.length - expected.length),
            spellingErrors: points.flatMap(item => item.correct ? [] : compareText(item.expected, item.matchedAnswer, { ...config, pointBased: false }).spellingErrors),
            punctuationErrors: points.flatMap(item => item.correct ? [] : compareText(item.expected, item.matchedAnswer, { ...config, pointBased: false }).punctuationErrors),
            points
        };
    }

    function compareTrueFalse(question, answer) {
        const expected = String(question.answer ?? "").trim().toLowerCase();
        const received = String(answer?.value ?? "").trim().toLowerCase();
        const answered = received !== "";
        const correct = answered && expected !== "" && expected === received;
        return {
            score: correct ? 1 : 0,
            correct,
            status: resultStatus(correct ? 1 : 0, correct, answered),
            missing: correct ? [] : [expected],
            extra: correct || !answered ? [] : [received],
            points: []
        };
    }

    function compareAssertionReasoning(question, answer) {
        const expected = String(question.answerData?.result ?? "").trim().toLowerCase();
        const received = String(answer?.value ?? "").trim().toLowerCase();
        const answered = received !== "";
        const correct = answered && expected !== "" && expected === received;
        return {
            score: correct ? 1 : 0,
            correct,
            status: resultStatus(correct ? 1 : 0, correct, answered),
            expected,
            received,
            missing: correct ? [] : [expected],
            extra: correct || !answered ? [] : [received],
            points: []
        };
    }

    function compareOrdering(question, answer, config = {}) {
        const expected = Array.isArray(question.orderItems) ? question.orderItems.map(item => String(item.id)) : [];
        const received = normalizeAnswerValues(answer);
        const answered = received.length > 0;
        const total = Math.max(expected.length, 1);
        const correctCount = expected.reduce((count, id, index) => count + (received[index] === id ? 1 : 0), 0);
        const score = expected.length ? correctCount / total : 0;
        const correct = expected.length > 0 && received.length === expected.length && correctCount === expected.length;
        return {
            score: config.partialCredit === false && !correct ? 0 : score,
            correct,
            status: resultStatus(config.partialCredit === false && !correct ? 0 : score, correct, answered, config.partialCredit !== false),
            missing: expected.filter(id => !received.includes(id)),
            extra: received.filter(id => !expected.includes(id)),
            points: expected.map((id, index) => ({ expected: id, received: received[index] || "", correct: received[index] === id, score: received[index] === id ? 1 : 0, index }))
        };
    }

    function compareMatching(question, answer, config = {}) {
        const pairs = Array.isArray(question.pairs) ? question.pairs : [];
        const expectedMap = question.matchingConnections && typeof question.matchingConnections === "object"
            ? question.matchingConnections
            : {};
        const receivedMap = answer?.values && typeof answer.values === "object" && !Array.isArray(answer.values) ? answer.values : {};
        const answered = Object.values(receivedMap).some(value => String(value ?? "").trim() !== "");
        const points = pairs.map(pair => {
            const expected = expectedMap[pair.id] ?? pair.id;
            const received = receivedMap[pair.id] ?? "";
            return { expected, received, correct: String(expected) === String(received), score: String(expected) === String(received) ? 1 : 0, id: pair.id };
        });
        const score = points.length ? points.reduce((sum, item) => sum + item.score, 0) / points.length : 0;
        const correct = points.length > 0 && points.every(item => item.correct) && Object.keys(receivedMap).every(id => pairs.some(pair => pair.id === id));
        return {
            score: config.partialCredit === false && !correct ? 0 : score,
            correct,
            status: resultStatus(config.partialCredit === false && !correct ? 0 : score, correct, answered, config.partialCredit !== false),
            missing: points.filter(item => !item.correct).map(item => item.expected),
            extra: Object.keys(receivedMap).filter(id => !pairs.some(pair => pair.id === id)),
            points
        };
    }

    function compareDifference(question, answer, config = {}) {
        const rows = Array.isArray(question.difference?.rows) ? question.difference.rows : [];
        const receivedRows = answer?.values && typeof answer.values === "object" && !Array.isArray(answer.values) ? answer.values : {};
        const points = [];
        for (const row of rows) {
            const expectedValues = Array.isArray(row.values) ? row.values : [];
            const receivedValues = Array.isArray(receivedRows[row.id]) ? receivedRows[row.id] : [];
            const cellCount = Math.max(expectedValues.length, receivedValues.length, 1);
            let correctCells = 0;
            for (let index = 0; index < cellCount; index++) {
                const expected = String(expectedValues[index] ?? "").trim();
                const received = String(receivedValues[index] ?? "").trim();
                if (!expected) {
                    points.push({ rowId: row.id, index, expected, received, score: 0, correct: false, status: received ? "incorrect" : "unanswered" });
                    continue;
                }
                const result = compareText(expected, received, { ...config, pointBased: false });
                correctCells += result.correct ? 1 : 0;
                points.push({ rowId: row.id, index, expected, received, score: result.score, correct: result.correct });
            }
        }
        const totalCells = Math.max(points.length, 1);
        const score = rows.length ? correctCellsScore(points) : 0;
        const answered = points.some(item => item.received !== "");
        const correct = rows.length > 0 && points.length > 0 && points.every(item => item.correct) && rows.every(row => Array.isArray(receivedRows[row.id]) && receivedRows[row.id].length === (row.values || []).length);
        return {
            score: config.partialCredit === false && !correct ? 0 : score,
            correct,
            status: resultStatus(config.partialCredit === false && !correct ? 0 : score, correct, answered, config.partialCredit !== false),
            missing: points.filter(item => !item.correct).map(item => item.expected),
            extra: [],
            points,
            totalCells
        };
    }

    function correctCellsScore(points) {
        return points.length ? points.reduce((sum, item) => sum + item.score, 0) / points.length : 0;
    }

    function checkQuestion(question, answer = {}, settings = {}, overrides = {}) {
        if (!question || typeof question !== "object") {
            return { score: 0, correct: false, status: "unanswered", missing: [], extra: [], points: [] };
        }
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

        if (question.type === "text") {
            const received = String(answer?.text ?? "");
            if (!received.trim()) return { score: 0, correct: false, status: "unanswered", missing: [String(question.answer ?? "")], extra: [], points: [] };
            const result = compareText(question.answer, received, config);
            return { ...result, status: resultStatus(result.score, result.correct, true, config.partialCredit !== false) };
        }
        if (question.type === "fill") return compareFill(question, answer, config);
        if (question.type === "trueFalse") return compareTrueFalse(question, answer);
        if (["singleCorrect", "multipleCorrect"].includes(question.type)) return compareChoice(question, answer, config);
        if (question.type === "assertionReasoning") return compareAssertionReasoning(question, answer);
        if (question.type === "ordering") return compareOrdering(question, answer, config);
        if (question.type === "matching") return compareMatching(question, answer, config);
        if (question.type === "difference") return compareDifference(question, answer, config);
        if (question.type === "caseBased") {
            const subQuestions = Array.isArray(question.caseQuestions) ? question.caseQuestions : [];
            const receivedValues = answer?.values && typeof answer.values === "object" ? answer.values : {};
            const details = subQuestions.map(sub => {
                const subAnswer = receivedValues[sub.id] || {};
                const result = checkQuestion(sub, subAnswer, settings, overrides);
                return { ...result, id: sub.id, expected: sub.answer, matchedAnswer: subAnswer };
            });
            const score = details.length ? details.reduce((sum, item) => sum + item.score, 0) / details.length : 0;
            const answered = details.some(item => item.status !== "unanswered");
            const correct = details.length > 0 && details.every(item => item.correct);
            return {
                score: config.partialCredit === false && !correct ? 0 : score,
                correct,
                status: resultStatus(config.partialCredit === false && !correct ? 0 : score, correct, answered, config.partialCredit !== false),
                missing: details.filter(item => !item.correct).map(item => item.id),
                extra: [],
                points: details
            };
        }
        return { score: 0, correct: false, status: "unanswered", missing: [], extra: [], points: [] };
    }

    function scoreForQuestion(question, result) {
        const marks = Math.max(0, Number(question.marks) || 1);
        const normalizedScore = Number.isFinite(Number(result?.score)) ? Number(result.score) : 0;
        return Number((marks * Math.max(0, Math.min(1, normalizedScore))).toFixed(2));
    }

    ns.checkQuestion = checkQuestion;
    ns.scoreForQuestion = scoreForQuestion;
})(window.everyLearn);
