// assets/auth.js[cite: 4]
let isSignUp = new URLSearchParams(window.location.search).get('mode') === 'signup';
const ADMIN_EMAIL = 'swapnil7kuri@gmail.com';

function applyAuthMode() {
  document.getElementById('auth-title').innerText = isSignUp ? 'Create Account' : 'Welcome Back';
  document.getElementById('auth-sub').innerText = isSignUp ? 'Join our creator learning community' : 'Sign in to continue your learning journey';
  document.getElementById('submit-btn').innerText = isSignUp ? 'Create Account' : 'Sign In';
  document.getElementById('toggle-text').innerText = isSignUp ? 'Already have an account?' : 'Do not have an account?';
  document.getElementById('toggle-btn').innerText = isSignUp ? 'Sign in' : 'Sign up';
  document.getElementById('fullname-field').classList.toggle('hidden', !isSignUp);
}

function toggleAuthMode() {
  isSignUp = !isSignUp;
  applyAuthMode();
}

// Reflect ?mode=signup on initial load
applyAuthMode();

// Google Provider Sign-In (Redirects to account.html)
async function loginWithGoogle() {
  const sb = getSupabase();
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/account.html' }
  });
  if (error) alert(error.message);
}

// Form Submit Handler
document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const sb = getSupabase();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (isSignUp) {
    const fullName = document.getElementById('full-name').value;
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) return alert(error.message);
    alert('Account created successfully!');
    window.location.href = '/account.html';
  } else {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);

    // Redirect Admin or Regular User
    if (data.user.email === ADMIN_EMAIL) {
      window.location.href = '/admin/index.html';
    } else {
      window.location.href = '/account.html';
    }
  }
});
