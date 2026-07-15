const fs = require('fs');
const path = './graphify-out/graph.json';

if (!fs.existsSync(path)) {
  console.log("graph.json not found");
  process.exit(1);
}

const g = JSON.parse(fs.readFileSync(path, 'utf-8'));
const targets = ['adbanner', 'adnative', 'adpopunder', 'adsocialbar', 'enqueuead', 'processqueue', 'public_adsterra_service'];

const nodes = g.nodes.filter(n => targets.some(t => n.id.toLowerCase().includes(t)));

nodes.forEach(n => {
  const inEdges = g.links.filter(l => l.target === n.id).length;
  const outEdges = g.links.filter(l => l.source === n.id).length;
  
  console.log(`Node ID: ${n.id}`);
  console.log(`- File Asal: ${n.file || 'N/A'}`);
  console.log(`- Symbol Asal: ${n.name || n.id || 'N/A'}`);
  console.log(`- Community ID: ${n.community || 'N/A'}`);
  console.log(`- Edge Masuk: ${inEdges}`);
  console.log(`- Edge Keluar: ${outEdges}`);
  console.log('---');
});

// Also explicitly check if any of the requested terms DO NOT exist in ANY node ID
const foundNodeIds = nodes.map(n => n.id.toLowerCase());
targets.forEach(t => {
  if (!foundNodeIds.some(id => id.includes(t))) {
    console.log(`[EXPLICIT] Node term '${t}' tidak ditemukan sama sekali di dalam graph.json.`);
  }
});
