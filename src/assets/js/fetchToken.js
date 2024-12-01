import { useEffect, useState } from 'react';
import axios from 'axios'; // Import axios

// Import env var
import ENV from "../../../env.js";
console.log('ENV', ENV);
console.log('ENV.API_URL', ENV.API_URL);



const useFetchToken = () => {
  const [token, setToken] = useState(null);
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const fetchToken = () => {
      let tokenToValidate;

      if (!ENV.isProduction) {
        console.log("Running development");
        tokenToValidate = ENV.token;
        console.log("tokenToValidate", tokenToValidate)
      } else {
        console.log("Running production");
        const queryParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = queryParams.get('token');
        if (tokenFromUrl) {
          tokenToValidate = tokenFromUrl;
        } else {
          console.log("Token not found in URL");
          setToken(null);
          setIsValid(false);
          return;
        }
      }
      // Set the token in state and validate
      setToken(tokenToValidate);
      validateToken(tokenToValidate);
    };

    fetchToken();
  }, []);

  // Validate token
  const validateToken = async (token) => {
    // console.log("Validating token:", token);
    try {
      const response = await axios.get(`${ENV.isProduction ? "https://backend.expressbild.org" : "/api"}/index.php/rest/auth/validate_token/${token}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Token validation result:', response.data.result);
      if (response.data.result === null) {
        setIsValid(false);
      }else if (response.data.result){
        setIsValid(true);
      }
    } catch (error) {
      console.error('Error validating token:', error);
      setIsValid(false);
    }
  };

  return { token, isValid };
};

export default useFetchToken;
