import React from 'react'

const Sidebar = ({ activePage, setActivePage }) => {
    const pages = [
        { id: 'home', label: 'Home', icon: '🏠' },
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        {id:'aientities' , label:'AI Entities',icon:'🤖'},
        { id: 'marketplace', label: 'Physics NFT', icon: '🛒' },
        { id: 'carbon', label: 'Carbon Rewards', icon: '🌿' },
        { id: 'identity', label: 'Quantum Identity', icon: '🔐' },
        { id: 'entanglement', label: 'Entanglement', icon: '🌌' }
    ]

    return (
        <aside className="hidden lg:block">
        <div className="sticky top-24 w-full bg-gradient-to-br from-[var(--pane)] to-[var(--ink)] text-white rounded-3xl p-6 shadow-2xl border border-gray-800">
            {/* Sidebar Header */}
            <div className="mb-6 pb-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-[var(--mustard)] text-center">Navigation</h2>
            <p className="text-xs text-gray-400 text-center mt-1">Explore QuantumVerse</p>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-2">
            {pages.map((page) => (
                <button
                key={page.id}
                onClick={() => setActivePage(page.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                    activePage === page.id
                    ? 'bg-gradient-to-r from-[var(--mustard)] to-yellow-600 text-[var(--ink)] font-bold shadow-lg transform scale-[1.02]'
                    : 'hover:bg-[var(--ink)]/50 text-gray-300 hover:text-[var(--mustard)] hover:transform hover:scale-[1.01]'
                }`}
                >
                <span className="text-2xl">{page.icon}</span>
                <span className="font-medium">{page.label}</span>
                {activePage === page.id && (
                    <div className="ml-auto w-2 h-2 bg-[var(--ink)] rounded-full animate-pulse"></div>
                )}
                </button>
            ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--mustard)] to-yellow-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg">
                🌌
                </div>
                <p className="text-xs text-gray-500 mb-1">Powered by</p>
                <p className="text-sm font-bold text-[var(--mustard)]">Hedera Blockchain</p>
            </div>
            </div>
        </div>
        </aside>
    )
}

export default Sidebar
