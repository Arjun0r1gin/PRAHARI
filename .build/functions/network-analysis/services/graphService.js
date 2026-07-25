const { computeCentrality, isTopPercentile, CENTRALITY_TOP_PERCENTILE } = require("../algorithms/centrality");

// TODO(integration): replace with real data-fusion/Data Store query
function fetchCoOccurrenceData(caseId) {
  const targetCase = caseId || "CASE-992";

  // Synthetic co-occurrence network dataset for local execution and testing
  return {
    case_id: targetCase,
    nodes: [
      { person_id: "P-1029", name: "Suspect A" },
      { person_id: "P-1030", name: "Suspect B" },
      { person_id: "P-1031", name: "Suspect C (Hub/Ringleader)" },
      { person_id: "P-1032", name: "Suspect D" },
      { person_id: "P-1033", name: "Suspect E" }
    ],
    edges: [
      { source: "P-1029", target: "P-1031", shared_incident_ids: ["INC-2026-0417", "INC-2026-0418"] },
      { source: "P-1030", target: "P-1031", shared_incident_ids: ["INC-2026-0417"] },
      { source: "P-1031", target: "P-1032", shared_incident_ids: ["INC-2026-0419"] },
      { source: "P-1031", target: "P-1033", shared_incident_ids: ["INC-2026-0420"] },
      { source: "P-1032", target: "P-1033", shared_incident_ids: ["INC-2026-0420"] }
    ]
  };
}

/**
 * Builds case suspect network graph, computes centrality metrics, and flags high-betweenness ringleaders.
 *
 * @param {string} caseId Unique case identifier
 * @returns {{ nodes: Array<{ person_id: string, degree_centrality: number, betweenness_centrality: number, flagged_ringleader: boolean }>, edges: Array<{ source: string, target: string, shared_incident_ids: string[] }> }}
 */
function getGraph(caseId) {
  const rawGraph = fetchCoOccurrenceData(caseId);

  if (!rawGraph || !Array.isArray(rawGraph.nodes)) {
    return { nodes: [], edges: [] };
  }

  // 1. Calculate degree & betweenness centrality
  const centralityResults = computeCentrality(rawGraph);

  // 2. Extract array of all betweenness scores for percentile thresholding
  const allBetweenness = centralityResults.map((c) => c.betweenness_centrality);

  // 3. Map nodes with flagged_ringleader attribute using imported CENTRALITY_TOP_PERCENTILE
  const nodes = centralityResults.map((item) => {
    const isRingleader = isTopPercentile(item.betweenness_centrality, allBetweenness, CENTRALITY_TOP_PERCENTILE);

    return {
      person_id: item.person_id,
      degree_centrality: item.degree_centrality,
      betweenness_centrality: item.betweenness_centrality,
      flagged_ringleader: isRingleader
    };
  });

  // 4. Format edges output
  const edges = Array.isArray(rawGraph.edges)
    ? rawGraph.edges.map((e) => ({
        source: e.source,
        target: e.target,
        shared_incident_ids: Array.isArray(e.shared_incident_ids) ? e.shared_incident_ids : []
      }))
    : [];

  return {
    nodes,
    edges
  };
}

module.exports = {
  getGraph,
  fetchCoOccurrenceData
};
