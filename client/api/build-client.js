import axios from 'axios';

// Configures axios to work on both client and server

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') { 
    // We are on the server!
    // Requests insight k8s to another service must follow this url:
    // http://SERVICENAME.NAMESPACE.svc.cluster.local/normal-route-here

    return axios.create({
      // baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      baseURL: 'https://www.agrohe-dev-ticketing.xyz',
      headers: req.headers
    });
  }
  else {
    // We are on the client!
    return axios.create({
      baseURL: '/'
    });
  }
};

export default buildClient;