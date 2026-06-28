async function main() {
  try {
    const res = await fetch('http://localhost:3000/v1/auth/get-session');
    console.log('STATUS:', res.status);
    const text = await res.text();
    console.log('BODY:', text);
  } catch (err) {
    console.error('ERROR:', err);
  }
}
main();
