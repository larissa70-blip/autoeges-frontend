// ============================================================
//  Fichier centralisé pour tous les appels API
//  Toutes les fonctions retournent des données JSON
// ============================================================

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Récupérer le token JWT stocké dans localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Construction des headers avec le token
function headers(avecToken = true) {
  const h = { 'Content-Type': 'application/json' };
  if (avecToken) h['Authorization'] = `Bearer ${getToken()}`;
  return h;
}

// Fonction générique pour les requêtes
async function requete(methode, chemin, body = null) {
  const options = {
    method: methode,
    headers: headers(),
  };
  if (body) options.body = JSON.stringify(body);

  const reponse = await fetch(`${BASE_URL}${chemin}`, options);
  const data = await reponse.json();

  if (!reponse.ok) {
    throw new Error(data.message || 'Erreur serveur');
  }
  return data;
}

// ---- AUTHENTIFICATION ----
export const auth = {
  login:  (email, mot_de_passe) =>
    requete('POST', '/auth/login', { email, mot_de_passe }),

  register: (data) =>
    requete('POST', '/auth/register', data),

  profil: () =>
    requete('GET', '/auth/profil'),
};

// ---- ÉLÈVES ----
export const elevesApi = {
  lister:    (statut) => requete('GET', statut ? `/eleves?statut=${statut}` : '/eleves'),
  stats:     ()       => requete('GET', '/eleves/stats'),
  obtenir:   (id)     => requete('GET', `/eleves/${id}`),
  ajouter:   (data)   => requete('POST', '/eleves', data),
  modifier:  (id, data) => requete('PUT', `/eleves/${id}`, data),
  supprimer: (id)     => requete('DELETE', `/eleves/${id}`),
};

// ---- PAIEMENTS ----
export const paiementsApi = {
  lister:      ()      => requete('GET', '/paiements'),
  parEleve:    (id)    => requete('GET', `/paiements/eleve/${id}`),
  enregistrer: (data)  => requete('POST', '/paiements', data),
  supprimer:   (id)    => requete('DELETE', `/paiements/${id}`),
};

// ---- EXAMENS ----
export const examensApi = {
  lister:     ()         => requete('GET', '/examens'),
  programmer: (data)     => requete('POST', '/examens', data),
  mettreAJour:(id, data) => requete('PUT', `/examens/${id}`, data),
};

// ---- PLANNING ----
export const planningApi = {
  lister:    (semaine) => requete('GET', semaine ? `/planning?semaine=${semaine}` : '/planning'),
  reserver:  (data)    => requete('POST', '/planning', data),
  supprimer: (id)      => requete('DELETE', `/planning/${id}`),
};

// ---- MONITEURS ----
export const moniteursApi = {
  lister:  ()     => requete('GET', '/moniteurs'),
  ajouter: (data) => requete('POST', '/moniteurs', data),
};
