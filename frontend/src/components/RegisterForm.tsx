import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import styles from "./RegisterForm.module.css";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

type RegisterFormInputs = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>();

  const navigate = useNavigate();

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      await axios.post(
       `${API_URL}/users/register`,
        {
          username: data.name,
          email: data.email,
          password: data.password,
        }
      );

      alert("Usuario registrado correctamente");
      navigate("/login");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      if (err.response?.status === 409 && err.response?.data?.message?.includes("Email already exists")) {
        setError("email", { type: "server", message: "Este email ya está registrado" });
      } else if (err.response?.status === 400) {
        setError("root", { type: "server", message: "Rellena todos los campos obligatorios" });
      } else {
        setError("root", { type: "server", message: err.response?.data?.message || "Error en el registro" });
      }
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className={styles.heading}>Crear cuenta</h2>
      <div className={styles.field}>
        <label htmlFor="name">Nombre de usuario</label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          {...register("name", { required: "El nombre es obligatorio" })}
          className={errors.name ? styles.inputError : ""}
        />
        {errors.name && (
          <span className={styles.error}>{errors.name.message}</span>
        )}
      </div>
      <div className={styles.field}>
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email", {
            required: "El email es obligatorio",
            pattern: {
              value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
              message: "Email no válido",
            },
          })}
          className={errors.email ? styles.inputError : ""}
        />
        {errors.email && (
          <span className={styles.error}>{errors.email.message}</span>
        )}
      </div>
      <div className={styles.field}>
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password", {
            required: "La contraseña es obligatoria",
            minLength: { value: 6, message: "Mínimo 6 caracteres" },
          })}
          className={errors.password ? styles.inputError : ""}
        />
        {errors.password && (
          <span className={styles.error}>{errors.password.message}</span>
        )}
      </div>
      <div className={styles.field}>
        <label htmlFor="confirmPassword">Repetir contraseña</label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword", {
            required: "Repite la contraseña",
            validate: (value) =>
              value === watch("password") || "Las contraseñas no coinciden",
          })}
          className={errors.confirmPassword ? styles.inputError : ""}
        />
        {errors.confirmPassword && (
          <span className={styles.error}>{errors.confirmPassword.message}</span>
        )}
      </div>
      <button className={styles.button} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Registrarse"}
      </button>
      <div className={styles.loginPrompt}>
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className={styles.loginLink}>
          Inicia sesión aquí
        </Link>
      </div>
    </form>
  );
}
