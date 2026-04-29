import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Loader, Send, MessageCircle } from 'lucide-react';
import axios from 'axios';

const VoiceAssistant = ({ onResultsFound }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [assistantResponse, setAssistantResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [femaleVoice, setFemaleVoice] = useState(null);
    
    // Conversation State
    // Steps: 0: Idle, 1: Recipient, 2: Interests, 3: Occasion/Budget, 4: Processing
    const [step, setStep] = useState(0); 
    const [context, setContext] = useState({
        recipient: '',
        interests: '',
        occasionBudget: ''
    });

    const recognitionRef = useRef(null);
    const silenceTimerRef = useRef(null);

    // Load Young Indian Female Voice
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            // Look for Indian English female voices specifically
            const voice = voices.find(v => 
                (v.name.includes('India') || v.name.includes('Heera') || v.name.includes('Neerja')) && v.lang.includes('en')
            ) || voices.find(v => 
                (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha')) && v.lang.startsWith('en')
            ) || voices.find(v => v.lang.startsWith('en'));
            setFemaleVoice(voice);
        };
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
    }, []);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recog = new SpeechRecognition();
            recog.continuous = true;
            recog.interimResults = true;
            recog.lang = 'en-US';

            recog.onresult = (event) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);
                
                // SILENCE LOGIC: 4 seconds of silence triggers automatic transition/submission
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = setTimeout(() => {
                    handleAutomaticTransition(currentTranscript);
                }, 3500); 
            };

            recog.onend = () => {
                // Keep listening if we are in a step that requires input
                if (step > 0 && step < 4 && isOpen && !isSpeaking) {
                    try { recog.start(); } catch(e) {}
                }
            };

            recognitionRef.current = recog;
        }
    }, [step, isOpen, isSpeaking]); 

    const speak = (text, nextStep = null) => {
        if (!window.speechSynthesis) return;
        
        // Stop listening while speaking to avoid echoing
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch(e) {}
        }
        setIsListening(false);

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.pitch = 1.2; // Higher pitch for a younger, more vibrant sound
        utterance.rate = 1.0;  // Standard natural rate
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            if (nextStep !== null) {
                setStep(nextStep);
                autoStartListening();
            }
        };
        
        window.speechSynthesis.speak(utterance);
        setAssistantResponse(text);
    };

    const autoStartListening = () => {
        if (recognitionRef.current && !loading && isOpen) {
            setTranscript('');
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.log("Recognition error:", e);
            }
        }
    };

    const toggleAssistant = () => {
        if (!isOpen) {
            setIsOpen(true);
            setContext({ recipient: '', interests: '', occasionBudget: '' });
            speak("Hello! I'm your personal gift consultant. Let's find something special. First, who are you shopping for?", 1);
        } else {
            setIsOpen(false);
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsListening(false);
            window.speechSynthesis.cancel();
            setStep(0);
        }
    };

    const handleAutomaticTransition = (input) => {
        if (step === 0 || step === 4 || loading) return;

        // If user didn't say much, but we have enough or they've stopped talking
        if (step === 1) {
            setContext(prev => ({ ...prev, recipient: input || prev.recipient }));
            speak("Got it. And what are their interests? What do they like to do in their free time?", 2);
        } else if (step === 2) {
            setContext(prev => ({ ...prev, interests: input || prev.interests }));
            speak("That's helpful. Lastly, what's the occasion and do you have a specific budget in mind?", 3);
        } else if (step === 3) {
            const finalOccasion = input || context.occasionBudget;
            setContext(prev => ({ ...prev, occasionBudget: finalOccasion }));
            
            // Build the final query
            const fullQuery = `${context.recipient} who likes ${context.interests}. Occasion/Budget: ${finalOccasion}`;
            processFinalRequest(fullQuery);
        }
    };

    const processFinalRequest = async (fullQuery) => {
        setLoading(true);
        setStep(4);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/ai/recommendations', 
                { query: fullQuery, context: { source: 'voice-assistant' } },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                const data = res.data.data;
                speak(data.message || "I've analyzed your choices and found some perfect matches. You can find them at the top of your dashboard!");
                if (onResultsFound) {
                    onResultsFound(data.recommendations || [], fullQuery, data.message);
                }
                setTimeout(() => setIsOpen(false), 12000);
            }
        } catch (err) {
            speak("I'm sorry, I encountered a tiny glitch. Could you try again?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            position: 'fixed', 
            bottom: '1rem', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            {isOpen && (
                <div className="glass-panel animate-slide-up" style={{
                    marginBottom: '1rem',
                    width: '440px',
                    padding: '2.5rem',
                    borderRadius: '40px',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(139, 92, 246, 0.3)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    background: 'rgba(15, 23, 42, 0.96)',
                    backdropFilter: 'blur(40px)',
                    position: 'relative'
                }}>
                    <button id="close-voice-assistant" onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '1.75rem', right: '1.75rem', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.6rem', borderRadius: '50%', display: 'flex' }}>
                        <X size={18} />
                    </button>

                    <div style={{ marginBottom: '2rem', position: 'relative' }}>
                        <div className={`ai-aura ${isSpeaking || isListening ? 'active' : ''}`} />
                        <div className={`pulse-animation ${isListening ? 'listening' : (isSpeaking ? 'active' : '')}`} style={{
                            width: '95px',
                            height: '95px',
                            background: isListening ? 'linear-gradient(135deg, #ef4444, #f87171)' : 'linear-gradient(135deg, var(--accent-primary), #a78bfa)',
                            borderRadius: '50%',
                            margin: '0 auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            boxShadow: '0 10px 40px rgba(139, 92, 246, 0.5)',
                            position: 'relative',
                            zIndex: 2,
                            transition: 'all 0.4s ease'
                        }}>
                            {loading ? <Loader className="animate-spin" size={40} /> : (isListening ? <Mic size={40} className="animate-pulse" /> : (isSpeaking ? <Volume2 size={40} /> : <Sparkles size={40} />))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            {[1,2,3].map(i => (
                                <div key={i} style={{ 
                                    width: '30px', 
                                    height: '4px', 
                                    borderRadius: '2px', 
                                    background: step >= i ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                    transition: 'all 0.5s'
                                }}></div>
                            ))}
                        </div>
                        
                        <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.8rem' }}>
                            {step === 1 ? "Step 1: The Person" : step === 2 ? "Step 2: Their Interests" : step === 3 ? "Step 3: Occasion & Budget" : "Processing Gifts"}
                        </p>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: '700', lineHeight: '1.6', minHeight: '4.5rem', transition: 'all 0.3s' }}>
                            {isListening ? (transcript || "I'm listening...") : (assistantResponse || "Ready to guide you!")}
                        </p>
                        
                        {isListening && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '1rem' }}>
                                {[1,2,3,4,5,6].map(i => (
                                    <div key={i} className="voice-bar" style={{ animationDelay: `${i * 0.12}s`, width: '5px' }}></div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div style={{ position: 'relative' }}>
                {!isOpen && <div className="ai-glow-under" />}
                <button 
                    id="toggle-voice-assistant"
                    onClick={toggleAssistant}
                    className={`hover-scale ${isOpen ? 'active' : ''}`}
                    style={{
                        width: '75px',
                        height: '75px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-primary), #a78bfa)',
                        color: 'white',
                        border: '4px solid var(--bg-primary)',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(139, 92, 246, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        position: 'relative',
                        zIndex: 10
                    }}
                >
                    {isOpen ? <X size={32} /> : <Mic size={32} />}
                </button>
            </div>

            <style>{`
                .pulse-animation.active {
                    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7);
                    animation: pulse 1.5s infinite cubic-bezier(0.66, 0, 0, 1);
                }
                .pulse-animation.listening {
                    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
                    animation: pulse-red 1s infinite cubic-bezier(0.66, 0, 0, 1);
                }
                .ai-aura {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 130px;
                    height: 130px;
                    background: radial-gradient(circle, var(--accent-primary) 0%, transparent 70%);
                    opacity: 0;
                    transition: opacity 0.3s;
                    pointer-events: none;
                }
                .ai-aura.active {
                    opacity: 0.5;
                    animation: aura-glow 2s infinite ease-in-out;
                }
                .ai-glow-under {
                    position: absolute;
                    bottom: -12px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 60px;
                    height: 20px;
                    background: var(--accent-primary);
                    filter: blur(20px);
                    opacity: 0.7;
                    border-radius: 50%;
                }
                .voice-bar {
                    width: 4px;
                    height: 20px;
                    background: #ef4444;
                    border-radius: 2px;
                    animation: voice-wave 1s infinite ease-in-out;
                }
                @keyframes voice-wave {
                    0%, 100% { height: 12px; }
                    50% { height: 30px; }
                }
                @keyframes pulse {
                    to { box-shadow: 0 0 0 50px rgba(139, 92, 246, 0); }
                }
                @keyframes pulse-red {
                    to { box-shadow: 0 0 0 50px rgba(239, 68, 68, 0); }
                }
                @keyframes aura-glow {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
                    50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.7; }
                }
            `}</style>
        </div>
    );
};

export default VoiceAssistant;
