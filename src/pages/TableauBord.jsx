import React, { useState, useEffect } from 'react';
import { Badge, ErreurApi, Chargement } from '../components';
import { elevesApi } from '../api';

const inscriptionsParMois = [
  { mois: 'Jan', val: 8 }, { mois: 'Fév', val: 12 }, { mois: 'Mar', val: 15 },
  { mois: 'Avr', val: 10 }, { mois: 'Mai', val: 18 }, { mois: 'Jun', val: 14 },
];

const activites = [
  { id: 1, heure: "Aujourd'hui 09h15", texte: "Kamga René — Examen code",    detail: "Admis",                 couleur: '#2e7d32' },
  { id: 2, heure: "Aujourd'hui 08h30", texte: "Paiement reçu",               detail: "Ndiaye Fatou 75 000 F", couleur: '#CE1126' },
  { id: 3, heure: "Hier 16h00",        texte: "Leçon annulée",               detail: "Moniteur indisponible", couleur: '#e65100' },
  { id: 4, heure: "Hier 14h00",        texte: "Nouvelle inscription",        detail: "Mbarga Sylvie",          couleur: '#1565c0' },
];

// Données de secours si le serveur n'est pas encore connecté
const ELEVES_DEMO = [
  { id: 1, nom: 'Kamga',   prenom: 'René',    formation: 'Permis B', heures_faites: 18, heures_max: 20, statut: 'Actif' },
  { id: 2, nom: 'Ndiaye',  prenom: 'Fatou',   formation: 'Permis B', heures_faites: 12, heures_max: 20, statut: 'Actif' },
  { id: 3, nom: 'Mbarga',  prenom: 'Sylvie',  formation: 'Permis A', heures_faites:  4, heures_max: 10, statut: 'En cours' },
  { id: 4, nom: 'Tabi',    prenom: 'Charles', formation: 'Permis B', heures_faites: 20, heures_max: 20, statut: 'Examen' },
];

export default function TableauBord({ onNaviguer }) {
  const [eleves, setEleves]   = useState([]);
  const [stats, setStats]     = useState(null);
  const [erreur, setErreur]   = useState('');
  const [loading, setLoading] = useState(true);

  const max = Math.max(...inscriptionsParMois.map(d => d.val));

  useEffect(() => {
    async function charger() {
      try {
        const [listeEleves, statsData] = await Promise.all([
          elevesApi.lister(),
          elevesApi.stats(),
        ]);
        setEleves(listeEleves);
        setStats(statsData);
      } catch (err) {
        setErreur('Serveur non connecté — affichage des données de démo');
        setEleves(ELEVES_DEMO);
      } finally {
        setLoading(false);
      }
    }
    charger();
  }, []);

  const nbEleves   = stats?.nb_eleves   ?? eleves.length;
  const revenusMois = stats?.revenus_mois
    ? Number(stats.revenus_mois).toLocaleString('fr-FR')
    : '4 200 000';

  return (
    <div className="page">
      {erreur && (
        <div className="alerte alerte-warning" style={{ marginBottom: 16 }}>
          ⚠️ {erreur}
        </div>
      )}

      {/* KPI */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Élèves inscrits</div>
          <div className="stat-value" style={{ color: '#CE1126' }}>{nbEleves}</div>
          <div className="stat-sub"><span className="stat-dot" style={{ background: '#009A44' }} />+3 ce mois</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Heures de conduite</div>
          <div className="stat-value" style={{ color: '#009A44' }}>1 284</div>
          <div className="stat-sub"><span className="stat-dot" style={{ background: '#CE1126' }} />Cette année</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Taux de réussite</div>
          <div className="stat-value">78 %</div>
          <div className="stat-sub"><span className="stat-dot" style={{ background: '#009A44' }} />+5 % vs 2023</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Revenus du mois</div>
          <div className="stat-value" style={{ fontSize: 20 }}>{revenusMois}</div>
          <div className="stat-sub"><span className="stat-dot" style={{ background: '#CE1126' }} />FCFA</div>
        </div>
      </div>

      <div className="grille-2-1">
        {/* Graphique inscriptions */}
        <div className="carte">
          <div className="carte-entete">
            <div className="carte-titre">📈 Inscriptions par mois</div>
            <span className="tag">2025</span>
          </div>
          <div className="carte-corps">
            <div className="graphique">
              {inscriptionsParMois.map((d, i) => (
                <div className="barre-item" key={d.mois}>
                  <span className="barre-num">{d.val}</span>
                  <div
                    className="barre-rect"
                    title={`${d.mois} : ${d.val} inscriptions`}
                    style={{
                      height: `${Math.round(d.val / max * 100)}px`,
                      background: i === inscriptionsParMois.length - 2 ? '#CE1126' : '#1a1a2e',
                    }}
                  />
                  <span className="barre-mois">{d.mois}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div className="carte">
          <div className="carte-entete"><div className="carte-titre">⏱ Activité récente</div></div>
          <div className="carte-corps">
            <div className="timeline">
              {activites.map(a => (
                <div className="tl-item" key={a.id}>
                  <div className="tl-point" style={{ background: a.couleur }} />
                  <div className="tl-heure">{a.heure}</div>
                  <div className="tl-texte">{a.texte} — <strong>{a.detail}</strong></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tableau derniers élèves */}
      <div className="carte">
        <div className="carte-entete">
          <div className="carte-titre">Derniers élèves inscrits</div>
          <button className="btn btn-sm" onClick={() => onNaviguer('eleves')}>Voir tous →</button>
        </div>
        {loading ? <Chargement /> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Élève</th>
                  <th>Formation</th>
                  <th>Progression</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {eleves.slice(0, 5).map(e => {
                  const pct = e.heures_max > 0
                    ? Math.min(100, Math.round(e.heures_faites / e.heures_max * 100))
                    : 0;
                  return (
                    <tr key={e.id}>
                      <td>
                        <div className="flex">
                          <div className="avatar">{e.prenom?.[0]}{e.nom?.[0]}</div>
                          <span>{e.prenom} {e.nom}</span>
                        </div>
                      </td>
                      <td><span className="tag">{e.formation}</span></td>
                      <td style={{ minWidth: 140 }}>
                        <div className="texte-petit texte-gris">
                          {e.heures_max > 0 ? `${e.heures_faites}/${e.heures_max} h (${pct}%)` : '—'}
                        </div>
                        {e.heures_max > 0 && (
                          <div className="barre-prog mt-8">
                            <div className="barre-fill" style={{ width: `${pct}%` }} />
                          </div>
                        )}
                      </td>
                      <td><Badge texte={e.statut} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
