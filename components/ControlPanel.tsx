
import React, { useState, useRef } from 'react';
import type { HierarchyPointNode } from 'd3-hierarchy';
import type { MindMapNode } from '../types';

interface ControlPanelProps {
  selectedNode: HierarchyPointNode<MindMapNode> | null;
  suggestions: string[];
  isLoading: boolean;
  onAddNode: (parentNodeId: string, newNodeName: string) => void;
  onExport: (format: 'png' | 'svg' | 'json') => void;
  onImport: (file: File) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedNode,
  suggestions,
  isLoading,
  onAddNode,
  onExport,
  onImport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const [customNodeName, setCustomNodeName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddCustomNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (customNodeName.trim() && selectedNode) {
      onAddNode(selectedNode.data.id, customNodeName.trim());
      setCustomNodeName('');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <div className="w-full md:w-96 bg-gray-800 p-6 flex-shrink-0 flex flex-col space-y-6 overflow-y-auto">
      <div>
        <h2 className="text-xl font-bold text-emerald-400 mb-2">Controls</h2>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button onClick={onUndo} disabled={!canUndo} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            Undo
          </button>
          <button onClick={onRedo} disabled={!canRedo} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            Redo
          </button>
        </div>
        <div className="flex space-x-2">
            <button onClick={handleImportClick} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-200 text-sm">Import JSON</button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
        </div>
      </div>
      
      {selectedNode && (
      <div>
        <h2 className="text-lg font-semibold text-emerald-400 mb-3">
          Selected Node: <span className="text-white font-bold">{selectedNode.data.name}</span>
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-md font-semibold text-gray-300 mb-2">Add Custom Node</h3>
            <form onSubmit={handleAddCustomNode} className="flex space-x-2">
              <input
                type="text"
                value={customNodeName}
                onChange={(e) => setCustomNodeName(e.target.value)}
                placeholder="New idea..."
                className="flex-grow bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded transition duration-200 text-sm">Add</button>
            </form>
          </div>
          
          <div>
            <h3 className="text-md font-semibold text-gray-300 mb-2">AI Suggestions</h3>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
              </div>
            ) : (
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>
                    <button 
                      onClick={() => onAddNode(selectedNode.data.id, suggestion)}
                      className="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded transition duration-200 text-sm"
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      )}
      
      <div className="pt-4 border-t border-gray-700">
        <h2 className="text-xl font-bold text-emerald-400 mb-2">Export Mindmap</h2>
        <div className="grid grid-cols-3 gap-2">
            <button onClick={() => onExport('png')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition duration-200 text-sm">PNG</button>
            <button onClick={() => onExport('svg')} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded transition duration-200 text-sm">SVG</button>
            <button onClick={() => onExport('json')} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded transition duration-200 text-sm">JSON</button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
