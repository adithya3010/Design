// utils/auth.js
export const login = async (email, password) => {
  const res = await axios.post('/api/login', { email, password });
  localStorage.setItem('token', res.data.token);

  const decoded = JSON.parse(atob(res.data.token.split('.')[1]));
  localStorage.setItem('role', decoded.role);
};
