import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Connexion from './pages/Connexion';
import TableauBord from './pages/TableauBord';
import Eleves from './pages/Eleves';
import { Sidebar, Modal } from './components';
import {
  Planning, Examens, Paiements,
  Moniteurs, Parametres,
} from './pages/AutresPages';

const TITRES = {
  'tableau-bord': '📊 Tableau de bord',
  'eleves':       '👥 Gestion des élèves',
  'planning':     '📅 Planning hebdomadaire',
  'examens':      '📝 Examens',
  'paiements':    '💰 Paiements',
  'moniteurs':    '🚗 Moniteurs',
  'parametres':   '⚙️ Paramètres',
};

const notifData = [
  { id: 1, titre: 'Paiement en retard', texte: 'Tabi Charles — 2ème tranche impayée', couleur: '#CE1126' },
  { id: 2, titre: 'Examen dans 2 jours', texte: 'Tabi Charles — Conduite le 05/04', couleur: '#e65100' },
  { id: 3, titre: 'Nouvelle inscription', texte: 'Mbarga Sylvie — Permis A', couleur: '#009A44' },
];

function AppContenu() {
  const { utilisateur, chargement } = useAuth();
  const [page, setPage]             = useState('tableau-bord');
  const [notifModal, setNotifModal] = useState(false);
  const [sidebarOuverte, setSidebarOuverte] = useState(false);

  if (chargement) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#f5f5f0', fontSize: 14, color: '#888',
      }}>
        <div className="chargement">Chargement...</div>
      </div>
    );
  }

  if (!utilisateur || utilisateur.role !== 'admin') {
    return <Connexion />;
  }

  function naviguer(id) {
    setPage(id);
    setSidebarOuverte(false); // fermer sidebar sur mobile après navigation
  }

  function afficherPage() {
    switch (page) {
      case 'tableau-bord': return <TableauBord onNaviguer={naviguer} />;
      case 'eleves':       return <Eleves />;
      case 'planning':     return <Planning />;
      case 'examens':      return <Examens />;
      case 'paiements':    return <Paiements />;
      case 'moniteurs':    return <Moniteurs />;
      case 'parametres':   return <Parametres />;
      default:             return <TableauBord onNaviguer={naviguer} />;
    }
  }

  return (
    <div className="app-layout">
      {/* Overlay mobile */}
      <div
        className={`sidebar-overlay${sidebarOuverte ? ' ouvert' : ''}`}
        onClick={() => setSidebarOuverte(false)}
      />

      <Sidebar
        pageCourante={page}
        onNaviguer={naviguer}
        ouvert={sidebarOuverte}
      />

      <div className="main">
        <div className="topbar">
          {/* Bouton hamburger — visible seulement sur mobile */}
          <button className="btn-menu" onClick={() => setSidebarOuverte(v => !v)}>
            ☰
          </button>

          <div className="topbar-title">{TITRES[page]}</div>

          <div className="topbar-right">
            <button
              className="btn"
              onClick={() => setNotifModal(true)}
              style={{ position: 'relative', padding: '7px 14px' }}
            >
              🔔
              <span className="notif-point" />
            </button>

            <button className="btn btn-rouge" onClick={() => naviguer('eleves')}>
              + Nouvel élève
            </button>
          </div>
        </div>

        {afficherPage()}
      </div>

      <Modal ouvert={notifModal} onFermer={() => setNotifModal(false)} titre="🔔 Notifications">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifData.map(n => (
            <div key={n.id} style={{
              padding: '12px 14px', background: '#fafafa',
              borderRadius: 8, borderLeft: `3px solid ${n.couleur}`,
            }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{n.titre}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>{n.texte}</div>
            </div>
          ))}
        </div>
        <div className="modal-pied">
          <button className="btn" onClick={() => setNotifModal(false)}>Fermer</button>
        </div>
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContenu />
    </AuthProvider>
  );
}
