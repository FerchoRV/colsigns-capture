import { auth, db } from '@/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export const checkAdminRole = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) {
    console.error('Usuario no autenticado');
    return false;
  }

  try {
    // Leer el documento del usuario desde Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const roleId = userData?.roleId;

      if (roleId === parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1)) {
        console.log('El usuario es un administrador.');
        return true;
      } else {
        console.error('El usuario no tiene permisos de administrador.');
        return false;
      }
    } else {
      console.error('Documento del usuario no encontrado.');
      return false;
    }
  } catch (error) {
    console.error('Error verificando el rol del usuario:', error);
    return false;
  }
};