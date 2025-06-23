import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  isListening: boolean = false;
  recognition: any;
  hideMobileIcon: boolean = false;

  // canvas waveform
  audioContext!: AudioContext;
  analyser!: AnalyserNode;
  dataArray!: Uint8Array;
  source!: MediaStreamAudioSourceNode;
  animationId: number = 0;

  word = 'hello';
  end = '';
  onresult = '';
  result = '';
  private mediaStream?: MediaStream;

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.initSpeechRecognition();
  }

  initSpeechRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 5;

      this.recognition.onresult = (event: any) => {
        this.ngZone.run(() => {
          this.onresult = 'result';
          const results = event.results[0];
          this.result = results[0].transcript.trim();

          if (results.isFinal) {
            const transcript = results[0].transcript.trim();
            console.log('recording', transcript);

            if (transcript) {
              this.word = transcript;
            } else {
              this.word = 'un';
              this.retrySpeechRecognition();
            }
            this.cdr.detectChanges();
          }
        });
      };

      this.recognition.onend = () => {
        this.ngZone.run(() => {
          this.isListening = false;
          this.end = 'end';
          this.recognition.stop();
          this.cdr.detectChanges();
        });
      };

      this.recognition.onerror = (event: any) => {
        this.ngZone.run(() => {
          console.error('Speech recognition error:', event.error);
          this.isListening = false;
          this.word = 'error';
          this.cdr.detectChanges();
        });
      };
    } else {
      console.error('Speech Recognition API is not supported in this browser.');
    }
  }

  retrySpeechRecognition(): void {
    console.log('Retrying speech recognition...');
    setTimeout(() => {
      if (!this.isListening) {
        this.ngZone.runOutsideAngular(() => {
          this.recognition.start();
          this.ngZone.run(() => {
            this.isListening = true;
          });
        });
      }
    }, 500);
  }

  toggleSpeechRecognition(event: any): void {
    if (this.isListening) {
      this.recognition.stop();
      // this.stopVisualizer();
      this.isListening = false;
      this.cdr.detectChanges();
    } else {
      this.end = '';
      this.ngZone.runOutsideAngular(() => {
        this.recognition.start();
        this.ngZone.run(() => {
          this.isListening = true;
          // this.startVisualizer(); // optional
        });
      });
    }
  }

  startVisualizer(): void {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        this.mediaStream = stream;
        this.audioContext = new AudioContext();
      })
      .catch((err) => {
        console.error('Microphone access denied', err);
      });
  }

  stopVisualizer(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.audioContext) this.audioContext.close();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = undefined;
    }
  }
}
