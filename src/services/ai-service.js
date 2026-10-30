const DEFAULT_AI_ENDPOINT = '/api/analyze-idea';

const includesAny = (text, terms) => terms.some((term) => text.includes(term));

const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const extractBusinessName = (text) => {
    const match = text.match(/(?:llamad[ao]|nombre|marca|negocio)\s+(?:es\s+)?([\p{L}0-9][\p{L}0-9 &'._-]{1,30})/iu);
    return match?.[1]?.trim().split(/[,.!?]/)[0] || 'Por definir';
};

const unique = (items) => [...new Set(items)];

export const AIService = {
    async analyzeIdea(userInput) {
        if (!userInput || userInput.trim().length < 10) {
            throw new Error('DESCRIPCION_CORTA');
        }

        const endpoint = globalThis.window?.__FORGELOCK_AI_ENDPOINT || DEFAULT_AI_ENDPOINT;
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userInput })
            });
            if (response.ok) {
                const proposal = await response.json();
                return this.normalizeProposal(proposal);
            }
        } catch (error) {
            console.warn('Endpoint de IA no disponible; se usara el analisis local:', error);
        }

        return this.heuristicAnalysis(userInput);
    },

    heuristicAnalysis(text) {
        const lower = text.toLowerCase();
        const pageStructure = ['Inicio / Presentación', 'Servicios o productos', 'Sobre el negocio', 'Galería', 'Ubicación y horarios', 'Contacto directo'];
        const functionalities = ['Botón de contacto por WhatsApp', 'Adaptación a celular y computador', 'Enlaces a redes sociales', 'Formulario de contacto'];
        let sector = 'Negocio comercial o de servicios';
        let objective = 'Presentar la marca y captar nuevos clientes digitales.';
        let visualStyle = 'Moderno, limpio y profesional';
        let colorsSuggested = 'Por definir segun la identidad de marca';

        if (includesAny(lower, ['barber', 'peluquer', 'corte'])) sector = 'Barbería / Cuidado personal';
        else if (includesAny(lower, ['restaurante', 'comida', 'cafe', 'menú'])) sector = 'Gastronomía / Alimentos';
        else if (includesAny(lower, ['tienda', 'ropa', 'vender', 'catálogo'])) sector = 'E-commerce / Tienda online';
        else if (includesAny(lower, ['consultor', 'abogado', 'servicios'])) sector = 'Servicios profesionales';

        if (includesAny(lower, ['vender', 'catalogo', 'comprar'])) {
            objective = 'Mostrar la oferta y facilitar nuevas ventas o solicitudes.';
            functionalities.push('Catálogo de productos');
        }
        if (includesAny(lower, ['oscuro', 'negro'])) visualStyle = 'Elegante, minimalista y sobrio';
        if (includesAny(lower, ['creativo', 'llamativo', 'colorido'])) visualStyle = 'Vibrante, creativo y visual';
        if (lower.includes('negro') && lower.includes('dorado')) colorsSuggested = 'Negro carbón y dorado elegante';
        else if (lower.includes('azul')) colorsSuggested = 'Azul corporativo con acentos claros';

        return {
            businessName: titleCase(extractBusinessName(text)),
            sector,
            objective,
            targetAudience: 'Por definir; podrían considerarse clientes locales y digitales interesados en el servicio.',
            visualStyle,
            colorsSuggested,
            pageStructure: unique(pageStructure),
            functionalities: unique(functionalities),
            callToAction: 'Contactar por WhatsApp para conocer el proceso y solicitar una cotización.',
            pendingInfo: 'Por definir logo, horarios, recursos fotográficos y datos comerciales exactos.'
        };
    },

    normalizeProposal(proposal = {}) {
        const approvedSections = ['Inicio / Presentación', 'Servicios o productos', 'Sobre el negocio', 'Galería', 'Ubicación y horarios', 'Contacto directo'];
        const approvedFunctionalities = ['Botón de contacto por WhatsApp', 'Adaptación a celular y computador', 'Enlaces a redes sociales', 'Formulario de contacto', 'Catálogo de productos'];
        const filteredList = (value, allowed, fallback) => {
            if (!Array.isArray(value)) return fallback;
            const normalized = value.filter((item) => allowed.includes(item));
            return normalized.length ? unique(normalized) : fallback;
        };
        return {
            businessName: proposal.businessName || 'Por definir',
            sector: proposal.sector || 'Por definir',
            objective: 'Presentar el negocio, sus servicios o productos en una landing page.',
            targetAudience: proposal.targetAudience || 'Por definir',
            visualStyle: proposal.visualStyle || 'Por definir',
            colorsSuggested: proposal.colorsSuggested || proposal.colors || 'Por definir',
            pageStructure: filteredList(proposal.pageStructure || proposal.sections, approvedSections, ['Inicio / Presentación', 'Contacto directo']),
            functionalities: filteredList(proposal.functionalities, approvedFunctionalities, ['Botón de contacto por WhatsApp']),
            callToAction: 'Contactar por WhatsApp para consultar por una landing page.',
            pendingInfo: 'Por definir: información comercial y elementos visuales que quieres presentar.'
        };
    },

    getWhatsAppLink(_originalIdea, proposal, phoneNumber) {
        const message = `Hola ForgeLock, quiero información sobre una landing page para mi negocio: ${proposal.businessName}. ¿Me cuentan los planes, precios y pasos?`;
        return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    }
};
