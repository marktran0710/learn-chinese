// Audio/Speech utility for pronunciation
export class PronunciationPlayer {
  static speak(text: string, language: string = "zh-CN") {
    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.8; // Slower for better clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    speechSynthesis.speak(utterance);
  }

  static stopSpeaking() {
    speechSynthesis.cancel();
  }

  static isSpeaking(): boolean {
    return speechSynthesis.speaking;
  }
}
