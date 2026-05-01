'use client';

import { useState, useCallback, useRef } from 'react';
import { WorkflowNode, NodeType } from '@/types/node';
import { createNode, reorderNodes, sortNodesByPosition } from '@/lib/node-utils';

interface UseNodeEditorProps {
  initialNodes?: WorkflowNode[];
  onChange?: (nodes: WorkflowNode[]) => void;
}

export function useNodeEditor({ initialNodes = [], onChange }: UseNodeEditorProps = {}) {
  const [nodes, setNodesState] = useState<WorkflowNode[]>(sortNodesByPosition(initialNodes));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // 使用 ref 来保持最新的 nodes 状态
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  // 使用 ref 来保持 onChange 引用，避免依赖问题
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // 触发 onChange 的辅助函数
  const triggerOnChange = useCallback((updatedNodes: WorkflowNode[]) => {
    onChangeRef.current?.(updatedNodes);
  }, []);

  // 包装 setNodes 以触发 onChange
  const setNodes = useCallback((newNodes: WorkflowNode[] | ((prev: WorkflowNode[]) => WorkflowNode[])) => {
    const updatedNodes = typeof newNodes === 'function' 
      ? newNodes(nodesRef.current) 
      : newNodes;
    setNodesState(updatedNodes);
    triggerOnChange(updatedNodes);
  }, [triggerOnChange]);

  const addNode = useCallback((type: NodeType) => {
    const currentNodes = nodesRef.current;
    const newNode = createNode(type, currentNodes.length + 1);
    const updatedNodes = [...currentNodes, newNode];
    setNodesState(updatedNodes);
    setSelectedNodeId(newNode.id);
    triggerOnChange(updatedNodes);
    return newNode;
  }, [triggerOnChange]);

  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    const currentNodes = nodesRef.current;
    const updatedNodes = currentNodes.map((node) =>
      node.id === nodeId ? { ...node, ...updates } as WorkflowNode : node
    );
    setNodesState(updatedNodes);
    triggerOnChange(updatedNodes);
  }, [triggerOnChange]);

  const deleteNode = useCallback((nodeId: string) => {
    const currentNodes = nodesRef.current;
    const filteredNodes = currentNodes.filter((node) => node.id !== nodeId);
    // 重新排序 position
    const reorderedNodes = filteredNodes.map((node, index) => ({
      ...node,
      position: index + 1,
    }));
    setNodesState(reorderedNodes);
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    triggerOnChange(reorderedNodes);
  }, [selectedNodeId, triggerOnChange]);

  const moveNode = useCallback((fromIndex: number, toIndex: number) => {
    const currentNodes = nodesRef.current;
    const updatedNodes = reorderNodes(currentNodes, fromIndex, toIndex);
    setNodesState(updatedNodes);
    triggerOnChange(updatedNodes);
  }, [triggerOnChange]);

  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const getSelectedNode = useCallback(() => {
    return nodesRef.current.find((node) => node.id === selectedNodeId) || null;
  }, [selectedNodeId]);

  return {
    nodes,
    selectedNodeId,
    addNode,
    updateNode,
    deleteNode,
    moveNode,
    selectNode,
    getSelectedNode,
    setNodes,
  };
}
