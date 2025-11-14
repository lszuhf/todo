import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout';
import { TodosPage, TagsPage, SettingsPage } from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<TodosPage />} />
          <Route path="tags" element={<TagsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
