const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
// Target: el div con id="appContainer" dentro de la pantalla
const appContainer = document.getElementById('appContainer');

// Función principal para obtener datos
const fetchPokemon = async () => {
    const query = searchInput.value.trim().toLowerCase();
    
    // Si el campo está vacío, no hacemos nada
    if (!query) return;

    // Mostrar estado de "Cargando"
    appContainer.innerHTML = '<p style="color: #fff;">Buscando...</p>';

    try {
        // Petición a la PokeAPI
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        
        // 1. Manejo de error 404 (No encontrado)
        if (!response.ok) {
            throw new Error('No encontrado');
        }
        
        const data = await response.json();
        renderPokemon(data);

    } catch (error) {
        // 2. Manejo de errores de conexión o errores lanzados arriba
        const errorMessage = error.message === 'Failed to fetch' 
            ? 'Error de conexión. Revisa tu red.' 
            : 'Pokémon no detectado.';
            
        // Mostrar error en la pantalla de la Pokédex
        appContainer.innerHTML = `
            <div style="color: #ff5252; text-align: center; padding: 10px;">
                <p>⚠ ERROR</p>
                <p>${errorMessage}</p>
            </div>
        `;
    }
};

// Función para renderizar el resultado en la pantalla
const renderPokemon = (data) => {
    // Usamos el sprite frontal simple, ideal para la pantalla retro
    const image = data.sprites.front_default; 
    const name = data.name.toUpperCase();
    const id = data.id;
    // Formatea los tipos (ej: electric/steel)
    const type = data.types.map(t => t.type.name).join('/');

    // Inyectamos el HTML de la tarjeta dentro del contenedor de la pantalla
    appContainer.innerHTML = `
        <img src="${image}" alt="${name}" class="pokemon-img">
        <div style="text-align: center; margin-top: 5px;">
            <p>#${id} ${name}</p>
            <p style="color: #888; font-size: 0.5rem;">TIPO: ${type}</p>
            <p style="margin-top: 10px;">--------------</p>
            <p style="font-size: 0.5rem;">ALT: ${data.height/10}m</p>
            <p style="font-size: 0.5rem;">PES: ${data.weight/10}kg</p>
        </div>
    `;
};

// Event Listeners (para que el botón y la tecla Enter funcionen)
searchBtn.addEventListener('click', fetchPokemon);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchPokemon();
});