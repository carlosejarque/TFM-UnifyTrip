
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.recommendDestinations = async (req, res) => {
  try {
    const preferences = req.body;
    
    // Construct the prompt with user preferences
    const prompt = `Eres un asesor experto en viajes personalizados. Tu tarea es recomendar varios destinos de viaje ideales según los datos proporcionados.
Contexto: El usuario busca opciones de viaje adaptadas a sus preferencias de clima, presupuesto, estilo de viaje, intereses y otras variables. El país de referencia para calcular la distancia es **España**.
Tono/estilo: profesional, informativo y entusiasta.
Instrucciones específicas:

* Analiza los siguientes parámetros del usuario:

  * Fechas del viaje: ${preferences.startDate} a ${preferences.endDate}
  * Clima deseado: ${preferences.climate}
  * Tipo de experiencia buscada: ${preferences.experience}
  * Distancia preferida desde España: ${preferences.distance}
  * Presupuesto mínimo y máximo: ${preferences.minBudget} – ${preferences.maxBudget}
  * Estilo de viaje: ${preferences.travelStyle}
  * Número de viajeros: ${preferences.numberOfTravelers}
  * Intereses específicos: ${preferences.interests}
  * Información adicional: ${preferences.additionalInfo}
* IMPORTANTE: Recomienda ÚNICAMENTE destinos que sean ideales para visitar específicamente entre las fechas ${preferences.startDate} y ${preferences.endDate}.
* Considera el clima, temporada turística, eventos locales y condiciones específicas de cada destino durante esas fechas exactas.
* Sugiere entre 3 y 5 destinos que mejor encajen con el perfil.
* Justifica brevemente por qué cada destino es adecuado para esas fechas específicas (clima en esa época, actividades disponibles, presupuesto, etc.).
* Considera opciones nacionales e internacionales desde España, según la distancia indicada.

IMPORTANTE: Tu respuesta debe ser ÚNICAMENTE un JSON válido, sin texto adicional antes o después. No incluyas explicaciones, markdown, ni código formateado. Solo el JSON puro.

Formato de la respuesta:
{
  "destinations": [
    {
      "name": "Nombre del destino",
      "description": "Breve descripción del destino",
      "whyRecommended": "Por qué es una buena opción para este perfil y fechas específicas",
      "recommendedActivities": ["Actividad 1", "Actividad 2", "Actividad 3"],
      "estimatedCostRange": {
        "min": 800,
        "max": 1200,
        "currency": "EUR"
      },
      "climateConditions": "Cómo estará el clima específicamente en las fechas del viaje",
      "seasonalAdvantages": "Ventajas de visitar en esta época del año"
    }
  ]
}`;

    // Make API call to ChatGPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const recommendationsText = completion.choices[0].message.content;
    console.log('Raw ChatGPT response:', recommendationsText);
    
    // Function to extract and clean JSON from the response
    const extractJSON = (text) => {
      try {
        // First, try to parse directly
        return JSON.parse(text);
      } catch (e) {
        // If direct parsing fails, try to extract JSON from text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (e2) {
            throw new Error('Could not extract valid JSON from response');
          }
        }
        throw new Error('No JSON found in response');
      }
    };
    
    // Parse the JSON response from ChatGPT
    let recommendationsJson;
    try {
      recommendationsJson = extractJSON(recommendationsText);
      console.log('Parsed JSON:', recommendationsJson);
      
      // Validate the structure
      if (!recommendationsJson.destinations || !Array.isArray(recommendationsJson.destinations)) {
        throw new Error('Invalid JSON structure: missing or invalid destinations array');
      }
      
    } catch (parseError) {
      console.error('Error parsing ChatGPT JSON response:', parseError);
      console.error('Raw response was:', recommendationsText);
      return res.status(500).json({
        success: false,
        error: 'Error parsing AI response format',
        debug: {
          rawResponse: recommendationsText,
          parseError: parseError.message
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        destinations: recommendationsJson.destinations,
        preferences: preferences,
        totalDestinations: recommendationsJson.destinations?.length || 0
      }
    });

  } catch (error) {
    console.error('Error calling ChatGPT API:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({
        success: false,
        error: 'API quota exceeded. Please check your OpenAI billing.'
      });
    }
    
    if (error.code === 'invalid_api_key') {
      return res.status(401).json({
        success: false,
        error: 'Invalid OpenAI API key.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error generating destination recommendations'
    });
  }
}


