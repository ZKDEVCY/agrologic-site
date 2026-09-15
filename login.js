const SESSION='greenhubSessionV12';

// Private beta v1.2.1
// Public account registration is intentionally disabled.
// Only the existing GreenHub test/admin login is accepted.

loginForm.onsubmit=e=>{
  e.preventDefault();

  const u=username.value.trim().toLowerCase();
  const p=password.value;

  if((u==='admin'||u==='zacharias')&&p==='greenhub'){
    localStorage.setItem(SESSION,JSON.stringify({
      id:'legacy-zacharias',
      username:'zacharias',
      displayName:'Zacharias',
      email:'',
      location:'Larnaca'
    }));
    localStorage.setItem('greenhubLoggedIn','true');
    location.href='greenhub/index.html';
    return;
  }

  loginMessage.textContent='Incorrect username or password. New registrations are currently closed.';
};
