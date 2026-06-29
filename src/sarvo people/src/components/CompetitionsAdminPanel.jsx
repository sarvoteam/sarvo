import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search, Trophy } from 'lucide-react';
import { competitionApi } from '../apis/competitionApi';
import CompetitionStats from './CompetitionStats';
import CompetitionTable from './CompetitionTable';
import CompetitionDrawer from './CompetitionDrawer';
import CompetitionAdminDetailView from './CompetitionAdminDetailView';

const CompetitionsAdminPanel = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingComp, setEditingComp] = useState(null);
  const [viewingComp, setViewingComp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch competitions on mount
  const loadCompetitions = async () => {
    setIsLoading(true);
    try {
      const data = await competitionApi.getCompetitions();
      setCompetitions(data || []);
    } catch (err) {
      console.error('Failed to load competitions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompetitions();
  }, []);

  useEffect(() => {
    if (id) {
      const found = competitions.find(c => c.id === id);
      if (found) {
        setViewingComp(found);
      } else {
        competitionApi.getCompetitionById(id)
          .then(comp => {
            if (comp) {
              setViewingComp(comp);
            } else {
              navigate('/sarvo-people/competitions', { replace: true });
            }
          })
          .catch(err => {
            console.error('Failed to load competition by ID from route:', err);
            navigate('/sarvo-people/competitions', { replace: true });
          });
      }
    } else {
      setViewingComp(null);
    }
  }, [id, competitions]);

  // Check permissions
  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <div style={{ padding: '30px', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--text-red)' }}>Access Denied</h3>
        <p style={{ color: 'var(--text-muted)' }}>You do not have permission to access the competitions admin configuration.</p>
      </div>
    );
  }

  // Handle Save
  const handleSave = async (formData) => {
    try {
      if (editingComp) {
        // Edit mode
        await competitionApi.updateCompetition(editingComp.id, formData);
      } else {
        // Create mode
        await competitionApi.createCompetition(formData);
      }
      setIsDrawerOpen(false);
      setEditingComp(null);
      loadCompetitions();
    } catch (err) {
      alert(err.message || 'An error occurred while saving.');
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this competition? This action cannot be undone.')) {
      return;
    }
    try {
      await competitionApi.deleteCompetition(id);
      loadCompetitions();
    } catch (err) {
      alert(err.message || 'An error occurred while deleting.');
    }
  };

  // Open drawer for editing
  const handleEditClick = (comp) => {
    setEditingComp(comp);
    setIsDrawerOpen(true);
  };

  // Open drawer for creating
  const handleAddClick = () => {
    setEditingComp(null);
    setIsDrawerOpen(true);
  };

  // Filter competitions
  const filteredCompetitions = competitions.filter((comp) => {
    const matchesStatus = statusFilter === 'all' || comp.status === statusFilter;
    const matchesSearch = 
      comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (viewingComp) {
    return (
      <CompetitionAdminDetailView
        competition={viewingComp}
        onBack={() => {
          navigate('/sarvo-people/competitions');
        }}
      />
    );
  }

  return (
    <div style={{ padding: '30px', height: '100%', overflowY: 'auto' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={24} style={{ color: '#f59e0b' }} />
            Competitions Management
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Create, update, and manage active or past Sarvo engineering challenges and hackathons.
          </p>
        </div>

        <button
          onClick={handleAddClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--active-blue)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 20px',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundImage: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={16} /> Add Competition
        </button>
      </div>

      {/* Stats Section */}
      <CompetitionStats competitions={competitions} />

      {/* Filters & Search Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
        marginBottom: '20px'
      }}>
        {/* Status Filters */}
        <div style={{
          display: 'flex',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '4px',
          boxShadow: 'var(--card-shadow)'
        }}>
          {['all', 'active', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                border: 'none',
                background: statusFilter === status ? 'var(--active-blue)' : 'transparent',
                color: statusFilter === status ? 'white' : 'var(--text-muted)',
                borderRadius: '8px',
                padding: '6px 16px',
                fontSize: '13px',
                fontWeight: 600,
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '300px'
        }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            placeholder="Search competitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--card-bg)',
              color: 'inherit',
              outline: 'none',
              fontSize: '13px'
            }}
          />
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading records...
        </div>
      ) : (
        <CompetitionTable
          competitions={filteredCompetitions}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          onRowClick={(comp) => navigate(`/sarvo-people/competitions/${comp.id}`)}
        />
      )}

      {/* Slide-out Drawer Form */}
      <CompetitionDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingComp(null);
        }}
        competition={editingComp}
        onSave={handleSave}
      />
    </div>
  );
};

export default CompetitionsAdminPanel;
