import { Image as ImageIcon, Maximize2, Share2 } from 'lucide-react';

const IMAGES = [
  { id: 1, url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1000", title: "Practice Session", team: "SR Super Kings" },
  { id: 2, url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000", title: "Ground Preparation", team: "Venue" },
  { id: 3, url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000", title: "Training Drills", team: "RB Royals" },
  { id: 4, url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1000", title: "Team Meeting", team: "Golden Boyz" },
  { id: 5, url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000", title: "Warm up", team: "GPL Strikers" },
  { id: 6, url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000", title: "Pitch Inspection", team: "Officials" },
];

export default function Gallery() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2 text-center md:text-left">
        <h1 className="text-4xl font-black italic uppercase tracking-wider text-primary flex items-center justify-center md:justify-start gap-3">
          <ImageIcon size={32} /> Tournament Gallery
        </h1>
        <p className="text-text-muted font-medium">Relive the best moments from the field and beyond.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {IMAGES.map((img) => (
          <div key={img.id} className="group relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-surface">
            <img 
              src={img.url} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
              alt={img.title}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <div className="text-accent text-[10px] font-black uppercase tracking-widest mb-1">{img.team}</div>
                  <div className="text-white font-black text-lg leading-tight uppercase italic">{img.title}</div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-accent hover:text-background transition-all">
                    <Maximize2 size={18} />
                  </button>
                  <button className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-accent hover:text-background transition-all">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Mockup */}
      <div className="flex justify-center pt-8">
        <button className="px-8 py-4 bg-surface border border-white/10 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:border-accent hover:text-accent transition-all active:scale-95 shadow-xl">
          Load More Memories
        </button>
      </div>
    </div>
  );
}
