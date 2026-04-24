import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './pages/Layout'
import Home from './pages/Home'
import Matches from './pages/Matches'
import MatchDetail from './pages/MatchDetail'
import TeamDetail from './pages/TeamDetail'
import Standings from './pages/Standings'
import Vote from './pages/Vote'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="matches" element={<Matches />} />
          <Route path="matches/:id" element={<MatchDetail />} />
          <Route path="standings" element={<Standings />} />
          <Route path="teams/:id" element={<TeamDetail />} />
          <Route path="players" element={<div>Players Page (TBD)</div>} />
          <Route path="vote" element={<Vote />} />
          <Route path="more" element={<div>More Page (TBD)</div>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
