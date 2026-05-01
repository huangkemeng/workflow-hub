'use client';

import { useState, useCallback } from 'react';
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

  // 包装 setConnections 以触发 onChange
  const setConnections = useCallback((newConnections: Connection[] | ((prev: Connection[]) => Connection[])) => {
    const updatedConnections = typeof newConnections === 'function'
      ? newConnections(connections)
      : newConnections;
    setConnectionsState(updatedConnections);
    onChange?.(updatedConnections);
  }, [connections, onChange]);

  // 开始创建连接
  const startConnection = useCallback((sourceNodeId: string) => {
    setIsCreating(true);
    setTempConnection({ source: sourceNodeId, target: null });
  }, []);

  // 更新临时连接目标
  const updateTempTarget = useCallback((targetNodeId: string | null) => {
    if (tempConnection) {
      setTempConnection({ ...tempConnection, target: targetNodeId });
    }
  }, [tempConnection]);

  // 完成创建连接
  const completeConnection = useCallback(
    (type: ConnectionType = 'sequential', options?: { label?: string; condition?: string; color?: string }) => {
      if (!tempConnection?.target) return null;

      const validation = validateConnection(
        tempConnection.source,
        tempConnection.target,
        connections,
        nodes
      );

      if (!validation.valid) {
        setIsCreating(false);
        setTempConnection(null);
        throw new Error(validation.error);
      }

      const newConnection = createConnection(
        tempConnection.source,
        tempConnection.target,
        type,
        options
      );

      const updatedConnections = [...connections, newConnection];
      setConnectionsState(updatedConnections);
      setIsCreating(false);
      setTempConnection(null);
      onChange?.(updatedConnections);

      return newConnection;
    },
    [tempConnection, connections, nodes, onChange]
  );

  // 取消创建连接
  const cancelConnection = useCallback(() => {
    setIsCreating(false);
    setTempConnection(null);
  }, []);

  // 删除连接
  const deleteConnection = useCallback(
    (connectionId: string) => {
      const updatedConnections = deleteConn(connectionId, connections);
      setConnectionsState(updatedConnections);
      if (selectedConnectionId === connectionId) {
        setSelectedConnectionId(null);
      }
      onChange?.(updatedConnections);
    },
    [connections, selectedConnectionId, onChange]
  );

  // 更新连接
  const updateConnection = useCallback(
    (connectionId: string, updates: Partial<Connection>) => {
      const updatedConnections = updateConn(connectionId, updates, connections);
      setConnectionsState(updatedConnections);
      onChange?.(updatedConnections);
    },
    [connections, onChange]
  );

  // 选择连接
  const selectConnection = useCallback((connectionId: string | null) => {
    setSelectedConnectionId(connectionId);
  }, []);

  // 获取选中连接
  const getSelectedConnection = useCallback(() => {
    return connections.find((c) => c.id === selectedConnectionId) || null;
  }, [connections, selectedConnectionId]);

  // 获取节点的连接信息
  const getConnectionsForNode = useCallback(
    (nodeId: string) => {
      return getNodeConnections(nodeId, connections);
    },
    [connections]
  );

  // 验证连接
  const validateNewConnection = useCallback(
    (sourceId: string, targetId: string) => {
      return validateConnection(sourceId, targetId, connections, nodes);
    },
    [connections, nodes]
  );

  return {
    connections,
    selectedConnectionId,
    isCreating,
    tempConnection,
    setConnections,
    startConnection,
    updateTempTarget,
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
