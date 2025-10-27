import { useState } from "react";
import {
  X,
  Sparkles,
  Sun,
  Snowflake,
  Leaf,
  Cloud,
  MapPin,
  Users,
  Heart,
  Camera,
  Mountain,
  Building,
  Utensils,
  PartyPopper,
  Car,
  Plane,
} from "lucide-react";
import styles from "./AIDestinationForm.module.css";

type AIPreferences = {
  startDate: string;
  endDate: string;
  climate: string[];
  experience: string[];
  distance: string;
  minBudget: string;
  maxBudget: string;
  travelStyle: string;
  numberOfTravelers: number;
  interests: string[];
  additionalInfo: string;
};

type AIPreferencesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (preferences: AIPreferences) => void;
  tripDates?: {
    startDate: string;
    endDate: string;
  };
};

export function AIPreferencesModal({
  isOpen,
  onClose,
  onGenerate,
  tripDates,
}: AIPreferencesModalProps) {
  const [preferences, setPreferences] = useState<AIPreferences>({
    startDate: tripDates?.startDate || "",
    endDate: tripDates?.endDate || "",
    climate: [],
    experience: [],
    distance: "",
    minBudget: "",
    maxBudget: "",
    travelStyle: "",
    numberOfTravelers: 2,
    interests: [],
    additionalInfo: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleCheckboxChange = (category: keyof AIPreferences, value: string) => {
    if (category === "climate") {
      setPreferences(prev => {
        let newClimate = [...prev.climate];
        
        if (value === "any") {
          newClimate = newClimate.includes("any") ? [] : ["any"];
        } else {
          newClimate = newClimate.filter(item => item !== "any");
          newClimate = newClimate.includes(value)
            ? newClimate.filter(item => item !== value)
            : [...newClimate, value];
        }
        
        return { ...prev, climate: newClimate };
      });
    } else if (category === "experience" || category === "interests") {
      setPreferences(prev => ({
        ...prev,
        [category]: prev[category].includes(value)
          ? prev[category].filter(item => item !== value)
          : [...prev[category], value]
      }));
    }
  };

  const handleRadioChange = (category: keyof AIPreferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberChange = (field: 'numberOfTravelers', value: number) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): string[] => {
    const errors: string[] = [];
    
    if (step === 1) {
      if (!preferences.startDate) errors.push("Fecha de inicio es obligatoria");
      if (!preferences.endDate) errors.push("Fecha de fin es obligatoria");
      if (preferences.startDate && preferences.endDate && preferences.startDate > preferences.endDate) {
        errors.push("La fecha de inicio debe ser anterior a la fecha de fin");
      }
    }
    
    if (step === 2) {
      if (preferences.experience.length === 0) errors.push("Selecciona al menos una experiencia");
      if (!preferences.minBudget && !preferences.maxBudget) {
        errors.push("Especifica al menos un presupuesto mínimo o máximo");
      }
      if (preferences.minBudget && preferences.maxBudget) {
        const min = parseFloat(preferences.minBudget);
        const max = parseFloat(preferences.maxBudget);
        if (min > max) {
          errors.push("El presupuesto mínimo no puede ser mayor al máximo");
        }
      }
    }
    
    return errors;
  };

  const nextStep = () => {
    const errors = validateStep(currentStep);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setValidationErrors([]);
  };

  const handleGenerate = async () => {
    const allErrors = [
      ...validateStep(1),
      ...validateStep(2)
    ];
    
    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      if (validateStep(1).length > 0) setCurrentStep(1);
      else if (validateStep(2).length > 0) setCurrentStep(2);
      return;
    }
    
    setValidationErrors([]);
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    onGenerate(preferences);
    setIsGenerating(false);
    onClose();
  };

  const renderStep1 = () => (
    <>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          📅 Fechas del viaje *
        </h3>
        <div className={styles.dateInputsGrid}>
          <div className={styles.dateField}>
            <label className={styles.dateLabel}>Fecha de inicio</label>
            <input
              type="date"
              value={preferences.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.dateField}>
            <label className={styles.dateLabel}>Fecha de fin</label>
            <input
              type="date"
              value={preferences.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className={styles.dateInput}
            />
          </div>
        </div>
      </div>

      {/* Número de viajeros */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          👥 ¿Cuántas personas van a viajar?
        </h3>
        <div className={styles.numberInputContainer}>
          <input
            type="range"
            min="1"
            max="20"
            value={preferences.numberOfTravelers}
            onChange={(e) => handleNumberChange('numberOfTravelers', parseInt(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.numberDisplay}>
            <span className={styles.numberValue}>{preferences.numberOfTravelers}</span>
            <span className={styles.numberLabel}>
              {preferences.numberOfTravelers === 1 ? 'persona' : 'personas'}
            </span>
          </div>
        </div>
      </div>

      {/* Clima preferido */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          🌤️ ¿Qué clima prefieres?
        </h3>
        <div className={styles.checkboxGrid}>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={preferences.climate.includes("sunny")}
              onChange={() => handleCheckboxChange("climate", "sunny")}
            />
            <span className={styles.checkboxLabel}>
              <Sun size={18} />
              Sol y calor
            </span>
          </label>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={preferences.climate.includes("cold")}
              onChange={() => handleCheckboxChange("climate", "cold")}
            />
            <span className={styles.checkboxLabel}>
              <Snowflake size={18} />
              Frío y nieve
            </span>
          </label>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={preferences.climate.includes("mild")}
              onChange={() => handleCheckboxChange("climate", "mild")}
            />
            <span className={styles.checkboxLabel}>
              <Leaf size={18} />
              Clima templado
            </span>
          </label>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={preferences.climate.includes("any")}
              onChange={() => handleCheckboxChange("climate", "any")}
            />
            <span className={styles.checkboxLabel}>
              <Cloud size={18} />
              No me importa
            </span>
          </label>
        </div>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      {/* Tipo de experiencia */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          🎯 ¿Qué tipo de experiencia buscas? *
        </h3>
        <div className={styles.checkboxGrid}>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={preferences.experience.includes("relax")}
              onChange={() => handleCheckboxChange("experience", "relax")}
            />
            <span className={styles.checkboxLabel}>
              <Heart size={18} />
              Relax y descanso
            </span>
          </label>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={preferences.experience.includes("adventure")}
              onChange={() => handleCheckboxChange("experience", "adventure")}
            />
            <span className={styles.checkboxLabel}>
              <Mountain size={18} />
              Aventura y naturaleza
            </span>
          </label>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={preferences.experience.includes("culture")}
              onChange={() => handleCheckboxChange("experience", "culture")}
            />
            <span className={styles.checkboxLabel}>
              <Building size={18} />
              Historia y cultura
            </span>
          </label>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={preferences.experience.includes("gastronomy")}
              onChange={() => handleCheckboxChange("experience", "gastronomy")}
            />
            <span className={styles.checkboxLabel}>
              <Utensils size={18} />
              Gastronomía
            </span>
          </label>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={preferences.experience.includes("nightlife")}
              onChange={() => handleCheckboxChange("experience", "nightlife")}
            />
            <span className={styles.checkboxLabel}>
              <PartyPopper size={18} />
              Vida nocturna
            </span>
          </label>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={preferences.experience.includes("photography")}
              onChange={() => handleCheckboxChange("experience", "photography")}
            />
            <span className={styles.checkboxLabel}>
              <Camera size={18} />
              Lugares instagrameables
            </span>
          </label>
        </div>
      </div>

      {/* Presupuesto */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          💰 Rango de presupuesto por persona *
        </h3>
        <div className={styles.budgetRangeContainer}>
          <div className={styles.budgetInputGroup}>
            <label className={styles.budgetInputLabel}>
              Mínimo (€)
            </label>
            <input
              type="number"
              value={preferences.minBudget}
              onChange={(e) => setPreferences(prev => ({ ...prev, minBudget: e.target.value }))}
              placeholder="ej. 300"
              className={styles.budgetRangeInput}
              min="0"
            />
          </div>
          <div className={styles.budgetSeparator}>
            <span>—</span>
          </div>
          <div className={styles.budgetInputGroup}>
            <label className={styles.budgetInputLabel}>
              Máximo (€)
            </label>
            <input
              type="number"
              value={preferences.maxBudget}
              onChange={(e) => setPreferences(prev => ({ ...prev, maxBudget: e.target.value }))}
              placeholder="ej. 1200"
              className={styles.budgetRangeInput}
              min="0"
            />
          </div>
        </div>
        <p className={styles.budgetHelp}>
          💡 Especifica al menos uno de los dos valores para ayudarnos a encontrar opciones dentro de tu rango
        </p>
      </div>

      {/* Distancia */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          ✈️ Distancia preferida
        </h3>
        <div className={styles.radioGrid}>
          <label className={styles.radioItem}>
            <input
              type="radio"
              name="distance"
              checked={preferences.distance === "any"}
              onChange={() => handleRadioChange("distance", "any")}
            />
            <span className={styles.radioLabel}>
              <Sparkles size={18} />
              Cualquier Distancia
            </span>
          </label>
          <label className={styles.radioItem}>
            <input
              type="radio"
              name="distance"
              checked={preferences.distance === "national"}
              onChange={() => handleRadioChange("distance", "national")}
            />
            <span className={styles.radioLabel}>
              <MapPin size={18} />
              Nacional (España)
            </span>
          </label>
          <label className={styles.radioItem}>
            <input
              type="radio"
              name="distance"
              checked={preferences.distance === "europe"}
              onChange={() => handleRadioChange("distance", "europe")}
            />
            <span className={styles.radioLabel}>
              <Car size={18} />
              Europa (hasta 3h vuelo)
            </span>
          </label>
          <label className={styles.radioItem}>
            <input
              type="radio"
              name="distance"
              checked={preferences.distance === "international"}
              onChange={() => handleRadioChange("distance", "international")}
            />
            <span className={styles.radioLabel}>
              <Plane size={18} />
              Internacional
            </span>
          </label>
        </div>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      {/* Intereses específicos */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          🎨 Intereses específicos
        </h3>
        <div className={styles.checkboxGrid}>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={preferences.interests.includes("sports")}
              onChange={() => handleCheckboxChange("interests", "sports")}
            />
            <span className={styles.checkboxLabel}>
              🏃 Deportes
            </span>
          </label>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={preferences.interests.includes("nature")}
              onChange={() => handleCheckboxChange("interests", "nature")}
            />
            <span className={styles.checkboxLabel}>
              🌲 Naturaleza
            </span>
          </label>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={preferences.interests.includes("festivals")}
              onChange={() => handleCheckboxChange("interests", "festivals")}
            />
            <span className={styles.checkboxLabel}>
              🎵 Festivales
            </span>
          </label>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={preferences.interests.includes("shopping")}
              onChange={() => handleCheckboxChange("interests", "shopping")}
            />
            <span className={styles.checkboxLabel}>
              🛍️ Shopping
            </span>
          </label>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={preferences.interests.includes("art")}
              onChange={() => handleCheckboxChange("interests", "art")}
            />
            <span className={styles.checkboxLabel}>
              🎨 Arte
            </span>
          </label>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={preferences.interests.includes("beaches")}
              onChange={() => handleCheckboxChange("interests", "beaches")}
            />
            <span className={styles.checkboxLabel}>
              🏖️ Playas
            </span>
          </label>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={preferences.interests.includes("wine")}
              onChange={() => handleCheckboxChange("interests", "wine")}
            />
            <span className={styles.checkboxLabel}>
              🍷 Vinos
            </span>
          </label>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={preferences.interests.includes("history")}
              onChange={() => handleCheckboxChange("interests", "history")}
            />
            <span className={styles.checkboxLabel}>
              📚 Historia
            </span>
          </label>
        </div>
      </div>

      {/* Estilo de viaje */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          👥 Estilo de viaje
        </h3>
        <div className={styles.radioGrid}>
          <label className={styles.radioItem}>
            <input
              type="radio"
              name="travelStyle"
              checked={preferences.travelStyle === "solo"}
              onChange={() => handleRadioChange("travelStyle", "solo")}
            />
            <span className={styles.radioLabel}>
              <Users size={18} />
              Solo/Independiente
            </span>
          </label>
          <label className={styles.radioItem}>
            <input
              type="radio"
              name="travelStyle"
              checked={preferences.travelStyle === "couple"}
              onChange={() => handleRadioChange("travelStyle", "couple")}
            />
            <span className={styles.radioLabel}>
              <Heart size={18} />
              Romántico/Pareja
            </span>
          </label>
          <label className={styles.radioItem}>
            <input
              type="radio"
              name="travelStyle"
              checked={preferences.travelStyle === "friends"}
              onChange={() => handleRadioChange("travelStyle", "friends")}
            />
            <span className={styles.radioLabel}>
              <Users size={18} />
              Con amigos
            </span>
          </label>
          <label className={styles.radioItem}>
            <input
              type="radio"
              name="travelStyle"
              checked={preferences.travelStyle === "family"}
              onChange={() => handleRadioChange("travelStyle", "family")}
            />
            <span className={styles.radioLabel}>
              <Users size={18} />
              Familiar
            </span>
          </label>
        </div>
      </div>

      {/* Información adicional */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          💬 Algo específico que buscas
        </h3>
        <textarea
          value={preferences.additionalInfo}
          onChange={(e) => setPreferences(prev => ({ ...prev, additionalInfo: e.target.value }))}
          placeholder="Cuéntanos más detalles sobre lo que te gustaría encontrar en tu destino..."
          className={styles.textarea}
          rows={3}
        />
      </div>
    </>
  );

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <Sparkles size={24} />
            <h2>Recomendaciones Personalizadas</h2>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Progress indicator */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
          <div className={styles.stepLabels}>
            <span className={currentStep >= 1 ? styles.stepActive : styles.stepInactive}>
              Básico
            </span>
            <span className={currentStep >= 2 ? styles.stepActive : styles.stepInactive}>
              Preferencias
            </span>
            <span className={currentStep >= 3 ? styles.stepActive : styles.stepInactive}>
              Detalles
            </span>
          </div>
        </div>

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div className={styles.errorContainer}>
            <h4>Por favor, completa los siguientes campos:</h4>
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.content}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <div className={styles.footer}>
          <div className={styles.navigationButtons}>
            {currentStep > 1 && (
              <button onClick={prevStep} className={styles.prevBtn}>
                Anterior
              </button>
            )}
            {currentStep < 3 ? (
              <button onClick={nextStep} className={styles.nextBtn}>
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={styles.generateBtn}
              >
                {isGenerating ? (
                  <>
                    <div className={styles.spinner}></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generar Recomendaciones
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}