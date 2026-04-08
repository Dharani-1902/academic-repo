import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import StudentList from './pages/StudentList';
import StudentDetail from './pages/StudentDetail';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<StudentList />} />
        <Route path="/students/:id" element={<StudentDetail />} />
      </Routes>
    </Layout>
  );
}
