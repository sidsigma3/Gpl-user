import { useQuery } from '@tanstack/react-query';
import { Bell, Calendar, ArrowRight, Newspaper } from 'lucide-react';
import { useSeason } from '../context/SeasonContext';

// Sample data - we can later connect this to a 'news' table in Supabase
const SAMPLE_NEWS = [
  {
    id: 1,
    title: "GPL 2026 Opening Ceremony Details",
    category: "Event",
    date: "2026-05-02",
    excerpt: "Join us for a spectacular opening ceremony featuring local artists and the official team parades.",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Match Official Appointments Announced",
    category: "Technical",
    date: "2026-05-01",
    excerpt: "The tournament committee has finalized the panel of umpires and match referees for the upcoming season.",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "New Health & Safety Guidelines",
    category: "Security",
    date: "2026-04-30",
    excerpt: "Important update regarding venue access and fan behavior during the night matches.",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000&auto=format&fit=crop"
  }
];

export default function News() {
  const { activeSeason } = useSeason();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h1 className="text-4xl font-black italic uppercase tracking-wider text-primary flex items-center gap-3">
          <Newspaper size={32} /> Latest News
        </h1>
        <p className="text-text-muted font-medium">Stay updated with every announcement from the GPL committee.</p>
      </header>

      <div className="grid gap-6">
        {SAMPLE_NEWS.map((article, idx) => (
          <div key={article.id} className="card group overflow-hidden bg-gradient-to-br from-surface to-background border-white/5 hover:border-primary/30 transition-all cursor-pointer">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-64 h-48 md:h-auto overflow-hidden relative">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute top-4 left-4 bg-accent text-background text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg">
                  {article.category}
                </div>
              </div>
              
              <div className="flex-1 p-6 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  <Calendar size={12} className="text-accent" />
                  {new Date(article.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-black group-hover:text-primary transition-colors leading-tight">
                    {article.title}
                  </h2>
                  <p className="text-text-muted text-sm leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-4 flex items-center text-accent font-black uppercase text-[10px] tracking-widest gap-2 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all">
                  Read Full Article <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Announcements Sidebar Style Section */}
      <section className="bg-surface/30 rounded-3xl p-8 border border-white/5">
        <h3 className="text-xl font-black italic uppercase tracking-wider text-accent mb-6 flex items-center gap-2">
          <Bell size={24} /> Quick Updates
        </h3>
        <div className="space-y-4">
          {[
            "Rosters for 'GPL Strikers' have been verified.",
            "Toss for Match 1 scheduled at 6:30 PM on May 3rd.",
            "New merchandise available at the venue gates."
          ].map((update, i) => (
            <div key={i} className="flex gap-4 items-start p-4 bg-background/40 rounded-2xl border border-white/5">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <p className="text-sm font-medium text-text-primary">{update}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
