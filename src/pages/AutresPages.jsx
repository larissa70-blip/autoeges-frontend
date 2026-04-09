// ============================================================
//  Pages Admin : Planning, Examens, Paiements, Moniteurs,
//                Parametres
// ============================================================
import React, { useState, useEffect } from 'react';
import { Badge, Modal, ErreurApi, Chargement } from '../components';
import { examensApi, paiementsApi, planningApi, moniteursApi, elevesApi } from '../api';

/* ======================================================
   PLANNING
   ====================================================== */
const JOURS = ['Lun 31', 'Mar 01', 'Mer 02', 'Jeu 03', 'Ven 04'];
const HEURES = ['08h00', '10h00', '14h00', '16h00'];

export function Planning() {
  const [slots, setSlots]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur]   = useState('');

  useEffect(() => {
    planningApi.lister()
      .then(data => setSlots(data))
      .catch(err => setErreur(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Construire une grille à partir des données API
  function getSlot(jour, heure) {
    // Exemple : jour = 'Lun 31', heure = '08h00'
    const dateMap = {
      'Lun 31': '2025-03-31', 'Mar 01': '2025-04-01',
      'Mer 02': '2025-04-02', 'Jeu 03': '2025-04-03', 'Ven 04': '2025-04-04',
    };
    const heureMap = {
      '08h00': '08:00', '10h00': '10:00', '14h00': '14:00', '16h00': '16:00',
    };
    return slots.find(
      s => s.date_cours === dateMap[jour] && s.heure_debut === heureMap[heure]
    );
  }

  return (
    <div className="page">
      <div className="alerte alerte-succes">
        Planning du 31 mars au 4 avril 2025. Les créneaux libres peuvent être réservés.
      </div>
      {erreur && <ErreurApi message={erreur} />}
      <div className="carte">
        <div className="carte-entete">
          <div className="carte-titre">Planning hebdomadaire</div>
          <div className="flex">
            <span className="tag" style={{ background: '#fff3e0', color: '#7a4a00' }}>Réservé</span>
            <span className="tag" style={{ background: '#f0faf5', color: '#2e7d32' }}>Libre</span>
          </div>
        </div>
        <div className="carte-corps">
          {loading ? <Chargement /> : (
            <div className="planning-grille">
              <div />
              {JOURS.map(j => <div key={j} className="plan-header">{j}</div>)}
              {HEURES.map(h => (
                <React.Fragment key={h}>
                  <div className="plan-heure">{h}</div>
                  {JOURS.map(j => {
                    const slot = getSlot(j, h);
                    return slot ? (
                      <div key={j} className="plan-creneau plan-pris">
                        {slot.eleve_nom}<br />{slot.moniteur_nom}
                      </div>
                    ) : (
                      <div key={j} className="plan-creneau plan-libre">
                        Libre
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   EXAMENS
   ====================================================== */
export function Examens() {
  const [examens, setExamens]   = useState([]);
  const [eleves, setEleves]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [erreur, setErreur]     = useState('');
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState({ eleve_id: '', type: 'Code', date_examen: '' });
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    charger();
  }, []);

  async function charger() {
    try {
      const [e, el] = await Promise.all([examensApi.lister(), elevesApi.lister()]);
      setExamens(e);
      setEleves(el);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function programmer(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await examensApi.programmer(form);
      await charger();
      setModal(false);
      setForm({ eleve_id: '', type: 'Code', date_examen: '' });
    } catch (err) {
      alert('Erreur : ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  const aVenir = examens.filter(e => e.resultat === 'En attente');
  const passes = examens.filter(e => ['Admis', 'Recale'].includes(e.resultat));
  const nbAdmis = passes.filter(e => e.resultat === 'Admis').length;

  return (
    <div className="page">
      <div className="grille-3 mb-20">
        <div className="stat-card"><div className="stat-label">Examens prévus</div><div className="stat-value">{aVenir.length}</div></div>
        <div className="stat-card"><div className="stat-label">Admis</div><div className="stat-value" style={{ color: '#2e7d32' }}>{nbAdmis}</div></div>
        <div className="stat-card"><div className="stat-label">Recalés</div><div className="stat-value" style={{ color: '#CE1126' }}>{passes.length - nbAdmis}</div></div>
      </div>

      {erreur && <ErreurApi message={erreur} />}

      <div className="carte">
        <div className="carte-entete">
          <div className="carte-titre">Prochains examens</div>
          <button className="btn btn-rouge btn-sm" onClick={() => setModal(true)}>+ Programmer</button>
        </div>
        {loading ? <Chargement /> : (
          <table>
            <thead><tr><th>Élève</th><th>Type</th><th>Date</th><th>Moniteur</th><th>Résultat</th></tr></thead>
            <tbody>
              {aVenir.map(e => (
                <tr key={e.id}>
                  <td>{e.eleve_nom}</td><td>{e.type}</td><td>{e.date_examen}</td>
                  <td>{e.moniteur_nom || '—'}</td><td><Badge texte={e.resultat} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="carte">
        <div className="carte-entete"><div className="carte-titre">Résultats récents</div></div>
        <table>
          <thead><tr><th>Élève</th><th>Type</th><th>Date</th><th>Score</th><th>Résultat</th></tr></thead>
          <tbody>
            {passes.map(e => (
              <tr key={e.id}>
                <td>{e.eleve_nom}</td><td>{e.type}</td><td>{e.date_examen}</td>
                <td>{e.score || '—'}</td><td><Badge texte={e.resultat} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal ouvert={modal} onFermer={() => setModal(false)} titre="Programmer un examen">
        <form onSubmit={programmer}>
          <div className="form-groupe">
            <label className="form-label">Élève *</label>
            <select required className="form-input" value={form.eleve_id}
              onChange={e => setForm({ ...form, eleve_id: e.target.value })}>
              <option value="">— Choisir un élève —</option>
              {eleves.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
            </select>
          </div>
          <div className="grille-2">
            <div className="form-groupe">
              <label className="form-label">Type *</label>
              <select className="form-input" value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}>
                <option>Code</option><option>Conduite</option><option>Code blanc</option>
              </select>
            </div>
            <div className="form-groupe">
              <label className="form-label">Date *</label>
              <input type="date" required className="form-input" value={form.date_examen}
                onChange={e => setForm({ ...form, date_examen: e.target.value })} />
            </div>
          </div>
          <div className="modal-pied">
            <button type="submit" className="btn btn-rouge" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Programmer'}
            </button>
            <button type="button" className="btn" onClick={() => setModal(false)}>Annuler</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ======================================================
   PAIEMENTS
   ====================================================== */
export function Paiements() {
  const [paiements, setPaiements] = useState([]);
  const [eleves, setEleves]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erreur, setErreur]       = useState('');
  const [modal, setModal]         = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({ eleve_id: '', montant: '', tranche: '1ere tranche', mode: 'Especes', notes: '' });

  useEffect(() => { charger(); }, []);

  async function charger() {
    try {
      const [p, e] = await Promise.all([paiementsApi.lister(), elevesApi.lister()]);
      setPaiements(p);
      setEleves(e);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function enregistrer(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await paiementsApi.enregistrer(form);
      await charger();
      setModal(false);
      setForm({ eleve_id: '', montant: '', tranche: '1ere tranche', mode: 'Especes', notes: '' });
    } catch (err) {
      alert('Erreur : ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  const totalPercu = paiements.reduce((s, p) => s + Number(p.montant || 0), 0);

  return (
    <div className="page">
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Total perçu</div><div className="stat-value">{totalPercu.toLocaleString()}</div><div className="stat-sub">FCFA</div></div>
        <div className="stat-card"><div className="stat-label">Paiements</div><div className="stat-value">{paiements.filter(p => p.statut === 'Paye').length}</div><div className="stat-sub">soldés</div></div>
        <div className="stat-card"><div className="stat-label">Partiels</div><div className="stat-value" style={{ color: '#e65100' }}>{paiements.filter(p => p.statut === 'Partiel').length}</div></div>
        <div className="stat-card"><div className="stat-label">En retard</div><div className="stat-value" style={{ color: '#CE1126' }}>{paiements.filter(p => p.statut === 'En retard').length}</div></div>
      </div>

      {erreur && <ErreurApi message={erreur} />}

      <div className="carte">
        <div className="carte-entete">
          <div className="carte-titre">Historique des paiements</div>
          <button className="btn btn-vert btn-sm" onClick={() => setModal(true)}>+ Enregistrer</button>
        </div>
        {loading ? <Chargement /> : (
          <table>
            <thead><tr><th>Élève</th><th>Montant</th><th>Tranche</th><th>Date</th><th>Mode</th><th>Statut</th></tr></thead>
            <tbody>
              {paiements.map(p => (
                <tr key={p.id}>
                  <td>{p.eleve_nom}</td>
                  <td>{Number(p.montant).toLocaleString()} FCFA</td>
                  <td>{p.tranche}</td>
                  <td>{p.date_paiement}</td>
                  <td><span className="tag">{p.mode}</span></td>
                  <td><Badge texte={p.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal ouvert={modal} onFermer={() => setModal(false)} titre="Enregistrer un paiement">
        <form onSubmit={enregistrer}>
          <div className="form-groupe">
            <label className="form-label">Élève *</label>
            <select required className="form-input" value={form.eleve_id}
              onChange={e => setForm({ ...form, eleve_id: e.target.value })}>
              <option value="">— Choisir un élève —</option>
              {eleves.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
            </select>
          </div>
          <div className="grille-2">
            <div className="form-groupe">
              <label className="form-label">Montant (FCFA) *</label>
              <input type="number" required className="form-input" placeholder="75000" value={form.montant}
                onChange={e => setForm({ ...form, montant: e.target.value })} />
            </div>
            <div className="form-groupe">
              <label className="form-label">Tranche</label>
              <select className="form-input" value={form.tranche}
                onChange={e => setForm({ ...form, tranche: e.target.value })}>
                <option>1ere tranche</option><option>2eme tranche</option><option>Solde total</option><option>Autre</option>
              </select>
            </div>
          </div>
          <div className="form-groupe">
            <label className="form-label">Mode de paiement</label>
            <select className="form-input" value={form.mode}
              onChange={e => setForm({ ...form, mode: e.target.value })}>
              <option>Especes</option><option>MTN Money</option><option>Orange Money</option><option>Virement</option>
            </select>
          </div>
          <div className="form-groupe">
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={3} placeholder="Remarques éventuelles..."
              value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="modal-pied">
            <button type="submit" className="btn btn-vert" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Confirmer'}
            </button>
            <button type="button" className="btn" onClick={() => setModal(false)}>Annuler</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ======================================================
   MONITEURS
   ====================================================== */
export function Moniteurs() {
  const [moniteurs, setMoniteurs] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erreur, setErreur]       = useState('');

  useEffect(() => {
    moniteursApi.lister()
      .then(data => setMoniteurs(data))
      .catch(err => setErreur(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><Chargement /></div>;

  return (
    <div className="page">
      {erreur && <ErreurApi message={erreur} />}
      <div className="grille-3">
        {moniteurs.map(m => (
          <div className="carte" key={m.id}>
            <div className="carte-corps">
              <div className="flex" style={{ marginBottom: 16 }}>
                <div className="avatar" style={{ width: 48, height: 48, fontSize: 16 }}>
                  {m.prenom[0]}{m.nom[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{m.prenom} {m.nom}</div>
                  <div className="texte-gris texte-petit">Moniteur</div>
                </div>
              </div>
              <div style={{ fontSize: 13, marginBottom: 6 }}>
                <span className="texte-gris">Permis : </span>{m.permis}
              </div>
              <div style={{ fontSize: 13, marginBottom: 6 }}>
                <span className="texte-gris">Élèves actifs : </span><strong>{m.eleves_actifs}</strong>
              </div>
              <div style={{ fontSize: 13, marginBottom: 12 }}>
                <span className="texte-gris">Cours cette semaine : </span><strong>{m.cours_cette_semaine}</strong>
              </div>
              <div className="barre-prog" style={{ marginBottom: 12 }}>
                <div className="barre-fill" style={{ width: `${Math.min(100, Math.round((m.eleves_actifs / 10) * 100))}%` }} />
              </div>
              <Badge texte={m.disponible ? 'Disponible' : 'En congé'} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ======================================================
   MON DOSSIER — Espace élève */
export function Parametres() {
  const [notifs, setNotifs]     = useState({ retard: true, examen: true, sms: false });
  const [sauvegarde, setSauvegarde] = useState(false);
  const [info, setInfo]         = useState({ nom: 'AutoGes', adresse: 'Ange Raphael, Douala', telephone: '+237 651 273 405', email: 'larissa@autoges-douala.cm' });
  const [tarifs, setTarifs]     = useState({ permisB: '150 000', permisA: '80 000', code: '35 000' });

  function enregistrer() {
    setSauvegarde(true);
    setTimeout(() => setSauvegarde(false), 2500);
  }

  return (
    <div className="page">
      {sauvegarde && <div className="alerte alerte-succes">Paramètres enregistrés avec succès.</div>}

      <div className="grille-2">
        <div className="carte">
          <div className="carte-entete"><div className="carte-titre">Informations auto-école</div></div>
          <div className="carte-corps">
            {[['Nom', 'nom'], ['Adresse', 'adresse'], ['Téléphone', 'telephone'], ['Email', 'email']].map(([label, key]) => (
              <div className="form-groupe" key={key}>
                <label className="form-label">{label}</label>
                <input className="form-input" value={info[key]}
                  onChange={e => setInfo({ ...info, [key]: e.target.value })} />
              </div>
            ))}
            <button className="btn btn-rouge" onClick={enregistrer}>Enregistrer</button>
          </div>
        </div>

        <div className="carte">
          <div className="carte-entete"><div className="carte-titre">Tarifs des formations</div></div>
          <div className="carte-corps">
            {[['Permis B (voiture)', 'permisB'], ['Permis A (moto)', 'permisA'], ['Code de la route', 'code']].map(([label, key]) => (
              <div className="form-groupe" key={key}>
                <label className="form-label">{label} (FCFA)</label>
                <input className="form-input" value={tarifs[key]}
                  onChange={e => setTarifs({ ...tarifs, [key]: e.target.value })} />
              </div>
            ))}
            <button className="btn btn-vert" onClick={enregistrer}>Mettre à jour</button>
          </div>
        </div>
      </div>

      <div className="carte">
        <div className="carte-entete"><div className="carte-titre">Notifications automatiques</div></div>
        <div className="carte-corps">
          {[
            ['Rappel paiement en retard (par SMS)', 'retard'],
            ['Rappel examen 48h avant', 'examen'],
            ['Confirmation de leçon par SMS', 'sms'],
          ].map(([label, key]) => (
            <div className="toggle-ligne" key={key}>
              <span>{label}</span>
              <label className="switch">
                <input type="checkbox" checked={notifs[key]}
                  onChange={e => setNotifs({ ...notifs, [key]: e.target.checked })} />
                <span className="switch-piste" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
