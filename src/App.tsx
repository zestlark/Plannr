import { AppProvider } from '@/store/AppContext';
import { Toolbar } from '@/components/Toolbar/Toolbar';
import { Board } from '@/components/Board/Board';
import { ExpenseSummary } from '@/components/Summary/ExpenseSummary';
import { Toaster } from 'sonner';

function AppContent() {
  return (
    <div className="max-w-[1400px] mx-auto w-full flex flex-col items-center">
      <header className="w-full text-center mb-10 pt-4">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center gap-3 drop-shadow-sm">
          <span className="text-4xl filter drop-shadow-md">🛒</span> 
          Villa Shopping Organizer
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Plan, drag, drop, and settle expenses instantly.</p>
      </header>

      <Toolbar />
      <Board />
      <div className="w-full">
        <ExpenseSummary />
      </div>
      
      <Toaster 
        position="top-right" 
        expand={false} 
        richColors 
        theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'} 
      />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
