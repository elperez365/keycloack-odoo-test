import Keycloak from "keycloak-js";

// Crea un'istanza singleton di Keycloak
let keycloak = null;

const getKeycloakInstance = () => {
  if (!keycloak) {
    keycloak = new Keycloak({
      url: "https://keycloack.allcore.it:8443",
      realm: "CS",
      clientId: "app-test-keycloak",
      clientSecret: "GpgWphvDPcrOmhpQiJKEt4YRk827mn4D",
    });
  }
  return keycloak;
};

export default getKeycloakInstance();

("");
