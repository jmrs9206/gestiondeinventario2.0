import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  Settings, 
  Sun, 
  Moon, 
  Database, 
  Users, 
  Cpu,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface Item {
  id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

interface HealthStatus {
  status: string;
  database: string;
  timestamp: string;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'items' | 'create'>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Data State
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('ACTIVE');
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  // Synchronize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme as 'light' | 'dark');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Fetch API Health & Seed Data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Health Status
      const healthRes = await fetch(`${API_URL}/api/health`);
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealth(healthData);
      } else {
        setHealth({ status: 'ERROR', database: 'DISCONNECTED', timestamp: '' });
      }

      // 2. Items List
      const itemsRes = await fetch(`${API_URL}/api/items`);
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setItems(itemsData);
      }

      // 3. Users List
      const usersRes = await fetch(`${API_URL}/api/users`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (err: any) {
      setError('Could not connect to the Backend API. Ensure Docker containers are running.');
      setHealth({ status: 'ERROR', database: 'DISCONNECTED', timestamp: '' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Form Submit Handler
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${API_URL}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          description: formDesc,
          status: formStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create item');
      }

      setFormTitle('');
      setFormDesc('');
      setFormStatus('ACTIVE');
      setSuccessMessage('Item created successfully!');
      
      // Reload list
      const itemsRes = await fetch(`${API_URL}/api/items`);
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setItems(itemsData);
      }
      
      // Switch view after brief delay
      setTimeout(() => {
        setSuccessMessage(null);
        setCurrentTab('items');
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Item Handler
  const handleDeleteItem = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const response = await fetch(`${API_URL}/api/items/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setItems(items.filter(item => item.id !== id));
      }
    } catch (err) {
      setError('Error deleting item.');
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand-section">
          <img src="/assets/brand/logo.svg" className="brand-logo" alt="Logo" />
          <span className="brand-name">Marca</span>
        </div>

        <nav className="nav-menu">
          <button 
            onClick={() => setCurrentTab('dashboard')}
            className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentTab('items')}
            className={`nav-item ${currentTab === 'items' ? 'active' : ''}`}
          >
            <Package size={18} />
            Items Inventario
          </button>
          <button 
            onClick={() => setCurrentTab('create')}
            className={`nav-item ${currentTab === 'create' ? 'active' : ''}`}
          >
            <PlusCircle size={18} />
            Registrar Item
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" style={{ width: '100%' }}>
            <Settings size={18} />
            Configuración
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-panel">
        <header className="top-header">
          <div className="header-title">
            {currentTab === 'dashboard' && 'Panel de Control Principal'}
            {currentTab === 'items' && 'Listado de Inventario de Equipos'}
            {currentTab === 'create' && 'Registrar Nuevo Item de Inventario'}
          </div>
          <div className="header-actions">
            {/* Theme Toggle Button */}
            <button onClick={toggleTheme} className="btn-theme" title="Cambiar Tema">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button onClick={loadData} className="btn btn-outline">
              Sincronizar
            </button>
          </div>
        </header>

        <div className="content-wrapper">
          {/* Success / Error Alerts */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--color-danger)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)', color: 'var(--color-danger)', fontSize: '13px'
            }}>
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--color-success)',
              backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--color-success)', fontSize: '13px'
            }}>
              <CheckCircle size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: DASHBOARD VIEW */}
          {currentTab === 'dashboard' && (
            <>
              {/* KPIs Widgets Grid */}
              <div className="dashboard-grid">
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Total Equipos</span>
                    <Package size={20} className="text-muted" style={{ color: 'var(--primary)' }} />
                  </div>
                  <span className="card-value">{loading ? '...' : items.length}</span>
                  <span className="card-footer">Ítems registrados en la base de datos</span>
                </div>

                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Base de Datos</span>
                    <Database size={20} className="text-muted" />
                  </div>
                  <span className="card-value" style={{ 
                    color: health?.database === 'CONNECTED' ? 'var(--color-success)' : 'var(--color-danger)',
                    fontSize: '20px', fontWeight: '800', margin: '6px 0'
                  }}>
                    {health?.database === 'CONNECTED' ? 'CONECTADO' : 'DESCONECTADO'}
                  </span>
                  <span className="card-footer">Estado de conexión PostgreSQL</span>
                </div>

                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Usuarios</span>
                    <Users size={20} className="text-muted" />
                  </div>
                  <span className="card-value">{loading ? '...' : users.length}</span>
                  <span className="card-footer">Accesos corporativos registrados</span>
                </div>

                <div className="card">
                  <div className="card-header">
                    <span className="card-title">API Server</span>
                    <Cpu size={20} className="text-muted" />
                  </div>
                  <span className="card-value" style={{ 
                    color: health?.status === 'OK' ? 'var(--color-success)' : 'var(--color-danger)',
                    fontSize: '20px', fontWeight: '800', margin: '6px 0'
                  }}>
                    {health?.status === 'OK' ? 'ONLINE' : 'OFFLINE'}
                  </span>
                  <span className="card-footer">Servicio backend Node.js (8080)</span>
                </div>
              </div>

              {/* Quick info list: Registered Users */}
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Usuarios del Sistema</span>
                </div>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', padding: '24px' }}>
                            {loading ? 'Cargando usuarios...' : 'No hay usuarios en la base de datos.'}
                          </td>
                        </tr>
                      ) : (
                        users.map(u => (
                          <tr key={u.id}>
                            <td style={{ fontWeight: 600 }}>{u.name}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>
                              <span className={`badge ${u.active ? 'badge-success' : 'badge-danger'}`}>
                                {u.active ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: ITEMS LIST VIEW */}
          {currentTab === 'items' && (
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Equipos de Inventario</span>
                <button onClick={() => setCurrentTab('create')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  <PlusCircle size={14} /> Registrar Item
                </button>
              </div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>ID</th>
                      <th>Título</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th style={{ width: '100px', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', padding: '36px' }}>
                          {loading ? 'Cargando datos...' : 'El inventario está vacío. Comienza agregando un equipo.'}
                        </td>
                      </tr>
                    ) : (
                      items.map(item => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>#{item.id}</td>
                          <td style={{ fontWeight: 600 }}>{item.title}</td>
                          <td>{item.description || 'Sin notas.'}</td>
                          <td>
                            <span className={`badge ${
                              item.status === 'ACTIVE' ? 'badge-success' : 
                              item.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              onClick={() => handleDeleteItem(item.id)}
                              className="btn btn-outline" 
                              style={{ padding: '6px', color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.2)' }}
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CREATE ITEM FORM */}
          {currentTab === 'create' && (
            <div className="panel" style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
              <div className="panel-header">
                <span className="panel-title">Ingresar Nuevo Equipo</span>
              </div>
              <form onSubmit={handleCreateItem} className="form-grid">
                <div className="form-group form-full">
                  <label className="form-label">Nombre del Equipo *</label>
                  <input 
                    type="text" 
                    required 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ej: Computadora Portátil HP, Conector de red..."
                    className="form-control"
                  />
                </div>

                <div className="form-group form-full">
                  <label className="form-label">Descripción / Especificaciones</label>
                  <textarea 
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Detalles adicionales sobre el estado, número de serie o asignación..."
                    rows={4}
                    className="form-control"
                    style={{ resize: 'none' }}
                  />
                </div>

                <div className="form-group form-full">
                  <label className="form-label">Estado Inicial</label>
                  <select 
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="form-control"
                  >
                    <option value="ACTIVE">OPERATIVO / ACTIVO</option>
                    <option value="PENDING">PENDIENTE DE REVISIÓN</option>
                    <option value="FAILED">ROTO / FUERA DE SERVICIO</option>
                  </select>
                </div>

                <div className="form-full" style={{ display: 'flex', justify: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => setCurrentTab('items')} 
                    className="btn btn-outline"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="btn btn-primary"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={14} className="animate-pulse" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Registro'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
