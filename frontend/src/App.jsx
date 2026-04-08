import React from 'react';
import Sidebar from './components/sidebar/Sidebar';
import MarkdownEditor from './components/editor/MarkdownEditor';
import MarkdownPreview from './components/editor/MarkdownPreview';
import { useOfflineStatus } from './hooks/useOfflineStatus';
import { useThemeContext } from './hooks/useThemeContext';

function App() {
  const isOffline = useOfflineStatus();
  const { theme, toggleTheme } = useThemeContext();

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Offline Banner */}
      <div 
        className={`bg-destructive text-destructive-foreground text-center text-sm font-medium transition-all duration-500 ease-in-out overflow-hidden flex items-center justify-center ${
          isOffline ? 'h-8 opacity-100' : 'h-0 opacity-0'
        }`}
      >
        You are currently offline. Changes are saved locally.
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar theme={theme} toggleTheme={toggleTheme} />

        {/* Editor & Preview Area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col h-full bg-background min-w-0">
            <MarkdownEditor />
          </div>
          <div className="hidden lg:flex lg:flex-1 h-full min-w-0">
            <MarkdownPreview />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
