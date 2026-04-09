// ============================================================
//  Composants réutilisables — Interface Admin uniquement v2
// ============================================================
import React from 'react';
import { useAuth } from '../context/AuthContext';

// ---- Badge de statut ----
const classeBadge = {
  'Actif':       'badge-vert',  'Admis':      'badge-vert',
  'Paye':        'badge-vert',  'Solde':      'badge-vert',
  'Disponible':  'badge-vert',  'Confirme':   'badge-vert',
  'En cours':    'badge-orange','En attente': 'badge-orange',
  'Partiel':     'badge-orange','Examen':     'badge-bleu',
  'Recale':      'badge-rouge', 'Retard':     'badge-rouge',
  'En retard':   'badge-rouge', 'Annule':     'badge-rouge',
  'Suspendu':    'badge-rouge',
};

export function Badge({ texte }) {
  const cls = classeBadge[texte] || 'badge-gris';
  return <span className={`badge ${cls}`}>{texte}</span>;
}

// ---- Modal ----
export function Modal({ ouvert, onFermer, titre, children, large }) {
  if (!ouvert) return null;
  // Fermer avec Escape
  return (
    <div className="modal-fond" onClick={(e) => { if (e.target === e.currentTarget) onFermer(); }}>
      <div className="modal-boite" style={large ? { width: 600 } : {}}>
        <div className="modal-entete">
          <div className="modal-titre">{titre}</div>
          <button className="modal-fermer" onClick={onFermer} aria-label="Fermer">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---- Sidebar Admin ----
const liens = [
  { groupe: 'Administration', items: [
    { id: 'tableau-bord', label: ' Tableau de bord' },
    { id: 'eleves',       label: ' Élèves' },
    { id: 'planning',     label: ' Planning' },
    { id: 'examens',      label: ' Examens' },
    { id: 'paiements',    label: ' Paiements' },
    { id: 'moniteurs',    label: ' Moniteurs' },
  ]},
  { groupe: 'Réglages', items: [
    { id: 'parametres', label: ' Paramètres' },
  ]},
];

export function Sidebar({ pageCourante, onNaviguer, ouvert }) {
  const { utilisateur, deconnecter } = useAuth();

  return (
    <aside className={`sidebar${ouvert ? ' ouvert' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-row">
          <div className="logo-icon">AG</div>
          <div>
            <div className="logo-name">AutoGes</div>
            <div className="logo-city">, Douala</div>
          </div>
        </div>
        <span className="logo-badge">En activité</span>
      </div>

      {liens.map(groupe => (
        <div className="nav-section" key={groupe.groupe}>
          <div className="nav-section-label">{groupe.groupe}</div>
          {groupe.items.map(item => (
            <div
              key={item.id}
              className={`nav-link${pageCourante === item.id ? ' actif' : ''}`}
              onClick={() => onNaviguer(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onNaviguer(item.id)}
            >
              {item.label}
            </div>
          ))}
        </div>
      ))}

      <div className="sidebar-footer">
        <div className="sidebar-footer-info">
          <div className="avatar" style={{ background: '#CE1126' }}>
            {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div className="sidebar-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {utilisateur?.prenom} {utilisateur?.nom}
            </div>
            <div className="sidebar-user-role">Administrateur</div>
          </div>
        </div>
        <button className="btn btn-sm" style={{ width: '100%' }} onClick={deconnecter}>
           Se déconnecter
        </button>
      </div>
    </aside>
  );
}

// ---- Spinner ----
export function Chargement() {
  return <div className="chargement">Chargement en cours...</div>;
}

// ---- Erreur API ----
export function ErreurApi({ message }) {
  return (
    <div className="erreur-api">
       {message || 'Impossible de charger les données. Vérifiez que le serveur est démarré.'}
    </div>
  );
}
