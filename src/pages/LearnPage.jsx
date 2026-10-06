import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Layers,
  Palette,
  Network,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Info,
  Sliders,
  HelpCircle,
  BookMarked,
  X,
  Compass,
  Sigma,
  Zap,
  GraduationCap,
  Eye,
  Maximize2,
} from 'lucide-react';
import { useGraph } from '../context/GraphContext';
import MiniGraphCanvas from '../components/canvas/MiniGraphCanvas';
import Modal from '../components/common/Modal';
import {
  generatePathGraph,
  generateCycleGraph,
  generateCompleteGraph,
  generateCompleteBipartiteGraph,
  generateTreeGraph,
  generatePlatonicGraph,
  generateRealWorldModel,
  generateWheelGraph,
} from '../algorithms/graphTemplates';
import { PLATONIC_SOLIDS, generateDualGraph } from '../algorithms/planarityAlgorithms';
import { analyzeWalkSequence, findCliques, checkHamiltonianCycle } from '../algorithms/graphAlgorithms';
import { checkVertexCriticality, COLOR_PALETTE } from '../algorithms/coloringAlgorithms';

// Comprehensive Academic Knowledge Repository for Deep Dive Modals
const LEARN_DETAILS = {
  '1.1_definition': {
    title: '1.1 Definition of a Graph & Set Theoretic Rigor',
    chapter: 'Chapter 1 — Introduction to Graphs',
    formula: 'G = (V, E) \\quad \\text{where } E \\subseteq \\{\\{u, v\\} : u, v \\in V, u \\neq v\\}',
    formalDef: 'A simple undirected graph G is an ordered pair (V, E) consisting of a non-empty finite set V = V(G) of elements called vertices (or nodes) and a set E = E(G) of 2-element subsets of V called edges (or lines).',
    theorems: [
      { name: 'Finite & Simple Constraint', text: 'In introductory discrete mathematics (Clark & Holton), graphs are simple: they contain no self-loops (edges joining a vertex to itself) and no multiple edges (parallel edges between the same pair of vertices).' },
      { name: 'Order & Size', text: 'The order of G is the number of vertices n = |V(G)|. The size of G is the number of edges m = |E(G)|.' }
    ],
    workedExample: 'Consider V = {A, B, C, D} and E = {{A,B}, {B,C}, {C,D}, {D,A}, {A,C}}. Here order n = 4, size m = 5. Vertex A is incident to 3 edges and adjacent to B, C, D.',
    actionTab: 'graph-lab',
    actionLabel: 'Open Graph Lab & Build Simple Graphs'
  },
  '1.2_models': {
    title: '1.2 Graphs as Mathematical Models',
    chapter: 'Chapter 1 — Introduction to Graphs',
    formula: '\\text{Real-World System } \\xrightarrow{\\text{Abstraction}} G = (V, E)',
    formalDef: 'Graph theory serves as the universal mathematical abstraction for relational structures where individual discrete entities are abstracted as vertices, and symmetric relationships or physical channels are represented as edges.',
    theorems: [
      { name: 'Topological Invariance', text: 'Geometric distances, physical curves, and spatial orientations are irrelevant in abstract graph theory. Only the incidence and adjacency relations define graph identity.' },
      { name: 'Network Duality', text: 'Social networks (People + Friendships), Campus layouts (Buildings + Pathways), Airline routes (Airports + Direct flights), and Circuit boards (Components + Conductive traces) all reduce to the exact same computational graph algorithms.' }
    ],
    workedExample: 'In an airline network with 6 hubs (JFK, LHR, CDG, HND, DXB, SIN), direct flight paths form edges. Determining the minimum flights between any two cities reduces to finding the shortest path in G.',
    actionTab: 'graph-lab',
    actionLabel: 'Explore Real-World Graph Models'
  },
  '1.3_terminology': {
    title: '1.3 Fundamental Graph Terminology & Benchmark Families',
    chapter: 'Chapter 1 — Introduction to Graphs',
    formula: 'K_n, \\quad C_n, \\quad P_n, \\quad K_{m,n}, \\quad W_n, \\quad Q_n',
    formalDef: 'Standard graph families form the structural vocabulary for Discrete Mathematical Structures (DMS).',
    theorems: [
      { name: 'Complete Graph Kn', text: 'A simple graph of order n where every distinct pair of vertices is connected by an edge. Total edges m = n(n-1)/2. Every vertex has degree n-1.' },
      { name: 'Complete Bipartite Km,n', text: 'Vertices are partitioned into two disjoint sets V1 (|V1|=m) and V2 (|V2|=n) such that every edge connects a vertex in V1 to a vertex in V2. Total edges = m × n.' },
      { name: 'Cycle Cn & Path Pn', text: 'Cn has n vertices and n edges arranged in a closed loop (2-regular). Pn has n vertices and n-1 edges arranged linearly.' }
    ],
    workedExample: 'K4 has 4 vertices and 4(3)/2 = 6 edges. K3,3 has 6 vertices and 3×3 = 9 edges. C5 has 5 vertices and 5 edges.',
    actionTab: 'graph-lab',
    actionLabel: 'Load Benchmark Graphs in Graph Lab'
  },
  '1.4_degrees': {
    title: '1.4 Vertex Degrees & The Handshaking Lemma',
    chapter: 'Chapter 1 — Introduction to Graphs',
    formula: '\\sum_{v \\in V} \\deg(v) = 2|E| = 2m',
    formalDef: 'The degree (or valency) of a vertex v in G, denoted deg(v) or d(v), is the number of edges incident with v. The maximum degree is Δ(G) and minimum degree is δ(G).',
    theorems: [
      { name: 'The Handshaking Lemma (Euler 1736)', text: 'In any graph G = (V, E), the sum of the degrees of all vertices is equal to twice the number of edges. Proof: Each edge contributes exactly 1 to the degree of each of its two endpoints.' },
      { name: 'Odd Degree Corollary', text: 'In every graph, the number of vertices with odd degree is always even. Proof: If sum of all degrees is 2m (even), the sum of odd degrees must also be even, which requires an even number of odd summands.' }
    ],
    workedExample: 'A graph with 5 vertices of degrees 3, 3, 2, 2, 2 has sum = 12. Therefore, number of edges |E| = 12 / 2 = 6. Exactly 2 vertices have odd degree (even count).',
    actionTab: 'graph-lab',
    actionLabel: 'Verify Handshaking Lemma in Lab'
  },
  '1.5_subgraphs': {
    title: '1.5 Subgraphs & Induced Subgraphs',
    chapter: 'Chapter 1 — Introduction to Graphs',
    formula: 'H \\subseteq G \\iff V(H) \\subseteq V(G) \\land E(H) \\subseteq E(G)',
    formalDef: 'A graph H is a subgraph of G (written H ⊆ G) if V(H) ⊆ V(G) and E(H) ⊆ E(G). If V(H) = V(G), H is called a spanning subgraph of G.',
    theorems: [
      { name: 'Induced Subgraph G[S]', text: 'For a subset S ⊆ V(G), the induced subgraph G[S] has vertex set S and contains ALL edges of G that have both endpoints in S.' },
      { name: 'Spanning Trees', text: 'A spanning tree T of a connected graph G is a subgraph that contains all vertices of G and is a tree (acyclic and connected, containing exactly |V| - 1 edges).' }
    ],
    workedExample: 'In complete graph K4 on {A, B, C, D}, removing vertex D along with its 3 incident edges results in the induced subgraph G[{A, B, C}], which is isomorphic to K3 (triangle).',
    actionTab: 'graph-lab',
    actionLabel: 'Test Subgraph Selection in Lab'
  },
  '1.6_walks_paths': {
    title: '1.6 Walks, Trails, Paths, and Cycles',
    chapter: 'Chapter 1 — Introduction to Graphs',
    formula: '\\text{Walk } \\supseteq \\text{ Trail } \\supseteq \\text{ Path } \\supseteq \\text{ Cycle}',
    formalDef: 'A walk is an alternating sequence of vertices and edges v0, e1, v1, e2, ..., ek, vk where edge ei joins v_{i-1} and vi. The length is the number of edges k.',
    theorems: [
      { name: 'Trail', text: 'A walk in which all edges are distinct (no edge is traversed more than once).' },
      { name: 'Path', text: 'A walk in which all vertices (and consequently all edges) are distinct.' },
      { name: 'Cycle', text: 'A closed walk (v0 = vk) of length k ≥ 3 in which all intermediate vertices v0, v1, ..., v_{k-1} are distinct.' },
      { name: 'Fundamental Path Theorem', text: 'Every u-v walk contains an elementary u-v path as a sub-walk.' }
    ],
    workedExample: 'Sequence A → B → C → B → D is a walk (edge {B,C} repeated, vertex B repeated). A → B → C → D is a path (length 3). A → B → C → D → A is a cycle (length 4).',
    actionTab: 'graph-lab',
    actionLabel: 'Trace Walks & Paths in Graph Lab'
  },
  '1.7_matrix': {
    title: '1.7 Matrix Representation of Graphs',
    chapter: 'Chapter 1 — Introduction to Graphs',
    formula: 'A = [a_{ij}], \\quad a_{ij} = \\begin{cases} 1 & \\text{if } \\{v_i, v_j\\} \\in E \\\\ 0 & \\text{otherwise} \\end{cases}',
    formalDef: 'The Adjacency Matrix A(G) of a graph with n vertices is an n × n binary symmetric matrix where entry a_ij = 1 if vertex vi is adjacent to vj, and 0 otherwise.',
    theorems: [
      { name: 'Symmetry & Zero Diagonal', text: 'For any simple undirected graph, A = A^T (symmetric) and a_ii = 0 (no self-loops). The row sum of row i equals deg(vi).' },
      { name: 'Walks via Matrix Powers', text: 'The (i, j)-th entry of the k-th power matrix A^k is equal to the number of distinct walks of length k connecting vertex vi to vertex vj.' }
    ],
    workedExample: 'For triangle K3 on vertices {1,2,3}, A has 0s on the diagonal and 1s everywhere else. A^2 gives 2 on diagonals (2 walks of length 2 returning to origin: 1-2-1 and 1-3-1) and 1 on off-diagonals.',
    actionTab: 'graph-lab',
    actionLabel: 'Inspect Dynamic Adjacency Matrix'
  },
  '5.1_plane': {
    title: '5.1 Plane vs Planar Graphs & Topological Embeddings',
    chapter: 'Chapter 5 — Planar Graphs',
    formula: 'G \\text{ is planar} \\iff \\exists \\text{ embedding } f: G \\hookrightarrow \\mathbb{R}^2 \\text{ with 0 crossings}',
    formalDef: 'A graph G is planar if it can be drawn in a single 2D plane such that no two edges intersect except at their common endpoints. A plane graph is a concrete drawing with no crossings.',
    theorems: [
      { name: 'Drawing Invariance', text: 'A graph can be drawn with crossings and still be planar! The crossings in a particular diagram do not prove non-planarity; a graph is non-planar only if NO crossing-free drawing exists.' },
      { name: 'Stereographic Projection', text: 'A graph can be embedded on the surface of a 2-sphere without crossings if and only if it is planar in the Euclidean plane R^2.' }
    ],
    workedExample: 'Complete graph K4 drawn with two intersecting diagonal chords has 1 crossing, but moving one diagonal outside the bounding triangle yields 0 crossings. Thus K4 is planar.',
    actionTab: 'planarity-lab',
    actionLabel: 'Untangle K4 in Planarity Lab'
  },
  '5.2_euler': {
    title: '5.2 Euler\'s Polyhedral Formula & Planarity Bounds',
    chapter: 'Chapter 5 — Planar Graphs',
    formula: 'V - E + F = 2 \\quad \\implies \\quad E \\le 3V - 6 \\quad (\\text{for } V \\ge 3)',
    formalDef: 'For any connected plane graph with V vertices, E edges, and F faces (counting the unbounded exterior region), the Euler characteristic always equals 2.',
    theorems: [
      { name: 'Euler\'s Formula (1752)', text: 'Let G be a connected plane graph with V vertices, E edges, and F faces. Then V - E + F = 2. Proof: By mathematical induction on the number of edges (base case: trees have E = V - 1, F = 1).' },
      { name: 'Linear Edge Bound', text: 'In any simple planar graph with V ≥ 3, every face has boundary degree ≥ 3, which implies 2E ≥ 3F. Substituting into Euler\'s formula yields E ≤ 3V - 6.' },
      { name: 'Bipartite Planar Bound', text: 'If G is triangle-free (e.g. bipartite with girth ≥ 4), every face has boundary degree ≥ 4, so 2E ≥ 4F = 4(2 + E - V) → E ≤ 2V - 4.' }
    ],
    workedExample: 'For a planar graph on 6 vertices, maximum possible edges = 3(6) - 6 = 12 edges. For K5: V=5, E=10. Maximum edges = 3(5)-6 = 9. Since 10 > 9, K5 CANNOT be planar!',
    actionTab: 'planarity-lab',
    actionLabel: 'Verify Euler Formula Calculator'
  },
  '5.3_platonic': {
    title: '5.3 The Five Platonic Solids & Regular Plane Graphs',
    chapter: 'Chapter 5 — Planar Graphs',
    formula: 'd \\cdot V = 2E = k \\cdot F, \\quad \\frac{1}{d} + \\frac{1}{k} > \\frac{1}{2}',
    formalDef: 'A Platonic solid is a regular convex 3D polyhedron whose faces are congruent regular polygons and where the same number of faces meet at each vertex. Their planar graph nets satisfy Euler\'s formula.',
    theorems: [
      { name: 'Classification Theorem', text: 'There are exactly 5 Platonic solids: Tetrahedron (V=4, E=6, F=4), Cube (V=8, E=12, F=6), Octahedron (V=6, E=12, F=8), Dodecahedron (V=20, E=30, F=12), and Icosahedron (V=12, E=30, F=20).' },
      { name: 'Dual Pairing', text: 'The Cube and Octahedron are planar duals of each other. The Dodecahedron and Icosahedron are planar duals. The Tetrahedron is self-dual (its dual is also a Tetrahedron).' }
    ],
    workedExample: 'Cube net: 8 - 12 + 6 = 2. Each vertex has degree 3, each face is a quadrilateral (length 4). 3V = 2E = 4F = 24.',
    actionTab: 'planarity-lab',
    actionLabel: 'Load Platonic Solids in Lab'
  },
  '5.4_kuratowski': {
    title: '5.4 Kuratowski\'s Theorem & Forbidden Minors',
    chapter: 'Chapter 5 — Planar Graphs',
    formula: 'G \\text{ is planar} \\iff G \\text{ contains no subdivision of } K_5 \\text{ or } K_{3,3}',
    formalDef: 'Kazimierz Kuratowski (1930) completely characterized planarity through topological forbidden subgraphs.',
    theorems: [
      { name: 'Kuratowski\'s Theorem (1930)', text: 'A finite graph G is planar if and only if it contains no subgraph that is homeomorphic to (a subdivision of) K5 (complete on 5 vertices) or K3,3 (complete bipartite utilities graph).' },
      { name: 'Wagner\'s Theorem (1937)', text: 'A finite graph is planar if and only if it does not contain K5 or K3,3 as a graph minor (obtained by edge contractions and deletions).' }
    ],
    workedExample: 'The Petersen graph has 10 vertices and 15 edges. Contracting the 5 spokes yields K5 as a minor. By Wagner\'s/Kuratowski\'s theorem, the Petersen graph is strictly non-planar.',
    actionTab: 'planarity-lab',
    actionLabel: 'Inspect Kuratowski Minors in Lab'
  },
  '5.5_hamiltonian': {
    title: '5.5 Non-Hamiltonian Plane Graphs & Grinberg\'s Condition',
    chapter: 'Chapter 5 — Planar Graphs',
    formula: '\\sum_{i=3}^n (i - 2)(f\'_i - f\'\'_i) = 0',
    formalDef: 'A Hamiltonian cycle in a graph G is a spanning closed path that visits every vertex in V(G) exactly once and returns to the start vertex. A graph containing such a cycle is Hamiltonian.',
    theorems: [
      { name: 'Grinberg\'s Theorem (1968)', text: 'Let G be a plane graph with a Hamiltonian cycle C. Let f\'_i and f\'\'_i be the number of i-sided faces inside and outside C respectively. Then sum over i of (i - 2)(f\'_i - f\'\'_i) = 0.' },
      { name: 'Non-Hamiltonian Polyhedral Graphs', text: 'Tait (1884) conjectured that all 3-connected cubic planar graphs are Hamiltonian. Tutte (1946) disproved this with a 46-vertex counterexample. The Herschel graph (11 vertices) is the smallest bipartite non-Hamiltonian polyhedral graph.' }
    ],
    workedExample: 'A wheel graph W5 with central hub and 4 outer rim vertices is Hamiltonian (cycle: center → v1 → v2 → v3 → v4 → center).',
    actionTab: 'graph-lab',
    actionLabel: 'Hunt Hamiltonian Cycles in Lab'
  },
  '5.6_dual': {
    title: '5.6 Dual Graphs of Plane Embeddings',
    chapter: 'Chapter 5 — Planar Graphs',
    formula: 'V(G^*) = F(G), \\quad E(G^*) = E(G), \\quad F(G^*) = V(G)',
    formalDef: 'Given a plane graph G, its dual graph G* is constructed by placing one dual vertex inside each face of G (including the exterior face), and connecting two dual vertices with an edge whenever their corresponding faces share a boundary edge in G.',
    theorems: [
      { name: 'Duality Invariants', text: 'For any connected plane graph G, (G*)* is isomorphic to G. The degree of a dual vertex v* in G* equals the number of boundary edges of the corresponding face f in G.' },
      { name: 'Bridge-to-Loop Transformation', text: 'A bridge edge (cut-edge) in G becomes a self-loop in G*. Multiple edges in G become cut-pairs in G*.' }
    ],
    workedExample: 'For the standard plane drawing of K4 with 4 triangular faces (3 inner + 1 outer), the dual graph G* has 4 vertices, each of degree 3, forming another K4. K4 is therefore self-dual.',
    actionTab: 'planarity-lab',
    actionLabel: 'Explore Dual Graph Generator'
  },
  '6.1_colouring': {
    title: '6.1 Vertex Colouring & The Chromatic Number χ(G)',
    chapter: 'Chapter 6 — Colouring',
    formula: '\\chi(G) = \\min \\{ k \\in \\mathbb{N} : G \\text{ is } k\\text{-colourable}\\}',
    formalDef: 'A proper vertex k-colouring of G is an assignment of k distinct colours c: V(G) → {1, 2, ..., k} such that c(u) ≠ c(v) for all edges {u, v} ∈ E(G). The chromatic number χ(G) is the minimum integer k for which a proper k-colouring exists.',
    theorems: [
      { name: 'Bipartite Characterization', text: 'A graph is 2-colourable (χ(G) ≤ 2) if and only if it is bipartite, which is equivalent to containing no odd cycles.' },
      { name: 'Complete & Cycle Chromatic Numbers', text: 'Complete graphs require χ(Kn) = n. Even cycles have χ(C2k) = 2. Odd cycles have χ(C2k+1) = 3.' }
    ],
    workedExample: 'Wheel graph W6 has a central hub connected to cycle C5. C5 requires 3 colors. The central hub is adjacent to all 5 vertices, so it needs a 4th color. χ(W6) = 4.',
    actionTab: 'coloring-lab',
    actionLabel: 'Open Coloring Lab & Palette'
  },
  '6.2_algorithms': {
    title: '6.2 Vertex Colouring Algorithms (Welsh-Powell & Greedy Bounds)',
    chapter: 'Chapter 6 — Colouring',
    formula: '\\chi(G) \\le \\Delta(G) + 1, \\quad \\chi(G) \\le \\Delta(G) \\quad (\\text{Brooks\' Theorem})',
    formalDef: 'The Greedy Colouring Algorithm iterates through vertices in a predefined order and assigns each vertex the smallest available color not present on any of its already colored neighbors.',
    theorems: [
      { name: 'Welsh-Powell Heuristic (1967)', text: 'Orders vertices by descending degree deg(v1) ≥ deg(v2) ≥ ... ≥ deg(vn). This ensures high-degree vertices are colored first with minimal color clashes.' },
      { name: 'Brooks\' Theorem (1941)', text: 'For any connected graph G that is neither a complete graph Kn nor an odd cycle C2k+1, χ(G) ≤ Δ(G).' }
    ],
    workedExample: 'For the Petersen graph, max degree Δ = 3. Since it is neither complete nor an odd cycle, Brooks\' theorem guarantees χ ≤ 3. Welsh-Powell properly colors Petersen in exactly 3 colors.',
    actionTab: 'coloring-lab',
    actionLabel: 'Run Step-by-Step Greedy Simulator'
  },
  '6.3_critical': {
    title: '6.3 Vertex-Critical Graphs',
    chapter: 'Chapter 6 — Colouring',
    formula: 'G \\text{ is } k\\text{-critical} \\iff \\chi(G) = k \\land \\forall v \\in V, \\chi(G - v) = k - 1',
    formalDef: 'A graph G is k-critical (or vertex-critical) if χ(G) = k and for every vertex v ∈ V(G), the vertex-deleted subgraph G - v has chromatic number χ(G - v) < k.',
    theorems: [
      { name: 'Minimum Degree of Critical Graphs', text: 'If G is k-critical, then every vertex has degree deg(v) ≥ k - 1 (i.e. δ(G) ≥ k - 1).' },
      { name: 'Odd Cycle & Complete Criticality', text: 'Every complete graph Kn is n-critical. Every odd cycle C2k+1 is 3-critical. Removing any single vertex from an odd cycle turns it into a path, which is 2-colorable.' }
    ],
    workedExample: 'In triangle K3 (3-critical, χ=3), removing vertex C leaves an edge A-B with χ=2. Since removing ANY vertex reduces χ from 3 to 2, K3 is 3-critical.',
    actionTab: 'coloring-lab',
    actionLabel: 'Test Critical Graphs in Lab'
  },
  '6.4_cliques': {
    title: '6.4 Cliques & The Clique Number Bound ω(G)',
    chapter: 'Chapter 6 — Colouring',
    formula: '\\omega(G) \\le \\chi(G) \\le \\Delta(G) + 1',
    formalDef: 'A clique in a graph G is a subset of vertices S ⊆ V(G) such that the induced subgraph G[S] is complete (every pair of vertices in S is adjacent). The clique number ω(G) is the size of the largest clique in G.',
    theorems: [
      { name: 'The Clique Lower Bound', text: 'Because all ω(G) vertices in a maximum clique are mutually adjacent, each must receive a distinct color in any proper coloring. Therefore: χ(G) ≥ ω(G).' },
      { name: 'Mycielski Construction', text: 'Mycielski (1955) proved that there exist graphs with arbitrarily large chromatic numbers χ(G) that contain NO triangles (clique number ω(G) = 2).' }
    ],
    workedExample: 'In complete graph K4, ω(G) = 4 and χ(G) = 4. In the Grötzsch graph (triangle-free), ω(G) = 2, but χ(G) = 4.',
    actionTab: 'coloring-lab',
    actionLabel: 'Detect Cliques with Bron-Kerbosch'
  },
  '6.5_edge_colouring': {
    title: '6.5 Edge Colouring & Vizing\'s Theorem',
    chapter: 'Chapter 6 — Colouring',
    formula: '\\Delta(G) \\le \\chi\'(G) \\le \\Delta(G) + 1',
    formalDef: 'A proper edge k-colouring assigns colors to edges such that incident edges (sharing a vertex) receive different colors. The chromatic index (edge chromatic number) is denoted χ\'(G).',
    theorems: [
      { name: 'Vizing\'s Theorem (1964)', text: 'For any simple graph G with maximum degree Δ(G), the chromatic index satisfies either χ\'(G) = Δ(G) (Class 1 graph) or χ\'(G) = Δ(G) + 1 (Class 2 graph).' },
      { name: 'Bipartite Edge Colouring (Kőnig 1916)', text: 'Every bipartite graph is Class 1: χ\'(G) = Δ(G).' }
    ],
    workedExample: 'Complete graph K4 has Δ = 3. Its 6 edges can be partitioned into 3 independent matchings of size 2. Thus χ\'(K4) = 3 = Δ (Class 1).',
    actionTab: 'coloring-lab',
    actionLabel: 'Try Edge Colouring in Lab'
  },
  '6.6_map_colouring': {
    title: '6.6 Map Colouring & The Four Colour Theorem',
    chapter: 'Chapter 6 — Colouring',
    formula: '\\text{Every planar graph is 4-colourable: } \\chi(G) \\le 4',
    formalDef: 'The Map Colouring Problem asks for the minimum number of colors to shade contiguous regions on a map so that countries sharing a common boundary line receive different colors.',
    theorems: [
      { name: 'The Four Colour Theorem (Appel & Haken 1976)', text: 'Every planar map can be colored using at most 4 colors such that no two adjacent regions share the same color. It was the first major mathematical theorem proved with the aid of a computer (checking 1,936 reducible configurations).' },
      { name: 'Map to Dual Graph Equivalence', text: 'Coloring regions of a planar map is mathematically identical to vertex-coloring its planar dual graph G*.' }
    ],
    workedExample: 'A map of South America with countries Brazil, Argentina, Bolivia, Paraguay, Uruguay, etc. can be properly colored in 4 colors without any border conflicts.',
    actionTab: 'coloring-lab',
    actionLabel: 'Color Interactive Map in Lab'
  }
};

