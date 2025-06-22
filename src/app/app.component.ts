import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';
// import { Subject } from 'rxjs';
// import { SpeechRecognitionService } from './speech';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit{
  //solution 1
  //   transcript = '';

  // constructor(private speech: SpeechRecognitionService) {}

  // start() {
  //   this.speech.startListening().subscribe({
  //     next: text => {this.transcript = text;console.log(text)},
  //     error: err => console.error('Error:', err),
  //     complete: () => console.log('Speech recognition ended')
  //   });
  // }

  // stop() {
  //   this.speech.stopListening();
  // }


    //solution 2
//   constructor(private speechService: SpeechRecognitionService) {}

// start() {
//   this.speechService.startListening(
//     (transcript) => {
//       console.log('Heard:', transcript);
//     },
//     (error) => {
//       console.error('Speech error:', error);
//     },
//     () => {
//       console.log('Listening started');
//     },
//     () => {
//       console.log('Listening stopped');
//     }
//   );
// }

// stop() {
//   this.speechService.stopListening();
// }

  lang: any = 'en';
  searchKeywords: string = '';
  products: any = [];
  hideSearch: boolean = true;
  recentSearch: any = [];
  popularSearch: any = [];
  isListening: boolean = false;
  recognition: any;
  hideMobileIcon: boolean = false;
  @ViewChild('inputText') inputText!: ElementRef<HTMLInputElement>;
  // canvas wave form
  @ViewChild('waveformCanvas') waveformCanvas!: ElementRef<HTMLCanvasElement>;
  audioContext!: AudioContext;
  analyser!: AnalyserNode;
  dataArray!: Uint8Array;
  source!: MediaStreamAudioSourceNode;
  animationId: number = 0;
  isRedirected: boolean = false;
  userLoggedIn: boolean = false;
  searchSubject = new Subject<string>();

  constructor(

    private cdr: ChangeDetectorRef,
  ) {
  
  }
  ngOnInit(): void {
    this.initSpeechRecognition();

  }

  initSpeechRecognition(): void {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = this.lang === 'en' ? 'ar-SA' : 'ar-SA';

      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event: any) => {
        const results = event.results[0];
        if (results.isFinal) {
          const transcript = results[0].transcript.trim();
          console.log("recording",transcript)
          if (transcript) {
            this.searchKeywords = transcript;
            // window.location.reload()
            // this.onSubmit(this.searchKeywords);
          } else {
            this.retrySpeechRecognition();
          }
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.cdr.detectChanges();
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
        this.cdr.detectChanges();
      };
    } else {
      console.error('Speech Recognition API is not supported in this browser.');
    }
  }

  retrySpeechRecognition(): void {
    console.log('Retrying speech recognition...');
    setTimeout(() => {
      if (!this.isListening) {
        this.recognition.start();
        this.isListening = true;
      }
    }, 500);
  }

  toggleSpeechRecognition(event: any): void {
    console.log(this.isListening)
    if (this.isListening) {
      this.recognition.stop();
      this.stopVisualizer();
      this.isListening = false;
      this.cdr.detectChanges();
    } else {
      this.recognition.start();
      this.isListening = true;
      this.startVisualizer();
    }
  }
  startVisualizer(): void {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        this.audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64; // ~32 bars

        const bufferLength = this.analyser.frequencyBinCount; // 32
        this.dataArray = new Uint8Array(bufferLength);

        this.source = this.audioContext.createMediaStreamSource(stream);
        this.source.connect(this.analyser);

      })
      .catch((err) => {
        console.error('Microphone access denied', err);
      });
  }

  stopVisualizer(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.audioContext) this.audioContext.close();
  }

}
