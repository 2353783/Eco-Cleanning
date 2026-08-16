import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import ClientDashboard from './components/ClientDashboard';
import AgentDashboard from './components/AgentDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';

import { 
  INITIAL_CLIENTS, 
  INITIAL_AGENTS, 
  INITIAL_PASSAGES, 
  INITIAL_COMPLAINTS 
} from './data/mockData';

import { broadcastStateUpdate, subscribeToRealtimeSync } from './firebase';

export default function App() {
  const [currentRole, setCurrentRole] = useState('public'); // public, client, agent, admin
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedBouquetId, setSelectedBouquetId] = useState(null);

  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [admins, setAdmins] = useState([
    { id: 'adm-1', name: 'Aubin Muzola', phone: '+243983850447', password: '12345678' }
  ]);
  const [passages, setPassages] = useState(INITIAL_PASSAGES);
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);

  // Active client session
  const [activeClientId, setActiveClientId] = useState(null);
  const [activeAgentId, setActiveAgentId] = useState(null);

  // Auth modal state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  // Real-time synchronization across Client, Agent, Admin profiles
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeSync(({ sliceKey, data }) => {
      if (!data) return;
      if (sliceKey === 'clients') setClients(data);
      if (sliceKey === 'agents') setAgents(data);
      if (sliceKey === 'passages') setPassages(data);
      if (sliceKey === 'complaints') setComplaints(data);
    });
    return () => unsubscribe();
  }, []);

  const activeClient = clients.find(c => c.id === activeClientId) || clients[0];
  const activeAgent = agents.find(a => a.id === activeAgentId) || agents[0];

  const handleOpenAuth = (mode = 'login', bouquetId = null) => {
    setAuthModalMode(mode);
    setSelectedBouquetId(bouquetId);
    setIsAuthOpen(true);
  };

  const handleLogout = () => {
    setCurrentRole('public');
    setSelectedBouquetId(null);
    setCurrentUser(null);
  };

  const handleLoginSuccess = (role, formData, onError) => {
    if (formData.name && role === 'client') {
      // New Client registration
      const newClient = {
        id: `cli-${Date.now()}`,
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        ville: formData.ville || 'Kinshasa',
        commune: formData.commune || '',
        quartier: formData.quartier || '',
        avenue: formData.avenue || 'Avenue Principale',
        parcelleNo: formData.parcelleNo || 'N° 1',
        bouquetId: selectedBouquetId || 'moyen',
        bouquetName: selectedBouquetId === 'petit' ? 'Petit Bouquet' : selectedBouquetId === 'grand' ? 'Grand Bouquet' : 'Moyen Bouquet',
        status: 'En attente',
        subscriptionStartDate: null,
        subscriptionExpires: null,
        paymentHistory: []
      };
      const updatedClients = [newClient, ...clients];
      setClients(updatedClients);
      broadcastStateUpdate('clients', updatedClients);
      setActiveClientId(newClient.id);
      setCurrentUser(newClient);
      setCurrentRole('client');
    } else {
      // Login: validate phone + password
      if (role === 'client') {
        const found = clients.find(c => c.phone === formData.phone && c.password === formData.password);
        if (!found) { onError('Téléphone ou mot de passe incorrect.'); return; }
        setActiveClientId(found.id);
        setCurrentUser(found);
      } else if (role === 'agent') {
        const found = agents.find(a => a.phone === formData.phone && a.password === formData.password);
        if (!found) { onError('Téléphone ou mot de passe incorrect.'); return; }
        setActiveAgentId(found.id);
        setCurrentUser(found);
      } else if (role === 'admin') {
        const found = admins.find(a => a.phone === formData.phone && a.password === formData.password);
        if (!found) { onError('Téléphone ou mot de passe incorrect.'); return; }
        setCurrentUser(found);
      }
      setCurrentRole(role);
    }
  };

  const handleAddAgent = (newAgent) => {
    const updatedAgents = [newAgent, ...agents];
    setAgents(updatedAgents);
    broadcastStateUpdate('agents', updatedAgents);
  };

  const handleDeleteAgent = (agentId) => {
    const updatedAgents = agents.filter(a => a.id !== agentId);
    setAgents(updatedAgents);
    broadcastStateUpdate('agents', updatedAgents);
  };

  const handleAddAdmin = (newAdmin) => {
    setAdmins([newAdmin, ...admins]);
  };

  const handleDeleteAdmin = (adminId) => {
    if (admins.length <= 1) {
      alert("Impossible de supprimer le dernier administrateur principal.");
      return;
    }
    setAdmins(admins.filter(a => a.id !== adminId));
  };

  const handleDeleteClient = (clientId) => {
    const updatedClients = clients.filter(c => c.id !== clientId);
    setClients(updatedClients);
    broadcastStateUpdate('clients', updatedClients);
  };

  // Handlers for state mutations across roles with real-time sync
  const handleUpdateClient = (updatedData) => {
    const updatedClients = clients.map(c => c.id === activeClientId ? { ...c, ...updatedData } : c);
    setClients(updatedClients);
    broadcastStateUpdate('clients', updatedClients);
  };

  const handleAddPayment = (paymentObj) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newPayment = {
      id: `pay-${Date.now()}`,
      date: todayStr,
      startDate: null,
      endDate: null,
      ...paymentObj,
      status: 'En attente'
    };

    const updatedClients = clients.map(c => {
      if (c.id === activeClientId) {
        return {
          ...c,
          status: 'En attente de validation Admin',
          bouquetId: paymentObj.bouquetId,
          bouquetName: paymentObj.bouquetName,
          paymentHistory: [newPayment, ...(c.paymentHistory || [])]
        };
      }
      return c;
    });

    setClients(updatedClients);
    broadcastStateUpdate('clients', updatedClients);
  };

  const handleValidatePayment = (clientId, paymentId) => {
    const today = new Date();
    const startDateStr = today.toISOString().split('T')[0];
    
    const endDateObj = new Date(today);
    endDateObj.setDate(endDateObj.getDate() + 30);
    const endDateStr = endDateObj.toISOString().split('T')[0];

    const updatedClients = clients.map(c => {
      if (c.id === clientId) {
        const updatedHistory = (c.paymentHistory || []).map(p => {
          if (p.id === paymentId) {
            return { 
              ...p, 
              status: 'Validé',
              startDate: startDateStr,
              endDate: endDateStr
            };
          }
          return p;
        });

        return {
          ...c,
          status: 'Actif',
          subscriptionStartDate: startDateStr,
          subscriptionExpires: endDateStr,
          paymentHistory: updatedHistory
        };
      }
      return c;
    });

    setClients(updatedClients);
    broadcastStateUpdate('clients', updatedClients);
  };

  const handleConfirmPassage = (passageId, agentNote) => {
    const updatedPassages = passages.map(p => {
      if (p.id === passageId) {
        return {
          ...p,
          status: 'Ramassé',
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentNote
        };
      }
      return p;
    });

    setPassages(updatedPassages);
    broadcastStateUpdate('passages', updatedPassages);
  };

  const handleRateAgent = (passageId, rating, feedback) => {
    const updatedPassages = passages.map(p => {
      if (p.id === passageId) {
        return {
          ...p,
          clientRating: rating,
          clientFeedback: feedback
        };
      }
      return p;
    });

    setPassages(updatedPassages);
    broadcastStateUpdate('passages', updatedPassages);
  };

  const handleSubmitComplaint = (complaintData) => {
    const newComplaint = {
      id: `rec-${Date.now()}`,
      clientId: activeClient?.id || 'cli-1',
      clientName: activeClient?.name || 'Client Eco Clean',
      phone: activeClient?.phone || '',
      quartier: activeClient?.quartier || '',
      avenue: activeClient ? `${activeClient.avenue} ${activeClient.parcelleNo}` : '',
      agentAssigned: 'KAPUKU Alain',
      date: new Date().toISOString().split('T')[0],
      ...complaintData,
      status: 'En cours de traitement'
    };

    const updatedComplaints = [newComplaint, ...complaints];
    setComplaints(updatedComplaints);
    broadcastStateUpdate('complaints', updatedComplaints);
  };

  const handleResolveComplaint = (complaintId) => {
    const updatedComplaints = complaints.map(c => c.id === complaintId ? { ...c, status: 'Résolu' } : c);
    setComplaints(updatedComplaints);
    broadcastStateUpdate('complaints', updatedComplaints);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      
      {/* Top Navbar Header */}
      <Navbar 
        currentUser={currentUser}
        currentRole={currentRole} 
        onLogout={handleLogout}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main View Router with Animated Page Transition */}
      <main key={currentRole} className="page-transition-enter" style={{ flex: 1 }}>
        {currentRole === 'public' && (
          <LandingPage 
            onSelectRole={setCurrentRole} 
            onOpenAuth={handleOpenAuth}
            passages={passages}
          />
        )}

        {currentRole === 'client' && (
          <ClientDashboard 
            client={activeClient}
            onUpdateClient={handleUpdateClient}
            passages={passages}
            onAddPayment={handleAddPayment}
            onRateAgent={handleRateAgent}
            onSubmitComplaint={handleSubmitComplaint}
          />
        )}

        {currentRole === 'agent' && (
          <AgentDashboard 
            agent={activeAgent}
            passages={passages}
            onConfirmPassage={handleConfirmPassage}
          />
        )}

        {currentRole === 'admin' && (
          <AdminDashboard 
            clients={clients}
            agents={agents}
            admins={admins}
            passages={passages}
            complaints={complaints}
            onValidatePayment={handleValidatePayment}
            onResolveComplaint={handleResolveComplaint}
            onAddAgent={handleAddAgent}
            onAddAdmin={handleAddAdmin}
            onDeleteClient={handleDeleteClient}
            onDeleteAgent={handleDeleteAgent}
            onDeleteAdmin={handleDeleteAdmin}
          />
        )}
      </main>

      {/* Modal Authentication */}
      <AuthModal 
        isOpen={isAuthOpen}
        mode={authModalMode}
        selectedBouquetId={selectedBouquetId}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}

