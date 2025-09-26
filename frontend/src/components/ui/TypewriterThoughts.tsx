import React, { useState, useEffect } from 'react';

interface ThoughtItem {
  id: string;
  message: string;
  timestamp: string;
}

interface TypewriterThoughtsProps {
  thoughts: ThoughtItem[];
  isVisible: boolean;
  onContentChange?: () => void; // Callback to trigger parent scroll
}

const TypewriterThoughts: React.FC<TypewriterThoughtsProps> = ({ thoughts, isVisible, onContentChange }) => {
  const [staticText, setStaticText] = useState("");
  const [animatedText, setAnimatedText] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastThoughtCount, setLastThoughtCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Custom typewriter effect
  useEffect(() => {
    if (animatedText && currentIndex < animatedText.length && isAnimating) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + animatedText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        
        // Trigger scroll during animation
        if (onContentChange) {
          onContentChange();
        }
      }, 1); // 15ms delay between characters (faster animation)

      return () => clearTimeout(timer);
    } else if (animatedText && currentIndex >= animatedText.length && isAnimating) {
      // Animation finished
      setIsAnimating(false);
      setStaticText(prev => prev + (prev ? '\n\n' : '') + displayedText);
      setAnimatedText("");
      setDisplayedText("");
      setCurrentIndex(0);
    }
  }, [animatedText, currentIndex, isAnimating, displayedText, onContentChange]);

  useEffect(() => {
    if (!isVisible || thoughts.length === 0) {
      setStaticText("");
      setAnimatedText("");
      setDisplayedText("");
      setCurrentIndex(0);
      setLastThoughtCount(0);
      setIsAnimating(false);
      return;
    }

    // If new thoughts have been added
    if (thoughts.length > lastThoughtCount) {
      const newThoughts = thoughts.slice(lastThoughtCount);
      const newText = newThoughts.map(t => t.message).join('\n\n');
      
      setAnimatedText(newText);
      setDisplayedText("");
      setCurrentIndex(0);
      setIsAnimating(true);
      setLastThoughtCount(thoughts.length);
      
      // Trigger scroll when new thoughts start animating
      if (onContentChange) {
        onContentChange();
      }
    }
  }, [thoughts, isVisible, lastThoughtCount, onContentChange]);

  if (!isVisible || (staticText === "" && animatedText === "")) {
    return null;
  }

  return (
    <div className="flex gap-4 justify-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
        <div className="w-5 h-5 text-white">🤖</div>
      </div>
      <div className="bg-white/5 border border-cyan-400/20 rounded-2xl rounded-bl-none p-4 backdrop-blur-sm w-full max-w-2xl">
        <div className="text-sm text-cyan-100/90 whitespace-pre-wrap">
          {/* Display static text directly */}
          {staticText && <span>{staticText}</span>}
          
          {/* Display currently animating text */}
          {displayedText && <span>{displayedText}</span>}
          
          {/* Show blinking cursor if still animating */}
          {isAnimating && currentIndex < animatedText.length && (
            <span className="animate-pulse text-cyan-400">|</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TypewriterThoughts;
