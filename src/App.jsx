import React, { useEffect, useState } from "react";
import keycloak from "./utils/KeycloakProvider";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleManualLogin = () => {
    setError(null);
    keycloak
      .login({
        // Usa lo stesso redirect URI dell'URL fornito
        redirectUri:
          "https://allcorespa-staging-unitiva-20197579.dev.odoo.com/auth_oauth/signin",
        // Scope come nell'URL fornito
        scope: "openid profile email",
      })
      .catch((err) => {
        console.error("Errore durante il login manuale:", err);
        setError("Errore durante il login. Riprova.");
      });
  };

  const handleGoToOdoo = () => {
    const odooUrl =
      "https://allcorespa-staging-unitiva-20197579.dev.odoo.com/my/tickets";
    window.location.href = odooUrl;
  };

  useEffect(() => {
    // Controlla se Keycloak è già stato inizializzato
    if (keycloak.authenticated !== undefined) {
      // Keycloak è già inizializzato
      setAuthenticated(keycloak.authenticated);
      setLoading(false);
      // Rimuoviamo il redirect automatico, l'utente sceglierà quando andare a Odoo
      return;
    }

    // Inizializza Keycloak con configurazione basata sull'URL fornito
    keycloak
      .init({
        // Usa check-sso per verificare se l'utente è già autenticato
        onLoad: "check-sso",
        // Usa authorization code flow come nell'URL
        flow: "standard",
        // Disabilita iframe per evitare problemi CSP
        checkLoginIframe: false,
        // Configurazioni per PKCE (come nell'URL)
        pkceMethod: "S256",
        // Usa query mode invece di fragment per compatibilità con Odoo
        responseMode: "query",
        // Abilita logging per debug
        enableLogging: true,
        // Redirect URI che corrisponde a quello nell'URL
        redirectUri:
          "https://allcorespa-staging-unitiva-20197579.dev.odoo.com/auth_oauth/signin",
        // Scope come nell'URL fornito
        scope: "openid profile email",
      })
      .then((auth) => {
        setLoading(false);
        if (auth) {
          setAuthenticated(true);
          console.log("Autenticazione riuscita con Keycloak");
          console.log("Token:", keycloak.token);
          // Rimuoviamo il redirect automatico, l'utente sceglierà quando andare a Odoo
        } else {
          console.log("Utente non autenticato, mostra pulsante di login");
          // Non forzare il login automatico, lascia che l'utente clicchi il pulsante
          setAuthenticated(false);
        }
      })
      .catch((error) => {
        console.error("Errore durante l'inizializzazione di Keycloak:", error);
        setLoading(false);
        setError("Errore di inizializzazione. Prova il login manuale.");
      });
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      {loading ? (
        <div>
          <h2>Caricamento...</h2>
          <p>Inizializzazione dell'autenticazione in corso...</p>
        </div>
      ) : authenticated ? (
        <div>
          <h2>✅ Autenticazione riuscita!</h2>
          <p>Sei stato autenticato con successo tramite Keycloak.</p>
          <p>Token disponibile per l'accesso ai servizi.</p>
          <br />
          <button
            onClick={handleGoToOdoo}
            style={{
              padding: "15px 30px",
              fontSize: "18px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            🚀 Vai a Odoo
          </button>
          <br />
          <br />
          <small style={{ color: "#666" }}>
            Verrai reindirizzato a:
            https://allcorespa-staging-unitiva-20197579.dev.odoo.com/my/tickets
          </small>
        </div>
      ) : (
        <div>
          <h2>Accesso richiesto</h2>
          {error && (
            <div style={{ color: "red", marginBottom: "10px" }}>
              <p>{error}</p>
            </div>
          )}
          <p>È necessario effettuare l'accesso per continuare.</p>
          <button
            onClick={handleManualLogin}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Accedi con Keycloak
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
