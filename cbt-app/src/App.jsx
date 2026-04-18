import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HalamanSiswa from './pages/HalamanSiswa'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HalamanSiswa />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
