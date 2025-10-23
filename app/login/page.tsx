// [FILE: app/login/page.tsx]
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If already logged in, redirect to the dashboard or wherever
  if (user) {
    redirect('/dashboard'); // Change this to where you want to redirect logged-in users
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Login</h1>
      {/* Login Form Goes Here */}
      <button onClick={async () => {
        // Trigger login flow (e.g., OAuth, email, etc.)
        await supabase.auth.signInWithOAuth({ provider: 'google' }); // Example with Google Auth
      }}>
        Login with Google
      </button>
    </main>
  );
}
