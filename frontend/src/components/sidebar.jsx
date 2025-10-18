import React from 'react'

const Sidebar = ({ activePage, setActivePage }) => {
    const pages = [
        { id: 'marketplace', label: 'Physics NFT', icon: '🛒' },
        { id: 'carbon', label: 'Carbon Rewards', icon: '🌿' },
        { id: 'identity', label: 'Quantum Identity', icon: '🔐' },
        { id: 'entanglement', label: 'Entanglement', icon: '🌌' }
    ]

    return (
        <aside className="bg-[var(--pane)] text-[var(--mustard)] rounded-2xl p-4 shadow-xl fade-in h-[85vh] sticky top-30 gap-[5vh]">
            <h2 className="text-lg font-bold mb-4 text-center">Navigation</h2>
            <ul className="space-y-2">
                {pages.map((page) => (
                    <li key={page.id}>
                        <button
                            onClick={() => setActivePage(page.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                                activePage === page.id
                                    ? 'bg-[var(--mustard)] text-[var(--ink)] font-bold'
                                    : 'hover:bg-[var(--ink)] text-white/80'
                            }`}
                        >
                            <span className="text-2xl">{page.icon}</span>
                            <span>{page.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    )
}

export default Sidebar
