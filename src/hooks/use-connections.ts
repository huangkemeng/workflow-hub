'use client';

import { useState, useCallback, useRef } from 'react';
import { Connection, ConnectionType, CreateConnectionRequest } from '@/types/connection';
import { WorkflowNode } from '@/types/node';
import {
  createConnection,
  validateConnection,
  deleteConnection as deleteConn,
  updateConnection as updateConn,
  getNodeConnections,
} from '@/lib/connection-utils';

interface UseConnectionsProps {
  initialConnections?: Connection[];
  nodes: WorkflowNode[];
  onChange?: (connections: Connection[]) => void;
}

export function useConnections({
  initialConnections = [],
  nodes,
  onChange,
}: UseConnectionsProps) {
  const [connections, setConnectionsState] = useState<Connection[]>(initialConnections);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [tempConnection, setTempConnection] = useState<{
    source: string;
    target: string | null;
  } | null>(null);

  // 使用 ref 来保持最新状态
  const connectionsRef = useRef(connections);
  connectionsRef.current = connections;
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // 包装 setConnections 以触发 onChange
  const setConnections = useCallback((newConnections: Connection[] | ((prev: Connection[]) => Connection[])) => {
    const updatedConnections = typeof newConnections === 'function'
      ? newConnections(connectionsRef.current)
      : newConnections;
    setConnectionsState(updatedConnections);
    onChangeRef.current?.(updatedConnections);
  }, []); // 空依赖数组

  // 开始创建连接
  const startConnection = useCallback((sourceNodeId: string) => {
    setIsCreating(true);
    setTempConnection({ source: sourceNodeId, target: null });
  }, []);

  // 更新临时连接目标
  const updateTempTarget = useCallback((targetNodeId: string | null) => {
    setTempConnection((prev) => prev ? { ...prev, target: targetNodeId } : null);
  }, []);

  // 完成创建连接
  const completeConnection = useCallback(
    (type: ConnectionType = 'sequential', options?: { label?: string; condition?: string; color?: string }) => {
      const currentTemp = tempConnection;
      const currentConnections = connectionsRef.current;
      const currentNodes = nodesRef.current;

      if (!currentTemp?.target) return null;

      const validation = validateConnection(
        currentTemp.source,
        currentTemp.target,
        currentConnections,
        currentNodes
      );

      if (!validation.valid) {
        setIsCreating(false);
        setTempConnection(null);
        throw new Error(validation.error);
      }

      const newConnection = createConnection(
        currentTemp.source,
        currentTemp.target,
        type,
        options
      );

      const updatedConnections = [...currentConnections, newConnection];
      setConnectionsState(updatedConnections);
      setIsCreating(false);
      setTempConnection(null);
      onChangeRef.current?.(updatedConnections);

      return newConnection;
    },
    [tempConnection] // 只依赖 tempConnection
  );

  // 取消创建连接
  const cancelConnection = useCallback(() => {
    setIsCreating(false);
    setTempConnection(null);
  }, []);

  // 删除连接
  const deleteConnection = useCallback(
    (connectionId: string) => {
      const currentConnections = connectionsRef.current;
      const updatedConnections = deleteConn(connectionId, currentConnections);
      setConnectionsState(updatedConnections);
      setSelectedConnectionId((prev) => prev === connectionId ? null : prev);
      onChangeRef.current?.(updatedConnections);
    },
    [] // 空依赖数组
  );

  // 更新连接
  const updateConnection = useCallback(
    (connectionId: string, updates: Partial<Connection>) => {
      const currentConnections = connectionsRef.current;
      const updatedConnections = updateConn(connectionId, updates, currentConnections);
      setConnectionsState(updatedConnections);
      onChangeRef.current?.(updatedConnections);
    },
    [] // 空依赖数组
  );

  // 选择连接
  const selectConnection = useCallback((connectionId: string | null) => {
    setSelectedConnectionId(connectionId);
  }, []);

  // 获取选中连接
  const getSelectedConnection = useCallback(() => {
    return connectionsRef.current.find((c) => c.id === selectedConnectionId) || null;
  }, [selectedConnectionId]); // 只依赖 selectedConnectionId

  // 获取节点的连接信息
  const getConnectionsForNode = useCallback(
    (nodeId: string) => {
      return getNodeConnections(nodeId, connectionsRef.current);
    },
    [] // 空依赖数组
  );

  // 验证连接
  const validateNewConnection = useCallback(
    (sourceId: string, targetId: string) => {
      return validateConnection(sourceId, targetId, connectionsRef.current, nodesRef.current);
    },
    [] // 空依赖数组
  );

  return {
    connections,
    selectedConnectionId,
    isCreating,
    tempConnection,
    setConnections,
    startConnection,
    completeConnection,
    cancelConnection,
    deleteConnection,
    updateConnection,
    selectConnection,
    getSelectedConnection,
    getConnectionsForNode,
    validateNewConnection,
  };
}
