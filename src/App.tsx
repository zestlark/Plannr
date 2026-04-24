import { HashRouter, Routes, Route, useOutletContext } from 'react-router-dom';
import { AppProvider } from '@/store/AppContext';
import { MainLayout } from '@/components/Navigation/MainLayout';
import { DashboardView } from '@/views/DashboardView';
import { PeopleView } from '@/views/PeopleView';
import { SummaryView } from '@/views/SummaryView';
import { DataView } from '@/views/DataView';
import { Toaster } from 'sonner';

// Helper to bridge search query to views
function DashboardRoute() {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  return <DashboardView searchQuery={searchQuery} />;
}

function App() {
  return (
    <HashRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardRoute />} />
            <Route path="people" element={<PeopleView />} />
            <Route path="summary" element={<SummaryView />} />
            <Route path="settings" element={<DataView />} />
          </Route>
        </Routes>
        
        <Toaster 
          position="top-right" 
          expand={false} 
          richColors 
          theme="light"
        />
      </AppProvider>
    </HashRouter>
  );
}

export default App;
