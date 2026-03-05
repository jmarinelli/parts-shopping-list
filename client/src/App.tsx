import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { HomePage } from '@/pages/home';
import { CarDetailPage } from '@/pages/car-detail';
import { ProjectDetailPage } from '@/pages/project-detail';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cars/:carId" element={<CarDetailPage />} />
        <Route path="/cars/:carId/projects/:projectId" element={<ProjectDetailPage />} />
      </Routes>
      <Toaster
        position="bottom-left"
        toastOptions={{
          style: {
            background: '#1c1c1f',
            border: '1px solid #2a2a2d',
            color: '#ececef',
            fontFamily: 'Geist, system-ui, sans-serif',
            fontSize: '13px',
          },
        }}
      />
    </>
  );
}

export default App;
