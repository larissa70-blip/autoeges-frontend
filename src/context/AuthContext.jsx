import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user  = localStorage.getItem('utilisateur');

    if (token && user) {
      try {
        const parsed = JSON.parse(user);
        // Sécurité : s'assurer que seuls les admins restent connectés
        if (parsed.role === 'admin') {
          setUtilisateur(parsed);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('utilisateur');
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('utilisateur');
      }
    }
    setChargement(false);
  }, []);

  function connecter(token, user) {
    // Bloquer tout accès si ce n'est pas un admin
    if (user.role !== 'admin') {
      throw new Error('Accès réservé aux administrateurs');
    }
    localStorage.setItem('token', token);
    localStorage.setItem('utilisateur', JSON.stringify(user));
    setUtilisateur(user);
  }

  function deconnecter() {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    setUtilisateur(null);
  }

  return (
    <AuthContext.Provider value={{ utilisateur, connecter, deconnecter, chargement }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
