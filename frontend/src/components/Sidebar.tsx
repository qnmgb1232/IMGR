import { Link } from 'react-router-dom'

export default function Sidebar() {
  const navItems = [
    { path: '/', label: '首页' },
    { path: '/predictions', label: '预测号码' },
    { path: '/trends', label: '走势图' },
    { path: '/distribution', label: '号码分布' },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-bg-sidebar border-r border-border-color p-4">
      <h2 className="text-xl font-bold text-ball-red mb-8">IMGR</h2>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="block px-4 py-2 rounded text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
