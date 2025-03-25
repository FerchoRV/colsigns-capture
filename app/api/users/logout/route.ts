export async function POST(_: Request) {
    // Eliminar sesión (depende de cómo la manejes en el backend)
    return new Response(null, {
      status: 200,
      headers: {
        'Set-Cookie': 'token=; Path=/; Max-Age=0; HttpOnly;',
      },
    });
  }
  