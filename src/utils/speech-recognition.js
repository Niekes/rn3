import {
    has,
    isEmpty,
} from './object';

// eslint-disable-next-line import/prefer-default-export
export function checkSpeechRecognition(sr) {
    if (isEmpty(sr.settings) || !has(sr.settings, 'enabled')) {
        return false;
    }

    if (has(sr.settings, 'enabled') && sr.settings.enabled === false) {
        return false;
    }

    try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        const speechRecognition = new SpeechRecognition();

        speechRecognition.continuous = true;
        speechRecognition.interimResults = true;
        speechRecognition.lang = sr.settings.language;
        speechRecognition.onresult = sr.onresult;
        speechRecognition.onerror = sr.onerror;
        speechRecognition.onnomatch = sr.onnomatch;
        speechRecognition.onspeechend = sr.onspeechend;

        return speechRecognition;
    } catch (e) {
        return false;
    }
}
