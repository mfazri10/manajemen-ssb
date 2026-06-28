async function main() {
  try {
    const res = await fetch('http://localhost:3000/v1/auth/sign-in/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@ssb.com',
        password: 'admin123',
        callbackURL: '/'
      })
    });
    console.log('STATUS:', res.status);
    const headers = Object.fromEntries(res.headers.entries());
    console.log('HEADERS:', headers);
    const text = await res.text();
    console.log('BODY:', text);
  } catch (err) {
    console.error('ERROR:', err);
  }
}
main();
