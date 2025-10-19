import React, { useState, useEffect } from 'react';
import { useWallet } from '../Context/WalletContext';
import { Client, AccountBalanceQuery } from '@hashgraph/sdk';

const Dashboard = () => {
  const { connectedAccount, isConnected } = useWallet();
  const [userTokens, setUserTokens] = useState([]);
  const [globalTokens, setGlobalTokens] = useState([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const MIRROR_NODE_URL = 'https://testnet.mirrornode.hedera.com/api/v1';

  useEffect(() => {
    if (isConnected && connectedAccount) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [isConnected, connectedAccount]);

  const fetchTokenInfoFromMirror = async (tokenId) => {
    const response = await fetch(`${MIRROR_NODE_URL}/tokens/${tokenId}`);
    if (!response.ok) throw new Error(`Failed to fetch token ${tokenId}`);
    return await response.json();
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const client = Client.forTestnet();
      
      const userBalanceQuery = new AccountBalanceQuery()
        .setAccountId(connectedAccount);

      const userBalance = await userBalanceQuery.execute(client);
      const userTokenBalances = [];

      for (const [tokenId, balance] of userBalance.tokens) {
        try {
          const tokenInfo = await fetchTokenInfoFromMirror(tokenId.toString());

          userTokenBalances.push({
            tokenId: tokenId.toString(),
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            balance: balance.toString(),
            decimals: tokenInfo.decimals
          });
        } catch (tokenError) {
          console.warn(`Could not fetch info for token ${tokenId}:`, tokenError);
        }
      }

      setUserTokens(userTokenBalances);

      const mockGlobalTokens = [
        { tokenId: '0.0.123456', name: 'Quantum Token', symbol: 'QT', totalSupply: '1000000', decimals: 2 },
        { tokenId: '0.0.123457', name: 'Carbon Credit', symbol: 'CC', totalSupply: '500000', decimals: 0 },
        { tokenId: '0.0.123458', name: 'Identity Token', symbol: 'ID', totalSupply: '10000', decimals: 0 },
      ];

      setGlobalTokens(mockGlobalTokens);
      setActiveUsers(1250);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total portfolio value (mock calculation)
  const calculateTotalValue = () => {
    return userTokens.reduce((sum, token) => {
      const tokenValue = parseInt(token.balance) / Math.pow(10, token.decimals);
      return sum + tokenValue * 0.5; // Mock price multiplier
    }, 0);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] text-white rounded-3xl shadow-2xl p-12 text-center border border-gray-800">
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto text-[var(--mustard)] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[var(--mustard)] to-yellow-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-xl text-gray-400 mb-8">Please connect your wallet to access your dashboard</p>
            <div className="inline-block px-6 py-3 bg-[var(--mustard)] text-[var(--ink)] rounded-xl font-semibold">
              Connect Wallet to Continue
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] text-white rounded-3xl shadow-2xl p-12 border border-gray-800">
            <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[var(--mustard)] to-yellow-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-[var(--mustard)]"></div>
                <div className="absolute top-0 left-0 animate-ping rounded-full h-20 w-20 border-4 border-[var(--mustard)] opacity-20"></div>
              </div>
              <span className="mt-6 text-xl text-gray-400 animate-pulse">Loading dashboard data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] text-white rounded-3xl shadow-2xl p-12 border border-gray-800">
            <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[var(--mustard)] to-yellow-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-2xl border border-red-500 shadow-lg">
              <div className="flex items-start gap-4">
                <svg className="w-8 h-8 text-white flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Error Loading Data</h3>
                  <p className="text-white/90">{error}</p>
                  <button
                    onClick={fetchDashboardData}
                    className="mt-4 px-6 py-3 bg-white text-red-600 rounded-xl hover:bg-gray-100 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalValue = calculateTotalValue();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[var(--pane)] via-[var(--ink)] to-[var(--pane)] text-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--mustard)] opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-[var(--mustard)] to-yellow-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-gray-400 text-lg">Welcome back, {connectedAccount?.slice(0, 10)}...</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Connected</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-[var(--ink)] to-gray-900 p-6 rounded-2xl border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm font-medium">Total Tokens</p>
                  <svg className="w-5 h-5 text-[var(--mustard)]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-white">{userTokens.length}</p>
                <p className="text-xs text-gray-500 mt-1">In your wallet</p>
              </div>

              <div className="bg-gradient-to-br from-[var(--ink)] to-gray-900 p-6 rounded-2xl border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm font-medium">Portfolio Value</p>
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-white">${totalValue.toFixed(2)}</p>
                <p className="text-xs text-green-500 mt-1">+2.4% today</p>
              </div>

              <div className="bg-gradient-to-br from-[var(--ink)] to-gray-900 p-6 rounded-2xl border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm font-medium">Active Users</p>
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-white">{activeUsers.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Platform wide</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* User Token Holdings - Takes 2 columns */}
          <div className="xl:col-span-2 bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] text-white rounded-3xl shadow-2xl p-8 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Your Token Holdings</h2>
                <p className="text-gray-400 text-sm">Tokens in your connected wallet</p>
              </div>
              <div className="p-3 bg-[var(--mustard)]/10 rounded-xl">
                <svg className="w-6 h-6 text-[var(--mustard)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {userTokens.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-20 h-20 mx-auto text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-400 text-lg">No tokens found in your account</p>
                  <p className="text-gray-600 text-sm mt-2">Start by acquiring some tokens</p>
                </div>
              ) : (
                userTokens.map((token, index) => (
                  <div 
                    key={token.tokenId} 
                    className="group bg-gradient-to-r from-[var(--ink)] to-gray-900 p-5 rounded-2xl border border-gray-800 hover:border-[var(--mustard)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--mustard)]/10 cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--mustard)] to-yellow-600 flex items-center justify-center text-[var(--ink)] font-bold text-lg shadow-lg">
                          {token.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-white group-hover:text-[var(--mustard)] transition-colors">
                            {token.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-400">{token.symbol}</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-xs text-gray-500 font-mono">{token.tokenId}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-[var(--mustard)]">
                          {(parseInt(token.balance) / Math.pow(10, token.decimals)).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">{token.symbol}</p>
                        <p className="text-xs text-gray-600 mt-1 font-mono">Raw: {token.balance}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Global Statistics - Takes 1 column */}
          <div className="space-y-6">
            
            {/* Platform Tokens */}
            <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] text-white rounded-3xl shadow-2xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Platform Stats</h3>
                  <p className="text-xs text-gray-500">Global metrics</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-[var(--ink)]/50 rounded-xl border border-gray-800">
                  <span className="text-gray-400 text-sm">Total Tokens</span>
                  <span className="font-bold text-[var(--mustard)] text-lg">{globalTokens.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[var(--ink)]/50 rounded-xl border border-gray-800">
                  <span className="text-gray-400 text-sm">Active Users</span>
                  <span className="font-bold text-blue-400 text-lg">{activeUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[var(--ink)]/50 rounded-xl border border-gray-800">
                  <span className="text-gray-400 text-sm">Total Supply</span>
                  <span className="font-bold text-green-400 text-lg">
                    {globalTokens.reduce((sum, token) => sum + parseInt(token.totalSupply), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Created Tokens */}
            <div className="bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] text-white rounded-3xl shadow-2xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Created Tokens</h3>
                  <p className="text-xs text-gray-500">Platform tokens</p>
                </div>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {globalTokens.map((token, index) => (
                  <div 
                    key={token.tokenId} 
                    className="p-4 bg-gradient-to-r from-[var(--ink)] to-gray-900 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all duration-200"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {token.symbol.slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm">{token.name}</p>
                        <p className="text-xs text-gray-500">{token.symbol}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-800">
                      <span className="text-xs text-gray-500 font-mono">{token.tokenId}</span>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Supply</p>
                        <p className="text-sm font-bold text-[var(--mustard)]">
                          {(parseInt(token.totalSupply) / Math.pow(10, token.decimals)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--mustard);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4a942;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
