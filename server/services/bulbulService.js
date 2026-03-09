/**
 * Sarvam AI – Bulbul v3 Text-to-Speech Service
 *
 * Wraps the Sarvam AI REST API for the Bulbul:v3 model.
 * API key is read exclusively from the SARVAM_API_KEY environment variable.
 *
 * REST endpoint: POST https://api.sarvam.ai/text-to-speech
 *
 * Docs: https://docs.sarvam.ai/api-reference-docs/text-to-speech/convert
 */

const logger = require('../utils/logger');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SARVAM_API_URL = 'https://api.sarvam.ai/text-to-speech';
const DEFAULT_MODEL = 'bulbul:v3';
const DEFAULT_LANGUAGE = 'en-IN';
const DEFAULT_SPEAKER = 'Shubh';
const DEFAULT_PACE = 1.0;
const DEFAULT_SAMPLE_RATE = 24000;
const MAX_CHARS_PER_REQUEST = 2500;

/** All speakers supported by Bulbul v3 */
const BULBUL_SPEAKERS = [
    'Shubh', 'Aditya', 'Ritu', 'Priya', 'Neha', 'Rahul', 'Pooja', 'Rohan',
    'Simran', 'Kavya', 'Amit', 'Dev', 'Ishita', 'Shreya', 'Ratan', 'Varun',
    'Manan', 'Sumit', 'Roopa', 'Kabir', 'Aayan', 'Ashutosh', 'Advait',
    'Amelia', 'Sophia', 'Anand', 'Tanya', 'Tarun', 'Sunny', 'Mani',
    'Gokul', 'Vijay', 'Shruti', 'Suhani', 'Mohit', 'Kavitha', 'Rehan',
    'Soham', 'Rupali',
];

/** BCP-47 language codes supported by Bulbul v3 */
const BULBUL_LANGUAGES = [
    'en-IN', // English (Indian accent)
    'hi-IN', // Hindi
    'bn-IN', // Bengali
    'ta-IN', // Tamil
    'te-IN', // Telugu
    'gu-IN', // Gujarati
    'kn-IN', // Kannada
    'ml-IN', // Malayalam
    'mr-IN', // Marathi
    'pa-IN', // Punjabi
    'od-IN', // Odia
];

/** Supported sample rates (Hz). Higher rates only via REST API. */
const SUPPORTED_SAMPLE_RATES = [8000, 16000, 22050, 24000, 32000, 44100, 48000];

// ---------------------------------------------------------------------------
// Helper: chunk text at word boundaries ≤ MAX_CHARS_PER_REQUEST
// ---------------------------------------------------------------------------

/**
 * Splits `text` into an array of strings, each ≤ maxChars characters,
 * breaking only at word/sentence boundaries to preserve prosody.
 *
 * @param {string} text
 * @param {number} [maxChars]
 * @returns {string[]}
 */
function chunkText(text, maxChars = MAX_CHARS_PER_REQUEST) {
    if (text.length <= maxChars) return [text];

    const chunks = [];
    // Prefer splitting at sentence endings, then paragraph breaks, then spaces
    const sentences = text.replace(/([.!?])\s+/g, '$1\n').split('\n');
    let current = '';

    for (const sentence of sentences) {
        const candidate = current ? `${current} ${sentence}` : sentence;
        if (candidate.length <= maxChars) {
            current = candidate;
        } else {
            if (current) chunks.push(current.trim());
            // If a single sentence is still > maxChars, split at spaces
            if (sentence.length > maxChars) {
                const words = sentence.split(' ');
                let wordChunk = '';
                for (const word of words) {
                    const c = wordChunk ? `${wordChunk} ${word}` : word;
                    if (c.length <= maxChars) {
                        wordChunk = c;
                    } else {
                        if (wordChunk) chunks.push(wordChunk.trim());
                        wordChunk = word;
                    }
                }
                current = wordChunk;
            } else {
                current = sentence;
            }
        }
    }
    if (current) chunks.push(current.trim());
    return chunks.filter(Boolean);
}

/**
 * Helper: concatenate multiple WAV buffers into a single valid WAV
 */
function concatenateWavBuffers(audioBuffers) {
    if (!audioBuffers || audioBuffers.length === 0) return Buffer.alloc(0);
    if (audioBuffers.length === 1) return audioBuffers[0];

    const { WaveFile } = require('wavefile');
    let formatInfo = null;
    let combinedSamples = [];

    for (const buf of audioBuffers) {
        const wav = new WaveFile(buf);
        if (!formatInfo) {
            formatInfo = {
                numChannels: wav.fmt.numChannels,
                sampleRate: wav.fmt.sampleRate,
                bitDepth: wav.bitDepth,
            };
        }
        combinedSamples.push(wav.getSamples(false));
    }

    let finalSamples;
    if (formatInfo.numChannels === 1) {
        const totalLen = combinedSamples.reduce((acc, curr) => acc + curr.length, 0);
        finalSamples = [new Float64Array(totalLen)];
        let offset = 0;
        for (const s of combinedSamples) {
            finalSamples[0].set(s, offset);
            offset += s.length;
        }
    } else {
        finalSamples = [];
        for (let c = 0; c < formatInfo.numChannels; c++) {
            const totalLen = combinedSamples.reduce((acc, curr) => acc + curr[c].length, 0);
            const channelSamples = new Float64Array(totalLen);
            let offset = 0;
            for (const s of combinedSamples) {
                channelSamples.set(s[c], offset);
                offset += s[c].length;
            }
            finalSamples.push(channelSamples);
        }
    }

    const outputWav = new WaveFile();
    outputWav.fromScratch(formatInfo.numChannels, formatInfo.sampleRate, formatInfo.bitDepth, finalSamples);
    return Buffer.from(outputWav.toBuffer());
}

