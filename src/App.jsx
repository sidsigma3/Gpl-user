import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './pages/Layout'
import Home from './pages/Home'
import Matches from './pages/Matches'
import MatchDetail from './pages/MatchDetail'
import TeamDetail from './pages/TeamDetail'
import Standings from './pages/Standings'
import News from './pages/News'
import Gallery from './pages/Gallery'
import Vote from './pages/Vote'
import Stats from './pages/Stats'

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
          <Route path="gallery" element={<Gallery />} />
          <Route path="news" element={<News />} />
          <Route path="vote" element={<Vote />} />
          <Route path="stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
