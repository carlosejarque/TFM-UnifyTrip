import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import styles from "./LoginForm.module.css";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type LoginFormInputs = {
  email: string;
  password: string;
};

export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await axios.post("http://localhost:3000/users/login", {
        email: data.email,
        password: data.password,
      });

      await login(response.data.token, response.data.refreshToken);
      navigate("/mytrips");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;

      if (err.response?.status === 401) {
        setError("email", {
          type: "server",
          message: "Email o contraseña incorrectos",
        });
        setError("password", {
          type: "server",
          message: "Email o contraseña incorrectos",
        });
      }
      else if (err.response?.status === 400) {
        setError("root", {
          type: "server",
          message: "Rellena todos los campos",
        });
      }
      else {
        setError("root", {
          type: "server",
          message: err.response?.data?.message || "Error al iniciar sesión",
        });
      }
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className={styles.heading}>Iniciar sesión</h2>
      <div className={styles.field}>
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          {...register("email", { required: "El email es obligatorio" })}
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
          autoComplete="current-password"
          {...register("password", {
            required: "La contraseña es obligatoria",
          })}
          className={errors.password ? styles.inputError : ""}
        />
        {errors.password && (
          <span className={styles.error}>{errors.password.message}</span>
        )}
      </div>
      <button className={styles.button} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Entrar"}
      </button>

      <div className={styles.registerPrompt}>
        ¿Aún no tienes cuenta?{" "}
        <Link to="/register" className={styles.registerLink}>
          Regístrate aquí
        </Link>
      </div>
    </form>
  );
};
