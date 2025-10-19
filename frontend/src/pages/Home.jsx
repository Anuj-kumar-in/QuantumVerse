import React from 'react'
import { useWallet } from '../Context/WalletContext'

export const Home = () => {
  const { isConnected, connectedAccount, connectWallet } = useWallet()

  const formatAccountId = (accountId) => {
    if (!accountId) return ''
    return `${accountId.slice(0, 8)}...${accountId.slice(-4)}`
  }

  return (
    <>
      <style>{`
        :root {
          --ink: #0a0a0f;           /* Very dark blue-black */
          --pane: #1a1a2e;         /* Dark blue-gray */
          --mustard: #ffd700;      /* Gold accent */
        }

        @keyframes fade {
          from { opacity:.3; transform: translateY(4px); }
          to   { opacity:1;  transform: translateY(0); }
        }
        .fade-in { animation: fade .25s ease; }
      `}</style>

      <div className="min-h-screen bg-[var(--ink)] text-white">
        <main className="w-90vw mx-auto px-4 py-10 space-y-8">

          {/* Hero Section */}
          <section className="bg-gradient-to-r from-[var(--pane)] via-[var(--ink)] to-[var(--pane)] rounded-2xl p-8 text-center fade-in">
            <h1 className="text-5xl font-bold mb-4 text-[var(--mustard)]">
              Welcome to <span className="text-yellow-300">QuantumVerse</span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-6">
              Experience the future of decentralized applications on Hedera Hashgraph.
              Trade physics NFTs, earn carbon credits, manage digital identity, and explore quantum entanglement.
            </p>

            {/* Wallet Connection */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              {isConnected ? (
                <div className="bg-[var(--mustard)]/20 border border-[color:rgba(238,195,41,0.3)] rounded-lg px-6 py-3">
                  <span className="text-[var(--mustard)] font-semibold">
                    🔷 Connected: {formatAccountId(connectedAccount)}
                  </span>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="bg-[var(--mustard)] text-[var(--ink)] px-8 py-3 rounded-lg font-semibold hover:opacity-80 transition-colors"
                >
                  🔷 Connect Hedera Wallet
                </button>
              )}
            </div>
          </section>

          {/* Features Overview */}
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 fade-in">
            <div className="bg-[var(--pane)] rounded-2xl p-6 border border-[color:rgba(244,211,94,0.2)] text-center">
              <div className="text-4xl mb-4">🧬</div>
              <h3 className="text-xl font-semibold text-[var(--mustard)] mb-2">Physics NFTs</h3>
              <p className="text-white/70 text-sm">
                Trade unique physics properties and quantum assets on the blockchain
              </p>
            </div>

            <div className="bg-[var(--pane)] rounded-2xl p-6 border border-[color:rgba(244,211,94,0.2)] text-center">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold text-[var(--mustard)] mb-2">Carbon Rewards</h3>
              <p className="text-white/70 text-sm">
                Earn tokens for real environmental actions with AI verification
              </p>
            </div>

            <div className="bg-[var(--pane)] rounded-2xl p-6 border border-[color:rgba(244,211,94,0.2)] text-center">
              <div className="text-4xl mb-4">🆔</div>
              <h3 className="text-xl font-semibold text-[var(--mustard)] mb-2">Digital Identity</h3>
              <p className="text-white/70 text-sm">
                Secure and decentralized identity management on Hedera
              </p>
            </div>

            <div className="bg-[var(--pane)] rounded-2xl p-6 border border-[color:rgba(244,211,94,0.2)] text-center">
              <div className="text-4xl mb-4">⚛️</div>
              <h3 className="text-xl font-semibold text-[var(--mustard)] mb-2">Quantum Entanglement</h3>
              <p className="text-white/70 text-sm">
                Explore quantum computing concepts and decentralized applications
              </p>
            </div>
          </section>

          {/* Stats Section */}
          <section className="bg-[var(--pane)] rounded-2xl p-6 shadow-xl fade-in">
            <h2 className="text-2xl font-semibold text-[var(--mustard)] mb-6 text-center">Platform Statistics</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)] text-center">
                <div className="text-2xl font-bold text-[var(--mustard)] mb-1">10,000+</div>
                <div className="text-sm text-white/70">Active Users</div>
              </div>

              <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)] text-center">
                <div className="text-2xl font-bold text-[var(--mustard)] mb-1">50,000+</div>
                <div className="text-sm text-white/70">NFTs Traded</div>
              </div>

              <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)] text-center">
                <div className="text-2xl font-bold text-[var(--mustard)] mb-1">1,000 tons</div>
                <div className="text-sm text-white/70">CO₂ Offset</div>
              </div>

              <div className="bg-[var(--ink)] rounded-xl p-4 border border-[color:rgba(244,211,94,0.2)] text-center">
                <div className="text-2xl font-bold text-[var(--mustard)] mb-1">99.9%</div>
                <div className="text-sm text-white/70">Uptime</div>
              </div>
            </div>
          </section>

          {/* Getting Started */}
          <section className="bg-[var(--pane)] rounded-2xl p-6 shadow-xl fade-in">
            <h2 className="text-2xl font-semibold text-[var(--mustard)] mb-6 text-center">Getting Started</h2>

            <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-[var(--mustard)] text-[var(--ink)] w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold text-[var(--mustard)] mb-2">Connect Wallet</h3>
                <p className="text-white/70 text-sm">
                  Connect your Hedera wallet to access all features and start earning rewards
                </p>
              </div>

              <div className="text-center">
                <div className="bg-[var(--mustard)] text-[var(--ink)] w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold text-[var(--mustard)] mb-2">Explore Features</h3>
                <p className="text-white/70 text-sm">
                  Browse the marketplace, submit carbon actions, or mint your first physics NFT
                </p>
              </div>

              <div className="text-center">
                <div className="bg-[var(--mustard)] text-[var(--ink)] w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold text-[var(--mustard)] mb-2">Start Earning</h3>
                <p className="text-white/70 text-sm">
                  Complete challenges, trade assets, and contribute to environmental goals
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center text-sm text-white/60 pt-8 fade-in">
            © 2025 QuantumVerse - Decentralized Applications on Hedera Hashgraph
          </footer>
        </main>
      </div>
    </>
  )
}

export default Home