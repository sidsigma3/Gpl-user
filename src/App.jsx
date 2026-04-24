import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './pages/Layout'
import Home from './pages/Home'
import Matches from './pages/Matches'
import MatchDetail from './pages/MatchDetail'
import Standings from './pages/Standings'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="matches" element={<Matches />} />
          <Route path="matches/:id" element={<MatchDetail />} />
          <Route path="standings" element={<Standings />} />
          <Route path="players" element={<div>Players Page (TBD)</div>} />
          <Route path="vote" element={<div>Vote Page (TBD)</div>} />
          <Route path="more" element={<div>More Page (TBD)</div>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
