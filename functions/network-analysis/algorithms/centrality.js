const CENTRALITY_TOP_PERCENTILE = 0.05;

/**
 * Checks if a given value lies within the top percentile threshold of a dataset.
 *
 * @param {number} value Value to evaluate
 * @param {Array<number>} allValues Reference dataset
 * @param {number} [percentile=0.05] Top fraction threshold (e.g. 0.05 for top 5%)
 * @returns {boolean} True if value is in top percentile
 */
function isTopPercentile(value, allValues = [], percentile = CENTRALITY_TOP_PERCENTILE) {
  if (typeof value !== "number" || isNaN(value)) return false;
  if (!Array.isArray(allValues) || allValues.length === 0) return false;

  const validNumbers = allValues.filter((v) => typeof v === "number" && !isNaN(v));
  if (validNumbers.length === 0) return false;

  const sorted = [...validNumbers].sort((a, b) => a - b);
  const cutoffIndex = Math.floor((1 - percentile) * sorted.length);
  const threshold = sorted[Math.min(cutoffIndex, sorted.length - 1)];

  return value >= threshold;
}

/**
 * Computes degree and betweenness centrality scores for a graph of suspects/persons.
 *
 * @param {Object} graphData Graph structure containing nodes/persons and edges/connections
 * @param {Array<Object>} [graphData.nodes=[]] List of nodes [{ id: "P-1" }] or persons [{ person_id: "P-1" }]
 * @param {Array<Object>} [graphData.edges=[]] List of edges [{ source: "P-1", target: "P-2" }]
 * @returns {Array<{ person_id: string, degree_centrality: number, betweenness_centrality: number }>}
 */
function computeCentrality(graphData = {}) {
  if (!graphData || typeof graphData !== "object") {
    return [];
  }

  const rawNodes = Array.isArray(graphData.nodes) ? graphData.nodes : Array.isArray(graphData.persons) ? graphData.persons : [];
  const rawEdges = Array.isArray(graphData.edges) ? graphData.edges : Array.isArray(graphData.links) ? graphData.links : [];

  // Extract distinct node IDs
  const nodeIds = new Set();
  for (const n of rawNodes) {
    const id = typeof n === "string" ? n : n.id || n.person_id;
    if (id) nodeIds.add(id);
  }

  // Add any nodes implied by edges
  const adjMap = new Map();
  const addEdge = (u, v) => {
    if (!u || !v || u === v) return;
    nodeIds.add(u);
    nodeIds.add(v);
    if (!adjMap.has(u)) adjMap.set(u, new Set());
    if (!adjMap.has(v)) adjMap.set(v, new Set());
    adjMap.get(u).add(v);
    adjMap.get(v).add(u);
  };

  for (const e of rawEdges) {
    if (!e) continue;
    const u = e.source || e.person1 || e.from;
    const v = e.target || e.person2 || e.to;
    addEdge(u, v);
  }

  const nodesList = Array.from(nodeIds);
  const N = nodesList.length;

  if (N === 0) {
    return [];
  }

  // Ensure all nodes are present in adjacency map
  for (const nodeId of nodesList) {
    if (!adjMap.has(nodeId)) {
      adjMap.set(nodeId, new Set());
    }
  }

  // 1. Degree Centrality (Normalized deg / (N - 1))
  const degreeCentralityMap = new Map();
  for (const u of nodesList) {
    const neighbors = adjMap.get(u);
    const deg = neighbors ? neighbors.size : 0;
    const normDeg = N > 1 ? deg / (N - 1) : 0;
    degreeCentralityMap.set(u, parseFloat(normDeg.toFixed(4)));
  }

  // 2. Betweenness Centrality (Brandes Algorithm for Unweighted Graphs)
  const CB = new Map();
  for (const u of nodesList) CB.set(u, 0);

  for (const s of nodesList) {
    const S = []; // Stack
    const P = new Map(); // Predecessors
    const sigma = new Map(); // Shortest path counts
    const d = new Map(); // Distances
    const delta = new Map(); // Dependency

    for (const w of nodesList) {
      P.set(w, []);
      sigma.set(w, 0);
      d.set(w, -1);
      delta.set(w, 0);
    }

    sigma.set(s, 1);
    d.set(s, 0);

    const Q = [s]; // Queue

    while (Q.length > 0) {
      const v = Q.shift();
      S.push(v);

      const neighbors = adjMap.get(v) || [];
      for (const w of neighbors) {
        // Path discovery
        if (d.get(w) < 0) {
          Q.push(w);
          d.set(w, d.get(v) + 1);
        }
        // Path counting
        if (d.get(w) === d.get(v) + 1) {
          sigma.set(w, sigma.get(w) + sigma.get(v));
          P.get(w).push(v);
        }
      }
    }

    // Accumulation
    while (S.length > 0) {
      const w = S.pop();
      for (const v of P.get(w)) {
        const coeff = (sigma.get(v) / sigma.get(w)) * (1 + delta.get(w));
        delta.set(v, delta.get(v) + coeff);
      }
      if (w !== s) {
        CB.set(w, CB.get(w) + delta.get(w));
      }
    }
  }

  // Normalize betweenness centrality by (N-1)(N-2)/2 for undirected graph
  const normFactor = N > 2 ? ((N - 1) * (N - 2)) / 2 : 1;
  const results = [];

  for (const person_id of nodesList) {
    const rawCB = CB.get(person_id) / 2; // Divided by 2 for undirected edges
    const normCB = N > 2 ? rawCB / normFactor : rawCB;

    results.push({
      person_id,
      degree_centrality: degreeCentralityMap.get(person_id) || 0,
      betweenness_centrality: parseFloat(Math.min(1.0, Math.max(0.0, normCB)).toFixed(4))
    });
  }

  // Sort by betweenness_centrality descending
  results.sort((a, b) => b.betweenness_centrality - a.betweenness_centrality);

  return results;
}

module.exports = {
  computeCentrality,
  isTopPercentile,
  CENTRALITY_TOP_PERCENTILE
};