export default function LearnPage() {
  const { setActiveTab, loadGraphTemplate } = useGraph();

  // Active Chapter Timeline Tab: 'ch1', 'ch5', 'ch6'
  const [activeChapter, setActiveChapter] = useState('ch1');
  const [activeModalKey, setActiveModalKey] = useState(null);

  // Chapter 1 Interactive States
  const [modelScenario, setModelScenario] = useState('social'); // 'social', 'campus', 'flights'
  const [selectedTerm, setSelectedTerm] = useState('adjacent');
  const [walkSequence, setWalkSequence] = useState(['v1', 'v2', 'v3']);
  const [activeMatrixCell, setActiveMatrixCell] = useState(null); // { r, c }
  const [selectedSubgraphNodes, setSelectedSubgraphNodes] = useState(new Set(['v1', 'v2', 'v3']));

  // Chapter 5 Interactive States
  const [selectedPlatonic, setSelectedPlatonic] = useState('cube');
  const [hamiltonianPath, setHamiltonianPath] = useState(['o1', 'o2', 'o3', 'o4', 'i4', 'i3', 'i2', 'i1', 'o1']);

  // Chapter 6 Interactive States
  const [criticalTestNode, setCriticalTestNode] = useState(null);
  const [mapRegionColors, setMapRegionColors] = useState({ r1: '#3b82f6', r2: '#10b981', r3: '#f59e0b', r4: '#a855f7', r5: '#ef4444' });
  const [activePaletteIndex, setActivePaletteIndex] = useState(0);

  // Active real-world model data
  const currentModelData = generateRealWorldModel(modelScenario, 260, 160);

  // Sample graph for Matrix & Walks (4 vertices: A, B, C, D)
  const sampleGraph4 = {
    nodes: [
      { id: 'v1', label: 'A', x: 50, y: 40, color: '#38bdf8' },
      { id: 'v2', label: 'B', x: 170, y: 40, color: '#a855f7' },
      { id: 'v3', label: 'C', x: 170, y: 130, color: '#10b981' },
      { id: 'v4', label: 'D', x: 50, y: 130, color: '#f59e0b' },
    ],
    edges: [
      { id: 'e1', source: 'v1', target: 'v2' },
      { id: 'e2', source: 'v2', target: 'v3' },
      { id: 'e3', source: 'v3', target: 'v4' },
      { id: 'e4', source: 'v4', target: 'v1' },
      { id: 'e5', source: 'v1', target: 'v3' },
    ],
  };

  const walkAnalysis = analyzeWalkSequence(walkSequence, sampleGraph4.nodes, sampleGraph4.edges);

  // Active Platonic Solid model
  const currentPlatonicModel = generatePlatonicGraph(selectedPlatonic, 260, 160);
  const currentPlatonicInfo = PLATONIC_SOLIDS.find(p => p.id === selectedPlatonic) || PLATONIC_SOLIDS[1];

  // Dual graph calculation for K4
  const k4Dual = generateDualGraph(
    [
      { id: 'v1', label: 'A', x: 130, y: 40 },
      { id: 'v2', label: 'B', x: 50, y: 140 },
      { id: 'v3', label: 'C', x: 210, y: 140 },
      { id: 'v4', label: 'D', x: 130, y: 95 },
    ],
    [
      { id: 'e1', source: 'v1', target: 'v2' },
      { id: 'e2', source: 'v2', target: 'v3' },
      { id: 'e3', source: 'v3', target: 'v1' },
      { id: 'e4', source: 'v1', target: 'v4' },
      { id: 'e5', source: 'v2', target: 'v4' },
      { id: 'e6', source: 'v3', target: 'v4' },
    ],
    240,
    160
  );

  // Chapter 6 Sample K5 for Cliques
  const k5Cliques = findCliques(
    [
      { id: '1', label: 'A', x: 50, y: 50 },
      { id: '2', label: 'B', x: 110, y: 30 },
      { id: '3', label: 'C', x: 170, y: 50 },
      { id: '4', label: 'D', x: 150, y: 120 },
      { id: '5', label: 'E', x: 70, y: 120 },
    ],
    [
      { id: 'e1', source: '1', target: '2' },
      { id: 'e2', source: '2', target: '3' },
      { id: 'e3', source: '3', target: '4' },
      { id: 'e4', source: '4', target: '5' },
      { id: 'e5', source: '5', target: '1' },
      { id: 'e6', source: '1', target: '3' },
      { id: 'e7', source: '1', target: '4' },
    ]
  );

  const activeModalData = activeModalKey ? LEARN_DETAILS[activeModalKey] : null;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300 font-sans">
      {/* Textbook Header */}
      <div className="space-y-2 border-b border-[#1b2348] pb-5">
        <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>A First Look at Graph Theory — Clark & Holton</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Selected Interactive Topics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
          Explore the academic foundations structured directly around Chapters 1, 5, and 6 of John Clark & Derek Allan Holton's curriculum. Hover or click <span className="text-purple-300 font-semibold underline decoration-purple-500/50">"Learn More / Deep Dive"</span> on any concept card or graph for rigorous DMS mathematical breakdowns, theorems, and worked proofs.
        </p>
      </div>

      {/* Chapter Navigation Timeline Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            id: 'ch1',
            number: '01',
            title: 'Introduction to Graphs',
            topics: 'Definitions • Models • Degrees • Subgraphs • Paths • Matrix',
          },
          {
            id: 'ch5',
            number: '05',
            title: 'Planar Graphs',
            topics: 'Plane vs Planar • Euler Formula • Platonic Bodies • Kuratowski • Duals',
          },
          {
            id: 'ch6',
            number: '06',
            title: 'Colouring',
            topics: 'Vertex Colouring • Greedy Heuristics • Critical Graphs • Cliques • Maps',
          },
        ].map(ch => {
          const isActive = activeChapter === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => setActiveChapter(ch.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                isActive
                  ? 'bg-[#121838] border-purple-500 shadow-xl shadow-purple-600/15 ring-1 ring-purple-400'
                  : 'bg-[#0e1329] border-[#1b2347] hover:border-[#273365]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                  Chapter {ch.number}
                </span>
                {isActive && <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />}
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">{ch.title}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{ch.topics}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* CHAPTER 1 CONTENT: AN INTRODUCTION TO GRAPHS */}
      {/* ========================================================================= */}
      {activeChapter === 'ch1' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#1b2348] pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono">Chapter 1.</span>
              <span>An Introduction to Graphs</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Clark & Holton, pp. 1–32</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1.1 Definition of a Graph */}
            <div className="group relative p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-purple-500/80 hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Section 1.1</span>
                  <button
                    onClick={() => setActiveModalKey('1.1_definition')}
                    className="text-[10px] font-mono text-purple-300 bg-purple-950/70 hover:bg-purple-800/80 border border-purple-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">Definition of a Graph</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A graph G consists of a non-empty finite set <strong className="text-purple-300">V</strong> of vertices and a set <strong className="text-cyan-300">E</strong> of edges, where each edge joins two vertices.
                </p>
              </div>

              <div
                onClick={() => setActiveModalKey('1.1_definition')}
                className="bg-[#090d20] p-3 rounded-xl border border-[#171f40] group-hover:border-purple-600/40 space-y-2 text-center cursor-pointer transition-colors relative"
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-purple-900/80 text-purple-200 text-[9px] px-1.5 py-0.5 rounded font-mono">
                  Click for Deep Dive ↗
                </div>
                <MiniGraphCanvas
                  nodes={[
                    { id: '1', label: 'u', x: 40, y: 35, color: '#38bdf8' },
                    { id: '2', label: 'v', x: 140, y: 35, color: '#a855f7' },
                    { id: '3', label: 'w', x: 90, y: 75, color: '#10b981' },
                  ]}
                  edges={[
                    { id: 'e1', source: '1', target: '2' },
                    { id: 'e2', source: '2', target: '3' },
                  ]}
                  width={180}
                  height={80}
                  className="mx-auto"
                />
                <span className="text-[11px] font-mono text-purple-300 block">
                  V = {'{u, v, w}'}, E = {'{(u,v), (v,w)}'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#161f42]">
                <button
                  onClick={() => setActiveModalKey('1.1_definition')}
                  className="text-xs text-purple-400 font-semibold flex items-center gap-1 hover:text-purple-300"
                >
                  <span>Deep Dive Notes</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setActiveTab('graph-lab')}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>Open Lab</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 1.2 Graphs as Models */}
            <div className="group relative p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-purple-500/80 hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Section 1.2</span>
                  <button
                    onClick={() => setActiveModalKey('1.2_models')}
                    className="text-[10px] font-mono text-purple-300 bg-purple-950/70 hover:bg-purple-800/80 border border-purple-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">Graphs as Models</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Switch between domains to see how the same mathematical graph models social connections, campus maps, or flight routes.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1 bg-[#090d20] p-1 rounded-xl border border-[#171f40] text-[11px]">
                  {['social', 'campus', 'flights'].map(sc => (
                    <button
                      key={sc}
                      onClick={() => setModelScenario(sc)}
                      className={`flex-1 py-1 rounded-lg capitalize font-medium transition-colors ${
                        modelScenario === sc ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sc}
                    </button>
                  ))}
                </div>

                <div
                  onClick={() => setActiveModalKey('1.2_models')}
                  className="bg-[#090d20] p-2 rounded-xl border border-[#171f40] group-hover:border-purple-600/40 cursor-pointer transition-colors relative"
                >
                  <MiniGraphCanvas
                    nodes={currentModelData.nodes}
                    edges={currentModelData.edges}
                    width={200}
                    height={85}
                    className="mx-auto"
                  />
                  <p className="text-[10px] text-slate-400 text-center mt-1 truncate">
                    {currentModelData.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#161f42]">
                <button
                  onClick={() => setActiveModalKey('1.2_models')}
                  className="text-xs text-purple-400 font-semibold flex items-center gap-1 hover:text-purple-300"
                >
                  <span>Domain Abstractions</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <span className="text-[11px] text-emerald-400 font-mono">
                  V: Entities • E: Rel
                </span>
              </div>
            </div>

            {/* 1.3 Basic Graph Terminology */}
            <div className="group relative p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-purple-500/80 hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Section 1.3</span>
                  <button
                    onClick={() => setActiveModalKey('1.3_terminology')}
                    className="text-[10px] font-mono text-purple-300 bg-purple-950/70 hover:bg-purple-800/80 border border-purple-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">Basic Terminology</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click a term to highlight its structural definition:
                </p>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
                  {['adjacent', 'degree', 'cycle', 'subgraph', 'connected', 'complete'].map(term => (
                    <button
                      key={term}
                      onClick={() => setSelectedTerm(term)}
                      className={`py-1 px-1.5 rounded-lg capitalize truncate ${
                        selectedTerm === term ? 'bg-purple-600 text-white font-bold' : 'bg-[#090d20] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {term}
                    </button>
                  ))}
                </div>

                <div className="bg-[#090d20] p-2.5 rounded-xl border border-[#171f40] text-[11px] text-slate-300">
                  {selectedTerm === 'adjacent' && 'Adjacent: Two vertices connected directly by an edge.'}
                  {selectedTerm === 'degree' && 'Degree: Number of edges incident to a vertex (deg(v)).'}
                  {selectedTerm === 'cycle' && 'Cycle: Closed path where only start and end vertices repeat.'}
                  {selectedTerm === 'subgraph' && 'Subgraph: Graph formed by subsets of vertices and edges.'}
                  {selectedTerm === 'connected' && 'Connected: A path exists between every pair of vertices.'}
                  {selectedTerm === 'complete' && 'Complete (Kn): Every pair of distinct vertices is adjacent.'}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#161f42]">
                <button
                  onClick={() => setActiveModalKey('1.3_terminology')}
                  className="text-xs text-purple-400 font-semibold flex items-center gap-1 hover:text-purple-300"
                >
                  <span>Full DMS Glossary</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <span className="text-[11px] text-purple-400 font-mono">Kn, Cn, Pn, Km,n</span>
              </div>
            </div>

            {/* 1.4 Vertex Degrees Explorer */}
            <div className="group relative p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-purple-500/80 hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Section 1.4</span>
                  <button
                    onClick={() => setActiveModalKey('1.4_degrees')}
                    className="text-[10px] font-mono text-purple-300 bg-purple-950/70 hover:bg-purple-800/80 border border-purple-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">Vertex Degrees & Handshaking</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The degree of a vertex is the number of incident edges. By the Handshaking Lemma, ∑ deg(v) = 2|E|.
                </p>
              </div>

              <div
                onClick={() => setActiveModalKey('1.4_degrees')}
                className="bg-[#090d20] p-3 rounded-xl border border-[#171f40] group-hover:border-purple-600/40 space-y-2 text-xs font-mono text-slate-300 cursor-pointer transition-colors"
              >
                <div className="flex justify-between">
                  <span>deg(A) = 3</span>
                  <span>deg(B) = 2</span>
                  <span>deg(C) = 3</span>
                  <span>deg(D) = 2</span>
                </div>
                <div className="p-2 rounded bg-[#0e1329] border border-[#182046] text-center text-emerald-400 font-bold">
                  Sum = 10 = 2 × (5 Edges)
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#161f42]">
                <button
                  onClick={() => setActiveModalKey('1.4_degrees')}
                  className="text-xs text-purple-400 font-semibold flex items-center gap-1 hover:text-purple-300"
                >
                  <span>Euler Proof & Corollaries</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setActiveTab('graph-lab')}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>Test in Lab</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 1.5 Subgraphs Explorer */}
            <div className="group relative p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-purple-500/80 hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Section 1.5</span>
                  <button
                    onClick={() => setActiveModalKey('1.5_subgraphs')}
                    className="text-[10px] font-mono text-purple-300 bg-purple-950/70 hover:bg-purple-800/80 border border-purple-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">Subgraphs & Spanning Trees</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A subgraph H = (V', E') satisfies V' ⊆ V and E' ⊆ E, where all edge endpoints belong to V'.
                </p>
              </div>

              <div
                onClick={() => setActiveModalKey('1.5_subgraphs')}
                className="bg-[#090d20] p-3 rounded-xl border border-[#171f40] group-hover:border-purple-600/40 space-y-2 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Selected: {'{A, B, C}'}</span>
                  <span className="text-emerald-400 font-bold font-mono">Induced Subgraph G[S]</span>
                </div>
                <MiniGraphCanvas
                  nodes={[
                    { id: '1', label: 'A', x: 50, y: 35, color: '#38bdf8' },
                    { id: '2', label: 'B', x: 130, y: 35, color: '#38bdf8' },
                    { id: '3', label: 'C', x: 90, y: 75, color: '#38bdf8' },
                    { id: '4', label: 'D', x: 170, y: 75, color: '#334155' },
                  ]}
                  edges={[
                    { id: 'e1', source: '1', target: '2' },
                    { id: 'e2', source: '2', target: '3' },
                    { id: 'e3', source: '1', target: '3' },
                  ]}
                  highlightedNodes={['1', '2', '3']}
                  width={180}
                  height={80}
                  className="mx-auto"
                />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#161f42]">
                <button
                  onClick={() => setActiveModalKey('1.5_subgraphs')}
                  className="text-xs text-purple-400 font-semibold flex items-center gap-1 hover:text-purple-300"
                >
                  <span>Spanning Subgraph Notes</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <span className="text-[11px] text-purple-400 font-mono">H ⊆ G</span>
              </div>
            </div>

            {/* 1.6 Paths and Cycles Walk Explorer */}
            <div className="group relative p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-purple-500/80 hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Section 1.6</span>
                  <button
                    onClick={() => setActiveModalKey('1.6_walks_paths')}
                    className="text-[10px] font-mono text-purple-300 bg-purple-950/70 hover:bg-purple-800/80 border border-purple-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">Walks, Trails, Paths & Cycles</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sequentially walk through vertices to test walk vs trail vs path vs cycle hierarchies.
                </p>
              </div>

              <div
                onClick={() => setActiveModalKey('1.6_walks_paths')}
                className="bg-[#090d20] p-3 rounded-xl border border-[#171f40] group-hover:border-purple-600/40 space-y-2 text-xs cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-purple-300 font-bold">
                    Walk: A → B → C → D
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                    Simple Path
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  No repeated vertices or edges → forms an elementary simple path of length 3.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#161f42]">
                <button
                  onClick={() => setActiveModalKey('1.6_walks_paths')}
                  className="text-xs text-purple-400 font-semibold flex items-center gap-1 hover:text-purple-300"
                >
                  <span>Walk Hierarchy Theorem</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <span className="text-[11px] text-cyan-400 font-mono">
                  Path ⊆ Trail ⊆ Walk
                </span>
              </div>
            </div>

            {/* 1.7 Matrix Representation */}
            <div className="group relative p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-purple-500/80 hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300 flex flex-col justify-between space-y-4 lg:col-span-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Section 1.7</span>
                    <button
                      onClick={() => setActiveModalKey('1.7_matrix')}
                      className="text-[10px] font-mono text-purple-300 bg-purple-950/70 hover:bg-purple-800/80 border border-purple-700/60 px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                    >
                      <span>Deep Dive & Matrix Powers</span>
                      <Maximize2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">Matrix Representation of Graphs</h3>
                  <p className="text-xs text-slate-400">
                    The Adjacency Matrix A = [a_ij] has entry 1 if vertices v_i and v_j are adjacent, and 0 otherwise. Click any cell to inspect the corresponding connection.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-[#090d20] p-4 rounded-xl border border-[#171f40] group-hover:border-purple-600/40 transition-colors">
                {/* Matrix Table */}
                <div className="overflow-x-auto">
                  <table className="font-mono text-xs mx-auto border-collapse">
                    <thead>
                      <tr>
                        <th className="p-1 text-slate-500"></th>
                        {['A', 'B', 'C', 'D'].map(l => (
                          <th key={l} className="p-2 text-purple-400 font-bold">{l}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['A', [0, 1, 1, 1]],
                        ['B', [1, 0, 1, 0]],
                        ['C', [1, 1, 0, 1]],
                        ['D', [1, 0, 1, 0]],
                      ].map(([rowLbl, rowVals], rIdx) => (
                        <tr key={rIdx}>
                          <td className="p-2 font-bold text-purple-400">{rowLbl}</td>
                          {rowVals.map((val, cIdx) => (
                            <td
                              key={cIdx}
                              onClick={() => setActiveMatrixCell({ r: rIdx, c: cIdx })}
                              className={`p-2 text-center cursor-pointer rounded transition-all ${
                                val === 1
                                  ? 'bg-purple-950/80 text-purple-300 font-bold border border-purple-800 hover:bg-purple-800'
                                  : 'text-slate-600 hover:bg-slate-900'
                              } ${activeMatrixCell?.r === rIdx && activeMatrixCell?.c === cIdx ? 'ring-2 ring-white scale-110' : ''}`}
                            >
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Graph Mini Canvas */}
                <div
                  onClick={() => setActiveModalKey('1.7_matrix')}
                  className="flex flex-col items-center justify-center space-y-2 cursor-pointer"
                >
                  <MiniGraphCanvas
                    nodes={sampleGraph4.nodes}
                    edges={sampleGraph4.edges}
                    width={220}
                    height={120}
                  />
                  <span className="text-[11px] text-slate-400 hover:text-purple-300 flex items-center gap-1">
                    <span>Symmetric Matrix A = Aᵀ (Click to view Aᵏ walk powers)</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHAPTER 5 CONTENT: PLANAR GRAPHS */}
      {/* ========================================================================= */}
      {activeChapter === 'ch5' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#1b2348] pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">Chapter 5.</span>
              <span>Planar Graphs</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Clark & Holton, pp. 129–160</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 5.1 Plane vs Planar */}
            <div className="group relative p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-emerald-500/80 hover:shadow-2xl hover:shadow-emerald-900/20 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Section 5.1</span>
                  <button
                    onClick={() => setActiveModalKey('5.1_plane')}
                    className="text-[10px] font-mono text-emerald-300 bg-emerald-950/70 hover:bg-emerald-800/80 border border-emerald-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">Plane vs Planar Graphs</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A <strong>planar graph</strong> can be drawn without crossings. A <strong>plane graph</strong> is a concrete embedding with 0 crossings.
                </p>
              </div>

              <div
                onClick={() => setActiveModalKey('5.1_plane')}
                className="bg-[#090d20] p-3 rounded-xl border border-[#171f40] group-hover:border-emerald-600/40 space-y-2 text-center text-xs cursor-pointer transition-colors"
              >
                <div className="flex justify-around items-center">
                  <div>
                    <span className="text-amber-400 block font-bold mb-1">Planar Crossed</span>
                    <MiniGraphCanvas nodes={generateCompleteGraph(4, 90, 70, true).nodes} edges={generateCompleteGraph(4, 90, 70, true).edges} width={85} height={60} />
                  </div>
                  <div>
                    <span className="text-emerald-400 block font-bold mb-1">Plane (Untangled)</span>
                    <MiniGraphCanvas nodes={generateCompleteGraph(4, 90, 70, false).nodes} edges={generateCompleteGraph(4, 90, 70, false).edges} width={85} height={60} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#161f42]">
                <button
                  onClick={() => setActiveModalKey('5.1_plane')}
                  className="text-xs text-emerald-400 font-semibold flex items-center gap-1 hover:text-emerald-300"
                >
                  <span>Topological Proofs</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setActiveTab('planarity-lab')}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>Untangle in Lab</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 5.2 Euler's Formula */}
            <div className="group relative p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-emerald-500/80 hover:shadow-2xl hover:shadow-emerald-900/20 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Section 5.2</span>
                  <button
                    onClick={() => setActiveModalKey('5.2_euler')}
                    className="text-[10px] font-mono text-emerald-300 bg-emerald-950/70 hover:bg-emerald-800/80 border border-emerald-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">Euler's Formula: V - E + F = 2</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  For any connected plane graph, the number of vertices V, edges E, and faces F satisfies Euler's formula.
                </p>
              </div>

              <div
                onClick={() => setActiveModalKey('5.2_euler')}
                className="bg-[#090d20] p-3 rounded-xl border border-[#171f40] group-hover:border-emerald-600/40 space-y-1.5 font-mono text-xs text-slate-300 cursor-pointer transition-colors"
              >
                <div className="flex justify-between">
                  <span>Vertices (V):</span>
                  <span className="text-sky-400 font-bold">4</span>
                </div>
                <div className="flex justify-between">
                  <span>Edges (E):</span>
                  <span className="text-purple-400 font-bold">6</span>
                </div>
                <div className="flex justify-between">
                  <span>Faces (F):</span>
                  <span className="text-emerald-400 font-bold">4 (3 internal + 1 outer)</span>
                </div>
                <div className="p-1.5 bg-[#0e1329] rounded text-center text-amber-300 font-bold border border-[#1d2752] mt-1">
                  4 - 6 + 4 = 2 ✓
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#161f42]">
                <button
                  onClick={() => setActiveModalKey('5.2_euler')}
                  className="text-xs text-emerald-400 font-semibold flex items-center gap-1 hover:text-emerald-300"
                >
                  <span>Planarity Inequality Proofs</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setActiveTab('planarity-lab')}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>Planarity Lab</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 5.3 Platonic Bodies Gallery */}
            <div className="group relative p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-emerald-500/80 hover:shadow-2xl hover:shadow-emerald-900/20 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Section 5.3</span>
                  <button
                    onClick={() => setActiveModalKey('5.3_platonic')}
                    className="text-[10px] font-mono text-emerald-300 bg-emerald-950/70 hover:bg-emerald-800/80 border border-emerald-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">Platonic Bodies</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The 5 regular polyhedra whose planar graphs satisfy Euler's formula:
                </p>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
                  {['tetrahedron', 'cube', 'octahedron'].map(sol => (
                    <button
                      key={sol}
                      onClick={() => setSelectedPlatonic(sol)}
                      className={`py-1 rounded capitalize truncate ${
                        selectedPlatonic === sol ? 'bg-purple-600 text-white font-bold' : 'bg-[#090d20] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sol}
                    </button>
                  ))}
                </div>

                <div
                  onClick={() => setActiveModalKey('5.3_platonic')}
                  className="bg-[#090d20] p-2.5 rounded-xl border border-[#171f40] group-hover:border-emerald-600/40 text-center space-y-1 cursor-pointer transition-colors"
                >
                  <span className="text-[11px] font-bold text-white block">{currentPlatonicInfo.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400 block">{currentPlatonicInfo.formulaCheck}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#161f42]">
                <button
                  onClick={() => setActiveModalKey('5.3_platonic')}
                  className="text-xs text-emerald-400 font-semibold flex items-center gap-1 hover:text-emerald-300"
                >
                  <span>Dual Pairings & Proof</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    loadGraphTemplate('complete', { n: 4 });
                    setActiveTab('graph-lab');
                  }}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>Load in Lab</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 5.4 Kuratowski's Theorem */}
            <div className="group relative p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-emerald-500/80 hover:shadow-2xl hover:shadow-emerald-900/20 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Section 5.4</span>
                  <button
                    onClick={() => setActiveModalKey('5.4_kuratowski')}
                    className="text-[10px] font-mono text-emerald-300 bg-emerald-950/70 hover:bg-emerald-800/80 border border-emerald-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">Kuratowski's Theorem</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A finite graph is planar if and only if it contains no subdivision of <strong className="text-rose-400">K5</strong> or <strong className="text-rose-400">K3,3</strong>.
                </p>
              </div>

              <div
                onClick={() => setActiveModalKey('5.4_kuratowski')}
                className="bg-[#090d20] p-3 rounded-xl border border-[#171f40] group-hover:border-emerald-600/40 flex justify-around items-center text-xs cursor-pointer transition-colors"
              >
                <div className="text-center">
                  <span className="text-rose-400 font-bold block mb-1">K5 Non-Planar</span>
                  <MiniGraphCanvas nodes={generateCompleteGraph(5, 80, 60).nodes} edges={generateCompleteGraph(5, 80, 60).edges} width={80} height={55} />
                </div>
                <div className="text-center">
                  <span className="text-rose-400 font-bold block mb-1">K3,3 Non-Planar</span>
                  <MiniGraphCanvas nodes={generateCompleteBipartiteGraph(3, 3, 80, 60).nodes} edges={generateCompleteBipartiteGraph(3, 3, 80, 60).edges} width={80} height={55} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#161f42]">
                <button
                  onClick={() => setActiveModalKey('5.4_kuratowski')}
                  className="text-xs text-emerald-400 font-semibold flex items-center gap-1 hover:text-emerald-300"
                >
                  <span>Wagner Minor Invariants</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <span className="text-[11px] text-rose-400 font-mono">K5 & K3,3 Minors</span>
              </div>
            </div>

            {/* 5.5 Non-Hamiltonian Plane Graphs */}
            <div className="group relative p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-emerald-500/80 hover:shadow-2xl hover:shadow-emerald-900/20 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Section 5.5</span>
                  <button
                    onClick={() => setActiveModalKey('5.5_hamiltonian')}
                    className="text-[10px] font-mono text-emerald-300 bg-emerald-950/70 hover:bg-emerald-800/80 border border-emerald-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">Non-Hamiltonian Plane Graphs</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Not all planar graphs contain a Hamiltonian cycle. Grinberg's formula gives face condition constraints.
                </p>
              </div>

              <div
                onClick={() => setActiveModalKey('5.5_hamiltonian')}
                className="bg-[#090d20] p-3 rounded-xl border border-[#171f40] group-hover:border-emerald-600/40 space-y-2 text-xs cursor-pointer transition-colors"
              >
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]">
                  Grinberg condition: ∑ (f_i - 2)(c'_i - c''_i) = 0
                </div>
                <p className="text-[10px] text-slate-400">
                  Herschel graph is the smallest non-Hamiltonian polyhedral graph (11 vertices, 18 edges).
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#161f42]">
                <button
                  onClick={() => setActiveModalKey('5.5_hamiltonian')}
                  className="text-xs text-emerald-400 font-semibold flex items-center gap-1 hover:text-emerald-300"
                >
                  <span>Grinberg's Theorem Proof</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <span className="text-[11px] text-purple-400 font-mono">Tutte & Herschel</span>
              </div>
            </div>

            {/* 5.6 Dual Graph Explorer */}
            <div className="group relative p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-emerald-500/80 hover:shadow-2xl hover:shadow-emerald-900/20 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Section 5.6</span>
                  <button
                    onClick={() => setActiveModalKey('5.6_dual')}
                    className="text-[10px] font-mono text-emerald-300 bg-emerald-950/70 hover:bg-emerald-800/80 border border-emerald-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">Dual of a Plane Graph</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In dual graph G*, every face of G becomes a dual vertex, and shared boundary edges become dual edges.
                </p>
              </div>

              <div
                onClick={() => setActiveModalKey('5.6_dual')}
                className="bg-[#090d20] p-3 rounded-xl border border-[#171f40] group-hover:border-emerald-600/40 space-y-2 text-center text-xs cursor-pointer transition-colors"
              >
                <MiniGraphCanvas
                  nodes={k4Dual.dualNodes}
                  edges={k4Dual.dualEdges}
                  width={200}
                  height={80}
                  className="mx-auto"
                />
                <span className="text-[10px] text-purple-300 font-mono block">
                  Dual G* has 4 Vertices & 6 Edges (Tetrahedron is self-dual)
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#161f42]">
                <button
                  onClick={() => setActiveModalKey('5.6_dual')}
                  className="text-xs text-emerald-400 font-semibold flex items-center gap-1 hover:text-emerald-300"
                >
                  <span>Duality Proofs & Bridges</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setActiveTab('planarity-lab')}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>Dual Generator</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHAPTER 6 CONTENT: COLOURING */}
      {/* ========================================================================= */}
      {activeChapter === 'ch6' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#1b2348] pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-pink-400 font-mono">Chapter 6.</span>
              <span>Colouring</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Clark & Holton, pp. 161–196</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 6.1 Vertex Colouring */}
            <div className="group relative p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-pink-500/80 hover:shadow-2xl hover:shadow-pink-900/20 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-pink-400 font-bold uppercase">Section 6.1</span>
                  <button
                    onClick={() => setActiveModalKey('6.1_colouring')}
                    className="text-[10px] font-mono text-pink-300 bg-pink-950/70 hover:bg-pink-800/80 border border-pink-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-pink-300 transition-colors">Vertex Colouring & χ(G)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A proper vertex coloring assigns colors such that adjacent vertices have different colors. The minimum colors needed is χ(G).
                </p>
              </div>

              <div
                onClick={() => setActiveModalKey('6.1_colouring')}
                className="bg-[#090d20] p-3 rounded-xl border border-[#171f40] group-hover:border-pink-600/40 space-y-1 font-mono text-xs text-slate-300 cursor-pointer transition-colors"
              >
                <div className="flex justify-between py-0.5">
                  <span>Tree / Bipartite:</span>
                  <span className="text-emerald-400 font-bold">χ = 2</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>Odd Cycle (C2k+1):</span>
                  <span className="text-sky-400 font-bold">χ = 3</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>Complete (Kn):</span>
                  <span className="text-amber-400 font-bold">χ = n</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#161f42]">
                <button
                  onClick={() => setActiveModalKey('6.1_colouring')}
                  className="text-xs text-pink-400 font-semibold flex items-center gap-1 hover:text-pink-300"
                >
                  <span>Chromatic Invariants</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setActiveTab('coloring-lab')}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>Coloring Lab</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 6.2 Greedy Colouring Algorithm */}
            <div className="group relative p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-pink-500/80 hover:shadow-2xl hover:shadow-pink-900/20 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-pink-400 font-bold uppercase">Section 6.2</span>
                  <button
                    onClick={() => setActiveModalKey('6.2_algorithms')}
                    className="text-[10px] font-mono text-pink-300 bg-pink-950/70 hover:bg-pink-800/80 border border-pink-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-pink-300 transition-colors">Vertex Colouring Algorithms</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The greedy algorithm considers vertices sequentially and assigns the smallest available color (e.g. Welsh-Powell ordering).
                </p>
              </div>

              <div
                onClick={() => setActiveModalKey('6.2_algorithms')}
                className="bg-[#090d20] p-3 rounded-xl border border-[#171f40] group-hover:border-pink-600/40 space-y-1.5 text-xs text-slate-300 cursor-pointer transition-colors"
              >
                <div className="p-1.5 rounded bg-purple-950/60 text-purple-300 font-mono text-[11px] border border-purple-800">
                  Upper bound: χ(G) ≤ Δ(G) + 1
                </div>
                <p className="text-[10px] text-slate-400">
                  Brooks' Theorem: χ(G) ≤ Δ(G) for graphs that are neither complete nor odd cycles.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#161f42]">
                <button
                  onClick={() => setActiveModalKey('6.2_algorithms')}
                  className="text-xs text-pink-400 font-semibold flex items-center gap-1 hover:text-pink-300"
                >
                  <span>Welsh-Powell Proof</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setActiveTab('coloring-lab')}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>Greedy Simulator</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 6.3 Critical Graphs */}
            <div className="group relative p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-pink-500/80 hover:shadow-2xl hover:shadow-pink-900/20 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-pink-400 font-bold uppercase">Section 6.3</span>
                  <button
                    onClick={() => setActiveModalKey('6.3_critical')}
                    className="text-[10px] font-mono text-pink-300 bg-pink-950/70 hover:bg-pink-800/80 border border-pink-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-pink-300 transition-colors">Critical Graphs</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A graph G is k-critical if χ(G) = k and every proper subgraph has chromatic number &lt; k.
                </p>
              </div>

              <div
                onClick={() => setActiveModalKey('6.3_critical')}
                className="bg-[#090d20] p-3 rounded-xl border border-[#171f40] group-hover:border-pink-600/40 space-y-2 text-xs cursor-pointer transition-colors"
              >
                <div className="p-2 rounded bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-[11px] font-mono">
                  Odd cycles C2k+1 are 3-critical (removing any node yields a 2-colorable path).
                </div>
                <p className="text-[10px] text-slate-400">
                  Every k-chromatic graph contains a k-critical subgraph.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#161f42]">
                <button
                  onClick={() => setActiveModalKey('6.3_critical')}
                  className="text-xs text-pink-400 font-semibold flex items-center gap-1 hover:text-pink-300"
                >
                  <span>Min Degree Invariants</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <span className="text-[11px] text-purple-400 font-mono">δ(G) ≥ k - 1</span>
              </div>
            </div>

            {/* 6.4 Cliques */}
            <div className="group relative p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-pink-500/80 hover:shadow-2xl hover:shadow-pink-900/20 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-pink-400 font-bold uppercase">Section 6.4</span>
                  <button
                    onClick={() => setActiveModalKey('6.4_cliques')}
                    className="text-[10px] font-mono text-pink-300 bg-pink-950/70 hover:bg-pink-800/80 border border-pink-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-pink-300 transition-colors">Cliques & Clique Number ω(G)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A clique is a completely interconnected subgraph. The clique number ω(G) gives a lower bound: χ(G) ≥ ω(G).
                </p>
              </div>

              <div
                onClick={() => setActiveModalKey('6.4_cliques')}
                className="bg-[#090d20] p-3 rounded-xl border border-[#171f40] group-hover:border-pink-600/40 space-y-1.5 text-xs text-slate-300 font-mono cursor-pointer transition-colors"
              >
                <div className="flex justify-between">
                  <span>Max Clique Size ω(G):</span>
                  <span className="text-purple-400 font-bold">{k5Cliques.maxCliqueSize}</span>
                </div>
                <div className="p-1.5 rounded bg-[#0e1329] border border-[#1d2752] text-center text-amber-300 text-[11px]">
                  χ(G) ≥ ω(G) = {k5Cliques.maxCliqueSize}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#161f42]">
                <button
                  onClick={() => setActiveModalKey('6.4_cliques')}
                  className="text-xs text-pink-400 font-semibold flex items-center gap-1 hover:text-pink-300"
                >
                  <span>Bron-Kerbosch & Bounds</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <span className="text-[11px] text-purple-400 font-mono">ω(G) ≤ χ(G)</span>
              </div>
            </div>

            {/* 6.5 Edge Colouring */}
            <div className="group relative p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-pink-500/80 hover:shadow-2xl hover:shadow-pink-900/20 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-pink-400 font-bold uppercase">Section 6.5</span>
                  <button
                    onClick={() => setActiveModalKey('6.5_edge_colouring')}
                    className="text-[10px] font-mono text-pink-300 bg-pink-950/70 hover:bg-pink-800/80 border border-pink-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-pink-300 transition-colors">Edge Colouring & Vizing's Theorem</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  An edge coloring assigns colors so that incident edges have distinct colors. Chromatic index χ'(G) is Δ or Δ + 1.
                </p>
              </div>

              <div
                onClick={() => setActiveModalKey('6.5_edge_colouring')}
                className="bg-[#090d20] p-3 rounded-xl border border-[#171f40] group-hover:border-pink-600/40 space-y-1 text-xs text-slate-300 font-mono cursor-pointer transition-colors"
              >
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-cyan-300 text-[11px]">
                  Vizing: Δ(G) ≤ χ'(G) ≤ Δ(G) + 1
                </div>
                <p className="text-[10px] text-slate-400 font-sans">
                  Class 1 graphs have χ' = Δ; Class 2 graphs have χ' = Δ + 1.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#161f42]">
                <button
                  onClick={() => setActiveModalKey('6.5_edge_colouring')}
                  className="text-xs text-pink-400 font-semibold flex items-center gap-1 hover:text-pink-300"
                >
                  <span>Class 1 vs Class 2</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setActiveTab('coloring-lab')}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>Edge Palette</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 6.6 Map Colouring */}
            <div className="group relative p-5 rounded-2xl bg-[#0e1329] border border-[#1b2347] hover:border-pink-500/80 hover:shadow-2xl hover:shadow-pink-900/20 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-pink-400 font-bold uppercase">Section 6.6</span>
                  <button
                    onClick={() => setActiveModalKey('6.6_map_colouring')}
                    className="text-[10px] font-mono text-pink-300 bg-pink-950/70 hover:bg-pink-800/80 border border-pink-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-pink-300 transition-colors">Map Colouring & 4-Color Theorem</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every planar map can be colored using at most 4 colors without adjacent conflicts (Appel & Haken, 1976).
                </p>
              </div>

              <div
                onClick={() => setActiveModalKey('6.6_map_colouring')}
                className="bg-[#090d20] p-3 rounded-xl border border-[#171f40] group-hover:border-pink-600/40 space-y-2 text-xs cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-center gap-1.5">
                  {COLOR_PALETTE.slice(0, 4).map(c => (
                    <div key={c.id} className="w-5 h-5 rounded-full" style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  Map dual converts countries to vertices and borders to edges.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#161f42]">
                <button
                  onClick={() => setActiveModalKey('6.6_map_colouring')}
                  className="text-xs text-pink-400 font-semibold flex items-center gap-1 hover:text-pink-300"
                >
                  <span>4-Color Proof History</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setActiveTab('coloring-lab')}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>Color Map</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACADEMIC DEEP DIVE MODAL DIALOG */}
      {/* ========================================================================= */}
      {activeModalData && (
        <Modal
          isOpen={!!activeModalKey}
          onClose={() => setActiveModalKey(null)}
          title={activeModalData.title}
          subtitle={activeModalData.chapter}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6 text-slate-200 max-h-[75vh] overflow-y-auto pr-1">
            {/* Formal Definition */}
            <div className="space-y-2 bg-[#090d22] p-4 rounded-xl border border-[#1b2554]">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                <BookMarked className="w-4 h-4" />
                <span>Formal Definition (DMS Curriculum)</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {activeModalData.formalDef}
              </p>
            </div>

            {/* Theorems & Corollaries */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                <span>Theorems, Invariants & Proof Sketches</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {activeModalData.theorems.map((thm, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#0c122e] border border-[#1e295d] space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                        {thm.name}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pl-4">
                      {thm.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Worked Academic Example */}
            <div className="space-y-2 bg-gradient-to-br from-[#09152b] to-[#0d1c3a] p-4 rounded-xl border border-blue-900/50">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Worked Academic Example & Case Study</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {activeModalData.workedExample}
              </p>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#1b2554]">
              <span className="text-xs text-slate-400 font-mono">
                Source: Clark & Holton — A First Look at Graph Theory
              </span>
              <button
                onClick={() => {
                  if (activeModalData.actionTab) {
                    setActiveTab(activeModalData.actionTab);
                  }
                  setActiveModalKey(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
              >
                <span>{activeModalData.actionLabel || 'Launch Interactive Lab'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
