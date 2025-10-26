
import React, { useState, useCallback, useEffect } from 'react';
import type { HierarchyPointNode } from 'd3-hierarchy';
import MindMap from './components/MindMap';
import ControlPanel from './components/ControlPanel';
import { getAISuggestions } from './services/geminiService';
import { exportAsJson, exportAsPng, exportAsSvg } from './utils/export';
import type { MindMapNode } from './types';

const findNodeAndAddChild = (
    node: MindMapNode,
    parentId: string,
    newNode: MindMapNode
  ): MindMapNode => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...(node.children || []), newNode],
      };
    }
  
    if (node.children) {
      return {
        ...node,
        children: node.children.map((child) =>
          findNodeAndAddChild(child, parentId, newNode)
        ),
      };
    }
  
    return node;
  };

const App: React.FC = () => {
    const [history, setHistory] = useState<MindMapNode[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const mindMapData = history[historyIndex] ?? null;

    const [selectedNode, setSelectedNode] = useState<HierarchyPointNode<MindMapNode> | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [initialTopic, setInitialTopic] = useState<string>('');
    
    const handleNodeClick = useCallback((node: HierarchyPointNode<MindMapNode>) => {
      setSelectedNode(node);
      setIsLoading(true);
      setSuggestions([]);
  
      const path = node.ancestors().map(d => d.data.name).reverse();
  
      getAISuggestions(path).then((newSuggestions) => {
        setSuggestions(newSuggestions);
        setIsLoading(false);
      });
    }, []);
  
    const handleAddNode = useCallback((parentNodeId: string, newNodeName: string) => {
      if (!mindMapData) return;
  
      const newNode: MindMapNode = {
        id: `${Date.now()}-${Math.random()}`,
        name: newNodeName,
      };
  
      const newMindMapData = findNodeAndAddChild(mindMapData, parentNodeId, newNode);
      
      const newHistory = history.slice(0, historyIndex + 1);
      setHistory([...newHistory, newMindMapData]);
      setHistoryIndex(newHistory.length);

    }, [mindMapData, history, historyIndex]);

    const handleStartMindMap = (e: React.FormEvent) => {
      e.preventDefault();
      if(initialTopic.trim()) {
        const rootNode: MindMapNode = {
          id: 'root',
          name: initialTopic.trim(),
          children: [],
        };
        setHistory([rootNode]);
        setHistoryIndex(0);
        setSelectedNode(null);
        setSuggestions([]);
      }
    };

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(prevIndex => prevIndex - 1);
            setSelectedNode(null);
            setSuggestions([]);
        }
    }, [historyIndex]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prevIndex => prevIndex + 1);
            setSelectedNode(null);
            setSuggestions([]);
        }
    }, [historyIndex, history.length]);

    const handleExport = (format: 'png' | 'svg' | 'json') => {
        if (!mindMapData) {
            alert("Please create a mind map first.");
            return;
        }
        switch (format) {
            case 'png':
                exportAsPng();
                break;
            case 'svg':
                exportAsSvg();
                break;
            case 'json':
                exportAsJson(mindMapData);
                break;
        }
    };

    const handleImport = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result as string;
                const data = JSON.parse(result);
                // Basic validation
                if (data.id && data.name) {
                    setHistory([data]);
                    setHistoryIndex(0);
                    setSelectedNode(null);
                    setSuggestions([]);
                } else {
                    alert("Invalid JSON file format.");
                }
            } catch (error) {
                alert("Error reading or parsing the file.");
                console.error(error);
            }
        };
        reader.readAsText(file);
    };

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    if (!mindMapData) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900 p-4">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-emerald-400 mb-2">AI Mind Map</h1>
                    <p className="text-lg text-gray-300 mb-8">Enter a central topic to begin your creative journey.</p>
                </div>
                <form onSubmit={handleStartMindMap} className="w-full max-w-lg flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={initialTopic}
                        onChange={(e) => setInitialTopic(e.target.value)}
                        placeholder="e.g., The Future of Renewable Energy"
                        className="flex-grow bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
                        Start
                    </button>
                </form>
            </div>
        );
    }
  
    return (
      <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-gray-900">
        <main className="flex-grow h-full w-full">
            <MindMap data={mindMapData} onNodeClick={handleNodeClick} selectedNodeId={selectedNode?.data.id} />
        </main>
        <aside className="h-full">
            <ControlPanel
                selectedNode={selectedNode}
                suggestions={suggestions}
                isLoading={isLoading}
                onAddNode={handleAddNode}
                onExport={handleExport}
                onImport={handleImport}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={canUndo}
                canRedo={canRedo}
            />
        </aside>
      </div>
    );
  };
  
  export default App;
