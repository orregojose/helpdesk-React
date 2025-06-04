const config = {
    apiUrl: process.env.NODE_ENV === 'production'
        ? 'https://tu-backend-url.com'  // URL donde desplegarás el backend
        : 'http://localhost:3001'
};

export default config; 