/** Configuración de Tailwind compilada localmente. */
module.exports = {
    content: ['./*.html', './src/**/*.js'],
    theme: {
        extend: {
            colors: { brand: { 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d' } },
            fontFamily: { sans: ['Inter', 'sans-serif'] }
        }
    }
};
