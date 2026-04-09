import React, { useState, useEffect } from 'react';
import { Badge, Modal, ErreurApi, Chargement } from '../components';
import { elevesApi, moniteursApi } from '../api';

export default function Eleves() {
  const [eleves, setEleves]       = useState([]);
  const [moniteurs, setMoniteurs] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [loading, setLoading]     = useState(true);
  const [erreur, setErreur]       = useState('');
  const [dossier, setDossier]     = useState(null);
  const [modalInscription, setModalInscription] = useState(false);
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', ville: '', formation: 'Permis B', moniteur_id: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    chargerDonnees();
  }, []);

  async function chargerDonnees() {
    try {
      const [listeEleves, listeMoniteurs] = await Promise.all([
        elevesApi.lister(),
        moniteursApi.lister(),
      ]);
      setEleves(listeEleves);
      setMoniteurs(listeMoniteurs);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function ajouterEleve(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await elevesApi.ajouter(form);
      await chargerDonnees();
      setModalInscription(false);
      setForm({ nom: '', prenom: '', telephone: '', ville: '', formation: 'Permis B', moniteur_id: '' });
    } catch (err) {
      alert('Erreur : ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  const elevesFiltres = eleves.filter(e =>
    `${e.prenom} ${e.nom}`.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="page">
      <div className="flex mb-20" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <input className="form-input" style={{ maxWidth: 300 }}
          placeholder="Rechercher un élève..." value={recherche}
          onChange={e => setRecherche(e.target.value)} />
        <button className="btn btn-rouge" onClick={() => setModalInscription(true)}>
          + Inscrire un élève
        </button>
      </div>

      {erreur && <ErreurApi message={erreur} />}
      {loading ? <Chargement /> : (
        <div className="carte">
          <table>
            <thead>
              <tr><th>N°</th><th>Nom</th><th>Formation</th><th>Heures</th><th>Paiement</th><th>Statut</th><th>Action</th></tr>
            </thead>
            <tbody>
              {elevesFiltres.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#aaa' }}>Aucun élève trouvé</td></tr>
              ) : elevesFiltres.map(e => (
                <tr key={e.id}>
                  <td className="texte-gris">{String(e.id).padStart(3, '0')}</td>
                  <td>
                    <div className="flex">
                      <div className="avatar">{e.prenom?.[0]}{e.nom?.[0]}</div>
                      {e.prenom} {e.nom}
                    </div>
                  </td>
                  <td>{e.formation}</td>
                  <td>{e.heures_max > 0 ? `${e.heures_faites}/${e.heures_max}` : '—'}</td>
                  <td>
                    <Badge texte={
                      e.total_verse >= e.total_formation ? 'Solde' :
                      e.total_verse > 0 ? 'Partiel' : 'Retard'
                    } />
                  </td>
                  <td><Badge texte={e.statut} /></td>
                  <td><button className="btn btn-sm" onClick={() => setDossier(e)}>Dossier</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Inscription */}
      <Modal ouvert={modalInscription} onFermer={() => setModalInscription(false)} titre="Inscrire un élève">
        <form onSubmit={ajouterEleve}>
          <div className="grille-2">
            <div className="form-groupe">
              <label className="form-label">Prénom *</label>
              <input required className="form-input" placeholder="Jean" value={form.prenom}
                onChange={e => setForm({ ...form, prenom: e.target.value })} />
            </div>
            <div className="form-groupe">
              <label className="form-label">Nom *</label>
              <input required className="form-input" placeholder="Kamga" value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })} />
            </div>
          </div>
          <div className="grille-2">
            <div className="form-groupe">
              <label className="form-label">Téléphone</label>
              <input className="form-input" placeholder="+237 6XX XXX XXX" value={form.telephone}
                onChange={e => setForm({ ...form, telephone: e.target.value })} />
            </div>
            <div className="form-groupe">
              <label className="form-label">Ville</label>
              <input className="form-input" placeholder="Douala, Akwa" value={form.ville}
                onChange={e => setForm({ ...form, ville: e.target.value })} />
            </div>
          </div>
          <div className="grille-2">
            <div className="form-groupe">
              <label className="form-label">Formation *</label>
              <select className="form-input" value={form.formation}
                onChange={e => setForm({ ...form, formation: e.target.value })}>
                <option>Permis B</option>
                <option>Permis A</option>
                <option>Code</option>
              </select>
            </div>
            <div className="form-groupe">
              <label className="form-label">Moniteur</label>
              <select className="form-input" value={form.moniteur_id}
                onChange={e => setForm({ ...form, moniteur_id: e.target.value })}>
                <option value="">— Sélectionner —</option>
                {moniteurs.map(m => (
                  <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-pied">
            <button type="submit" className="btn btn-rouge" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button type="button" className="btn" onClick={() => setModalInscription(false)}>Annuler</button>
          </div>
        </form>
      </Modal>

      {/* Modal Dossier */}
      {dossier && (
        <Modal ouvert={!!dossier} onFermer={() => setDossier(null)} titre={`Dossier — ${dossier.prenom} ${dossier.nom}`}>
          <div className="grille-2" style={{ fontSize: 13, marginBottom: 16 }}>
            <div><span className="texte-gris">Formation</span><div><strong>{dossier.formation}</strong></div></div>
            <div><span className="texte-gris">Moniteur</span><div>{dossier.moniteur_nom || '—'}</div></div>
            <div><span className="texte-gris">Téléphone</span><div>{dossier.telephone || '—'}</div></div>
            <div><span className="texte-gris">Ville</span><div>{dossier.ville || '—'}</div></div>
          </div>
          {dossier.heures_max > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div className="flex" style={{ justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>Heures de conduite</span><span>{dossier.heures_faites}/{dossier.heures_max} h</span>
              </div>
              <div className="barre-prog">
                <div className="barre-fill" style={{ width: `${Math.round(dossier.heures_faites / dossier.heures_max * 100)}%` }} />
              </div>
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <div className="flex" style={{ justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span>Paiement</span>
              <span>{Number(dossier.total_verse || 0).toLocaleString()} / {Number(dossier.total_formation || 0).toLocaleString()} FCFA</span>
            </div>
            <div className="barre-prog">
              <div className="barre-fill" style={{
                width: dossier.total_formation > 0 ? `${Math.round(dossier.total_verse / dossier.total_formation * 100)}%` : '0%',
                background: dossier.total_verse >= dossier.total_formation ? '#2e7d32' : '#CE1126',
              }} />
            </div>
          </div>
          <div className="modal-pied">
            <button className="btn" onClick={() => setDossier(null)}>Fermer</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