// ---------------------------------------------------------------------------
// Core TTS function
// ---------------------------------------------------------------------------

/**
 * Generates speech audio from text using Sarvam AI Bulbul v3.
 *
 * For texts longer than 2500 chars, the function automatically chunks the
 * text and concatenates the resulting WAV buffers.
 *
 * @param {Object} params
 * @param {string}  params.text              - Text to synthesise
 * @param {string}  [params.languageCode]    - BCP-47 code (default: 'en-IN')
 * @param {string}  [params.speaker]         - Speaker name (default: 'Shubh')
 * @param {number}  [params.pace]            - Speech rate 0.5–2.0 (default: 1.0)
 * @param {number}  [params.sampleRate]      - Hz (default: 24000)
 * @returns {Promise<{ audioBuffer: Buffer, mimeType: string }>}
 */
async function generateSpeech({
    text,
    languageCode = DEFAULT_LANGUAGE,
    speaker = DEFAULT_SPEAKER,
    pace = DEFAULT_PACE,
    sampleRate = DEFAULT_SAMPLE_RATE,
}) {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
        throw new Error('SARVAM_API_KEY environment variable is not set. Cannot call Bulbul v3 TTS.');
    }

    // Validate inputs
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new Error('text must be a non-empty string');
    }
    if (!BULBUL_LANGUAGES.includes(languageCode)) {
        logger.warn(`[Bulbul] Unrecognised languageCode "${languageCode}", falling back to "${DEFAULT_LANGUAGE}"`);
        languageCode = DEFAULT_LANGUAGE;
    }
    if (!BULBUL_SPEAKERS.includes(speaker)) {
        logger.warn(`[Bulbul] Unrecognised speaker "${speaker}", falling back to "${DEFAULT_SPEAKER}"`);
        speaker = DEFAULT_SPEAKER;
    }
    pace = Math.min(2.0, Math.max(0.5, Number(pace) || DEFAULT_PACE));
    if (!SUPPORTED_SAMPLE_RATES.includes(sampleRate)) {
        logger.warn(`[Bulbul] Unsupported sampleRate ${sampleRate}, falling back to ${DEFAULT_SAMPLE_RATE}`);
        sampleRate = DEFAULT_SAMPLE_RATE;
    }

    const chunks = chunkText(text.trim());
    logger.info(`[Bulbul] Generating speech: ${chunks.length} chunk(s), speaker=${speaker}, lang=${languageCode}, pace=${pace}`);

    const audioBuffers = await Promise.all(
        chunks.map((chunk, idx) => _callSarvamAPI({ chunk, languageCode, speaker, pace, sampleRate, apiKey, idx }))
    );

    // Concatenate all WAV buffers
    const combined = concatenateWavBuffers(audioBuffers);
    return { audioBuffer: combined, mimeType: 'audio/wav' };
}

/**
 * Makes a single call to the Sarvam AI REST TTS endpoint.
 * @private
 */
async function _callSarvamAPI({ chunk, languageCode, speaker, pace, sampleRate, apiKey, idx = 0 }) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000); // 30s timeout

    try {
        const response = await fetch(SARVAM_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': apiKey,
            },
            body: JSON.stringify({
                inputs: [chunk],
                target_language_code: languageCode,
                speaker,
                pace,
                sample_rate: sampleRate,
                model: DEFAULT_MODEL,
                enable_preprocessing: true,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const errText = await response.text().catch(() => 'unknown error');
            throw new Error(`Sarvam API error ${response.status}: ${errText}`);
        }

        const data = await response.json();

        // Bulbul v3 returns base64-encoded WAV audio in data.audios[]
        if (!data.audios || !Array.isArray(data.audios) || data.audios.length === 0) {
            throw new Error('Sarvam API returned no audio data');
        }

        return Buffer.from(data.audios[0], 'base64');
    } catch (err) {
        clearTimeout(timeout);
        if (err.name === 'AbortError') {
            throw new Error(`Sarvam API request timed out (chunk ${idx + 1})`);
        }
        throw err;
    }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
    generateSpeech,
    chunkText,
    BULBUL_SPEAKERS,
    BULBUL_LANGUAGES,
    DEFAULT_SPEAKER,
    DEFAULT_LANGUAGE,
    DEFAULT_PACE,
    DEFAULT_SAMPLE_RATE,
    MAX_CHARS_PER_REQUEST,
};
