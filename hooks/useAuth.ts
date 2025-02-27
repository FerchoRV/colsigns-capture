import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<{ username: string; role_id: number; id:number } | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 🔹 Estado de carga

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      console.log("Valor de storedUser:", storedUser);
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.role_id = Number(parsedUser.role_id); // Convertir role_id a número
          if (parsedUser.hasOwnProperty('id')) {
            parsedUser.userid = String(parsedUser.userid); // Convertir userid a string
          } else {
            console.error("Error: userid no está definido en parsedUser", parsedUser);
          }
          setUser(parsedUser);
          console.log("Usuario cargado desde localStorage:", parsedUser);
        } catch (error) {
          console.error("Error al parsear usuario:", error);
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false); // 🔹 Terminó la carga
    }
  }, []);

  const login = (userData: { username: string; role_id: number; id:number }) => {
    if (!userData.role_id) {
      console.error("Error: role_id no está definido en userData", userData);
      return;
    }
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/'; // Redirigir al home después de cerrar sesión
  };

  return { user, isLoading, login, logout };
}


