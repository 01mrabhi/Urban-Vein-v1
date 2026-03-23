'use client';
import React from 'react';
import { 
  BarChart2, 
  ShoppingCart, 
  Users, 
  Package, 
  Settings, 
  Search, 
  Bell, 
  Moon, 
  UserCircle,
  Activity,
  Server,
  Terminal,
  Cpu
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-black text-red-500 font-mono selection:bg-red-900/50 flex">
      {/* Background Grid */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #dc2626 1px, transparent 1px),
            linear-gradient(to bottom, #dc2626 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-red-900/50 bg-black/80 backdrop-blur-md relative z-10 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo Area */}
          <div className="h-24 border-b border-red-900/50 flex items-center px-6 gap-4">
            <div className="w-10 h-10 bg-black border border-red-500 flex items-center justify-center">
              <Terminal size={20} className="text-red-500" />
            </div>
            <div>
              <h1 className="text-white font-bold tracking-widest uppercase text-sm">UrbanVein</h1>
              <p className="text-[9px] tracking-[0.2em] text-red-500/80">ADMIN TERMINAL</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-2">
            <Link href="#" className="flex items-center gap-3 px-4 py-3 bg-red-950/30 text-white border-l-2 border-red-500 text-xs tracking-widest uppercase hover:bg-red-900/20 transition-colors">
               <Activity size={16} className="text-red-500" />
               Overview
            </Link>
            {[
              { label: 'Orders', icon: ShoppingCart },
              { label: 'Users', icon: Users },
              { label: 'Inventory', icon: Package },
              { label: 'Settings', icon: Settings },
            ].map((item) => (
              <Link key={item.label} href="#" className="flex items-center gap-3 px-4 py-3 text-red-600/60 hover:text-red-500 hover:bg-red-950/20 border-l-2 border-transparent hover:border-red-500/50 text-xs tracking-widest uppercase transition-colors">
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-6 border-t border-red-900/50 text-[10px] tracking-[0.2em] text-red-600/60 font-mono">
          <p>LAT: 40.7128 N</p>
          <p>LON: 74.0060 W</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative z-10 bg-black/50 backdrop-blur-sm h-screen overflow-hidden">
        
        {/* TOPBAR */}
        <header className="h-24 border-b border-red-900/50 flex items-center justify-between px-8 bg-black/80">
          <div className="relative w-96">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-700" />
            <input 
              type="text" 
              placeholder="TERMINAL_SEARCH_QUERY..." 
              className="w-full bg-black border border-red-900/50 rounded-md py-2.5 pl-10 pr-4 text-xs tracking-widest text-red-500 placeholder-red-900 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-8">
            <span className="text-red-500 text-xs tracking-widest uppercase">Admin Dashboard</span>
            <div className="flex items-center gap-4 text-red-600 cursor-pointer">
              <Bell size={18} className="hover:text-red-400 transition-colors" />
              <Moon size={18} className="hover:text-red-400 fill-red-600 transition-colors" />
              <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center text-zinc-400">
                <UserCircle size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD GRID */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Top Row: Chart & Stats */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* System Overview Chart */}
              <div className="xl:col-span-2 border border-red-900/50 bg-black/60 rounded-xl p-6 relative overflow-hidden group hover:border-red-500/50 transition-colors">
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <h2 className="text-xl font-bold tracking-widest uppercase">System Overview</h2>
                  </div>
                  <div className="flex gap-8 text-right">
                    <div>
                      <p className="text-[8px] tracking-[0.2em] text-red-700 uppercase mb-1">User Growth</p>
                      <p className="text-lg text-red-500 font-bold">+12.4%</p>
                    </div>
                    <div>
                      <p className="text-[8px] tracking-[0.2em] text-red-700 uppercase mb-1">Revenue</p>
                      <p className="text-lg text-red-500 font-bold">98.2k</p>
                    </div>
                  </div>
                </div>
                <p className="text-[9px] tracking-[0.2em] text-red-600 uppercase mb-8 relative z-10">Real-time traffic & conversion metrics</p>
                
                {/* Fake Chart Area */}
                <div className="h-48 relative border-b border-red-900/30 flex items-end justify-between px-2">
                   {/* Horizontal grid lines */}
                   <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                     <div className="w-full h-px bg-red-900/20"></div>
                     <div className="w-full h-px bg-red-900/20"></div>
                     <div className="w-full h-px bg-red-900/20"></div>
                   </div>

                   {/* Glowing SVG Path */}
                   <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
                      <path 
                        d="M 0,150 C 100,120 200,160 300,140 C 400,120 450,40 550,50 C 650,60 700,20 800,80 C 900,140 950,20 1000,80" 
                        fill="none" 
                        stroke="#ef4444" 
                        strokeWidth="4"
                        style={{ filter: 'drop-shadow(0px 0px 8px rgba(239, 68, 68, 0.8))' }}
                      />
                      {/* Gradient Fill under path */}
                      <path 
                        d="M 0,150 C 100,120 200,160 300,140 C 400,120 450,40 550,50 C 650,60 700,20 800,80 C 900,140 950,20 1000,80 L 1000,200 L 0,200 Z" 
                        fill="url(#redGlow)" 
                        opacity="0.2"
                      />
                      <defs>
                        <linearGradient id="redGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                   </svg>
                </div>
              </div>

              {/* Active Nodes Circular Progress */}
              <div className="border border-red-900/50 bg-black/60 rounded-xl p-6 flex flex-col items-center justify-center relative hover:border-red-500/50 transition-colors">
                <div className="w-full flex justify-between uppercase text-[8px] tracking-[0.2em] text-red-600 mb-8 absolute top-6 px-6">
                   <span>STAT_UNIT_04</span>
                </div>
                <h3 className="text-white tracking-widest text-sm uppercase font-bold mb-8">Active Nodes</h3>
                
                {/* Ring */}
                <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                  {/* Background Ring */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="80" fill="none" stroke="rgba(220,38,38,0.2)" strokeWidth="12" />
                    <circle 
                      cx="96" 
                      cy="96" 
                      r="80" 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth="12" 
                      strokeDasharray="502" 
                      strokeDashoffset="120"
                      strokeLinecap="round"
                      style={{ filter: 'drop-shadow(0px 0px 10px rgba(239, 68, 68, 0.6))' }}
                    />
                  </svg>
                  <div className="text-center">
                    <span className="text-4xl font-bold text-white block leading-none mb-1 shadow-red-500 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">76%</span>
                    <span className="text-[8px] tracking-[0.2em] text-red-500 uppercase">Efficiency</span>
                  </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-4 mt-auto">
                  <div className="border border-red-900/40 p-3 text-center bg-red-950/10">
                    <p className="text-[8px] text-red-700 tracking-[0.2em] uppercase mb-1">Uptime</p>
                    <p className="text-sm font-bold text-white">99.98%</p>
                  </div>
                  <div className="border border-red-900/40 p-3 text-center bg-red-950/10">
                    <p className="text-[8px] text-red-700 tracking-[0.2em] uppercase mb-1">Latency</p>
                    <p className="text-sm font-bold text-white">14ms</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Area */}
            <div className="border border-red-900/50 bg-black/60 rounded-xl overflow-hidden hover:border-red-500/50 transition-colors">
              <div className="p-6 border-b border-red-900/50 flex justify-between items-center bg-red-900/10">
                <div className="flex items-center gap-3">
                  <Server size={18} className="text-red-500" />
                  <h3 className="text-white tracking-widest text-sm uppercase font-bold">Active_Orders_Manifest</h3>
                </div>
                <span className="text-[8px] tracking-[0.2em] text-red-800 uppercase animate-pulse">Live_Feed: Connected</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-red-900/30 text-[9px] tracking-[0.2em] text-red-700 uppercase">
                      <th className="p-4 pl-6 font-normal">Manifest_ID</th>
                      <th className="p-4 font-normal">Destination</th>
                      <th className="p-4 font-normal">Priority_Level</th>
                      <th className="p-4 font-normal">Loadout</th>
                      <th className="p-4 font-normal">Operational_Status</th>
                      <th className="p-4 pr-6 font-normal text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px] tracking-wider text-white">
                    {[
                      { id: '#VX-9920', dest: 'NEO-TOKYO SECTOR 7', priority: 'CRITICAL', loadout: 'DATA_SHARD_CORE', status: '[OPERATIONAL]', statusColor: 'text-green-500' },
                      { id: '#VX-9921', dest: 'NEW YORK HUB', priority: 'STANDARD', loadout: 'NEURAL_LINK_V4', status: '[SHIPPING]', statusColor: 'text-red-500' },
                      { id: '#VX-9925', dest: 'BERLIN NODE', priority: 'STANDARD', loadout: 'QUANTUM_RELAY', status: '[PROCESSING]', statusColor: 'text-yellow-500' },
                      { id: '#VX-9928', dest: 'SEOUL UNDERGROUND', priority: 'HIGH', loadout: 'OPTIC_FIBER_GRID', status: '[SHIPPING]', statusColor: 'text-red-500' },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-red-900/20 hover:bg-red-900/10 transition-colors">
                        <td className="p-4 pl-6 text-red-600 font-bold">{row.id}</td>
                        <td className="p-4">{row.dest}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 border border-zinc-700 text-[8px] tracking-widest text-zinc-400 bg-black">{row.priority}</span>
                        </td>
                        <td className="p-4 font-mono">{row.loadout}</td>
                        <td className={`p-4 font-bold tracking-widest ${row.statusColor}`}>{row.status}</td>
                        <td className="p-4 pr-6 text-right">
                          <button className="text-red-600 hover:text-white hover:underline uppercase text-[9px] tracking-widest transition-colors">Bypass</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 text-[9px] tracking-[0.3em] text-red-800 flex justify-between items-center bg-black/40">
                <span>TOTAL_ENTRIES: 00241</span>
                <span>PAGE: 01 // 24</span>
              </div>
            </div>

            {/* Bottom Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'CPU_LOAD', value: '42%', width: '42%' },
                { label: 'MEM_ALLOC', value: '68%', width: '68%' },
                { label: 'NET_THROUGHPUT', value: '91%', width: '91%' }
              ].map((metric, i) => (
                <div key={i} className="border border-red-900/50 bg-black/60 rounded-xl p-5 hover:border-red-500/50 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] tracking-[0.2em] text-red-600 uppercase">{metric.label}</span>
                    <span className="text-xs font-bold text-red-500">{metric.value}</span>
                  </div>
                  {/* Custom Progress Bar */}
                  <div className="w-full h-1 bg-red-950/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]"
                      style={{ width: metric.width }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.5);
          border-left: 1px solid rgba(153, 27, 27, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(220, 38, 38, 0.5);
          border-radius: 0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(220, 38, 38, 0.8);
        }
      `}</style>
    </div>
  );
}
