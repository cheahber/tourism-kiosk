import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  // Initialize headerImage with the default image path
  const [headerImage, setHeaderImage] = useState('/tourism-header.jpg');
  const [navigationResult, setNavigationResult] = useState('No route selected');
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Welcome to the Tourism Kiosk! 👋 How can I help you explore our city today?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  // Add new state variables for image adjustment
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 }); // percentage values
  const [imageScale, setImageScale] = useState(1);
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Modified header image handler to handle both file uploads and default image
  const handleHeaderImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setHeaderImage(imageUrl);
      // Reset adjustments when new image is uploaded
      setImagePosition({ x: 50, y: 50 });
      setImageScale(1);
      setIsAdjusting(true);
    }
  };

  // Add handler for position change
  const handlePositionChange = (axis, value) => {
    setImagePosition(prev => ({
      ...prev,
      [axis]: value
    }));
  };

  // Add handler for scale change
  const handleScaleChange = (value) => {
    setImageScale(value);
  };

  // Reset to default image
  const handleResetImage = () => {
    setHeaderImage('/tourism-header.jpg');
  };

  useEffect(() => {
    // Check if speech recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
    } else {
      console.warn('Speech recognition is not supported in this browser');
    }

    // Add speaking status listener
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    } else {
      console.warn('Speech synthesis is not supported in this browser');
    }
  }, []);

  const startListening = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      setUserInput('Listening...');
    };
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      setUserInput(transcript);
      
      // If it's a final result, send the message
      if (event.results[0].isFinal) {
        handleSendMessage(null, transcript);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setUserInput('');
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  const speakMessage = (text) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    // Use a more natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => voice.lang === 'en-US' && !voice.localService);
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = (e, transcriptText = null) => {
    if (e) e.preventDefault();
    const textToSend = transcriptText || userInput;
    
    if (!textToSend.trim()) return;

    const newUserMessage = { type: 'user', text: textToSend };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    
    // Show typing indicator
    setMessages(prev => [...prev, { type: 'bot', text: '...', isTyping: true }]);
    
    setTimeout(() => {
      // Remove typing indicator and add actual response
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      const botResponse = `I'll help you find the best route to ${textToSend}. Please check the map for directions.`;
      const newBotMessage = { type: 'bot', text: botResponse };
      setMessages(prev => [...prev, newBotMessage]);
      speakMessage(botResponse);
    }, 1500);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header Image Section - 20vh height */}
      <div className="w-full px-4 pt-4 pb-2 h-[20vh] flex-shrink-0">
        <div className="bg-white rounded-xl p-2 w-full h-full">
          <div className="relative w-full h-full group">
            <Image
              src={headerImage}
              alt="Tourism Header"
              fill
              style={{
                objectFit: 'cover',
                objectPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                transform: `scale(${imageScale})`,
                transition: 'transform 0.2s, object-position 0.2s'
              }}
              className="rounded-lg"
              priority
            />
            
            {/* Image adjustment controls */}
            {isAdjusting && (
              <div className="absolute bottom-2 right-2 bg-black/70 p-2 rounded-lg space-y-1 w-[180px]">
                <div className="flex items-center gap-2">
                  <label className="text-white text-xs min-w-[60px]">Horizontal</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={imagePosition.x}
                    onChange={(e) => handlePositionChange('x', parseInt(e.target.value))}
                    className="w-full h-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-white text-xs min-w-[60px]">Vertical</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={imagePosition.y}
                    onChange={(e) => handlePositionChange('y', parseInt(e.target.value))}
                    className="w-full h-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-white text-xs min-w-[60px]">Zoom</label>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.1"
                    value={imageScale}
                    onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                    className="w-full h-2"
                  />
                </div>
                <button
                  onClick={() => setIsAdjusting(false)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white text-xs py-1 rounded transition-colors mt-1"
                >
                  Done
                </button>
              </div>
            )}

            {/* Existing overlay buttons - Modified positioning */}
            <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isAdjusting && (
                <>
                  <label 
                    htmlFor="header-image" 
                    className="cursor-pointer bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
                    title="Change Header Image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </label>
                  <button
                    onClick={() => setIsAdjusting(true)}
                    className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
                    title="Adjust Image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </button>
                  <button
                    onClick={handleResetImage}
                    className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
                    title="Reset to Default"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </>
              )}
              <input
                type="file"
                id="header-image"
                accept="image/*"
                onChange={handleHeaderImageChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Smaller gap - 2vh */}
      <div className="h-[2vh]" />

      {/* Main content grid - 78vh height (remaining space) */}
      <div className="flex-1 px-4 pb-4 h-[78vh]">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Chatbot - Left Side */}
          <div className="col-span-5 flex flex-col">
            <div className="bg-white rounded-xl shadow-lg flex flex-col h-full">
              {/* Chat Header */}
              <div className="chat-header p-3 border-b flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    Tourism Assistant
                    {isSpeaking && (
                      <span className="animate-pulse text-blue-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.47 3.12a.75.75 0 011.06 0l5 5a.75.75 0 010 1.06l-5 5a.75.75 0 11-1.06-1.06l3.72-3.72H5a.75.75 0 010-1.5h13.19l-3.72-3.72a.75.75 0 010-1.06z" />
                        </svg>
                      </span>
                    )}
                  </h2>
                  <button
                    onClick={speechSupported ? startListening : () => {}}
                    disabled={!speechSupported}
                    title={!speechSupported ? "Speech recognition is not supported in this browser" : ""}
                    className={`speech-toggle-btn flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                      ${isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : speechSupported 
                          ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span className="text-sm font-medium">
                      {isListening ? 'Listening...' : 'Voice Input'}
                    </span>
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-500">💡 Tips:</span>
                  <div className="flex gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      Click messages to hear them
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      Use voice button to speak
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Area - scrollable */}
              <div className="flex-1 overflow-y-auto p-3 min-h-0">
                <div className="space-y-3">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`message-bubble ${message.type} ${message.isTyping ? 'typing' : ''} 
                                  ${message.type === 'bot' ? 'hover:bg-blue-50 transition-colors cursor-pointer' : ''}`}
                        onClick={() => message.type === 'bot' && !message.isTyping && speakMessage(message.text)}
                      >
                        {message.isTyping ? (
                          <div className="flex gap-1 items-center">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {message.text}
                            {message.type === 'bot' && (
                              <span className="text-xs text-gray-400 hover:text-blue-500">
                                🔊
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Input - fixed height */}
              <div className="p-3 border-t flex-shrink-0">
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={isListening ? 'Listening...' : 'Type your message or use voice input...'}
                        className={`chat-input w-full pl-4 pr-10 py-3 rounded-lg border
                          ${isListening 
                            ? 'border-red-500 bg-red-50 animate-pulse' 
                            : 'border-gray-200 focus:border-blue-500'}`}
                        readOnly={isListening}
                      />
                      {isListening && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <button 
                      type="submit" 
                      className="send-button"
                      disabled={isListening || !userInput.trim()}
                    >
                      <span>Send</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Side Container */}
          <div className="col-span-7 flex flex-col h-full">
            {/* Map - Top Right */}
            <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden mb-4">
              <div className="h-full w-full">
                <Map />
              </div>
            </div>

            {/* Navigation Info - Bottom Right */}
            <div className="h-[200px] bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-full p-3 overflow-y-auto">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Navigation Details</h2>
                <div className="navigation-details">
                  {navigationResult}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
