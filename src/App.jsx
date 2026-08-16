import React, { useState } from 'react';
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

export default function App() {
  const [currentRole, setCurrentRole] = useState('public'); // public, client, agent, admin
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedBouquetId, setSelectedBouquetId] = useState(null);

  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [admins, setAdmins] = useState([
    { id: 'adm-1', name: 'Administrateur Principal', phone: '+243 00 00 00 000' }
  ]);
  const [passages, setPassages] = useState(INITIAL_PASSAGES);
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);

  // Active client session (defaults to Kabamba Joseph for demo when switching)
  const [activeClientId, setActiveClientId] = useState('cli-1');
  const [activeAgentId, setActiveAgentId] = useState('agt-1');

  // Auth modal state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

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

  const handleLoginSuccess = (role, formData) => {
    if (formData.name && role === 'client') {
      // New Client registration
      const newClient = {
        id: `cli-${Date.now()}`,
        name: formData.name,
        phone: formData.phone,
        commune: 'Matete',
        quartier: formData.quartier || 'Batandu',
        avenue: formData.avenue || 'Avenue Principale',
        parcelleNo: formData.parcelleNo || 'N° 1',
        bouquetId: 'moyen',
        bouquetName: 'Moyen Bouquet',
        status: 'En attente',
        paymentHistory: []
      };
      setClients([newClient, ...clients]);
      setActiveClientId(newClient.id);
      setCurrentUser(newClient);
    } else {
      if (role === 'client') setCurrentUser(activeClient);
      if (role === 'agent') setCurrentUser(activeAgent);
      if (role === 'admin') setCurrentUser(admins[0]);
    }

    setCurrentRole(role);
  };

  const handleAddAgent = (newAgent) => {
    setAgents([newAgent, ...agents]);
  };

  const handleAddAdmin = (newAdmin) => {
    setAdmins([newAdmin, ...admins]);
  };

  // Handlers for state mutations across roles
  const handleUpdateClient = (updatedData) => {
    setClients(clients.map(c => c.id === activeClientId ? { ...c, ...updatedData } : c));
  };

  const handleAddPayment = (paymentObj) => {
    const newPayment = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...paymentObj,
      status: 'En attente'
    };

    setClients(clients.map(c => {
      if (c.id === activeClientId) {
        return {
          ...c,
          bouquetId: paymentObj.bouquetId,
          bouquetName: paymentObj.bouquetName,
          paymentHistory: [newPayment, ...(c.paymentHistory || [])]
        };
      }
      return c;
    }));
  };

  const handleValidatePayment = (clientId, paymentId) => {
    setClients(clients.map(c => {
      if (c.id === clientId) {
        const updatedHistory = (c.paymentHistory || []).map(p => p.id === paymentId ? { ...p, status: 'Validé' } : p);
        return {
          ...c,
          status: 'Actif',
          subscriptionExpires: '2026-09-30',
          paymentHistory: updatedHistory
        };
      }
      return c;
    }));
  };

  const handleConfirmPassage = (passageId, agentNote) => {
    setPassages(passages.map(p => {
      if (p.id === passageId) {
        return {
          ...p,
          status: 'Ramassé',
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentNote
        };
      }
      return p;
    }));
  };

  const handleRateAgent = (passageId, rating, feedback) => {
    setPassages(passages.map(p => {
      if (p.id === passageId) {
        return {
          ...p,
          clientRating: rating,
          clientFeedback: feedback
        };
      }
      return p;
    }));
  };

  const handleSubmitComplaint = (complaintData) => {
    const newComplaint = {
      id: `rec-${Date.now()}`,
      clientId: activeClient.id,
      clientName: activeClient.name,
      phone: activeClient.phone,
      quartier: activeClient.quartier,
      avenue: `${activeClient.avenue} ${activeClient.parcelleNo}`,
      agentAssigned: 'KAPUKU Alain',
      date: new Date().toISOString().split('T')[0],
      ...complaintData,
      status: 'En cours de traitement'
    };

    setComplaints([newComplaint, ...complaints]);
  };

  const handleResolveComplaint = (complaintId) => {
    setComplaints(complaints.map(c => c.id === complaintId ? { ...c, status: 'Résolu' } : c));
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

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
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
            passages={passages}
            complaints={complaints}
            onValidatePayment={handleValidatePayment}
            onResolveComplaint={handleResolveComplaint}
            onAddAgent={handleAddAgent}
            onAddAdmin={handleAddAdmin}
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
