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
        // Redirect alla tua app React invece che a Odoo
        redirectUri: window.location.origin,
      })
      .catch((err) => {
        console.error("Errore durante il login manuale:", err);
        setError("Errore durante il login. Riprova.");
      });
  };

  const handleGoToOdoo = async () => {
    const odooUrl =
      "https://allcorespa-staging-unitiva-20197579.dev.odoo.com/my/tickets";

    try {
      // Aggiorna il token se necessario
      await keycloak.updateToken(30);

      if (keycloak.token) {
        console.log("Token disponibile per SSO:", keycloak.token);

        // Metodo più robusto: usa l'endpoint OAuth di Odoo per l'autenticazione automatica
        const odooAuthUrl =
          "https://allcorespa-staging-unitiva-20197579.dev.odoo.com/auth_oauth/signin";
        const authParams = new URLSearchParams({
          access_token: keycloak.token,
          token_type: "Bearer",
          state: btoa(odooUrl), // Codifica l'URL di destinazione
        });

        window.open(`${odooAuthUrl}?${authParams.toString()}`, "_blank");
      } else {
        console.warn("Nessun token disponibile, apertura normale");
        window.open(odooUrl, "_blank");
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento del token:", error);
      window.open(odooUrl, "_blank");
    }
  };

  // Metodo alternativo per test
  const handleGoToOdooAlternative = async () => {
    const odooUrl =
      "https://allcorespa-staging-unitiva-20197579.dev.odoo.com/my/tickets";

    try {
      await keycloak.updateToken(30);

      if (keycloak.token) {
        // Prova con il token direttamente nell'URL della pagina target
        const urlWithToken = `${odooUrl}?access_token=${encodeURIComponent(
          keycloak.token
        )}`;
        window.open(urlWithToken, "_blank");
      } else {
        window.open(odooUrl, "_blank");
      }
    } catch (error) {
      console.error("Errore:", error);
      window.open(odooUrl, "_blank");
    }
  };

  const handleLogout = () => {
    keycloak.logout({
      redirectUri: window.location.origin,
    });
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

    // Inizializza Keycloak con configurazione minimale
    keycloak
      .init({
        // Usa check-sso per verificare se l'utente è già autenticato
        onLoad: "check-sso",
        // Disabilita iframe per evitare problemi CSP
        checkLoginIframe: false,
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
          {keycloak.tokenParsed && (
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "10px",
                margin: "10px 0",
                borderRadius: "5px",
              }}
            >
              <small>
                <strong>Utente:</strong>{" "}
                {keycloak.tokenParsed.preferred_username ||
                  keycloak.tokenParsed.sub}
                <br />
                <strong>Email:</strong> {keycloak.tokenParsed.email}
                <br />
                <strong>Token valido fino:</strong>{" "}
                {new Date(keycloak.tokenParsed.exp * 1000).toLocaleString()}
              </small>
            </div>
          )}
          <br />
          <div style={{ marginBottom: "20px" }}>
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
                marginRight: "10px",
              }}
            >
              🚀 Accedi a Odoo (OAuth)
            </button>
            <button
              onClick={handleGoToOdooAlternative}
              style={{
                padding: "15px 30px",
                fontSize: "18px",
                backgroundColor: "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                marginRight: "10px",
              }}
            >
              🔗 Accedi a Odoo (Token)
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: "15px 30px",
                fontSize: "18px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              🚪 Logout
            </button>
          </div>
          <small style={{ color: "#666" }}>
            Prova entrambi i metodi per vedere quale funziona meglio con la tua
            configurazione Odoo
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
