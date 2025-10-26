
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { HierarchyPointNode } from 'd3-hierarchy';
import type { MindMapNode } from '../types';

interface MindMapProps {
  data: MindMapNode;
  onNodeClick: (node: HierarchyPointNode<MindMapNode>) => void;
  selectedNodeId?: string | null;
}

const MindMap: React.FC<MindMapProps> = ({ data, onNodeClick, selectedNodeId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current || dimensions.width === 0) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const g = svg.append("g");

    const root = d3.hierarchy(data);
    const treeLayout = d3.tree<MindMapNode>().size([height, width - 300]);
    treeLayout(root);

    const links = root.links();
    const nodes = root.descendants();

    // Center the root node initially
    const rootInitialX = width / 6;
    const rootInitialY = height / 2;
    const xOffset = rootInitialX - root.y;
    const yOffset = rootInitialY - root.x;

    g.attr("transform", `translate(${xOffset}, ${yOffset})`);

    const linkGenerator = d3.linkHorizontal<d3.HierarchyLink<MindMapNode>, [number, number]>()
      .x(d => d.y)
      .y(d => d.x);

    g.append("g")
      .attr("fill", "none")
      .attr("stroke", "#4b5563") // gray-600
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("d", d => {
        const source: [number, number] = [d.source.x, d.source.y];
        const target: [number, number] = [d.target.x, d.target.y];
        const link = d3.linkHorizontal()({ source: [source[1], source[0]], target: [target[1], target[0]] });
        return link;
      });

    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .style("cursor", "pointer")
      .on("click", (event, d) => onNodeClick(d));

    node.append("circle")
      .attr("r", 6)
      .attr("fill", d => d.data.id === selectedNodeId ? "#3b82f6" : "#10b981") // blue-500 or emerald-500
      .attr("stroke", d => d.data.id === selectedNodeId ? "#60a5fa" : "#34d399") // blue-400 or emerald-400
      .attr("stroke-width", 2);

    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.children ? -10 : 10)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name)
      .attr("fill", "white")
      .style("font-size", "14px")
      .style("paint-order", "stroke")
      .attr("stroke", "#111827") // gray-900
      .attr("stroke-width", "3px")
      .attr("stroke-linejoin", "round");
      
    const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
            g.attr("transform", event.transform.toString());
        });

    const initialZoom = d3.zoomIdentity.translate(xOffset, yOffset).scale(0.8);
    svg.call(zoom).call(zoom.transform, initialZoom);


  }, [data, dimensions, onNodeClick, selectedNodeId]);

  return (
    <div ref={containerRef} className="w-full h-full flex-grow">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
    </div>
  );
};

export default MindMap;
