import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../api';

export default function Connexion() {
  const { connecter } = useAuth();

  const [form, setForm]       = useState({ email: '', mot_de_passe: '' });
  const [erreur, setErreur]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setLoading(true);

    try {
      const data = await auth.login(form.email, form.mot_de_passe);
      connecter(data.token, data.utilisateur);
    } catch (err) {
      setErreur(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Logo + titre */}
        <div style={styles.entete}>
          <div style={styles.logoIcon}>AE</div>
          <h1 style={styles.titre}>AutoÉcole La Réussite</h1>
          <p style={styles.sousTitre}>Douala, Cameroun </p>
          <div style={styles.adminBadge}>Interface Administrateur</div>
        </div>

        {/* Carte de connexion */}
        <div style={styles.carte}>
          <h2 style={styles.cartetitre}>Connexion Admin</h2>

          {erreur && <div style={styles.alerte}>{erreur}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.groupe}>
              <label style={styles.label}>Adresse email</label>
              <input
                type="email"
                required
                style={styles.input}
                placeholder="admin@autoecole.cm"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div style={styles.groupe}>
              <label style={styles.label}>Mot de passe</label>
              <input
                type="password"
                required
                style={styles.input}
                placeholder="Votre mot de passe"
                value={form.mot_de_passe}
                onChange={(e) => setForm({ ...form, mot_de_passe: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.btnConnexion, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <div style={styles.infoSection}>
            <p style={styles.infoTexte}>
               Accès réservé aux administrateurs autorisés
            </p>
          </div>
        </div>

        <p style={styles.footer}>
          © 2025 AutoÉcole La Réussite — Douala
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    width: '100%',
    maxWidth: '420px',
  },
  entete: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logoIcon: {
    width: '70px',
    height: '70px',
    borderRadius: '18px',
    background: '#CE1126',
    color: '#fff',
    fontSize: '26px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px',
  },
  titre: {
    color: '#fff',
    fontSize: '22px',
    fontWeight: '600',
    margin: '0 0 4px',
  },
  sousTitre: {
    color: '#aaa',
    fontSize: '14px',
    margin: '0 0 12px',
  },
  adminBadge: {
    display: 'inline-block',
    background: 'rgba(206, 17, 38, 0.25)',
    border: '1px solid rgba(206, 17, 38, 0.5)',
    color: '#ff6b7a',
    padding: '4px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  carte: {
    background: '#fff',
    borderRadius: '14px',
    padding: '32px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  cartetitre: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#111',
  },
  alerte: {
    background: '#ffebee',
    color: '#c62828',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
    borderLeft: '3px solid #c62828',
  },
  groupe: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: '#555',
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  },
  btnConnexion: {
    width: '100%',
    padding: '12px',
    background: '#CE1126',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginTop: '4px',
  },
  infoSection: {
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #f0f0f0',
    textAlign: 'center',
  },
  infoTexte: {
    fontSize: '12px',
    color: '#999',
    margin: 0,
  },
  footer: {
    textAlign: 'center',
    color: '#666',
    fontSize: '12px',
    marginTop: '20px',
  },
};
