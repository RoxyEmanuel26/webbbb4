const fs = require('fs');
const path = './graphify-out/graph.json';
const g = JSON.parse(fs.readFileSync(path, 'utf-8'));

const numNodes = g.nodes.length;
const numEdges = g.links.length;

// Count unique communities
const communities = new Set();
g.nodes.forEach(n => {
  if (n.community !== undefined && n.community !== null) {
    communities.add(n.community);
  }
});
const numCommunities = communities.size;

const enqueueAdNode = g.nodes.find(n => n.id === 'src_utils_adsterraqueue_enqueuead');
const communityValue = enqueueAdNode ? enqueueAdNode.community : 'N/A';

const incomingEdges = g.links.filter(l => l.target === enqueueAdNode.id).map(l => l.source);
const outgoingEdges = g.links.filter(l => l.source === enqueueAdNode.id).map(l => l.target);

console.log(`1. Jumlah Node: ${numNodes}`);
console.log(`2. Jumlah Edge: ${numEdges}`);
console.log(`3. Jumlah Community: ${numCommunities}`);
console.log(`4. Community tempat enqueueAd berada: ${communityValue}`);
console.log(`5. Node yang memiliki edge langsung ke enqueueAd: ${incomingEdges.join(', ')}`);
console.log(`6. Node yang dipanggil oleh enqueueAd: ${outgoingEdges.join(', ')}`);
