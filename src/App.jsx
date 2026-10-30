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
  INITIAL_COMPLAINTS,
  INITIAL_ADMINS
} from './data/mockData';

import { 
  broadcastStateUpdate, 
  subscribeToRealtimeSync,
  fetchServerData,
  getStoredData,
  setStoredData
} from './firebase';

const normalizePhone = (p) => {
  if (!p) return '';
  let str = String(p).replace(/[\s().-]/g, '');
  str = str.replace(/^(\+243|00243|\+242|00242)/, '');
  if (str.startsWith('0')) {
    str = str.substring(1);
  }
  return str;
};

export default function App() {
  const [currentRole, setCurrentRole] = useState(() => getStoredData('current_role', 'public'));
  const [currentUser, setCurrentUser] = useState(() => getStoredData('current_user', null));
  const [selectedBouquetId, setSelectedBouquetId] = useState(null);

  const [clients, setClients] = useState(() => getStoredData('clients', INITIAL_CLIENTS));
  const [agents, setAgents] = useState(() => getStoredData('agents', INITIAL_AGENTS));
  const [admins, setAdmins] = useState(() => getStoredData('admins', INITIAL_ADMINS));
  const [passages, setPassages] = useState(() => getStoredData('passages', INITIAL_PASSAGES));
  const [complaints, setComplaints] = useState(() => getStoredData('complaints', INITIAL_COMPLAINTS));

  // Active client & agent session IDs
  const [activeClientId, setActiveClientId] = useState(() => getStoredData('active_client_id', null));
  const [activeAgentId, setActiveAgentId] = useState(() => getStoredData('active_agent_id', null));

  // Auth modal state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  // Real-time synchronization across Client, Agent, Admin profiles and browser tabs
  useEffect(() => {
    // 1. Charger immédiatement les données les plus fraîches du serveur dès l'ouverture de l'application
    fetchServerData().then(db => {
      if (db) {
        if (Array.isArray(db.clients)) setClients(db.clients);
        if (Array.isArray(db.agents)) setAgents(db.agents);
        if (Array.isArray(db.admins)) setAdmins(db.admins);
        if (Array.isArray(db.passages)) setPassages(db.passages);
        if (Array.isArray(db.complaints)) setComplaints(db.complaints);
      }
    });

    const unsubscribe = subscribeToRealtimeSync(({ sliceKey, data }) => {
      if (!data) return;
      if (sliceKey === 'clients') {
        setClients(data);
        if (activeClientId) {
          const fresh = data.find(c => c.id === activeClientId);
          if (fresh) {
            setCurrentUser(fresh);
            setStoredData('current_user', fresh);
          }
        }
      }
      if (sliceKey === 'agents') {
        setAgents(data);
        if (activeAgentId) {
          const fresh = data.find(a => a.id === activeAgentId);
          if (fresh) {
            setCurrentUser(fresh);
            setStoredData('current_user', fresh);
          }
        }
      }
      if (sliceKey === 'admins') {
        setAdmins(data);
      }
      if (sliceKey === 'passages') {
        setPassages(data);
      }
      if (sliceKey === 'complaints') {
        setComplaints(data);
      }
    });
    return () => unsubscribe();
  }, [activeClientId, activeAgentId]);

  const activeClient = clients.find(c => c.id === activeClientId) || currentUser || clients[0];
  const activeAgent = agents.find(a => a.id === activeAgentId) || currentUser || agents[0];

  useEffect(() => {
    if (currentRole) {
      setStoredData('current_role', currentRole);
    }
  }, [currentRole]);

  const handleSetRole = (role) => {
    setCurrentRole(role);
    setStoredData('current_role', role);
  };

  const handleOpenAuth = (mode = 'login', bouquetId = null) => {
    setAuthModalMode(mode);
    setSelectedBouquetId(bouquetId);
    setIsAuthOpen(true);
  };

  const handleLogout = () => {
    handleSetRole('public');
    setCurrentUser(null);
    setStoredData('current_user', null);
    setActiveClientId(null);
    setStoredData('active_client_id', null);
    setActiveAgentId(null);
    setStoredData('active_agent_id', null);
    setSelectedBouquetId(null);
  };

  const handleLoginSuccess = async (role, formData, onError) => {
    // ─── INSCRIPTION client ───────────────────────────────────────────
    if (role === 'register') {
      let baseClients = clients;
      const freshDb = await fetchServerData();
      if (freshDb && Array.isArray(freshDb.clients)) baseClients = freshDb.clients;

      const newClient = {
        id: `cli-${Date.now()}`,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
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

      const updatedClients = [newClient, ...baseClients.filter(c => c.id !== newClient.id)];
      setClients(updatedClients);
      await broadcastStateUpdate('clients', updatedClients);

      setActiveClientId(newClient.id);
      setStoredData('active_client_id', newClient.id);
      setCurrentUser(newClient);
      setStoredData('current_user', newClient);
      setCurrentRole('client');
      setStoredData('current_role', 'client');
      setIsAuthOpen(false);
      return;
    }

    // ─── CONNEXION automatique : chercher dans client → agent → admin ─
    const cleanPhone = normalizePhone(formData.phone);
    const rawPhone = formData.phone ? formData.phone.trim() : '';
    const pwd = formData.password;

    const matchPhone = (stored) =>
      normalizePhone(stored) === cleanPhone || stored?.trim() === rawPhone;

    // Charger les données fraîches du serveur une seule fois
    let freshDb = null;
    const tryFresh = async () => {
      if (!freshDb) freshDb = await fetchServerData();
      return freshDb;
    };

    // 1. Client ?
    let foundClient = clients.find(c => matchPhone(c.phone) && c.password === pwd);
    if (!foundClient) {
      const db = await tryFresh();
      if (db?.clients) { setClients(db.clients); foundClient = db.clients.find(c => matchPhone(c.phone) && c.password === pwd); }
    }
    if (foundClient) {
      setActiveClientId(foundClient.id);
      setStoredData('active_client_id', foundClient.id);
      setCurrentUser(foundClient);
      setStoredData('current_user', foundClient);
      setCurrentRole('client');
      setStoredData('current_role', 'client');
      setIsAuthOpen(false);
      return;
    }

    // 2. Agent ?
    let foundAgent = agents.find(a => matchPhone(a.phone) && a.password === pwd);
    if (!foundAgent) {
      const db = await tryFresh();
      if (db?.agents) { setAgents(db.agents); foundAgent = db.agents.find(a => matchPhone(a.phone) && a.password === pwd); }
    }
    if (foundAgent) {
      setActiveAgentId(foundAgent.id);
      setStoredData('active_agent_id', foundAgent.id);
      setCurrentUser(foundAgent);
      setStoredData('current_user', foundAgent);
      setCurrentRole('agent');
      setStoredData('current_role', 'agent');
      setIsAuthOpen(false);
      return;
    }

    // 3. Admin ?
    let foundAdmin = admins.find(a => matchPhone(a.phone) && a.password === pwd);
    if (!foundAdmin) {
      const db = await tryFresh();
      if (db?.admins) { setAdmins(db.admins); foundAdmin = db.admins.find(a => matchPhone(a.phone) && a.password === pwd); }
    }
    if (foundAdmin) {
      setCurrentUser(foundAdmin);
      setStoredData('current_user', foundAdmin);
      setCurrentRole('admin');
      setStoredData('current_role', 'admin');
      setIsAuthOpen(false);
      return;
    }

    // Aucun compte trouvé
    onError('Numéro de téléphone ou mot de passe incorrect. Vérifiez vos informations.');
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
    const updatedAdmins = [newAdmin, ...admins];
    setAdmins(updatedAdmins);
    broadcastStateUpdate('admins', updatedAdmins);
  };

  const handleDeleteAdmin = (adminId) => {
    if (admins.length <= 1) {
      alert("Impossible de supprimer le dernier administrateur principal.");
      return;
    }
    const updatedAdmins = admins.filter(a => a.id !== adminId);
    setAdmins(updatedAdmins);
    broadcastStateUpdate('admins', updatedAdmins);
  };

  const handleDeleteClient = (clientId) => {
    const updatedClients = clients.filter(c => c.id !== clientId);
    setClients(updatedClients);
    broadcastStateUpdate('clients', updatedClients);
  };

  // Handlers for state mutations across roles with real-time sync & persistent storage
  const handleUpdateClient = (updatedData) => {
    const targetId = activeClientId || currentUser?.id;
    const updatedClients = clients.map(c => c.id === targetId ? { ...c, ...updatedData } : c);
    setClients(updatedClients);
    broadcastStateUpdate('clients', updatedClients);

    const updatedUser = { ...(currentUser || {}), ...updatedData };
    setCurrentUser(updatedUser);
    setStoredData('current_user', updatedUser);
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

    const targetId = activeClientId || currentUser?.id;
    const updatedClients = clients.map(c => {
      if (c.id === targetId) {
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

    const targetClient = clients.find(c => c.id === clientId);

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

    // Auto-create upcoming passage for this client if none active
    if (targetClient) {
      const hasUpcoming = passages.some(p => p.clientId === clientId && p.status === 'Planifié');
      if (!hasUpcoming) {
        const assignedAgent = agents.find(a => 
          a.quartiersAssigned && (
            a.quartiersAssigned.includes(targetClient.commune) ||
            a.quartiersAssigned.includes(targetClient.quartier) ||
            a.quartiersAssigned.includes(targetClient.ville)
          )
        ) || agents[0];

        const newPassage = {
          id: `pas-${Date.now()}`,
          clientId: targetClient.id,
          clientName: targetClient.name,
          ville: targetClient.ville || 'Kinshasa',
          commune: targetClient.commune || 'Commune',
          quartier: targetClient.quartier || 'Quartier',
          avenue: targetClient.avenue || 'Avenue',
          parcelleNo: targetClient.parcelleNo || 'N° 1',
          agentId: assignedAgent ? assignedAgent.id : 'agt-1',
          agentName: assignedAgent ? assignedAgent.name : 'KAPUKU Alain',
          tricycleNo: assignedAgent ? assignedAgent.tricycleNo : 'Tricycle EcoClean #01',
          date: startDateStr,
          timeSlot: '08:00 - 11:30',
          status: 'Planifié',
          completedAt: null,
          agentNote: null,
          clientRating: null,
          clientFeedback: null
        };
        const updatedPassages = [newPassage, ...passages];
        setPassages(updatedPassages);
        broadcastStateUpdate('passages', updatedPassages);
      }
    }
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
    let affectedAgentId = null;
    const updatedPassages = passages.map(p => {
      if (p.id === passageId) {
        affectedAgentId = p.agentId;
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

    if (affectedAgentId) {
      const updatedAgents = agents.map(a => {
        if (a.id === affectedAgentId) {
          const currentCount = a.ratingsCount || 0;
          const currentAvg = a.ratingAvg || 5.0;
          const newCount = currentCount + 1;
          const newAvg = Number(((currentAvg * currentCount + rating) / newCount).toFixed(1));
          return { ...a, ratingAvg: newAvg, ratingsCount: newCount };
        }
        return a;
      });
      setAgents(updatedAgents);
      broadcastStateUpdate('agents', updatedAgents);
    }
  };

  const handleSubmitComplaint = (complaintData) => {
    const curClient = activeClient || currentUser;
    const newComplaint = {
      id: `rec-${Date.now()}`,
      clientId: curClient?.id || 'cli-1',
      clientName: curClient?.name || 'Client Eco Clean',
      phone: curClient?.phone || '',
      quartier: curClient?.quartier || '',
      avenue: curClient ? `${curClient.avenue} ${curClient.parcelleNo}` : '',
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
            onSelectRole={handleSetRole} 
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
