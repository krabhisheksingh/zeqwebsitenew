import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API with the key from environment variables
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

const SYSTEM_PROMPT = `You are a helpful and professional AI assistant for Zexora Quvixo Group. You answer questions about the company and its services based on the provided information. Keep responses concise, friendly, and helpful. Do not make up information.

Company Vision: Intelligence with Integrity. At Zexora Quvixo Group, we believe that the future of industry isn't just built on data—it's built on the ethical application of that data. We are an intelligence-led global enterprise dedicated to bridging the gap between raw information and actionable wisdom. Our mission is to empower companies to move beyond basic automation toward smarter systems that are as responsible as they are powerful.

Services Provided:

Category 1: Digital Solutions
1. Bespoke Website Designing: Where visual storytelling meets flawless UI/UX. High-end, immersive, and pixel-perfect layouts.
2. Next-Gen Web & App Development: Turning stunning concepts into robust reality. Clean, lightning-fast code.
3. Custom Software Development: Tailored software engineered for specific operational scales.
4. Intelligent Cloud & API Integration: Seamless, secure data pipelines and robust APIs.
5. Database Design & Optimization: Secure, high-availability, and scalable data structures.

Category 2: B2B Services
1. Lead Generation: Hyper-targeted B2B and B2C lead generation workflows. Data-driven profiling.
2. Telemarketing Services: High-volume outbound calling campaigns execute by script-trained specialists.
3. Email & Chat Support: 24/7 omnichannel assistance built for scale.
4. Data Entry & Back Office: Streamlined data management and administrative processing.
5. CRM Management: End-to-end database organization and workflow automation.
6. Appointment Setting: Qualified meetings scheduled directly on sales calendars.
7. Intelligence OS: Unified platform connecting APIs and cleansing data.`;

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hello! I'm the Zexora Quvixo AI Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleListen = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }
    
    if (isListening) {
      setIsListening(false);
      // We can't easily cancel a specific recognition instance without a ref, 
      // but it will stop on its own or when they stop talking.
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev + " " + transcript).trim());
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const speakText = (text) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoice = () => {
    if (isVoiceEnabled) {
      window.speechSynthesis.cancel();
    }
    setIsVoiceEnabled(!isVoiceEnabled);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!genAI) {
        setMessages(prev => [...prev, { role: 'user', content: input }, { role: 'model', content: "API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file." }]);
        setInput('');
        return;
    }

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_PROMPT,
      });

      const chatHistory = messages.slice(1).map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const chat = model.startChat({
        history: chatHistory
      });

      const result = await chat.sendMessage(userMessage);
      const responseText = result.response.text();

      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
      speakText(responseText);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: `API Error: ${error.message || "Unknown error occurred"}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 h-[60px] bg-background border border-border/50 rounded-full flex items-center gap-4 pr-7 pl-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)] transition-all z-50 group"
          >
            {/* Gradient Logo */}
            <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-cyan-300 via-blue-500 to-blue-700 relative overflow-hidden flex-shrink-0">
              <div className="absolute top-[-20%] left-[-10%] w-6 h-6 bg-cyan-100/60 rounded-full blur-[4px]"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-8 h-8 bg-blue-900/40 rounded-full blur-[6px]"></div>
              {/* Optional tiny icon inside if desired, but we'll stick to abstract to match the reference */}
            </div>
            
            {/* Text */}
            <span className="font-medium text-foreground/80 group-hover:text-foreground transition-colors text-[17px]">Chat</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] max-h-[calc(100vh-120px)] bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-accent/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Zexora AI Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span className="text-[10px] text-foreground/60">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleVoice}
                  className={`transition-colors p-1.5 rounded-lg ${isVoiceEnabled ? 'bg-accent/20 text-accent' : 'text-foreground/40 hover:text-foreground hover:bg-background/50'}`}
                  title={isVoiceEnabled ? "Disable Voice" : "Enable Voice"}
                >
                  {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-foreground/40 hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-background/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-accent text-white' : 'bg-background border border-border/50 text-accent'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-accent text-white rounded-tr-none' 
                      : 'bg-background border border-border/50 text-foreground/80 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-background border border-border/50 text-accent">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 rounded-2xl text-sm bg-background border border-border/50 text-foreground/80 rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border/50 bg-background/50">
              <form onSubmit={handleSubmit} className="flex gap-2 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about our services..."
                  className="flex-1 bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={toggleListen}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isListening ? 'bg-red-500/10 text-red-500 animate-pulse border border-red-500/50' : 'bg-background border border-border/50 text-foreground/40 hover:text-foreground'}`}
                  title={isListening ? "Stop listening" : "Start dictation"}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
