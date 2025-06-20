import { useEffect } from 'react';

const AIAnswerBox = () => {
  useEffect(() => {
    // Prevent duplicate script injection
    if (!document.getElementById('hH8GVH8FUwagG4eLS1WeB')) {
      const script = document.createElement('script');
      script.src = 'https://www.chatbase.co/embed.min.js';
      script.id = 'hH8GVH8FUwagG4eLS1WeB';
      script.domain = 'www.chatbase.co';
      document.body.appendChild(script);
    }
    // Optional: Cleanup if you want to remove the chat bubble on unmount
    // return () => {
    //   const script = document.getElementById('hH8GVH8FUwagG4eLS1WeB');
    //   if (script) {
    //     script.remove();
    //   }
    // };
  }, []);

  // This component does not render any visible content itself
  return null;
};

export default AIAnswerBox; 