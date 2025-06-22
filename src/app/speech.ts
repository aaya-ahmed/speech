//solution 1
//  import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable, Subject } from 'rxjs';

// declare var webkitSpeechRecognition: any;

// @Injectable({
//   providedIn: 'root'
// })
// export class SpeechRecognitionService {
//   private recognition: any;
//   private result$ = new Subject<string>();
//   private isListeningSubject = new BehaviorSubject<boolean>(false);
//   public isListening$ = this.isListeningSubject.asObservable();

//   constructor() {
//     const SpeechRecognition = (window as any)['SpeechRecognition'] || (window as any)['webkitSpeechRecognition'];
//     if (!SpeechRecognition) {
//       throw new Error('SpeechRecognition is not supported in this browser.');
//     }

//     this.recognition = new SpeechRecognition();
//     this.recognition.lang = 'en-US'; // Change as needed
//     this.recognition.continuous = false;
//     this.recognition.interimResults = false;
//     this.recognition.maxAlternatives = 1;

//     this.attachEvents();
//   }

//   private attachEvents() {
//     this.recognition.onstart = () => this.isListeningSubject.next(true);

//     this.recognition.onend = () => {
//       this.isListeningSubject.next(false);
//       this.result$.complete();
//       this.result$ = new Subject<string>();
//     };

//     this.recognition.onerror = (event: any) => {
//       console.error('SpeechRecognition error:', event.error);
//       this.result$.error(event);
//     };

//     this.recognition.onresult = (event: any) => {
//       const transcript = event.results[0][0].transcript;
//       this.result$.next(transcript);
//     };
//   }

//   startListening(): Observable<string> {
//     this.result$ = new Subject<string>();
//     try {
//       this.recognition.start();
//     } catch (err) {
//       console.warn('Recognition start error:', err);
//     }
//     return this.result$.asObservable();
//   }

//   stopListening(): void {
//     this.recognition.stop();
//   }
// }


//solution 2
// import { Injectable } from '@angular/core';

// declare var webkitSpeechRecognition: any;

// @Injectable({
//   providedIn: 'root'
// })
// export class SpeechRecognitionService {
//   private recognition: any;
//   private isListening = false;

//   private onResultCallback?: (transcript: string) => void;
//   private onErrorCallback?: (error: any) => void;
//   private onStartCallback?: () => void;
//   private onEndCallback?: () => void;

//   constructor() {
//     const SpeechRecognition = (window as any)['SpeechRecognition'] || (window as any)['webkitSpeechRecognition'];
//     if (!SpeechRecognition) {
//       throw new Error('SpeechRecognition is not supported in this browser.');
//     }

//     this.recognition = new SpeechRecognition();
//     this.recognition.lang = 'en-US';
//     this.recognition.continuous = false;
//     this.recognition.interimResults = false;
//     this.recognition.maxAlternatives = 1;

//     this.attachEvents();
//   }

//   private attachEvents() {
//     this.recognition.onstart = () => {
//       this.isListening = true;
//       if (this.onStartCallback) this.onStartCallback();
//     };

//     this.recognition.onend = () => {
//       this.isListening = false;
//       if (this.onEndCallback) this.onEndCallback();
//     };

//     this.recognition.onerror = (event: any) => {
//       if (this.onErrorCallback) this.onErrorCallback(event);
//     };

//     this.recognition.onresult = (event: any) => {
//       const transcript = event.results[0][0].transcript;
//       if (this.onResultCallback) this.onResultCallback(transcript);
//     };
//   }

//   /**
//    * Starts listening for speech input.
//    */
//   startListening(
//     onResult: (transcript: string) => void,
//     onError?: (error: any) => void,
//     onStart?: () => void,
//     onEnd?: () => void
//   ) {
//     this.onResultCallback = onResult;
//     this.onErrorCallback = onError;
//     this.onStartCallback = onStart;
//     this.onEndCallback = onEnd;

//     try {
//       this.recognition.start();
//     } catch (err) {
//       if (this.onErrorCallback) this.onErrorCallback(err);
//     }
//   }

//   /**
//    * Stops listening manually.
//    */
//   stopListening(): void {
//     this.recognition.stop();
//   }

//   /**
//    * Returns current listening state.
//    */
//   isCurrentlyListening(): boolean {
//     return this.isListening;
//   }
// }
