
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from '@google/genai';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Activity, User, Shield, Terminal, Clock, Sparkles, MessageSquare, Volume2, Ear, RefreshCw, Radio, PlayCircle, StopCircle } from 'lucide-react';
import { User as UserType } from '../types';

interface AIInterviewerProps {
  onExit: () => void;
  currentUser: UserType;
}

const AIInterviewer: React.FC<AIInterviewerProps> = ({ onExit, currentUser }) => {
  const [isActive, setIsActive] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [inputTranscription, setInputTranscription] = useState('');
  const [outputTranscription, setOutputTranscription] = useState('');
  const [isAiTalking, setIsAiTalking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const frameIntervalRef = useRef<number | null>(null);

  // Audio Processing Helpers
  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  const startInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      });
      
      if (videoRef.current) videoRef.current.srcObject = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (!isMicOn || !isActive) return;
              const inputData = e.inputBuffer.getChannelData(0);
              
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setIsListening(rms > 0.01);

              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);

            frameIntervalRef.current = window.setInterval(() => {
              if (!isCameraOn || !videoRef.current || !canvasRef.current) return;
              const ctx = canvasRef.current.getContext('2d');
              if (!ctx) return;
              canvasRef.current.width = 320; 
              canvasRef.current.height = 240;
              ctx.drawImage(videoRef.current, 0, 0, 320, 240);
              
              canvasRef.current.toBlob(async (blob) => {
                if (blob) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64Data = (reader.result as string).split(',')[1];
                    sessionPromise.then(session => session.sendRealtimeInput({ 
                      media: { data: base64Data, mimeType: 'image/jpeg' } 
                    }));
                  };
                  reader.readAsDataURL(blob);
                }
              }, 'image/jpeg', 0.4);
            }, 1500);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setOutputTranscription(message.serverContent.outputTranscription.text);
              setIsAiTalking(true);
            } else if (message.serverContent?.inputTranscription) {
              setInputTranscription(message.serverContent.inputTranscription.text);
            }

            if (message.serverContent?.turnComplete) {
              setInputTranscription('');
              setIsAiTalking(false);
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              setIsAiTalking(true);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContextRef.current, 24000, 1);
              const source = outputAudioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContextRef.current.destination);
              source.addEventListener('ended', () => {
                audioSourcesRef.current.delete(source);
                if (audioSourcesRef.current.size === 0) setIsAiTalking(false);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              audioSourcesRef.current.add(source);
            }
          },
          onclose: () => setIsActive(false),
          onerror: (e) => console.error("Interviewer Connection Error", e)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: `You are the Lead Industrial Recruiter at TechNexus. 
          Your mission is to evaluate ${currentUser.name} for technical career readiness.
          
          1. Greet them and ask what technical role they want to interview for today (Python, ML, AI, Java, or C).
          2. Ask 5 high-level professional interview questions one at a time.
          3. REPEAT PROTOCOL: If the student says "repeat", "pardon", "what?", "say that again", or "didn't catch that", you MUST immediately repeat the last question clearly.
          4. TONE: Professional, firm but encouraging. 
          5. FEEDBACK: Give a brief technical summary at the end.`,
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start AI Interview:", err);
      alert("Please allow camera and microphone access to enter the hall.");
    }
  };

  const stopInterview = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsActive(false);
    onExit();
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-[32px] overflow-hidden border border-slate-800 shadow-2xl relative font-sans">
      {/* Hall Header */}
      <div className="h-20 bg-slate-950/50 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl transition-all ${isAiTalking ? 'bg-brand-orange/20 text-brand-orange' : 'bg-brand-cyan/10 text-brand-cyan'}`}>
            <Radio size={20} className={isAiTalking ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Interview Room</h2>
            <div className="flex items-center gap-2 mt-0.5">
               <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
               <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{isActive ? 'Live' : 'Ready'}</span>
            </div>
          </div>
        </div>
        <button 
            onClick={stopInterview} 
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider group"
        >
          <span className="hidden sm:inline">End Session</span>
          <PhoneOff size={16} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Student Visual Feed - Left */}
        <div className="w-full md:w-1/2 p-6 md:p-10 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col gap-6 border-r border-white/5 relative">
          <div className="flex-1 bg-black rounded-[24px] overflow-hidden relative shadow-lg ring-1 ring-white/10 group">
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity duration-700 ${!isCameraOn ? 'opacity-0' : 'opacity-100'}`} />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* User Label */}
            <div className="absolute top-4 left-4 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2">
               <User size={14} className="text-brand-cyan" />
               <span className="text-[10px] font-bold text-white uppercase tracking-wider">{currentUser.name}</span>
            </div>

            {/* Audio Visualizer Overlay */}
            <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-1 h-8 transition-opacity duration-300 ${isListening ? 'opacity-100' : 'opacity-20'}`}>
               {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1 bg-brand-cyan rounded-full transition-all duration-75" style={{ height: isListening ? `${20 + Math.random() * 60}%` : '20%' }}></div>
               ))}
            </div>

            {/* Camera Off Placeholder */}
            {!isCameraOn && (
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                     <VideoOff size={32} />
                  </div>
               </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <button 
                onClick={() => setIsMicOn(!isMicOn)} 
                className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all shadow-lg ${isMicOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white hover:bg-red-600'}`}
                title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
            >
              {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button 
                onClick={() => setIsCameraOn(!isCameraOn)} 
                className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all shadow-lg ${isCameraOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white hover:bg-red-600'}`}
                title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
            >
              {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
          </div>
        </div>

        {/* AI Recruiter Console - Right */}
        <div className="w-full md:w-1/2 p-6 md:p-10 bg-slate-50/5 relative flex flex-col">
          {!isActive ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="w-24 h-24 bg-gradient-to-br from-brand-cyan to-brand-blue rounded-[32px] shadow-2xl shadow-brand-cyan/20 flex items-center justify-center text-white">
                  <MessageSquare size={40} />
               </div>
               <div className="space-y-3 max-w-xs">
                  <h3 className="text-3xl font-bold text-white tracking-tight">Interview Prep</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                     Practice technical questions with our AI. Get real-time feedback and improve your confidence.
                  </p>
               </div>
               <button 
                onClick={startInterview} 
                className="px-10 py-4 bg-white text-slate-900 hover:bg-brand-cyan hover:text-white rounded-full font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
               >
                  <PlayCircle size={20} /> Start Interview
               </button>
            </div>
          ) : (
            <div className="h-full flex flex-col animate-fade-in relative">
                {/* Status Indicator */}
                <div className="absolute top-0 right-0 px-3 py-1 bg-slate-800 rounded-full border border-slate-700 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isAiTalking ? 'bg-brand-orange animate-pulse' : 'bg-emerald-500'}`}></div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                        {isAiTalking ? 'AI Speaking' : 'Listening'}
                    </span>
                </div>

               <div className="flex-1 flex flex-col justify-center space-y-12">
                   {/* Output Section */}
                   <div className="space-y-3">
                      <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-2">
                        <Volume2 size={14}/> AI Question
                      </span>
                      <div className="text-xl md:text-2xl font-medium text-white leading-relaxed">
                         {outputTranscription ? (
                             <span className="animate-in fade-in">{outputTranscription}</span>
                         ) : (
                             <span className="text-slate-500 italic">Thinking...</span>
                         )}
                      </div>
                   </div>

                   {/* Divider */}
                   <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                   {/* Input Section */}
                   <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Mic size={14}/> Your Answer
                      </span>
                      <div className="text-base text-slate-300 font-mono bg-slate-900/50 p-6 rounded-2xl border border-white/5 h-32 overflow-y-auto custom-scrollbar">
                         {inputTranscription || <span className="opacity-30">Waiting for you to speak...</span>}
                      </div>
                   </div>
               </div>

               {/* Hints Footer */}
               <div className="mt-auto grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5 flex items-center gap-3">
                     <div className="p-2 bg-brand-orange/10 rounded-lg text-brand-orange"><RefreshCw size={14}/></div>
                     <div className="text-xs text-slate-400">
                        <strong className="block text-slate-200 mb-0.5">Missed that?</strong>
                        Say "Repeat" to hear again
                     </div>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5 flex items-center gap-3">
                     <div className="p-2 bg-brand-cyan/10 rounded-lg text-brand-cyan"><Clock size={14}/></div>
                     <div className="text-xs text-slate-400">
                        <strong className="block text-slate-200 mb-0.5">Session Length</strong>
                        5 Questions Total
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInterviewer;
