import React, { useState, useEffect, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from "jspdf";

// Simulated Data Types (replace with actual types if integrating backend)
type RoastResult = {
  highlight: string;
  severity: 'mild' | 'medium' | 'nuclear';
};

type HeatmapMetric = {
  metric: string;
  value: number;
};

type RedFlag = {
  id: number;
  text: string;
  exploded: boolean;
};

// Main Component
const TruthCardAI: React.FC = () => {
  const [appState, setAppState] = useState<'onboarding' | 'upload' | 'analyzing' | 'roasting' | 'results' | 'error'>('onboarding');
  const [cringeScore, setCringeScore] = useState<number>(0);
  const [roastResults, setRoastResults] = useState<RoastResult[]>([]);
  const [redFlags, setRedFlags] = useState<RedFlag[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showCookieBanner, setShowCookieBanner] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [showShareCard, setShowShareCard] = useState<boolean>(false);
  const [heatmapData, setHeatmapData] = useState<HeatmapMetric[]>([]);
  const [isCardShattered, setIsCardShattered] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [lipSyncing, setLipSyncing] = useState<boolean>(false);
  const [currentTier, setCurrentTier] = useState<'Free' | 'Roaster'>('Free');
  const [uploadCount, setUploadCount] = useState<number>(0);
  const [lastUploadDate, setLastUploadDate] = useState<string>('');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockoutEndDate, setLockoutEndDate] = useState<string>('');

  const terminalLines = [
    "Booting TruthCard.AI v1.5...",
    "Initializing Cybernetic Roast Engine...",
    "Calibrating Cringe Detectors...",
    "WARNING: Brutal Honesty Enabled.",
    "Drag and drop your dating profile screenshot to begin.",
    "We are currently in development stage",
    "Please consider clicking the SELECT PRO TIER",
  ];
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const lineIndex = useRef(0);
  const charIndex = useRef(0);

  // Initialize usage tracking
  useEffect(() => {
    const storedData = localStorage.getItem('truthcard_usage');
    if (storedData) {
      const { count, date, locked, lockoutEnd } = JSON.parse(storedData);
      const today = new Date().toISOString().split('T')[0];
      
      if (locked && new Date(lockoutEnd) > new Date()) {
        setIsLocked(true);
        setLockoutEndDate(lockoutEnd);
      } else if (date === today) {
        setUploadCount(count);
        setLastUploadDate(date);
      } else {
        // Reset count for new day
        setUploadCount(0);
        setLastUploadDate(today);
        localStorage.setItem('truthcard_usage', JSON.stringify({
          count: 0,
          date: today,
          locked: false,
          lockoutEnd: ''
        }));
      }
    }
  }, []);

  // Handle upload tracking and limits
  const handleUploadLimit = () => {
    if (currentTier === 'Roaster') return true;
    
    const today = new Date().toISOString().split('T')[0];
    const newCount = uploadCount + 1;
    
    if (newCount >= 3) {
      const lockoutEnd = new Date();
      lockoutEnd.setMonth(lockoutEnd.getMonth() + 1);
      
      localStorage.setItem('truthcard_usage', JSON.stringify({
        count: newCount,
        date: today,
        locked: true,
        lockoutEnd: lockoutEnd.toISOString()
      }));
      
      setIsLocked(true);
      setLockoutEndDate(lockoutEnd.toISOString());
      return false;
    }
    
    localStorage.setItem('truthcard_usage', JSON.stringify({
      count: newCount,
      date: today,
      locked: false,
      lockoutEnd: ''
    }));
    
    setUploadCount(newCount);
    setLastUploadDate(today);
    return true;
  };

  // Terminal Typing Effect
  useEffect(() => {
    if (appState === 'onboarding') {
      setDisplayedLines(['']); // Start with one empty line
      const interval = setInterval(() => {
        if (lineIndex.current < terminalLines.length) {
          const currentLine = terminalLines[lineIndex.current];
          if (charIndex.current < currentLine.length) {
            setDisplayedLines(prev => {
              const lines = [...prev];
              lines[lineIndex.current] = currentLine.substring(0, charIndex.current + 1);
              return lines;
            });
            charIndex.current++;
          } else {
            lineIndex.current++;
            charIndex.current = 0;
            if (lineIndex.current < terminalLines.length) {
              setDisplayedLines(prev => [...prev, '']); // Add next line placeholder
            } else {
              clearInterval(interval);
              // Optionally auto-advance after delay
               setTimeout(() => setAppState('upload'), 1500);
            }
          }
        } else {
           clearInterval(interval);
        }
      }, 50); // Typing speed
      return () => clearInterval(interval);
    }
  }, [appState]);

  // Image Analysis and Roast Generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing && uploadedImage) {
      setAnalysisProgress(0);
      interval = setInterval(() => {
        setAnalysisProgress(prev => {
          const next = prev + Math.random() * 10;
          if (next >= 100) {
            clearInterval(interval);
            setIsAnalyzing(false);
            
            // Analyze image features (simulated - replace with actual API call)
            const img = new Image();
            img.src = uploadedImage;
            img.onload = () => {
              // Generate roasts based on image characteristics
              const width = img.width;
              const height = img.height;
              const aspectRatio = width / height;
              
              // Determine cringe score based on image properties
              let score = 0;
              let roasts: RoastResult[] = [];
              const flags: RedFlag[] = [];
              // Aspect ratio analysis
              if (aspectRatio > 1.2) {
                score += 20;
                flags.push({ id: 1, text: "Bad Crop", exploded: false });
              } else if (aspectRatio < 0.8) {
                score += 30;
                flags.push({ id: 2, text: "Suspicious Crop", exploded: false });
              }
              // Image quality analysis
              if (width < 800 || height < 800) {
                score += 25;
                flags.push({ id: 3, text: "Low Res", exploded: false });
              }
              // Randomize score slightly and cap at 100
              score = parseFloat((Math.min(score + Math.random() * 20, 100)).toFixed(2));
              // Escalating roast logic by cringe score
              if (score >= 1 && score <= 5) {
                roasts = [
                  { highlight: "Barely cringe, but we see you trying.", severity: "mild" },
                  { highlight: "Just a hint of awkwardness. Almost safe.", severity: "mild" },
                  { highlight: "You dodged the roast, but not by much.", severity: "mild" }
                ];
              } else if (score > 5 && score <= 10) {
                roasts = [
                  { highlight: "A little more effort and you'd be meme material.", severity: "mild" },
                  { highlight: "Trying to be cool, but the cringe is peeking through.", severity: "mild" },
                  { highlight: "Not bad, but not quite roast-proof.", severity: "mild" }
                ];
              } else if (score > 10 && score <= 15) {
                roasts = [
                  { highlight: "You call this your best shot?", severity: "mild" },
                  { highlight: "Cringe is rising, but still manageable.", severity: "mild" },
                  { highlight: "Almost made us laugh, but not for the right reasons.", severity: "mild" }
                ];
              } else if (score > 15 && score <= 20) {
                roasts = [
                  { highlight: "The awkward energy is strong with this one.", severity: "medium" },
                  { highlight: "Profile pic or yearbook disaster?", severity: "medium" },
                  { highlight: "You might want to try again.", severity: "medium" }
                ];
              } else if (score > 20 && score <= 25) {
                roasts = [
                  { highlight: "Cringe detected. Proceed with caution.", severity: "medium" },
                  { highlight: "This photo belongs in a group chat for the wrong reasons.", severity: "medium" },
                  { highlight: "Your vibe: 'I just woke up and chose this.'", severity: "medium" }
                ];
              } else if (score > 25 && score <= 30) {
                roasts = [
                  { highlight: "You’re on the edge of meme territory.", severity: "medium" },
                  { highlight: "This is the kind of pic your friends would roast in private.", severity: "medium" },
                  { highlight: "Cringe level: noticeable. Confidence level: questionable.", severity: "medium" }
                ];
              } else if (score > 30 && score <= 35) {
                roasts = [
                  { highlight: "You’re not fooling anyone with that filter.", severity: "medium" },
                  { highlight: "This is a 'before' photo for a glow-up meme.", severity: "medium" },
                  { highlight: "Your cringe is showing. Tuck it in!", severity: "medium" }
                ];
              } else if (score > 35 && score <= 40) {
                roasts = [
                  { highlight: "This photo screams 'I peaked in high school.'", severity: "medium" },
                  { highlight: "You’re one step away from being a cautionary tale.", severity: "medium" },
                  { highlight: "Cringe is now a personality trait.", severity: "medium" }
                ];
              } else if (score > 40 && score <= 45) {
                roasts = [
                  { highlight: "Your cringe is evolving. It’s super effective!", severity: "medium" },
                  { highlight: "This is the kind of pic that gets screenshotted for group chats.", severity: "medium" },
                  { highlight: "You’re not just cringing, you’re inspiring others to cringe.", severity: "medium" }
                ];
              } else if (score > 45 && score <= 50) {
                roasts = [
                  { highlight: "You’re halfway to legendary cringe status.", severity: "medium" },
                  { highlight: "This is the kind of photo that makes people swipe left twice.", severity: "medium" },
                  { highlight: "Cringe level: influencer caught in 4K.", severity: "medium" }
                ];
              } else if (score > 50 && score <= 55) {
                roasts = [
                  { highlight: "You’ve entered the danger zone. Cringe detected.", severity: "medium" },
                  { highlight: "This is the kind of pic that gets used in 'before' memes.", severity: "medium" },
                  { highlight: "Your cringe is contagious. Please quarantine.", severity: "medium" }
                ];
              } else if (score > 55 && score <= 60) {
                roasts = [
                  { highlight: "Cringe level: viral TikTok fail.", severity: "medium" },
                  { highlight: "This photo is a public service announcement for better selfies.", severity: "medium" },
                  { highlight: "You’re the reason the roast feature exists.", severity: "medium" }
                ];
              } else if (score > 60 && score <= 65) {
                roasts = [
                  { highlight: "You’re approaching nuclear cringe. Brace yourself.", severity: "nuclear" },
                  { highlight: "This is the kind of pic that gets posted on r/cringe.", severity: "nuclear" },
                  { highlight: "Cringe level: legendary. Seek help.", severity: "nuclear" }
                ];
              } else if (score > 65 && score <= 70) {
                roasts = [
                  { highlight: "You’ve unlocked a new level of embarrassment.", severity: "nuclear" },
                  { highlight: "This photo is a cautionary tale for future generations.", severity: "nuclear" },
                  { highlight: "Cringe so strong, it’s practically a superpower.", severity: "nuclear" }
                ];
              } else if (score > 70 && score <= 75) {
                roasts = [
                  { highlight: "You’re the final boss of cringe.", severity: "nuclear" },
                  { highlight: "This photo is why the internet invented roasting.", severity: "nuclear" },
                  { highlight: "Cringe level: catastrophic. May require therapy.", severity: "nuclear" }
                ];
              } else if (score > 75 && score <= 80) {
                roasts = [
                  { highlight: "Nuclear levels of cringe detected. This might be terminal.", severity: "nuclear" },
                  { highlight: "This is the kind of photo that gets banned from dating apps.", severity: "nuclear" },
                  { highlight: "Cringe so intense, it’s breaking the simulation.", severity: "nuclear" }
                ];
                flags.push({ id: 4, text: "Fedora Energy", exploded: false });
              } else if (score > 80 && score <= 85) {
                roasts = [
                  { highlight: "You’ve reached cringe singularity. No turning back.", severity: "nuclear" },
                  { highlight: "This photo is a black hole of awkwardness.", severity: "nuclear" },
                  { highlight: "Cringe level: universe-ending. Congratulations?", severity: "nuclear" }
                ];
                flags.push({ id: 5, text: "Cringe Overload", exploded: false });
              } else if (score > 85 && score <= 90) {
                roasts = [
                  { highlight: "You are the chosen one... for cringe.", severity: "nuclear" },
                  { highlight: "This photo is the reason for the word 'yikes.'", severity: "nuclear" },
                  { highlight: "Cringe so powerful, it’s rewriting history.", severity: "nuclear" }
                ];
                flags.push({ id: 6, text: "Epic Fail", exploded: false });
              } else if (score > 90 && score <= 95) {
                roasts = [
                  { highlight: "You’ve broken the cringe meter. Please stop.", severity: "nuclear" },
                  { highlight: "This photo is a war crime against good taste.", severity: "nuclear" },
                  { highlight: "Cringe level: apocalyptic. Seek immediate help.", severity: "nuclear" }
                ];
                flags.push({ id: 7, text: "Cringe Apocalypse", exploded: false });
              } else if (score > 95 && score <= 100) {
                roasts = [
                  { highlight: "Congratulations, you are the king/queen of cringe.", severity: "nuclear" },
                  { highlight: "This photo is the final boss of embarrassment.", severity: "nuclear" },
                  { highlight: "Cringe level: infinite. Achievement unlocked.", severity: "nuclear" }
                ];
                flags.push({ id: 8, text: "Cringe Royalty", exploded: false });
              } else {
                roasts = [
                  { highlight: "Surprisingly normal photo. Almost disappointing.", severity: "mild" },
                  { highlight: "You escaped the roast... this time.", severity: "mild" },
                  { highlight: "No cringe detected. Are you even trying?", severity: "mild" }
                ];
              }
              const heatmapData = [
                { metric: 'Humor', value: Math.random() * 100 },
                { metric: 'Creativity', value: Math.random() * 100 },
                { metric: 'Savagery', value: Math.random() * 100 },
                { metric: 'Authenticity', value: Math.random() * 100 },
                { metric: 'Style', value: Math.random() * 100 },
                { metric: 'Vibe', value: Math.random() * 100 }
              ];
              
              setCringeScore(score);
              setRoastResults(roasts);
              setRedFlags(flags);
              setHeatmapData(heatmapData);
              setAppState('roasting');
              setLipSyncing(true);
              setTimeout(() => setLipSyncing(false), 4000);
              setTimeout(() => setShowShareCard(true), 5000);
              setTimeout(() => {
                const supportPopup = document.createElement('div');
                supportPopup.style.cssText = `
                  position: fixed;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  background: rgba(0, 0, 0, 0.95);
                  border: 2px solidrgb(97, 8, 250);
                  border-radius: 16px;
                  padding: 2rem;
                  z-index: 1000;
                  box-shadow: 0 0 20px rgba(255, 0, 85, 0.3);
                  text-align: center;
                  max-width: 90%;
                  width: 400px;
                `;
                
                supportPopup.innerHTML = `
                  <h2 style="color: #8883F5; font-size: 1.5rem; margin-bottom: 1rem; font-weight: bold;">Support TruthCard AI</h2>
                  <p style="color: #fff; margin-bottom: 1.5rem;">Help us generate more brutal and honest roasts by supporting our development!</p>
                  <button id="supportButton" style="
                    background:rgb(48, 38, 237);
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                  ">Support Us</button>
                `;

                document.body.appendChild(supportPopup);

                const supportButton = document.getElementById('supportButton');
                if (supportButton) {
                  supportButton.addEventListener('mouseover', () => {
                    supportButton.style.backgroundColor = '#ff2975';
                    supportButton.style.transform = 'scale(1.05)';
                  });
                  supportButton.addEventListener('mouseout', () => {
                    supportButton.style.backgroundColor = '#ff0055';
                    supportButton.style.transform = 'scale(1)';
                  });
                  supportButton.addEventListener('click', () => {
                    // Replace with actual Gumroad link
                    window.open('https://vrrelated.gumroad.com/l/attracttherightone', '_blank');
                  });
                }

                // Close popup when clicking outside
                document.addEventListener('click', (e) => {
                  if (!supportPopup.contains(e.target as Node)) {
                    document.body.removeChild(supportPopup);
                  }
                });
              }, 10000);

              // Compatibility Heatmap Component
              const CompatibilityHeatmap: React.FC<{ heatmapData: HeatmapMetric[] }> = ({ heatmapData }) => {
                return (
                  <div className="bg-gray-800 rounded-lg p-4 mt-4">
                    <h3 className="text-xl font-bold mb-3 text-neon-pink">Compatibility Heatmap</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {heatmapData.map((metric, index) => {
                        let bgColor = '';
                        if (metric.value > 75) bgColor = 'bg-pink-500';
                        else if (metric.value > 50) bgColor = 'bg-orange-400';
                        else if (metric.value > 25) bgColor = 'bg-green-400';
                        else bgColor = 'bg-blue-500';
                        return (
                          <div
                            key={index}
                            className={`rounded-lg flex flex-col items-center justify-center h-24 w-full shadow-lg border-2 border-neon-pink ${bgColor}`}
                            style={{
                              boxShadow: `0 0 16px 2px ${metric.value > 75 ? '#ff0055' : metric.value > 50 ? '#ff9900' : metric.value > 25 ? '#00ff99' : '#0099ff'}`,
                              transition: 'box-shadow 0.3s, background 0.3s',
                            }}
                          >
                            <span className="text-white font-semibold text-lg drop-shadow">{metric.metric}</span>
                            <span className="text-white/80 text-2xl font-bold drop-shadow">{Math.round(metric.value)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              };

              return (
                <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center">
                  <div className="mb-8">
                    <h2 className="text-4xl font-bold mb-4 text-neon-pink">Roast Complete: Cringe Index™ {cringeScore}%</h2>
                    <div className="flex flex-col gap-4">
                      {roastResults.map((result, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg ${result.severity === 'nuclear' ? 'bg-red-900/50' :
                            result.severity === 'medium' ? 'bg-orange-900/50' : 'bg-blue-900/50'}`}
                        >
                          <p className="text-lg">{result.highlight}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8">
                      <CompatibilityHeatmap heatmapData={heatmapData} />
                    </div>
                  </div>
                </div>
              );
                  
              setTimeout(() => setLipSyncing(false), 4000);
              setTimeout(() => setShowShareCard(true), 5000);
              setTimeout(() => {
                const supportPopup = document.createElement('div');
                supportPopup.style.cssText = `
                  position: fixed;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  background: rgba(13, 17, 23, 0.95);
                  border: 2px solid #ff0055;
                  border-radius: 16px;
                  padding: 2rem;
                  z-index: 1000;
                  box-shadow: 0 0 20px rgba(255, 0, 85, 0.3);
                  text-align: center;
                  max-width: 90%;
                  width: 400px;
                `;
                
                supportPopup.innerHTML = `
                  <h2 style="color: #ff0055; font-size: 1.5rem; margin-bottom: 1rem; font-weight: bold;">Support TruthCard AI</h2>
                  <p style="color: #fff; margin-bottom: 1.5rem;">Help us generate more brutal and honest roasts by supporting our development!</p>
                  <button id="supportButton" style="
                    background: #ff0055;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                  ">Support Us</button>
                `;

                document.body.appendChild(supportPopup);

                const supportButton = document.getElementById('supportButton');
                if (supportButton) {
                  supportButton.addEventListener('mouseover', () => {
                    supportButton.style.backgroundColor = '#ff2975';
                    supportButton.style.transform = 'scale(1.05)';
                  });
                  supportButton.addEventListener('mouseout', () => {
                    supportButton.style.backgroundColor = '#ff0055';
                    supportButton.style.transform = 'scale(1)';
                  });
                  supportButton.addEventListener('click', () => {
                    // Replace with actual Gumroad link
                    window.open('https://your-gumroad-link.com', '_blank');
                  });
                }

                // Close popup when clicking outside
                document.addEventListener('click', (e) => {
                  if (!supportPopup.contains(e.target as Node)) {
                    document.body.removeChild(supportPopup);
                  }
                });
              }, 5000);


            };
          }
          return Math.min(next, 100);
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing, uploadedImage]);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      // Basic image type check
      if (!file.type.startsWith('image/')) {
          alert("Error: Please upload an image file.");
          setAppState('upload');
          setIsLoading(false);
          return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setIsLoading(false);
        setIsAnalyzing(true);
        setAppState('analyzing');
      };
      reader.onerror = () => {
        alert("Error reading file.");
        setAppState('upload');
        setIsLoading(false);
      }
      reader.readAsDataURL(file);
      setIsLoading(true); // Show loader immediately
    } else {
       setAppState('upload');
       setIsLoading(false);
    }
  };

  const SupportMessage = () => (
    <div className="mt-8 text-center">
      <h2 className="text-4xl font-bold mb-4 text-neon-blue">Choose Your Judgment Level</h2>
      <h2 className='text-2xl font-bold mb-4 text-neon-green'>We are in the development stage "If you want to support us"</h2>
      <h2 className='text-2xl font-bold mb-4 text-neon-green'>Please consider clicking on the button below</h2>
      <button className="bg-neon-pink text-white font-bold py-2 px-4 rounded hover:bg-neon-blue"></button>
      
    </div>
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFileChange(event.dataTransfer.files);
      event.dataTransfer.clearData();
    }
  }, []);

  const handleRedFlagClick = (id: number) => {
    setRedFlags(flags => flags.map(flag => flag.id === id ? { ...flag, exploded: true } : flag));
    // Optional: Remove after animation
    // setTimeout(() => {
    //   setRedFlags(flags => flags.filter(flag => flag.id !== id));
    // }, 500); // Match explosion animation duration
  };

  const handleShare = async () => {
      setIsCardShattered(true);
      setTimeout(async () => {
        // Capture truth card as image
        let cardImage = '';
        if (cardRef.current) {
          const canvas = await html2canvas(cardRef.current);
          cardImage = canvas.toDataURL('image/png');
        } else {
          alert("Truth card not found. Please try again after the card is visible.");
          setIsCardShattered(false);
          return;
        }
        // Social media sharing URLs
        const shareText = `My dating profile got a ${cringeScore}% cringe score on TruthCard.AI!`;
        const shareUrl = window.location.href;
        
        // Open share dialog with options
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'TruthCard.AI Results',
              text: shareText,
              url: shareUrl,
              files: cardImage ? [new File([await fetch(cardImage).then(r => r.blob())], 'truthcard.png', { type: 'image/png' })] : undefined
            });
          } catch (err) {
            console.error('Share failed:', err);
            // Fallback to direct platform links
            window.open(`https://www.instagram.com/stories/create?text=${encodeURIComponent(shareText)}`, '_blank');
          }
        } else {
          // Fallback to opening new tabs
          const confirmShare = confirm(`${shareText}\n\nOpen sharing options?`);
          if (confirmShare) {
            window.open(`https://www.instagram.com/stories/create?text=${encodeURIComponent(shareText)}`, '_blank');
            setTimeout(() => window.open(`https://www.tiktok.com/upload?description=${encodeURIComponent(shareText)}`, '_blank'), 300);
            setTimeout(() => window.open(`https://www.snapchat.com/creative/snapcode?text=${encodeURIComponent(shareText)}`, '_blank'), 600);
          }
        }
        
        setIsCardShattered(false); // Rebuild effect
      }, 1000); // Duration of shatter animation
  };

  const handleDownload = async (format: 'png' | 'jpg' | 'pdf' = 'png') => {
    const cardElement = document.querySelector('.truth-card-container');
    if (!cardElement) {
      alert('TruthCard not found.');
      return;
    }
    const canvas = await html2canvas(cardElement, {
      backgroundColor: null,
      useCORS: true,
      scale: 2
    });
    const dataUrl = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png');
    if (format === 'pdf') {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(dataUrl, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('truthcard.pdf');
    } else {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `truthcard.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRestart = () => {
      setAppState('upload');
      setCringeScore(0);
      setRoastResults([]);
      setRedFlags([]);
      setUploadedImage(null);
      setFileName('');
      setIsLoading(false);
      setIsAnalyzing(false);
      setShowShareCard(false);
      setIsCardShattered(false);
      setAnalysisProgress(0);
      setLipSyncing(false);
  };

  // Heatmap Component
  const Heatmap = ({ roasts }: { roasts: RoastResult[] }) => {
    const severityColors = {
      mild: 'bg-green-500 hover:bg-green-400',
      medium: 'bg-yellow-500 hover:bg-yellow-400',
      nuclear: 'bg-red-600 hover:bg-red-500'
    };

    return (
      <div className="mt-8 p-4 bg-black/50 border border-cyan-800 rounded-lg shadow-lg shadow-cyan-900/20">
        <h3 className={`text-xl font-bold ${neonCyan} mb-4 text-center`}>Roast Severity Heatmap</h3>
        <div className="grid grid-cols-5 gap-3">
          {roasts.map((roast, index) => (
            <div 
              key={index}
              className={`h-12 rounded-lg ${severityColors[roast.severity]} ${glitchHoverClass} 
                transition-all duration-200 transform hover:scale-110 shadow-md`}
              title={roast.highlight}
              data-tooltip={roast.highlight}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <span className="text-xs font-mono text-black opacity-0 group-hover:opacity-100 transition-opacity">
                  {roast.severity.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between text-xs text-gray-400">
          <span>Mild</span>
          <span>Medium</span>
          <span>Nuclear</span>
        </div>
      </div>
    );
  };

  const handleAcceptCookies = () => {
    setShowCookieBanner(false);
    // Set actual cookie here in a real app
  };

 const selectPlan = async (plan: 'Free' | 'Roaster') => {
    if (plan === 'Roaster') {
      // Dynamically load Razorpay script if not already loaded
      if (!document.getElementById('razorpay-script')) {
        const script = document.createElement('script');
        script.id = 'razorpay-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        script.onload = () => triggerRazorpayRoaster();
      } else {
        triggerRazorpayRoaster();
      }
    } else {
      alert('Switched to Free plan.');
      setCurrentTier('Free');
    }
  };

 async function triggerRazorpayRoaster() {
    // Fetch order details from backend
    let orderData;
    try {
      const response = await fetch('http://localhost:5000/api/create-razorpay-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      orderData = await response.json();
      if (!response.ok) throw new Error(orderData.error || 'Failed to create order');
      setPaymentStatus("Order created. Initializing Razorpay...");
    } catch (error) {
      setPaymentStatus('Failed to initiate payment. Please try again.');
      setIsLoading(false);
      return;
    }
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY || orderData.key,
      amount: orderData.amount, // Amount in paise
      currency: orderData.currency,
      name: 'TruthCard AI',
      description: 'Nuclear Roast Plan',
      image: '/favicon.ico',
      order_id: orderData.orderId,
      handler: function (response) {
        setPaymentStatus('Payment successful! Transaction ID: ' + response.razorpay_payment_id);
        setCurrentTier('Roaster');
        setIsLoading(false);
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      theme: {
        color: '#ff0055'
      },
      modal: {
        ondismiss: function () {
          setIsLoading(false);
        }
      }
    };
    if (window.Razorpay) {
      setPaymentStatus("Payment initialized. Please complete the payment.");
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      setPaymentStatus('Razorpay SDK failed to load. Please try again.');
      setIsLoading(false);
    }
 }


  // --- Style Constants ---
  const neonCyan = 'text-cyan-400';
  const neonMagenta = 'text-pink-500';
  const neonLime = 'text-lime-400';
  const bgDark = 'bg-black'; // More intense cyberpunk black
  const borderNeon = 'border-cyan-500';

  // --- Simulated Effects ---
  const crtScanlinesClass = "before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:via-black/10 before:to-transparent before:bg-repeat-y before:bg-[length:100%_4px] before:animate-scanlines before:pointer-events-none";
  const glitchHoverClass = "hover:translate-x-px hover:-translate-y-px hover:text-shadow-[1px_1px_0_rgba(255,0,255,0.8),-1px_-1px_0_rgba(0,255,255,0.8)] transition-transform duration-50";
  const matrixStreamClass = "absolute inset-0 opacity-10 overflow-hidden pointer-events-none before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"10\" height=\"50\"><text x=\"0\" y=\"10\" font-family=\"monospace\" font-size=\"10\" fill=\"%230f0\">01</text><text x=\"0\" y=\"30\" font-family=\"monospace\" font-size=\"10\" fill=\"%230f0\">10</text><text x=\"0\" y=\"50\" font-family=\"monospace\" font-size=\"10\" fill=\"%230f0\">01</text></svg>')] before:animate-matrix"; // Basic simulation

  // --- Dynamic Styles ---
  const cringeMeterWidth = `${cringeScore}%`;
  const cringeMeterColor = cringeScore > 75 ? 'bg-red-600' : cringeScore > 50 ? 'bg-yellow-500' : 'bg-green-500';
  const truthCardTrailStyle = { animationDuration: `${Math.max(0.5, 3 - cringeScore / 33)}s` }; // Faster trail for higher cringe

  return (
    <div className={`relative min-h-screen ${bgDark} text-gray-200 font-mono p-4 md:p-8 overflow-hidden flex flex-col items-center justify-center ${crtScanlinesClass}`}>
      {/* Simulated Matrix Background */}
      <div className={matrixStreamClass}></div>

      {/* Cookie Banner */}
      {showCookieBanner && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm p-4 border-t border-cyan-700 z-50 flex items-center justify-between gap-4">
           <p className="text-sm ${neonCyan}">We use cookies and process your data (for 24hrs only!) for roasting purposes. By using TruthCard.AI, you agree to our <a href="#" className="underline hover:text-lime-400">Terms & GDPR Policy</a>.</p>
           <button
             onClick={handleAcceptCookies}
             className={`px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold ${glitchHoverClass}`}
           >
             Accept & Judge
           </button>
         </div>
       )}

        <div className="relative z-10 w-full max-w-4xl mx-auto p-6 bg-black/70 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl shadow-cyan-900/30">

            {/* Header */}
            <header className="text-center mb-8 border-b border-dashed border-gray-600 pb-4">
                <h1 className={`text-4xl md:text-5xl font-bold ${neonMagenta} text-shadow-[0_0_8px_rgba(255,0,255,0.7)]`}>
                    TruthCard<span className={neonCyan}>.AI</span>
                </h1>
                <p className={`mt-2 ${neonLime} text-sm`}>Unfiltered Dating Profile Roasts. Prepare for Judgment.</p>
            </header>

            {/* --- Onboarding Terminal --- */}
            {appState === 'onboarding' && (
              <div className="bg-black p-4 rounded border border-lime-600 h-64 overflow-y-auto mb-6 crt-effect">
                {displayedLines.map((line, index) => (
                  <p key={index} className="text-lime-400 whitespace-pre-wrap">
                    &gt; {line}
                    {index === displayedLines.length - 1 && <span className="animate-pulse">_</span>}
                  </p>
                ))}
              </div>
            )}

             {/* --- Upload Area --- */}
             {appState === 'upload' && (
                <div
                 className={`relative flex flex-col items-center justify-center p-8 md:p-16 border-2 border-dashed ${isDragging ? 'border-lime-500 bg-lime-900/30 vortex-active' : 'border-cyan-700'} rounded-xl transition-all duration-300 ease-in-out`}
                 onDragOver={handleDragOver}
                 onDragLeave={handleDragLeave}
                 onDrop={handleDrop}
                >
                    <div className={`absolute inset-0 bg-radial-gradient from-transparent to-black transition-opacity duration-500 ${isDragging ? 'opacity-100 animate-spin-slow' : 'opacity-0'}`}></div> {/* Black Hole Sim */}
                    <input
                        type="file"
                        id="profileUpload"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleFileChange(e.target.files)}
                        disabled={isLoading}
                    />
                    <label htmlFor="profileUpload" className="z-10 text-center cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 mx-auto mb-4 ${isDragging ? 'text-lime-400 animate-pulse' : 'text-cyan-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className={`text-lg font-semibold ${neonCyan}`}>
                          {isDragging ? 'Release to Initiate Judgment!' : 'Drag & Drop Profile Screenshot Here'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">or click to upload</p>
                        {fileName && <p className="text-xs text-lime-400 mt-2">Selected: {fileName}</p>}
                    </label>
                </div>
             )}

            {/* --- Analyzing / Loading --- */}
            {(isLoading || isAnalyzing) && (
                <div className="flex flex-col items-center justify-center p-16 text-center">
                    <div className="relative w-24 h-24 mb-6">
                        {/* Hexagonal AI Judgment Loader */}
                        <div className="absolute inset-0 animate-spin-slow">
                            {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-full h-full"
                                style={{ transform: `rotate(${i * 60}deg)` }}
                            >
                                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 border-2 border-lime-500 bg-black hexagon-clip animate-pulse`} style={{ animationDelay: `${i * 100}ms` }}></div>
                            </div>
                            ))}
                        </div>
                         <div className="absolute inset-2 border-2 border-cyan-600 rounded-full animate-ping"></div>
                    </div>
                    <p className={`text-xl font-semibold ${neonLime} mb-2`}>{isLoading ? 'Uploading Securely...' : 'Initiating EXIF Scan & Cringe Analysis...'}</p>
                    {isAnalyzing && (
                         <div className="w-full max-w-md bg-gray-700 rounded-full h-2.5 mt-4 overflow-hidden border border-cyan-800">
                            <div className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300 ease-linear" style={{ width: `${analysisProgress}%` }}></div>
                        </div>
                    )}
                    {isAnalyzing && <p className="text-sm text-cyan-400 mt-2">{Math.round(analysisProgress)}% Complete</p>}
                    <p className="text-xs text-gray-500 mt-4">Processing via Encrypted Quantum Channels...</p>
                </div>
            )}

            {/* --- Roasting Display --- */}
            {appState === 'roasting' && !showShareCard && (
                <div className="flex flex-col md:flex-row items-center justify-around gap-8 p-6 animate-fade-in">
                  <Heatmap roasts={roastResults} />
                    {/* Bot Avatar */}
                    <div className="relative flex flex-col items-center">
                       <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-cyan-600 via-purple-600 to-pink-600 p-1 shadow-lg shadow-cyan-500/30 ${lipSyncing ? 'animate-pulse-speak' : ''}`}>
                           <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                                <span className={`text-4xl md:text-5xl ${neonLime}`}>AI</span>
                           </div>
                       </div>
                       <p className={`mt-2 text-sm ${neonCyan}`}>{lipSyncing ? 'Roasting...' : 'Gemini 1.5 Bot'}</p>
                       {/* Simulated Lip Sync Indicator */}
                       {lipSyncing && <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-10 h-2 bg-lime-400 rounded-full animate-lip-sync"></div>}
                    </div>

                    {/* Truth Card & Cringe Meter */}
                    <div className="relative w-full max-w-md flex flex-col items-center">
                        {/* Cringe Meter */}
                        <div className="w-full mb-4">
                           <p className="text-center text-sm mb-1 ${neonMagenta}">Cringe Index™</p>
                           <div className="h-4 w-full bg-gray-700 rounded-full border border-pink-700 overflow-hidden">
                               <div
                                 className={`h-full rounded-full ${cringeMeterColor} transition-all duration-1000 ease-out flex items-center justify-end text-xs font-bold pr-2 text-black`}
                                 style={{ width: cringeMeterWidth }}
                               >
                                 {cringeScore}%
                               </div>
                           </div>
                        </div>

                        {/* Floating Truth Card */}
                        <div className="relative group perspective">
                            <div className={`relative w-64 h-80 md:w-72 md:h-96 bg-gray-900 border border-gray-700 rounded-xl shadow-xl p-4 flex flex-col justify-between transform transition-transform duration-500 ease-out animate-float holographic-card ${isCardShattered ? 'opacity-0 scale-150' : 'opacity-100 scale-100'}`} style={truthCardTrailStyle}>
                                {/* RGB Fractal Border Sim */}
                                <div className="absolute -inset-1 rounded-xl border-2 border-transparent bg-clip-border animate-rgb-border z-[-1]"></div>
                                 {/* Digital Fog Emerge Sim (uses main card animation) */}

                                {/* Card Content */}
                                <div className="flex-grow overflow-hidden relative">
                                    {uploadedImage && (
                                        <img src={uploadedImage} alt="Uploaded Profile" className="w-full h-full object-cover rounded-md border border-gray-600 deepguard-blur" /> // Add .deepguard-blur class for simulated NSFW blur
                                    )}
                                     {/* RGB Trail Sim (using box-shadow animation) */}
                                     <div className="absolute inset-0 rounded-md animate-rgb-trail pointer-events-none" style={truthCardTrailStyle}></div>
                                </div>

                                {/* Roast Result (Liquid Motion Sim) */}
                                <div className="mt-4 text-center h-16 overflow-hidden">
                                    {roastResults.length > 0 && (
                                        <p className={`text-sm animate-liquid-result ${roastResults[0].severity === 'nuclear' ? 'text-red-500' : roastResults[0].severity === 'medium' ? 'text-yellow-400' : 'text-cyan-400'}`}>
                                           "{roastResults[0].highlight}"
                                        </p>
                                    )}
                                </div>

                                 {/* Red Flags */}
                                 <div className="absolute top-2 right-2 flex flex-col gap-2">
                                   {redFlags.filter(f => !f.exploded).map((flag, index) => (
                                     <button
                                        key={flag.id}
                                        onClick={() => handleRedFlagClick(flag.id)}
                                        className="relative w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-red-800 shadow-md animate-rotate cursor-pointer hover:scale-110 transition-transform"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                        title={flag.text}
                                    >
                                        !
                                        <div className="absolute inset-0 rounded-full animate-ping-slow opacity-75 bg-red-500"></div>
                                    </button>
                                   ))}
                                 </div>
                                  {/* Exploded Flags Placeholder */}
                                  {redFlags.filter(f => f.exploded).map(flag => (
                                      <div key={`exploded-${flag.id}`} className="absolute top-2 right-2 w-10 h-10 animate-explode">💥</div>
                                  ))}
                             </div>
                             {/* Holographic Shine */}
                             <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/10 opacity-50 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none holographic-shine"></div>
                         </div>
                    </div>
                </div>
            )}

            {/* --- Results & Share Card --- */}
            {appState === 'roasting' && showShareCard && (
               <div className="flex flex-col items-center p-6 animate-fade-in">
                   <h2 className={`text-2xl font-bold mb-6 ${neonMagenta}`}>Roast Complete: Cringe Index™ {cringeScore}%</h2>

                   {/* Shareable Card */}
                   <div className={`relative w-full max-w-lg bg-gradient-to-br from-gray-800 via-black to-gray-800 border ${borderNeon} rounded-lg p-6 shadow-lg shadow-cyan-700/40 mb-6 transition-all duration-500 ${isCardShattered ? 'animate-shatter' : 'animate-rebuild'}`}>
                     {/* Shattered Fragments Sim */}
                      {isCardShattered && (
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 pointer-events-none">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="bg-gray-600 opacity-50 animate-fragment" style={{ animationDelay: `${Math.random() * 0.5}s` }}></div>
                            ))}
                        </div>
                       )}

                     {/* Card Content (visible when not shattered) */}
                       <div className={`transition-opacity duration-300 ${isCardShattered ? 'opacity-0' : 'opacity-100'}`}>
                           <div className="flex flex-col md:flex-row gap-4 mb-4">
                               {uploadedImage && (
                                  <img src={uploadedImage} alt="Profile Thumbnail" className="w-24 h-24 rounded-md border border-gray-600 object-cover self-center md:self-start" />
                               )}
                               <div className="flex-grow">
                                   <h3 className={`text-lg font-semibold ${neonCyan} mb-2`}>Roast Highlights:</h3>
                                   <ul className="list-disc list-inside text-sm space-y-1">
                                     {roastResults.map((r, i) => (
                                       <li key={i} className={r.severity === 'nuclear' ? 'text-red-400' : r.severity === 'medium' ? 'text-yellow-400' : 'text-cyan-300'}>{r.highlight}</li>
                                     ))}
                                   </ul>
                               </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center text-sm">
                              <div>
                                 <p className={`${neonLime} font-bold mb-1`}>Compatibility Heatmap:</p>
                                 <div className="bg-gray-700 border border-lime-700 rounded h-16 flex items-center justify-center text-xs text-gray-400">(Simulated Heatmap Graphic)</div>
                              </div>
                              <div>
                                 <p className={`${neonMagenta} font-bold mb-1`}>AI Generated Meme:</p>
                                 <div className="bg-gray-700 border border-pink-700 rounded h-16 flex items-center justify-center text-xs text-gray-400">(Simulated AI Meme)</div>
                              </div>
                           </div>

                           {currentTier === 'Roaster' && (
                              <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded">
                                <p className={`text-yellow-400 text-sm font-semibold mb-1`}>Nuclear Roast Extras:</p>
                                <p className="text-xs text-yellow-300">- ElevenLabs Voice Roast: <button className={`ml-2 text-xs px-2 py-0.5 rounded ${neonLime} bg-lime-700 hover:bg-lime-600 ${glitchHoverClass}`}>Play Audio</button></p>
                                <p className="text-xs text-yellow-300">- Deep EXIF Data Revealed (Simulated)</p>
                              </div>
                           )}
                       </div>
                   </div>

                  {/* Action Buttons */}
                   <div className="flex flex-wrap justify-center gap-4">
                       <button onClick={handleShare} className={`px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded ${glitchHoverClass} transition-all`}>
                           {isCardShattered ? 'Generating Share Post...' : 'Share 3D Card / TikTok'}
                       </button>
                       <button onClick={() => alert('Friend Challenge Sent! (Not really)')} className={`px-6 py-3 bg-lime-600 hover:bg-lime-500 text-black font-bold rounded ${glitchHoverClass} transition-all`}>
                           Challenge a Friend
                       </button>
                       <button onClick={handleDownload} className={`px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded ${glitchHoverClass} transition-all`}>
                           Download TruthCard
                       </button>
                       <button onClick={handleRestart} className={`px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded ${glitchHoverClass} transition-all`}>
                           Roast Another
                       </button>
                   </div>

                   {/* Leaderboard Placeholder */}
                   <div className="mt-8 w-full max-w-md text-center">
                     <h3 className={`${neonMagenta} text-lg font-semibold mb-2`}>Embarrassment Leaderboard</h3>
                     <div className="bg-black/50 border border-gray-700 rounded p-4 text-sm text-gray-400">
                       (Supabase-powered Leaderboard - Coming Soon!)
                       <ol className="list-decimal list-inside text-left mt-2 space-y-1">
                           <li>User_Alpha - 98% Cringe</li>
                           <li>CyberRoastMaster - 95% Cringe</li>
                           <li>Anon_Profile - 91% Cringe</li>
                       </ol>
                     </div>
                   </div>
               </div>
            )}

            {/* --- Error State --- */}
            {appState === 'error' && (
                 <div className="text-center p-8">
                   <p className="text-2xl text-red-500 font-bold mb-4">ERROR: Judgment Malfunction</p>
                   <p className="text-gray-400 mb-6">Something went wrong during the analysis. Please try again.</p>
                   <button onClick={handleRestart} className={`px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded ${glitchHoverClass} transition-all`}>
                       Retry Upload
                   </button>
                 </div>
            )}

            {/* --- Pricing Section --- */}
            {appState !== 'onboarding' && ( // Show pricing after onboarding
            <section className="mt-12 pt-8 border-t border-dashed border-gray-600 w-full">
                <h2 className={`text-2xl font-bold text-center mb-6 ${neonCyan}`}>Choose Your Judgment Level</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Free Tier */}
                    <div className={`p-6 rounded-lg border ${currentTier === 'Free' ? 'border-cyan-500 bg-cyan-900/20 scale-105' : 'border-gray-700 bg-gray-800/50'} transition-all`}>
                        <h3 className="text-xl font-semibold text-white mb-2">Basic Scan</h3>
                        <p className={`text-3xl font-bold ${neonCyan} mb-4`}>$0<span className="text-sm text-gray-400">/forever</span></p>
                        <ul className="text-sm space-y-2 text-gray-300 mb-6">
                            <li>✓ Standard Cringe Index™</li>
                            <li>✓ Basic Red Flag Detection</li>
                            <li>✓ Limited Roast Highlights</li>
                            <li>✗ Compatibility Heatmap</li>
                            <li>✗ AI Meme Generation</li>
                            <li>✗ Voice Roasts</li>
                            <li>✗ Deep EXIF Reveals</li>
                        </ul>
                        <button
                            onClick={() => window.open("https://vrconnect.gumroad.com/l/attractthrightgirl", "_blank")}
                            disabled={currentTier === 'Pro'}
                            className={`w-full px-4 py-2 rounded font-bold ${currentTier === 'Pro' ? 'bg-gray-600 cursor-not-allowed' : `bg-lime-600 hover:bg-lime-500 text-black ${glitchHoverClass}`}`}
                         >
                            {currentTier === 'Pro' ? 'Selected' : 'Select Free Tier'}
                         </button>
                    </div>

                    {/* Pro Tier */}
                    <div className={`p-6 rounded-lg border ${currentTier === 'Pro' ? 'border-lime-500 bg-lime-900/20 scale-105' : 'border-gray-700 bg-gray-800/50'} transition-all`}>
                         <h3 className="text-xl font-semibold text-white mb-2">Pro Roast</h3>
                         <p className={`text-3xl font-bold ${neonLime} mb-4`}>$4.99<span className="text-sm text-gray-400">/roast</span></p>
                         <ul className="text-sm space-y-2 text-gray-300 mb-6">
                             <li>✓ Standard Cringe Index™</li>
                             <li>✓ Advanced Red Flag Detection</li>
                             <li>✓ Full Roast Highlights</li>
                             <li>✓ Compatibility Heatmap</li>
                             <li>✓ AI Meme Generation</li>
                             <li>✗ Voice Roasts</li>
                             <li>✗ Deep EXIF Reveals</li>
                         </ul>
                         <button
                            onClick={() => window.open("https://vrconnect.gumroad.com/l/attractthrightgirl", "_blank")}
                            disabled={currentTier === 'Pro'}
                            className={`w-full px-4 py-2 rounded font-bold ${currentTier === 'Pro' ? 'bg-gray-600 cursor-not-allowed' : `bg-lime-600 hover:bg-lime-500 text-black ${glitchHoverClass}`}`}
                         >
                            {currentTier === 'Pro' ? 'Selected' : 'Select Pro'}
                         </button>
                    </div>

                    {/* Roaster Tier */}
                     <div className={`p-6 rounded-lg border ${currentTier === 'Roaster' ? 'border-pink-500 bg-pink-900/20 scale-105' : 'border-gray-700 bg-gray-800/50'} transition-all`}>
                        <h3 className="text-xl font-semibold text-white mb-2">Nuclear Roast</h3>
                        <p className={`text-3xl font-bold ${neonMagenta} mb-4`}>$9.99<span className="text-sm text-gray-400">/roast</span></p>
                         <ul className="text-sm space-y-2 text-gray-300 mb-6">
                            <li>✓ Enhanced Cringe Index™</li>
                            <li>✓ All Red Flags Detected</li>
                            <li>✓ Uncensored Roast Highlights</li>
                            <li>✓ Detailed Compatibility Heatmap</li>
                            <li>✓ Custom AI Meme Generation</li>
                            <li>✓ ElevenLabs Voice Roast</li>
                            <li>✓ Deep EXIF Data Reveal</li>
                         </ul>
                         <button
                            onClick={() => window.open("https://vrconnect.gumroad.com/l/attractthrightgirl", "_blank")}
                            disabled={currentTier === 'Pro'}
                            className={`w-full px-4 py-2 rounded font-bold ${currentTier === 'Pro' ? 'bg-gray-600 cursor-not-allowed' : `bg-lime-600 hover:bg-lime-500 text-black ${glitchHoverClass}`}`}
                         >
                            {currentTier === 'Pro' ? 'Selected' : 'Select Nuclear Roast'}
                         </button>
                     </div>
                </div>
             </section>
             )}

        </div>

        {/* CSS Animations (can be moved to a global CSS file in a real app) */}
        <style jsx global>{`
           @keyframes scanlines {
             0% { background-position: 0 0; }
             100% { background-position: 0 100%; }
           }
           .crt-effect::after {
             content: "";
             position: absolute;
             inset: 0;
             background: radial-gradient(ellipse at center, rgba(128, 128, 128, 0.1) 0%, rgba(0,0,0,0.8) 100%);
             pointer-events: none;
             border-radius: inherit; // Match parent rounding
             box-shadow: inset 0 0 20px rgba(128, 255, 128, 0.1); // Inner glow
           }
           .text-shadow-neon {
             text-shadow: 0 0 5px currentColor, 0 0 10px currentColor;
           }
           .animate-spin-slow { animation: spin 3s linear infinite; }
           .animate-float { animation: float 6s ease-in-out infinite; }
           @keyframes float {
              0%, 100% { transform: translateY(0px) rotateX(5deg) rotateY(-3deg); }
              50% { transform: translateY(-15px) rotateX(-5deg) rotateY(3deg); }
           }
           .animate-rgb-border {
             animation: rgb-border-anim 4s linear infinite;
             background: linear-gradient(90deg, #ff00ff, #00ffff, #00ff00, #ffff00, #ff00ff) 0% 0% / 300% 100%;
           }
           @keyframes rgb-border-anim {
             0% { background-position: 0% 50%; }
             100% { background-position: 150% 50%; }
           }
            .animate-rgb-trail {
             // Using box-shadow for trail simulation
             animation: rgb-trail-anim 3s linear infinite; // Duration controlled by style prop
             box-shadow: 0 0 10px 3px rgba(0, 255, 255, 0), // Cyan start (transparent)
                         0 0 15px 5px rgba(255, 0, 255, 0), // Magenta mid (transparent)
                         0 0 20px 7px rgba(0, 255, 0, 0);   // Lime end (transparent)
           }
           @keyframes rgb-trail-anim {
              0%, 100% { box-shadow: 0 0 10px 3px rgba(0, 255, 255, 0.7), 0 0 15px 5px rgba(255, 0, 255, 0), 0 0 20px 7px rgba(0, 255, 0, 0); }
              33% { box-shadow: 0 0 10px 3px rgba(0, 255, 255, 0), 0 0 15px 5px rgba(255, 0, 255, 0.7), 0 0 20px 7px rgba(0, 255, 0, 0); }
              66% { box-shadow: 0 0 10px 3px rgba(0, 255, 255, 0), 0 0 15px 5px rgba(255, 0, 255, 0), 0 0 20px 7px rgba(0, 255, 0, 0.7); }
           }
           .animate-rotate { animation: rotate 10s linear infinite, pulse-badge 2s infinite ease-in-out; }
           @keyframes rotate { 100% { transform: rotate(360deg); } }
           @keyframes pulse-badge { 50% { box-shadow: 0 0 8px 2px rgba(255, 0, 0, 0.7); } }
           .animate-explode { animation: explode-anim 0.5s ease-out forwards; }
           @keyframes explode-anim {
             0% { transform: scale(1); opacity: 1; }
             100% { transform: scale(3); opacity: 0; }
           }
           .animate-liquid-result { animation: liquid-result-anim 1.5s ease-in-out forwards; }
           @keyframes liquid-result-anim {
              0% { transform: scale(0.9) translateY(10px); opacity: 0; }
              70% { transform: scale(1.05) translateY(-5px); opacity: 1; }
              100% { transform: scale(1) translateY(0); opacity: 1; }
           }
           .perspective { perspective: 1000px; }
           .holographic-card { transform-style: preserve-3d; }
           .holographic-shine {
             background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 50%);
             mix-blend-mode: overlay;
             animation: holo-shine 5s infinite alternate ease-in-out;
           }
           @keyframes holo-shine {
             0% { transform: translateX(-50%) translateY(-50%) rotate(0deg); opacity: 0.3; }
             100% { transform: translateX(50%) translateY(50%) rotate(10deg); opacity: 0.6; }
           }
           .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
           @keyframes fade-in { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
           .animate-shatter { animation: shatter-anim 1s forwards; }
           @keyframes shatter-anim {
              0% { opacity: 1; transform: scale(1); filter: blur(0); }
              100% { opacity: 0; transform: scale(1.2); filter: blur(5px); }
           }
            .animate-rebuild { animation: rebuild-anim 0.5s forwards ease-out; }
           @keyframes rebuild-anim {
              0% { opacity: 0; transform: scale(1.1); filter: blur(3px); }
              100% { opacity: 1; transform: scale(1); filter: blur(0); }
           }
           .animate-fragment { animation: fragment-fly 1s ease-out forwards; }
           @keyframes fragment-fly {
             0% { transform: translate(0, 0) rotate(0); opacity: 0.5; }
             100% {
                 transform: translate(calc(var(--tx, 0) * 50px), calc(var(--ty, 0) * 50px)) rotate(calc(var(--r, 0) * 90deg));
                 opacity: 0;
             }
           }
           /* Generate random vars for fragments (better done with JS in real app) */
           .animate-fragment:nth-child(1) { --tx: -1; --ty: -1; --r: -1; }
           .animate-fragment:nth-child(2) { --tx: 0; --ty: -1; --r: 1; }
           /* ... add more variations */

           .hexagon-clip { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
           .vortex-active { animation: vortex-pulse 1s infinite; }
           @keyframes vortex-pulse { 50% { filter: brightness(1.5); } }
           .bg-radial-gradient { background: radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 70%, black 100%); }
           .animate-matrix { animation: matrix-fall 10s linear infinite; }
           @keyframes matrix-fall { to { background-position-y: 1000px; } } /* Simple simulation */
           .animate-lip-sync { animation: lip-sync-anim 0.3s infinite alternate; }
           @keyframes lip-sync-anim {
             0% { transform: scaleY(1); }
             100% { transform: scaleY(0.3); }
           }
           .animate-pulse-speak { animation: pulse-speak-anim 0.5s infinite alternate; }
           @keyframes pulse-speak-anim {
             from { box-shadow: 0 0 10px 2px theme('colors.cyan.500'); }
             to { box-shadow: 0 0 20px 6px theme('colors.lime.500'); }
           }
           /* Simulated DeepGuard Blur */
           .deepguard-blur { /* filter: blur(10px); */ /* Uncomment to test visual */ }
            <p className="text-neon-blue mb-4">We are in development stage. "if you want to support us"</p>
             <p className="text-neon-blue mb-4">Please support by clicking the pricing plans</p>
        `}</style>
    </div>
  );
};

export default TruthCardAI;

const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (isLocked && currentTier === 'Free') {
      const lockoutEndDate = new Date(lockoutEndDate);
      alert(`You've reached your daily upload limit. Please upgrade to Pro or wait until ${lockoutEndDate.toLocaleDateString()} to upload more images.`);
      return;
    }
    
    if (!handleUploadLimit()) {
      alert('You have reached your daily upload limit (3 uploads). Please upgrade to Pro to continue using TruthCard AI.');
      return;
    }

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setFileName(file.name);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setIsLoading(false);
      setIsAnalyzing(true);
      setAppState('analyzing');
    };
    reader.readAsDataURL(file);
  };

  const handlePayment = async () => {
  try {
    // Call your backend (Edge Function) to create a Razorpay order
    const response = await fetch("/api/create-razorpay-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 50000 }) // ₹500 in paise
    });
    if (!response.ok) throw new Error("Failed to create order");
    const order = await response.json();
    const options = {
      key: "YOUR_RAZORPAY_KEY_ID", // Replace with your Razorpay Key ID
      amount: order.amount, // Amount in paise
      currency: order.currency,
      name: "TruthCard AI",
      description: "Purchase Pro Tier",
      order_id: order.id,
      handler: function (response) {
        setPaymentStatus('Payment successful! Transaction ID: ' + response.razorpay_payment_id);
        setCurrentTier('Roaster');
        setIsLoading(false);
      },
      prefill: {
        email: "",
        contact: ""
      },
      theme: {
        color: "#ff0055"
      }
    };
    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    alert("Payment failed: " + (err.message || err));
  }
};