exports.generateItinerayWithAI = async (req, res) => {
  try {
    const { destination, startDate, endDate } = req.body;
    
    // Construct the prompt with user data
    const prompt = `Actúas como un planificador de viajes profesional especializado en crear itinerarios turísticos inteligentes y realistas. Tu tarea es generar un itinerario diario en formato JSON, adaptado al destino y a las fechas proporcionadas.

Contexto: El usuario te proporcionará:

* Un **destino**: ${destination}
* Una **fecha de inicio**: ${startDate}
* Una **fecha de fin**: ${endDate}

Debes construir una lista de actividades para cada día del viaje, considerando:

* El clima típico en ese destino durante las fechas indicadas.
* Los horarios y días de apertura de cada atracción (evita, por ejemplo, museos los lunes si suelen cerrar).
* La duración aproximada de cada experiencia, asignando horas razonables de inicio y fin.
* Recomendaciones auténticas, equilibrando cultura, gastronomía, historia y naturaleza según el lugar.

Tono/estilo: Profesional, informativo y orientado a utilidad práctica.

Instrucciones específicas:

* Genera entre 2 y 5 actividades por día.
* Cada actividad debe representarse como un objeto con los siguientes campos:

  * \`name\`: nombre claro y conciso de la actividad.
  * \`description\`: breve descripción de lo que se hará, incluyendo si requiere reserva previa o entrada anticipada.
  * \`startdate\`: fecha y hora estimada de inicio en formato \`"YYYY-MM-DDTHH:MM"\`.
  * \`enddate\`: fecha y hora estimada de fin en formato \`"YYYY-MM-DDTHH:MM"\`.
* Ajusta los horarios para evitar solapamientos. Añade pausas lógicas entre actividades (por ejemplo, tiempo para comer o trasladarse).
* Asegúrate de que las actividades estén disponibles en el día y horario asignado.
* Si el clima puede influir negativamente en una actividad, considera alternativas o sugiere planes bajo techo.

IMPORTANTE: Tu respuesta debe ser ÚNICAMENTE un JSON válido, sin texto adicional antes o después. No incluyas explicaciones, markdown, ni código formateado. Solo el JSON puro.

Formato de salida:
Una lista JSON con todas las actividades del viaje. Ejemplo:

[
  {
    "name": "Visita al Palacio Real",
    "description": "Recorrido guiado por el Palacio Real. Cerrado los martes.",
    "startdate": "2025-06-15T10:00",
    "enddate": "2025-06-15T12:00",
    "location": "Dirección o lugar de la actividad (opcional)",
  }
]`;

    // Make API call to ChatGPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const itineraryText = completion.choices[0].message.content;
    console.log('Raw ChatGPT itinerary response:', itineraryText);
    
    // Function to extract and clean JSON from the response
    const extractJSON = (text) => {
      try {
        // First, try to parse directly
        return JSON.parse(text);
      } catch (e) {
        // If direct parsing fails, try to extract JSON array from text
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (e2) {
            throw new Error('Could not extract valid JSON array from response');
          }
        }
        throw new Error('No JSON array found in response');
      }
    };
    
    // Parse the JSON response from ChatGPT
    let itineraryJson;
    try {
      itineraryJson = extractJSON(itineraryText);
      console.log('Parsed itinerary JSON:', itineraryJson);
      
      // Validate the structure
      if (!Array.isArray(itineraryJson)) {
        throw new Error('Invalid JSON structure: response should be an array of activities');
      }
      
      // Validate each activity has required fields
      for (let i = 0; i < itineraryJson.length; i++) {
        const activity = itineraryJson[i];
        if (!activity.name || !activity.description || !activity.startdate || !activity.enddate) {
          throw new Error(`Invalid activity structure at index ${i}: missing required fields`);
        }
      }
      
    } catch (parseError) {
      console.error('Error parsing ChatGPT itinerary JSON response:', parseError);
      console.error('Raw response was:', itineraryText);
      return res.status(500).json({
        success: false,
        error: 'Error parsing AI itinerary response format',
        debug: {
          rawResponse: itineraryText,
          parseError: parseError.message
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        activities: itineraryJson,
        destination: destination,
        startDate: startDate,
        endDate: endDate,
        totalActivities: itineraryJson.length
      }
    });

  } catch (error) {
    console.error('Error calling ChatGPT API for itinerary:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({
        success: false,
        error: 'API quota exceeded. Please check your OpenAI billing.'
      });
    }
    
    if (error.code === 'invalid_api_key') {
      return res.status(401).json({
        success: false,
        error: 'Invalid OpenAI API key.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error generating itinerary with AI'
    });
  }
}