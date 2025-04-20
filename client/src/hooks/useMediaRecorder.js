import { useState, useEffect, useRef } from 'react';

const useMediaRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [mediaBlob, setMediaBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState(null);
  
  const mediaRecorder = useRef(null);
  const mediaChunks = useRef([]);
  const timerInterval = useRef(null);
  const streamRef = useRef(null);
  const audioSourceNode = useRef(null);
  const audioContext = useRef(null);
  
  // Тозалаш функцияси - бу жуда муҳим
  const cleanup = () => {
    // MediaRecorder тўхтатиш
    if (mediaRecorder.current && (recording || mediaRecorder.current.state === 'recording')) {
      try {
        mediaRecorder.current.stop();
      } catch (e) {
        console.error("Error stopping recorder:", e);
      }
    }
    
    // Таймерни тўхтатиш
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    
    // Барча аудио треклани тўхтатиш
    if (streamRef.current) {
      try {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => {
          track.stop();
          streamRef.current.removeTrack(track);
        });
        streamRef.current = null;
      } catch (e) {
        console.error("Error stopping tracks:", e);
      }
    }
    
    // Аудио контекст тозалаш
    if (audioSourceNode.current) {
      try {
        audioSourceNode.current.disconnect();
        audioSourceNode.current = null;
      } catch (e) {
        console.error("Error disconnecting audio source:", e);
      }
    }
    
    if (audioContext.current && audioContext.current.state !== 'closed') {
      try {
        audioContext.current.close();
        audioContext.current = null;
      } catch (e) {
        console.error("Error closing audio context:", e);
      }
    }
    
    // URL ни бекор қилиш
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
  };
  
  // Компонент тугаганда тозалаш
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);
  
  // Файлни сақлаш функцияси
  const downloadBlob = (blob, filename) => {
    // Файлни сақлаш учун элемент
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    
    // URL яратиш ва юклаш
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename || 'recording.mp3';
    a.click();
    
    // Тозалаш
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  // Микрофон ва браузер қўллаб-қувватлашини текшириш
  const checkSupport = async () => {
    // MediaRecorder қўллаб-қувватлашини текшириш
    if (!window.MediaRecorder) {
      throw new Error('MediaRecorder API is not supported in this browser');
    }
    
    // Микрофон рухсатини текшириш
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Microphone permission denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('No microphone found');
      } else {
        throw err;
      }
    }
  };
  
  // Ёзиб олишни бошлаш - бундан олдин тўлиқ тозаланиб олинади
  const startRecording = async () => {
    try {
      // Аввал барча ресурсларни тозалаш
      cleanup();
      
      // Статус ўзгартириш
      setError(null);
      setMediaBlob(null);
      setAudioURL(null);
      mediaChunks.current = [];
      
      // Микрофон рухсатини текшириш
      await checkSupport();
      
      console.log("Starting new recording...");
      
      // Медиа стрим олиш - аудио берилганларни кўпайтирамиз
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,             // Монорежим
          sampleRate: 44100,           // CD сифати
          sampleSize: 16               // 16 бит
        },
        video: false
      });
      
      streamRef.current = stream;
      
      // Аудио сифатини яхшилаш учун WebAudio API ишлатамиз
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      audioSourceNode.current = audioContext.current.createMediaStreamSource(stream);
      
      // Аудио баландлигини кузатиш
      const analyser = audioContext.current.createAnalyser();
      analyser.fftSize = 256;
      audioSourceNode.current.connect(analyser);
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Аудио баландлиги текшируви
      const checkAudioLevel = () => {
        if (!analyser) return;
        
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        // Натижаларни логлаш
        console.log("Mic level:", average);
        
        // Агар микрофон жуда паст овозда ишлаётган бўлса
        if (average < 5) {
          console.warn("WARNING: Microphone level is very low or muted!");
        }
        
        if (recording) {
          requestAnimationFrame(checkAudioLevel);
        }
      };
      
      // Аудио destination яратиш
      const destination = audioContext.current.createMediaStreamDestination();
      audioSourceNode.current.connect(destination);
      
      // Энг яхши формат танлаш
      let options = {};
      
      // Форматларни текшириш
      if (MediaRecorder.isTypeSupported('audio/wav')) {
        options = { mimeType: 'audio/wav', audioBitsPerSecond: 128000 };
        console.log("Using WAV format");
      } 
      else if (MediaRecorder.isTypeSupported('audio/mp3')) {
        options = { mimeType: 'audio/mp3', audioBitsPerSecond: 128000 };
        console.log("Using MP3 format");
      }
      else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm', audioBitsPerSecond: 256000 };
        console.log("Using WebM format with higher bitrate");
      }
      else {
        console.log("Using browser default format");
      }
      
      // MediaRecorder яратиш - бу destination орқали бўлади
      mediaRecorder.current = new MediaRecorder(destination.stream, options);
      
      // Тўғри чанклар олиш учун интервални камайтирамиз
      mediaRecorder.current.ondataavailable = (event) => {
        console.log(`Chunk received: ${event.data.size} bytes, type: ${event.data.type}`);
        if (event.data && event.data.size > 0) {
          mediaChunks.current.push(event.data);
        }
      };
      
      // Хатоларни тутиб олиш
      mediaRecorder.current.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError(`Recording error: ${event.error?.message || "unknown"}`);
        cleanup();
      };
      
      // Ёзиб олиш тугаганда
      mediaRecorder.current.onstop = () => {
        console.log(`Recording stopped. Collected ${mediaChunks.current.length} chunks`);
        
        if (mediaChunks.current.length > 0) {
          try {
            // Аудио блоб яратиш - турини тўғри ўрнатиш билан
            const mimeType = mediaRecorder.current.mimeType || 'audio/wav';
            console.log(`Creating blob with type: ${mimeType}`);
            
            const blob = new Blob(mediaChunks.current, { type: mimeType });
            console.log(`Created blob: ${blob.size} bytes`);
            
            // Тест учун аудиони тўғридан-тўғри юклаб олиш
            // Номи timestamp билан бўлади
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            // Файлни сақлаш - текшириш учун
            // downloadBlob(blob, `recording-${timestamp}.${mimeType.split('/')[1]}`);
            
            if (blob.size > 0) {
              // URL яратиш
              const url = URL.createObjectURL(blob);
              setAudioURL(url);
              
              // Аудио тестлаш
              const testAudio = new Audio(url);
              testAudio.onloadedmetadata = () => {
                console.log(`Test audio duration: ${testAudio.duration}s`);
                if (testAudio.duration < 0.1) {
                  console.warn("WARNING: Audio duration is very short!");
                }
              };
              
              // Base64 форматга ўтказиш
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64data = reader.result;
                setMediaBlob(base64data);
                console.log(`Converted to base64, length: ${base64data.length}`);
              };
              reader.readAsDataURL(blob);
            } else {
              throw new Error("Created blob is empty!");
            }
          } catch (e) {
            console.error("Error processing recording:", e);
            setError(`Processing error: ${e.message}`);
          }
        } else {
          console.error("No audio data was collected!");
          setError("No audio data was recorded. Please check your microphone.");
        }
      };
      
      // Ёзиб олишни бошлаш
      // Тез-тез чунклар олиш учун 100ms интервалда
      mediaRecorder.current.start(100);
      setRecording(true);
      console.log("Recording started successfully");
      
      // Аудио баландлигини кузатишни бошлаш
      checkAudioLevel();
      
      // Таймерни бошлаш
      setRecordingTime(0);
      timerInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error("Recording setup failed:", error);
      setError(`Could not start recording: ${error.message}`);
      cleanup();
    }
  };
  
  // Ёзиб олишни тўхтатиш
  const stopRecording = () => {
    console.log("Stopping recording...");
    try {
      if (mediaRecorder.current && (recording || mediaRecorder.current.state === 'recording')) {
        // Сўнгги чанкни олиш
        mediaRecorder.current.requestData();
        
        // Ёзувни тўхтатиш
        mediaRecorder.current.stop();
        console.log("MediaRecorder stopped");
        
        // Аудио треклар тўхтатиш
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Таймер тўхтатиш
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
          timerInterval.current = null;
        }
        
        setRecording(false);
      } else {
        console.warn("MediaRecorder is not recording");
      }
    } catch (e) {
      console.error("Error stopping recording:", e);
      setError(`Error stopping recording: ${e.message}`);
      setRecording(false);
    }
  };
  
  // Ёзиб олинган маълумотларни тозалаш
  const resetRecording = () => {
    // Ресурсларни озод қилиш 
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    
    // Ҳолатни тозалаш
    setAudioURL(null);
    setMediaBlob(null);
    setRecordingTime(0);
    setError(null);
    mediaChunks.current = [];
  };
  
  // Ёзиб олинган аудиони ўйнатиш
  const playRecording = () => {
    console.log("Playing recording");
    
    if (audioURL) {
      try {
        const audio = new Audio();
        
        // Хатоларни аниқлаш
        audio.onerror = (e) => {
          console.error("Audio playback error:", e);
          setError(`Error playing audio: ${audio.error?.message || "unknown error"}`);
        };
        
        audio.onloadstart = () => console.log("Audio loading started");
        audio.oncanplay = () => console.log("Audio can be played");
        audio.onplay = () => console.log("Audio playback started");
        audio.onended = () => console.log("Audio playback completed");
        
        // Максимал баландлик
        audio.volume = 1.0;
        
        // Манбани ўрнатиш
        audio.src = audioURL;
        
        // Мусиқани ўйнатиш
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio is playing");
            })
            .catch(err => {
              console.error("Error playing audio:", err);
              
              // Фойдаланувчи интеракцияси автоплей учун
              if (err.name === 'NotAllowedError') {
                console.log("Autoplay was prevented");
                alert("Please click to play audio");
                
                // Кликдан кейин ўйнатиш
                const playOnClick = () => {
                  audio.play().catch(e => {
                    console.error("Play error after click:", e);
                  });
                  document.removeEventListener('click', playOnClick);
                };
                
                document.addEventListener('click', playOnClick, { once: true });
              } else {
                setError(`Could not play recording: ${err.message}`);
              }
            });
        }
        
        return audio;
      } catch (e) {
        console.error("Error setting up audio:", e);
        setError(`Error setting up audio: ${e.message}`);
        return null;
      }
    } else if (mediaBlob) {
      // Base64 дан аудио яратиш
      try {
        const parts = mediaBlob.split(',');
        const byteString = atob(parts[1]);
        const mimeType = parts[0].match(/:(.*?);/)[1];
        
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        
        const audio = new Audio();
        audio.src = url;
        audio.volume = 1.0;
        
        // Хатолар учун текшириш
        audio.onerror = (e) => {
          console.error("Audio playback error:", e);
          setError(`Error playing audio: ${audio.error?.message || "unknown error"}`);
        };
        
        // Ўйнатиш
        audio.play().catch(err => {
          console.error("Error playing from base64:", err);
          
          if (err.name === 'NotAllowedError') {
            console.log("Autoplay prevented, waiting for user interaction");
            alert("Please click to play audio");
            
            const playOnClick = () => {
              audio.play().catch(e => {
                console.error("Play error after click:", e);
              });
              document.removeEventListener('click', playOnClick);
            };
            
            document.addEventListener('click', playOnClick, { once: true });
          } else {
            setError(`Could not play recording: ${err.message}`);
          }
        });
        
        return audio;
      } catch (e) {
        console.error("Error creating audio from base64:", e);
        setError(`Error creating audio from base64: ${e.message}`);
        return null;
      }
    } else {
      setError("No recording to play");
      return null;
    }
  };
  
  // Аудиони юклаб олиш
  const saveRecording = (filename = 'recording.wav') => {
    if (mediaChunks.current.length > 0) {
      try {
        // WAV форматда юклаш
        const blob = new Blob(mediaChunks.current, { type: 'audio/wav' });
        downloadBlob(blob, filename);
        return true;
      } catch (e) {
        console.error("Error saving recording:", e);
        setError(`Error saving recording: ${e.message}`);
        return false;
      }
    } else if (audioURL) {
      try {
        // AudioURL орқали юклаш
        fetch(audioURL)
          .then(res => res.blob())
          .then(blob => {
            downloadBlob(blob, filename);
          });
        return true;
      } catch (e) {
        console.error("Error saving from URL:", e);
        setError(`Error saving from URL: ${e.message}`);
        return false;
      }
    } else {
      setError("No recording to save");
      return false;
    }
  };
  
  return {
    recording,
    mediaBlob,
    audioURL,
    recordingTime,
    error,
    startRecording,
    stopRecording,
    resetRecording,
    playRecording,
    saveRecording  // Янги экспорт қилинган файлни сақлаш функцияси
  };
};

export default useMediaRecorder;
