// Función para agregar al itinerariesController.js

exports.generateWithAI = async (req, res) => {
  try {
    const { id: itineraryId } = req.params;
    const { trip_id, trip_title, destination, start_date, end_date } = req.body;

    // Validar que el itinerario existe
    const itinerary = await Itinerary.findByPk(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ message: "Itinerario no encontrado" });
    }

    // Validar datos requeridos
    if (!trip_id || !start_date || !end_date) {
      return res.status(400).json({ 
        message: "Faltan datos requeridos: trip_id, start_date, end_date" 
      });
    }

    // Calcular duración del viaje
    const calculateTripDuration = (startDate, endDate) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    const duration = calculateTripDuration(start_date, end_date);

    // Preparar el prompt para OpenAI
    const prompt = `Eres un planificador de viajes experto. Generas itinerarios realistas y variados, en español, sin inventar lugares improbables. Si no estás seguro de un sitio concreto, usa un barrio o zona conocida.
Responde SIEMPRE con JSON válido y nada más (sin texto adicional, ni markdown), cumpliendo estrictamente el esquema indicado.
No repitas actividades similares y no superpongas horarios. Todas las actividades deben estar dentro del rango del viaje.
Ventana horaria recomendada: 08:00–22:00. Duración típica por actividad: 1–4 horas. Deja un buffer de 30–60 minutos entre actividades.
Usa la zona horaria del destino si es conocida; si no, usa Europe/Madrid.

Contexto del viaje:
- Título: ${trip_title || "Viaje"}
- Destino: ${destination || "No especificado"}
- Fecha de inicio: ${start_date} (formato YYYY-MM-DD)
- Fecha de fin: ${end_date} (formato YYYY-MM-DD)
- Duración: ${duration} días

Tareas:
1) Crea entre 3 y 7 actividades realistas y específicas para el destino y la duración del viaje.
2) Cada actividad tendrá:
  - name: Nombre atractivo y descriptivo (máx. 80 caracteres).
  - description: 100–200 caracteres, centrada en qué hará el viajero y por qué es interesante.
  - start_datetime y end_datetime: ISO 8601 sin zona (YYYY-MM-DDTHH:MM:SS), coherentes con el rango del viaje, sin solaparse, con buffer ≥ 30 min.
  - location: Ubicación específica si es posible (lugar/monumento/barrio). Si no es seguro, usar un barrio/zona conocida.
3) Distribuye las actividades con lógica de día (mañana/tarde/noche) y variedad (cultura, vistas, gastronomía, paseo, etc.).
4) Si el destino es "No especificado", genera actividades urbanas genéricas (centro histórico, parque principal, mercado local).

Formato de salida (JSON puro, sin comas finales, sin texto extra):
{
  "activities": [
    {
      "name": "Nombre de la actividad",
      "description": "Descripción (100-200 caracteres)",
      "start_datetime": "YYYY-MM-DDTHH:MM:SS",
      "end_datetime": "YYYY-MM-DDTHH:MM:SS",
      "location": "Ubicación específica o barrio"
    }
  ]
}`;

    // Llamar a la API de OpenAI
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({ 
        message: "API Key de OpenAI no configurada en el servidor" 
      });
    }

    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
      }
    );

    const aiResponse = openaiResponse.data.choices[0]?.message?.content;
    if (!aiResponse) {
      return res.status(500).json({ message: "Respuesta vacía de la IA" });
    }

    // Parsear la respuesta JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (error) {
      console.error("Error parsing AI response:", aiResponse);
      return res.status(500).json({ 
        message: "Respuesta inválida de la IA",
        debug: aiResponse.substring(0, 200) // Primeros 200 caracteres para debug
      });
    }

    const aiActivities = parsedResponse.activities;
    if (!Array.isArray(aiActivities) || aiActivities.length === 0) {
      return res.status(500).json({ message: "La IA no generó actividades válidas" });
    }

    // Crear las actividades en la base de datos
    const createdActivities = [];
    for (const aiActivity of aiActivities) {
      try {
        const activity = await Activity.create({
          trip_id: parseInt(trip_id),
          itinerary_id: parseInt(itineraryId),
          name: aiActivity.name,
          description: aiActivity.description,
          start_date: new Date(aiActivity.start_datetime).toISOString(),
          end_date: new Date(aiActivity.end_datetime).toISOString(),
          location: aiActivity.location || null,
          created_by: req.user?.id || 1, // Usar el ID del usuario autenticado
        });
        createdActivities.push(activity);
      } catch (error) {
        console.error("Error creando actividad:", error);
        // Continuar con las demás actividades
      }
    }

    // Responder con las actividades creadas
    res.status(200).json({
      message: `Itinerario generado exitosamente con ${createdActivities.length} actividades`,
      activities: createdActivities,
      activitiesCount: createdActivities.length,
    });

  } catch (error) {
    console.error("Error en generateWithAI:", error);
    
    // Manejo específico de errores de OpenAI
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        message: "Límite de solicitudes excedido. Intenta de nuevo en unos minutos." 
      });
    }
    
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        message: "API Key de OpenAI inválida" 
      });
    }

    res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};
