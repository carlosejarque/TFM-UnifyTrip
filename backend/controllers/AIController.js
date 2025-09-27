
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
      "seasonalAdvantages": "Ventajas de visitar en esta época del año",
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
