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
  
  // Tozalash funktsiyasi - bu juda muhim
  const cleanup = () => {
    // MediaRecorder to'xtatish
    if (mediaRecorder.current && (recording || mediaRecorder.current.state === 'recording')) {
      try {
        mediaRecorder.current.stop();
      } catch (e) {
        console.error("Error stopping recorder:", e);
      }
    }
    
    // Taymerni to'xtatish
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    
    // Barcha audio treklarni to'xtatish
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
    
    // Audio kontekst tozalash
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
    
    // URL ni bekor qilish
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
  };
  
  // Komponent tugaganda tozalash
  useEffect(() => {
    // Mikrofon ruxsatini komponent yuklanishida so'rash
    const requestInitialPermission = async () => {
      try {
        const initialStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Initial microphone permission granted");
        
        // Ruxsat olish uchun yaratilgan stream treklar to'xtatish
        initialStream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error("Initial permission request failed:", err);
      }
    };
    
    requestInitialPermission();
    
    return () => {
      cleanup();
    };
  }, []);
  
  // Faylni saqlash funktsiyasi
  const downloadBlob = (blob, filename) => {
    // Faylni saqlash uchun element
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    
    // URL yaratish va yuklash
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename || 'recording.mp3';
    a.click();
    
    // Tozalash
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  // Mikrofon va brauzer qo'llab-quvvatlashini tekshirish
  const checkSupport = async () => {
    // MediaRecorder qo'llab-quvvatlashini tekshirish
    if (!window.MediaRecorder) {
      throw new Error('MediaRecorder API is not supported in this browser');
    }
    
    // Mikrofon ruxsatini tekshirish
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Mikrofondan foydalanish uchun ruxsat berilmadi. Iltimos, mikrofonni ruxsat bering.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('Mikrofon topilmadi. Mikrofoningiz ulangan ekanligini tekshiring.');
      } else {
        throw err;
      }
    }
  };
  
  // Yozib olishni boshlash - bundan oldin to'liq tozalanib olinadi
  const startRecording = async () => {
    try {
      // Avval barcha resurslarni tozalash
      cleanup();
      
      // Status o'zgartirish
      setError(null);
      setMediaBlob(null);
      setAudioURL(null);
      mediaChunks.current = [];
      
      // Mikrofon ruxsatini tekshirish
      await checkSupport();
      
      console.log("Starting new recording...");
      
      // Media stream olish - audio berilganlarni ko'paytirish
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,           // Monorejim
          sampleRate: 44100          // CD sifati
        },
        video: false
      });
      
      streamRef.current = stream;
      
      // Audio treklarini tekshirish
      const audioTracks = stream.getAudioTracks();
      console.log(`Audio tracks: ${audioTracks.length}`);
      audioTracks.forEach((track, i) => {
        console.log(`Track ${i}: enabled=${track.enabled}, kind=${track.kind}, label=${track.label}`);
      });
      
      // Audio sifatini yaxshilash uchun WebAudio API ishlatish
      try {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        audioSourceNode.current = audioContext.current.createMediaStreamSource(stream);
        
        // Audio balandligini kuzatish
        const analyser = audioContext.current.createAnalyser();
        analyser.fftSize = 256;
        audioSourceNode.current.connect(analyser);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // Audio balandligi tekshiruvi
        const checkAudioLevel = () => {
          if (!analyser) return;
          
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          
          // Agat mikrofon juda past ovozda ishlayotgan bo'lsa
          if (average < 5 && recording) {
            console.warn("WARNING: Microphone level is very low or muted!");
          }
          
          if (recording) {
            requestAnimationFrame(checkAudioLevel);
          }
        };
        
        // Audio destination yaratish
        const destination = audioContext.current.createMediaStreamDestination();
        audioSourceNode.current.connect(destination);
        
        // MediaRecorder yaratish - bu destination orqali bo'ladi
        // Eng yaxshi format tanlash
        let options = {};
        
        // Formatlarni tekshirish
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm', audioBitsPerSecond: 128000 };
          console.log("Using WebM format");
        } 
        else if (MediaRecorder.isTypeSupported('audio/mp3')) {
          options = { mimeType: 'audio/mp3', audioBitsPerSecond: 128000 };
          console.log("Using MP3 format");
        }
        else if (MediaRecorder.isTypeSupported('audio/wav')) {
          options = { mimeType: 'audio/wav', audioBitsPerSecond: 128000 };
          console.log("Using WAV format");
        }
        else {
          console.log("Using browser default format");
        }
        
        mediaRecorder.current = new MediaRecorder(destination.stream, options);
        
        // Audio levelni kuzatishni boshlash
        checkAudioLevel();
      } catch (audioCtxError) {
        console.error("WebAudio API error, falling back to direct recording:", audioCtxError);
        // WebAudio API ishlamasa, to'g'ridan-to'g'ri MediaRecorder ishlatish
        mediaRecorder.current = new MediaRecorder(stream);
      }
      
      // To'g'ri chunklar olish uchun intervalni kamaytiramiz
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log(`Chunk received: ${event.data.size} bytes`);
          mediaChunks.current.push(event.data);
        }
      };
      
      // Xatolarni tutib olish
      mediaRecorder.current.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError(`Recording error: ${event.error?.message || "unknown"}`);
        cleanup();
      };
      
      // Yozib olish tugaganda
      mediaRecorder.current.onstop = () => {
        console.log(`Recording stopped. Collected ${mediaChunks.current.length} chunks`);
        
        if (mediaChunks.current.length > 0) {
          try {
            // Audio blob yaratish - turini to'g'ri o'rnatish bilan
            const mimeType = mediaRecorder.current.mimeType || 'audio/webm';
            console.log(`Creating blob with type: ${mimeType}`);
            
            const blob = new Blob(mediaChunks.current, { type: mimeType });
            console.log(`Created blob: ${blob.size} bytes`);
            
            if (blob.size > 0) {
              // URL yaratish
              const url = URL.createObjectURL(blob);
              setAudioURL(url);
              
              // Audio testlash
              const testAudio = new Audio(url);
              testAudio.onloadedmetadata = () => {
                console.log(`Test audio duration: ${testAudio.duration}s`);
                if (testAudio.duration < 0.1) {
                  console.warn("WARNING: Audio duration is very short!");
                }
              };
              
              // Base64 formatga o'tkazish
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
          setError("Audio ma'lumotlari yozib olinmadi. Mikrofoningizni tekshiring.");
        }
      };
      
      // Yozib olishni boshlash
      // Tez-tez chunklar olish uchun 100ms intervalda
      mediaRecorder.current.start(100);
      setRecording(true);
      console.log("Recording started successfully");
      
      // Taymerni boshlash
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
  
  // Yozib olishni to'xtatish
  const stopRecording = () => {
    console.log("Stopping recording...");
    try {
      if (mediaRecorder.current && (recording || mediaRecorder.current.state === 'recording')) {
        // So'nggi chunkni olish
        mediaRecorder.current.requestData();
        
        // Yozuvni to'xtatish
        mediaRecorder.current.stop();
        console.log("MediaRecorder stopped");
        
        // Audio treklar to'xtatish
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Taymer to'xtatish
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
  
  // Yozib olingan ma'lumotlarni tozalash
  const resetRecording = () => {
    // Resurslarni ozod qilish 
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    
    // Holatni tozalash
    setAudioURL(null);
    setMediaBlob(null);
    setRecordingTime(0);
    setError(null);
    mediaChunks.current = [];
  };
  
  // Yozib olingan audioni o'ynatish
  const playRecording = () => {
    console.log("Playing recording");
    
    if (audioURL) {
      try {
        const audio = new Audio();
        
        // Xatolarni aniqlash
        audio.onerror = (e) => {
          console.error("Audio playback error:", e);
          setError(`Error playing audio: ${audio.error?.message || "unknown error"}`);
        };
        
        audio.onloadstart = () => console.log("Audio loading started");
        audio.oncanplay = () => console.log("Audio can be played");
        audio.onplay = () => console.log("Audio playback started");
        audio.onended = () => console.log("Audio playback completed");
        
        // Maksimal balandlik
        audio.volume = 1.0;
        
        // Manbani o'rnatish
        audio.src = audioURL;
        
        // Musiqani o'ynatish
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio is playing");
            })
            .catch(err => {
              console.error("Error playing audio:", err);
              
              // Foydalanuvchi interaktsiyasi autoplay uchun
              if (err.name === 'NotAllowedError') {
                console.log("Autoplay was prevented");
                setError("Audio o'ynatish uchun sahifada bir joyga bosing");
                
                // Klikdan keyin o'ynatish
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
      // Base64 dan audio yaratish
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
        
        // Xatolar uchun tekshirish
        audio.onerror = (e) => {
          console.error("Audio playback error:", e);
          setError(`Error playing audio: ${audio.error?.message || "unknown error"}`);
        };
        
        // O'ynatish
        audio.play().catch(err => {
          console.error("Error playing from base64:", err);
          
          if (err.name === 'NotAllowedError') {
            console.log("Autoplay prevented, waiting for user interaction");
            setError("Audio o'ynatish uchun sahifada bir joyga bosing");
            
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
      setError("Hozir o'ynatish uchun audio yo'q");
      return null;
    }
  };
  
  // Audioni yuklab olish
  const saveRecording = (filename = 'recording.wav') => {
    if (mediaChunks.current.length > 0) {
      try {
        const mimeType = mediaRecorder.current?.mimeType || 'audio/webm';
        const blob = new Blob(mediaChunks.current, { type: mimeType });
        downloadBlob(blob, filename);
        return true;
      } catch (e) {
        console.error("Error saving recording:", e);
        setError(`Error saving recording: ${e.message}`);
        return false;
      }
    } else if (audioURL) {
      try {
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
      setError("Hozir yuklab olish uchun audio yo'q");
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
    saveRecording
  };
};

export default useMediaRecorder;
