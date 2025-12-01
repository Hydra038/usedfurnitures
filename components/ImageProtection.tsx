'use client';

import { useEffect } from 'react';

export default function ImageProtection() {
  useEffect(() => {
    // Disable right-click on images and product cards
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || 
          target.closest('.card') || 
          target.closest('.protected-image') ||
          target.closest('[class*="product"]')) {
        e.preventDefault();
        return false;
      }
    };

    // Disable common keyboard shortcuts for saving/printing
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl/Cmd + P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        return false;
      }
      
      // Print Screen detection
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('');
        // Show a subtle warning
        const existingAlert = document.getElementById('screenshot-warning');
        if (!existingAlert) {
          const warning = document.createElement('div');
          warning.id = 'screenshot-warning';
          warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 9999;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            animation: slideIn 0.3s ease-out;
          `;
          warning.textContent = '⚠️ Screenshots are not allowed on this page';
          document.body.appendChild(warning);
          
          setTimeout(() => {
            warning.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => warning.remove(), 300);
          }, 3000);
        }
      }
    };

    // Disable drag and drop of images
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };

    // Add CSS animations for warning
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      style.remove();
    };
  }, []);

  return null;
}
