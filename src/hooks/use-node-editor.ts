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

  // 包装 setNodes 以触发 onChange
  const setNodes = useCallback((newNodes: WorkflowNode[] | ((prev: WorkflowNode[]) => WorkflowNode[])) => {
    const updatedNodes = typeof newNodes === 'function' 
      ? newNodes(nodesRef.current) 
      : newNodes;
    // 立即更新 ref，确保 getSelectedNode 能获取最新数据
    nodesRef.current = updatedNodes;
    setNodesState(updatedNodes);
    // 使用 ref 调用 onChange，避免依赖问题
    onChangeRef.current?.(updatedNodes);
  }, []); // 空依赖数组，不依赖任何外部变量

  const addNode = useCallback((type: NodeType) => {
    const currentNodes = nodesRef.current;
    const newNode = createNode(type, currentNodes.length + 1);
    const updatedNodes = [...currentNodes, newNode];
    // 立即更新 ref，确保 getSelectedNode 能获取最新数据
    nodesRef.current = updatedNodes;
    setNodesState(updatedNodes);
    setSelectedNodeId(newNode.id);
    onChangeRef.current?.(updatedNodes);
    return newNode;
  }, []); // 空依赖数组

  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    const currentNodes = nodesRef.current;
    const updatedNodes = currentNodes.map((node) =>
      node.id === nodeId ? { ...node, ...updates } as WorkflowNode : node
    );
    // 立即更新 ref，确保 getSelectedNode 能获取最新数据
    nodesRef.current = updatedNodes;
    setNodesState(updatedNodes);
    onChangeRef.current?.(updatedNodes);
  }, []); // 空依赖数组

  const deleteNode = useCallback((nodeId: string) => {
    const currentNodes = nodesRef.current;
    const filteredNodes = currentNodes.filter((node) => node.id !== nodeId);
    // 重新排序 position
    const reorderedNodes = filteredNodes.map((node, index) => ({
      ...node,
      position: index + 1,
    }));
    // 立即更新 ref，确保 getSelectedNode 能获取最新数据
    nodesRef.current = reorderedNodes;
    setNodesState(reorderedNodes);
    setSelectedNodeId((prev) => prev === nodeId ? null : prev);
    onChangeRef.current?.(reorderedNodes);
  }, []); // 空依赖数组，使用函数式更新 selectedNodeId

  const moveNode = useCallback((fromIndex: number, toIndex: number) => {
    const currentNodes = nodesRef.current;
    const updatedNodes = reorderNodes(currentNodes, fromIndex, toIndex);
    // 立即更新 ref，确保 getSelectedNode 能获取最新数据
    nodesRef.current = updatedNodes;
    setNodesState(updatedNodes);
    onChangeRef.current?.(updatedNodes);
  }, []); // 空依赖数组

  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const getSelectedNode = useCallback(() => {
    return nodesRef.current.find((node) => node.id === selectedNodeId) || null;
  }, [selectedNodeId]); // 只依赖 selectedNodeId

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
