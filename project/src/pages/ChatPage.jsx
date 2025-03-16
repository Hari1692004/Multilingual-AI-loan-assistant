import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Lightbulb, Mic, X } from 'lucide-react';
import axios from 'axios';
import './ChatPage.css';

const suggestions = [
  "Check my loan eligibility",
  "Guide me through loan application",
  "Show me financial tips",
  "Explain loan terms in my language"
];

function ChatPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: "Hello! I'm your Loan Advisor AI. How can I assist you with your financial journey today?"
    }
  ]);
  const [userDetails, setUserDetails] = useState('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/user-details', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUserDetails(response.data.userDetails);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };
    fetchUserDetails();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages([
      ...messages,
      { type: 'user', content: input },
      { type: 'assistant', content: 'Processing your request...' }
    ]);

    setInput('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/api/chat', {
        message: input
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessages(prev => [
        ...prev.slice(0, -1),
        { type: 'assistant', content: response.data.response }
      ]);
    } catch (error) {
      console.error('Error sending message to backend:', error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { type: 'assistant', content: 'Error connecting to the chat service. Please try again.' }
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setIsRecording(false);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please ensure permission is granted and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validExtensions = ['wav', 'mp3'];
      const extension = file.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes(extension)) {
        alert('Invalid file format. Please upload a WAV or MP3 file.');
        setAudioFile(null);
        return;
      }
      setAudioFile(file);
      setAudioBlob(null); // Clear recorded audio if a file is uploaded
    }
  };

  const handleVoiceSubmit = async () => {
    if (!audioFile && !audioBlob) {
      alert('Please record or upload an audio file before submitting.');
      return;
    }
  
    setIsVoiceModalOpen(false);
    setMessages([
      ...messages,
      { type: 'user', content: 'Voice message sent...' },
      { type: 'assistant', content: 'Processing your voice request...' }
    ]);
  
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      if (audioFile) {
        formData.append('audio', audioFile);
      } else if (audioBlob) {
        formData.append('audio', audioBlob, 'recording.wav');
      }
  
      const response = await axios.post('http://localhost:5001/api/voice-chat', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
  
      const { transcribed_text, response_text, response_audio } = response.data;
      const audioUrl = `data:audio/wav;base64,${response_audio}`;
  
      setMessages(prev => [
        ...prev.slice(0, -2),
        { type: 'user', content: transcribed_text },
        {
          type: 'assistant',
          content: response_text,
          audio: audioUrl
        }
      ]);
  
      setAudioFile(null);
      setAudioBlob(null);
    } catch (error) {
      console.error('Error processing voice chat:', error);
      const errorMessage = error.response?.data?.error || 'Error processing your voice request. Please try again.';
      setMessages(prev => [
        ...prev.slice(0, -2),
        { type: 'user', content: 'Voice message failed to send.' },
        { type: 'assistant', content: errorMessage }
      ]);
    }
  };
  
  const closeVoiceModal = () => {
    if (isRecording) stopRecording();
    setIsVoiceModalOpen(false);
    setAudioFile(null);
    setAudioBlob(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost text-gray-600 gap-2 hover:bg-gray-100 transition"
          >
            <ChevronLeft size={24} className="text-gray-600" />
            <span className="text-lg font-semibold">Back to Home</span>
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col">
        <div className="flex-1 space-y-6 mb-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex animate-fade-in-up ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-xl p-4 ${
                  message.type === 'user'
                    ? 'bg-indigo-500 text-white shadow-md shadow-gray-300'
                    : 'bg-gray-50 text-gray-900 shadow-md shadow-gray-200'
                }`}
              >
                {message.type === 'user' ? (
                  <p className="text-white">{message.content}</p>
                ) : (
                  <>
                    <div dangerouslySetInnerHTML={{ __html: message.content }} />
                    {message.audio && (
                      <audio controls className="mt-2">
                        <source src={message.audio} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="btn btn-outline text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400 gap-2 transition-all shadow-sm shadow-gray-200"
              onClick={() => setInput(suggestion)}
            >
              <Lightbulb size={16} className="text-yellow-500" />
              <span className="text-sm">{suggestion}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg shadow-gray-300 p-4 border border-gray-200">
          <div className="flex gap-4 items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about loans or finances..."
              className="flex-1 textarea bg-gray-50 text-gray-900 placeholder-gray-500 border-gray-300 focus:border-indigo-500 focus:ring-0 resize-none scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
              rows={2}
            />
            <button
              className="btn btn-circle bg-indigo-500 hover:bg-indigo-600 text-white border-none"
              onClick={() => setIsVoiceModalOpen(true)}
            >
              <Mic size={24} />
            </button>
            <button
              className="btn btn-circle bg-indigo-500 hover:bg-indigo-600 text-white border-none"
              onClick={handleSend}
              disabled={!input.trim()}
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>

      {isVoiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Voice Input</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={closeVoiceModal}
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Record Audio</label>
                <button
                  className={`btn w-full ${
                    isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-cyan-500 hover:bg-cyan-600'
                  } text-white border-none rounded-full`}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
                {audioBlob && (
                  <audio controls className="mt-2 w-full">
                    <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Or Upload Audio File (WAV/MP3)</label>
                <input
                  type="file"
                  accept="audio/wav,audio/mp3"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {audioFile && <p className="mt-2 text-gray-600">Selected file: {audioFile.name}</p>}
              </div>
              <button
                className="btn bg-cyan-500 text-white border-none hover:bg-cyan-600 w-full rounded-full"
                onClick={handleVoiceSubmit}
              >
                Submit Voice Input
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;