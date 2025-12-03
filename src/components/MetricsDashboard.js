// src/components/MetricsDashboard.js
import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import logger from '../services/loggingService';

const dashboardStyles = {
  container: {
    padding: '20px',
    margin: '20px',
    border: '1px solid #00bcd4',
    borderRadius: '8px',
    backgroundColor: '#f0f9fa',
  },
  title: {
    color: '#00796b',
    borderBottom: '2px solid #00796b',
    paddingBottom: '10px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #ddd',
    borderRadius: '5px',
    padding: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  metricName: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
  metricValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#009688',
    marginTop: '5px',
  },
  error: {
    color: '#d32f2f',
  }
};

/**
 * Parses Prometheus text-format metrics to find a specific value.
 * @param {string} text The raw metrics text.
 * @param {string} metricName The name of the metric to find.
 * @returns {number|null} The value of the metric or null if not found.
 */
const parseMetric = (text, metricName) => {
  try {
    const regex = new RegExp(`^${metricName}[{_]?.*\s+([\d.]+)$`, 'm');
    const match = text.match(regex);
    return match ? parseFloat(match[1]) : 0;
  } catch (e) {
    logger.error(`Failed to parse metric: ${metricName}`, e);
    return null;
  }
};


const MetricsDashboard = () => {
  const [metrics, setMetrics] = useState({
    loginErrors: 0,
    bidCount: 0,
    cpuUsage: 0,
  });
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    try {
      const response = await apiService.getMetrics();
      const rawMetrics = response.data;
      
      const loginErrors = parseMetric(rawMetrics, 'bookswap_login_errors_total');
      const bidCount = parseMetric(rawMetrics, 'bookswap_bid_latency_seconds_count');
      const cpuUsage = parseMetric(rawMetrics, 'bookswap_cpu_usage_percent');

      setMetrics({ loginErrors, bidCount, cpuUsage });
      setError(null); // Clear previous errors on successful fetch
    } catch (err) {
      logger.error('Failed to fetch metrics', err);
      setError('Could not load metrics from backend.');
    }
  };

  useEffect(() => {
    fetchMetrics(); // Fetch on component mount
    const interval = setInterval(fetchMetrics, 5000); // Refetch every 5 seconds
    
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <div style={dashboardStyles.container}>
      <h2 style={dashboardStyles.title}>Backend Metrics Dashboard (Live)</h2>
      {error && <p style={dashboardStyles.error}>{error}</p>}
      <div style={dashboardStyles.grid}>
        <div style={dashboardStyles.card}>
          <p style={dashboardStyles.metricName}>Login Errors Total</p>
          <p style={dashboardStyles.metricValue}>{metrics.loginErrors}</p>
        </div>
        <div style={dashboardStyles.card}>
          <p style={dashboardStyles.metricName}>Bids Placed Total</p>
          <p style={dashboardStyles.metricValue}>{metrics.bidCount}</p>
        </div>
        <div style={dashboardStyles.card}>
          <p style={dashboardStyles.metricName}>Backend CPU Usage</p>
          <p style={dashboardStyles.metricValue}>{metrics.cpuUsage.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
