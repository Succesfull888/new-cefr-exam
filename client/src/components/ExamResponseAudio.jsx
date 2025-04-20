import React, { useState, useEffect } from 'react';

const ExamResponseAudio = ({ audioUrl }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify we have a valid URL
    if (!audioUrl) {
      setError('Audio URL is missing');
      setLoading(false);
      return;
    }

    // Check if audio element can load the file
    const testAudio = new Audio();
    
    const handleError = () => {
      console.error('Audio failed to load:', audioUrl, testAudio.error);
      setError(`Failed to load audio: ${testAudio.error?.message || 'unknown error'}`);
      setLoading(false);
    };
    
    const handleCanPlay = () => {
      console.log('Audio can be played:', audioUrl);
      setLoading(false);
    };
    
    testAudio.addEventListener('error', handleError);
    testAudio.addEventListener('canplay', handleCanPlay);
    
    // Set audio source
    testAudio.src = audioUrl;
    
    // Set a timeout to prevent infinite loading state
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Audio loading timed out. Please try again.');
      }
    }, 10000); // 10 seconds timeout

    return () => {
      testAudio.pause();
      testAudio.src = '';
      testAudio.removeEventListener('error', handleError);
      testAudio.removeEventListener('canplay', handleCanPlay);
      clearTimeout(timeout);
    };
  }, [audioUrl, loading]);

  if (error) {
    return (
      <div className="audio-error">
        <p>Error: {error}</p>
        <p>Audio URL: {audioUrl}</p>
        <button onClick={() => window.open(audioUrl, '_blank')}>
          Try opening directly
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="audio-loading">Loading audio...</div>;
  }

  return (
    <div className="audio-player">
      <audio controls src={audioUrl} preload="auto" style={{ width: '100%' }}>
        Your browser does not support the audio element.
      </audio>
      <div className="audio-controls">
        <a href={audioUrl} download target="_blank" rel="noopener noreferrer" className="download-button">
          Download Audio
        </a>
      </div>
    </div>
  );
};

export default ExamResponseAudio;
