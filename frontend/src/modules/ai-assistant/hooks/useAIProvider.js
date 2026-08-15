/**
 * useAIProvider.js
 * Fetches the active AI provider metadata from /api/ai/provider.
 * Returns { provider, label, description, loading } — consumed by
 * ChatWindow header and FraudAnalysisModal to display an honest AI badge.
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../../../app/config';

export function useAIProvider() {
  const [providerInfo, setProviderInfo] = useState({
    provider: 'heuristic',
    label: 'Heuristic Engine',
    description: 'Offline rule-based AI engine',
    loading: true,
  });

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/ai/provider`)
      .then((res) => setProviderInfo({ ...res.data, loading: false }))
      .catch(() =>
        setProviderInfo({
          provider: 'heuristic',
          label: 'Heuristic Engine',
          description: 'Offline rule-based AI engine',
          loading: false,
        })
      );
  }, []);

  return providerInfo;
}
