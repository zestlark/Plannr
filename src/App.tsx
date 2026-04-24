import { HashRouter, Routes, Route, useOutletContext, useParams } from 'react-router-dom';
import { AppProvider, useAppStore } from '@/store/AppContext';
import { MainLayout } from '@/components/Navigation/MainLayout';
import { DashboardView } from '@/views/DashboardView';
import { PeopleView } from '@/views/PeopleView';
import { SummaryView } from '@/views/SummaryView';
import { DataView } from '@/views/DataView';
import { PlansView } from '@/views/PlansView';
import { Toaster } from 'sonner';
import { useEffect } from 'react';

// Wrapper to sync route param with store state
function PlanContextWrapper() {
  const { planId } = useParams();
  const { setCurrentPlanId } = useAppStore();

  useEffect(() => {
    if (planId) {
      setCurrentPlanId(planId);
    }
    return () => setCurrentPlanId(null);
  }, [planId, setCurrentPlanId]);

  return <MainLayout />;
}

function DashboardRoute() {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  return <DashboardView searchQuery={searchQuery} />;
}

function App() {
  return (
    <HashRouter>
      <AppProvider>
        <Routes>
          {/* Plan selection */}
          <Route path="/" element={<PlansView />} />
          
          {/* Individual Plan routes */}
          <Route path="/p/:planId" element={<PlanContextWrapper />}>
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
